"""Deterministic contour conversion of approved Recardnize concept A.

This reads the supplied raster reference; it never rewrites it. It does not
generate lettering, substitute a font, or alter spacing. See ../README.md.
Requires Pillow, numpy, opencv-python-headless, shapely, trimesh, mapbox-earcut.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import platform
from itertools import groupby
from pathlib import Path

import cv2
import mapbox_earcut
import numpy as np
from PIL import Image
import shapely
from shapely.geometry import Polygon
from shapely.geometry.polygon import orient
import trimesh


THRESHOLD = 120
MIN_AREA_PX2 = 30
SIMPLIFY_PX = 0.75
EXTRUSION_MM = 0.6
WIDTHS_MM = (60.0, 100.0)


def path_ring(points: list[list[float]]) -> str:
    return "M " + " L ".join(f"{p[0]:g} {p[1]:g}" for p in points) + " Z"


def svg_document(glyphs, bounds, mode):
    width, height = bounds
    colors = {
        "light": {"neutral": "#F7F7F7", "accent": "#EF3340"},
        "dark": {"neutral": "#151619", "accent": "#EF3340"},
        "mono": {"neutral": "#000000", "accent": "#000000"},
    }[mode]
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width + 2:g}" height="{height + 2:g}" viewBox="-1 -1 {width + 2:g} {height + 2:g}" role="img" aria-labelledby="logo-title">',
        '  <title id="logo-title">recardnize</title>',
        '  <desc>Konturgetreue Vektorisierung des freigegebenen Logoentwurfs A. Transparenter Hintergrund; alle sichtbaren Formen sind Pfade.</desc>',
    ]
    for glyph in glyphs:
        data = " ".join(path_ring(r) for r in [glyph["outer"], *glyph["holes"]])
        lines.append(f'  <path id="{glyph["id"]}" fill="{colors[glyph["color"]]}" fill-rule="evenodd" d="{data}"/>')
    lines.append('</svg>')
    return "\n".join(lines) + "\n"


def scad_document(glyphs, width, height):
    lines = [
        "// Recardnize: approved concept A, contour-derived geometry; units: mm.",
        "// No font required. No backing plate. Separate letters and i-dot are intentional.",
        "// Change logo_width and relief_height, then render (F6) and export STL.",
        "// Library use: use <recardnize-logo.scad>; recardnize_logo(width=60, height=0.4);",
        "logo_width = 60;",
        "relief_height = 0.6;",
        f"source_width = {width:g};",
        f"source_height = {height:g};",
        "",
        "// Dimensions are explicit module parameters; use imports need no global variables.",
        'module recardnize_logo(width = 60, height = 0.4, part = "all") {',
        '  assert(width > 0 && height > 0, "Positive mm dimensions required");',
        '  assert(part == "all" || part == "re-nize" || part == "card", "Unknown logo part");',
        "  linear_extrude(height = height, convexity = 10)",
        f"    scale([width/{width:g}, width/{width:g}])",
        "    union() {",
    ]
    for color, group in groupby(glyphs, key=lambda glyph: glyph["color"]):
        excluded_part = "re-nize" if color == "accent" else "card"
        lines.append(f'      if (part != "{excluded_part}") {{')
        for glyph in group:
            rings = [glyph["outer"], *glyph["holes"]]
            flat = [[x, height - y] for ring in rings for x, y in ring]
            cursor = 0
            paths = []
            for ring in rings:
                paths.append(list(range(cursor, cursor + len(ring))))
                cursor += len(ring)
            lines += [
                f'        // {glyph["id"]}',
                '        polygon(points=' + json.dumps(flat, separators=(",", ":")) + ', paths=' + json.dumps(paths, separators=(",", ":")) + ', convexity=10);',
            ]
        lines.append('      }')
    lines.append('    }')
    lines.append('}')
    lines.append('')
    lines.append('// Standalone defaults stay at the original 60 x 9.04065 x 0.6 mm.')
    lines.append('recardnize_logo(width = logo_width, height = relief_height);')
    return "\n".join(lines) + "\n"


def build(source: Path, root: Path):
    brand = root / "brand"
    assets = root / "src" / "assets" / "brand"
    brand.mkdir(parents=True, exist_ok=True)
    assets.mkdir(parents=True, exist_ok=True)
    rgb = np.array(Image.open(source).convert("RGB"))
    mask = (rgb.max(axis=2) > THRESHOLD).astype(np.uint8) * 255
    contours, hierarchy = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)
    hierarchy = hierarchy[0]
    outer_ids = [i for i, c in enumerate(contours) if hierarchy[i, 3] == -1 and cv2.contourArea(c) > MIN_AREA_PX2]
    outer_ids.sort(key=lambda i: (cv2.boundingRect(contours[i])[0], cv2.boundingRect(contours[i])[1]))
    assert len(outer_ids) == 11, f"Expected 10 letters and i-dot, got {len(outer_ids)}"
    all_points = np.concatenate([contours[i].reshape(-1, 2) for i in outer_ids])
    origin = all_points.min(axis=0)
    width, height = (all_points.max(axis=0) - origin).tolist()

    ids = ["r-1", "e-1", "c", "a", "r-2", "d", "n", "i-dot", "i-stem", "z", "e-2"]
    glyphs = []
    deviations = []
    raw_polygons = []
    for glyph_id, i in zip(ids, outer_ids, strict=True):
        children = [j for j in range(len(contours)) if hierarchy[j, 3] == i and cv2.contourArea(contours[j]) > MIN_AREA_PX2]
        raw_rings = [(contours[j].reshape(-1, 2) - origin).astype(float).tolist() for j in [i, *children]]
        rings = [(cv2.approxPolyDP(contours[j], SIMPLIFY_PX, True).reshape(-1, 2) - origin).astype(float).tolist() for j in [i, *children]]
        poly = Polygon(rings[0], rings[1:])
        raw_poly = Polygon(raw_rings[0], raw_rings[1:])
        assert poly.is_valid and poly.area > 0, f"Invalid outline: {glyph_id}"
        assert len(poly.interiors) == len(children)
        deviations.append(poly.boundary.hausdorff_distance(raw_poly.boundary))
        raw_polygons.append(raw_poly)
        glyphs.append({"id": glyph_id, "color": "accent" if glyph_id in {"c", "a", "r-2", "d"} else "neutral", "outer": rings[0], "holes": rings[1:]})

    assert sum(len(g["holes"]) for g in glyphs) == 4
    for mode, name in [("light", "recardnize-logo.svg"), ("dark", "recardnize-logo-dark.svg"), ("mono", "recardnize-logo-mono.svg")]:
        content = svg_document(glyphs, (width, height), mode)
        (assets / name).write_text(content, encoding="utf-8")
        (brand / name).write_text(content, encoding="utf-8")
    # Preserve the 1-unit canvas safety margin while making the visible logo 60 mm.
    cad_svg = svg_document(glyphs, (width, height), "mono").replace(
        f'width="{width + 2:g}" height="{height + 2:g}"',
        f'width="{(width + 2) * 60 / width:.12f}mm" height="{(height + 2) * 60 / width:.12f}mm"',
        1,
    )
    (brand / "recardnize-logo-60mm.svg").write_text(cad_svg, encoding="utf-8")
    (brand / "recardnize-logo.scad").write_text(scad_document(glyphs, width, height), encoding="utf-8")
    geometry = {"source_filename": source.name, "source_sha256": hashlib.sha256(source.read_bytes()).hexdigest(), "source_size_px": [rgb.shape[1], rgb.shape[0]], "origin_px": origin.tolist(), "geometry_size_units": [width, height], "viewBox": [-1, -1, width + 2, height + 2], "threshold_max_rgb": THRESHOLD, "min_contour_area_px2": MIN_AREA_PX2, "simplify_tolerance_px": SIMPLIFY_PX, "max_boundary_deviation_px": max(deviations), "glyphs": glyphs}
    (brand / "recardnize-logo.geometry.json").write_text(json.dumps(geometry, indent=2) + "\n", encoding="utf-8")

    reports = []
    printability = []
    polygons_units = [Polygon(g["outer"], g["holes"]) for g in glyphs]
    for index, polygon in enumerate(polygons_units):
        for other in range(index + 1, len(polygons_units)):
            printability.append({"between": [glyphs[index]["id"], glyphs[other]["id"]], "gap_at_60mm": polygon.distance(polygons_units[other]) * 60 / width})
    for target_width in WIDTHS_MM:
        scale = target_width / width
        meshes = []
        mesh_reports = []
        for glyph in glyphs:
            outer = [(x * scale, (height - y) * scale) for x, y in glyph["outer"]]
            holes = [[(x * scale, (height - y) * scale) for x, y in hole] for hole in glyph["holes"]]
            polygon = orient(Polygon(outer, holes), sign=1.0)
            mesh = trimesh.creation.extrude_polygon(polygon, EXTRUSION_MM, engine="earcut")
            assert mesh.is_watertight and mesh.is_winding_consistent and mesh.volume > 0
            assert mesh.euler_number == 2 - 2 * len(holes)
            assert abs(mesh.volume - polygon.area * EXTRUSION_MM) < 1e-6
            meshes.append(mesh)
            mesh_reports.append({"id": glyph["id"], "holes": len(holes), "watertight": bool(mesh.is_watertight), "consistent_winding": bool(mesh.is_winding_consistent), "euler_number": int(mesh.euler_number), "volume_mm3": float(mesh.volume), "faces": len(mesh.faces)})
        combined = trimesh.util.concatenate(meshes)
        name = f"recardnize-logo-{target_width:g}mm.stl"
        combined.export(brand / name)
        # Reload exported binary STL, checking the file users will actually receive.
        reloaded = trimesh.load(brand / name, force="mesh", process=True)
        assert reloaded.is_watertight and reloaded.is_winding_consistent and reloaded.volume > 0
        assert np.allclose(reloaded.extents, [target_width, height * scale, EXTRUSION_MM], atol=1e-5)
        reports.append({"filename": name, "units": "mm (STL stores unitless coordinates)", "dimensions_mm": reloaded.extents.tolist(), "volume_mm3": float(reloaded.volume), "watertight": bool(reloaded.is_watertight), "consistent_winding": bool(reloaded.is_winding_consistent), "disconnected_solids": len(meshes), "holes": sum(len(g["holes"]) for g in glyphs), "faces": len(reloaded.faces), "components": mesh_reports})
        if target_width == 60:
            for color, suffix in [("accent", "card"), ("neutral", "re-nize")]:
                part = trimesh.util.concatenate([mesh for mesh, glyph in zip(meshes, glyphs, strict=True) if glyph["color"] == color])
                assert part.is_watertight and part.is_winding_consistent and part.volume > 0
                part.export(brand / f"recardnize-logo-60mm-{suffix}.stl")
    validation = {"reference_sha256": geometry["source_sha256"], "parameters": {k: v for k, v in geometry.items() if k != "glyphs"}, "tools": {"python": platform.python_version(), "numpy": np.__version__, "opencv": cv2.__version__, "shapely": shapely.__version__, "trimesh": trimesh.__version__, "mapbox_earcut": mapbox_earcut.__version__}, "svg": {"path_count": len(glyphs), "counter_count": 4, "text_elements": 0, "embedded_raster_images": 0, "background": "transparent", "max_outline_deviation_at_60mm": max(deviations) * 60 / width}, "minimum_interpart_gap_at_60mm": min(printability, key=lambda item: item["gap_at_60mm"]), "color_parts": {"files": ["recardnize-logo-60mm-card.stl", "recardnize-logo-60mm-re-nize.stl"], "coordinate_system": "Same as combined 60mm STL. Import together as parts; do not auto-center individually."}, "stl": reports}
    (brand / "validation.json").write_text(json.dumps(validation, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(validation, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[2])
    args = parser.parse_args()
    build(args.source, args.root)
