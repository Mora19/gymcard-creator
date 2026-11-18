// Integration smoke test. use imports the module, not the standalone 0.6 mm logo.
// Expected bounds: X=3..33, Y=5..9.5203252033, Z=2..2.4 mm.
use <../recardnize-logo.scad>

translate([3, 5, 2])
  recardnize_logo(width = 30, height = 0.4);
