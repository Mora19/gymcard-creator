"""Export the added 0.4 mm STL and verify standalone + use-module behavior.

Requires numpy and trimesh. Does not alter SVGs, prior STL exports or production CAD.
"""
from __future__ import annotations

import argparse
import io
import json
from pathlib import Path
import subprocess

import numpy as np
import trimesh


def compile_mesh(executable: Path, source: Path, defines=(), output: Path | None = None):
    # Binary STL needs a seekable destination for its triangle-count header.
    # Use ASCII for in-memory checks and a real binary file for the deliverable.
    command = [str(executable), "--export-format", "binstl" if output else "asciistl", "-o", str(output) if output else "-"]
    for name, value in defines:
        command += ["-D", f"{name}={value}"]
    command += [str(source)]
    result = subprocess.run(command, capture_output=True, check=True)
    diagnostics = (result.stderr + (result.stdout if output else b"")).decode("utf-8", errors="replace")
    assert "WARNING:" not in diagnostics and "ERROR:" not in diagnostics, diagnostics
    payload = output.read_bytes() if output else result.stdout
    mesh = trimesh.load(io.BytesIO(payload), file_type="stl", force="mesh", process=True)
    assert mesh.is_watertight and mesh.is_winding_consistent and mesh.volume > 0
    return payload, mesh, diagnostics


def component_count(mesh):
    """Count face-connected components without an optional scipy dependency."""
    parent = list(range(len(mesh.faces)))

    def find(item):
        while parent[item] != item:
            parent[item] = parent[parent[item]]
            item = parent[item]
        return item

    for left, right in mesh.face_adjacency:
        parent[find(int(left))] = find(int(right))
    return len({find(i) for i in range(len(mesh.faces))})


def report(mesh, diagnostics):
    count = component_count(mesh)
    holes = int((2 * count - mesh.euler_number) / 2)
    assert count == 11 and holes == 4, (count, holes)
    return {
        "bounds_mm": mesh.bounds.tolist(),
        "dimensions_mm": mesh.extents.tolist(),
        "volume_mm3": float(mesh.volume),
        "watertight": bool(mesh.is_watertight),
        "consistent_winding": bool(mesh.is_winding_consistent),
        "solids": count,
        "through_holes": holes,
        "faces": len(mesh.faces),
        "warnings": False,
        "diagnostics": diagnostics.strip().splitlines(),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--openscad", type=Path, default=Path(r"C:\Program Files (x86)\OpenSCAD\openscad.com"))
    args = parser.parse_args()
    brand = Path(__file__).resolve().parents[1]
    scad = brand / "recardnize-logo.scad"
    geometry = json.loads((brand / "recardnize-logo.geometry.json").read_text(encoding="utf-8"))
    xy_ratio = geometry["geometry_size_units"][1] / geometry["geometry_size_units"][0]
    previous = trimesh.load(brand / "recardnize-logo-60mm.stl", force="mesh", process=True)

    _, standalone, standalone_diagnostics = compile_mesh(args.openscad, scad)
    assert np.allclose(standalone.bounds, [[0, 0, 0], [60, 60 * xy_ratio, 0.6]], atol=1e-5)
    assert abs(standalone.volume - previous.volume) < 1e-3

    output = brand / "recardnize-logo-60mm-0.4mm.stl"
    _, thin, thin_diagnostics = compile_mesh(args.openscad, scad, [("logo_width", 60), ("relief_height", 0.4)], output=output)
    assert np.allclose(thin.bounds, [[0, 0, 0], [60, 60 * xy_ratio, 0.4]], atol=1e-5)
    assert abs(thin.volume - previous.volume * 2 / 3) < 1e-3
    reloaded = trimesh.load(output, force="mesh", process=True)
    assert np.allclose(reloaded.bounds, thin.bounds, atol=1e-6)

    _, library, library_diagnostics = compile_mesh(args.openscad, brand / "tools" / "recardnize-module-smoke.scad")
    assert np.allclose(library.bounds, [[3, 5, 2], [33, 5 + 30 * xy_ratio, 2.4]], atol=1e-5)
    assert abs(library.volume - thin.volume / 4) < 1e-3

    version_result = subprocess.run([str(args.openscad), "--version"], capture_output=True, check=True)
    result = {
        "openscad_version": (version_result.stdout + version_result.stderr).decode("utf-8", errors="replace").strip(),
        "standalone_unchanged_0_6mm": report(standalone, standalone_diagnostics),
        "added_0_4mm_stl": {"filename": output.name, **report(reloaded, thin_diagnostics)},
        "use_module_30mm_offset": report(library, library_diagnostics),
    }
    (brand / "openscad-validation.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
