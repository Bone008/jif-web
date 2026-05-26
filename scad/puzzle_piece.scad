// Extrudes one layer of a juggling puzzle piece from a preprocessed SVG.
//
// The input SVG must contain only the geometry for ONE layer (the build
// script splits the 4-layer source into 4 single-layer SVGs first), with
// text and strokes already flattened to filled paths via:
//   inkscape --actions="select-all;object-to-path;select-all;object-stroke-to-path;..."
// Filled paths are required because OpenSCAD's import() for SVG silently
// drops strokes and <text>.
//
// Usage (one of the four layers at a time):
//   openscad -o out.stl -D 'svg_file="path/to/piece_layer1.svg"' -D layer=1 puzzle_piece.scad
//
// Layer 1 is the filled background, extruded `base_height` mm at Z=0.
// Layers 2..4 are the outline / throw numbers / object-count label, each
// extruded `detail_height` mm at Z=base_height. Merge the four STLs in a
// slicer (or as multi-material parts) to print a single multi-color piece.

svg_file = "svg-simplified/example_layer1.svg";  // overridden via -D on the CLI
layer = 1;                             // overridden via -D on the CLI (1..4)

scale_factor = 1.0;
base_height = 2.0;
detail_height = 0.15;

layer_height = (layer == 1) ? base_height : detail_height;
layer_z = (layer == 1) ? 0 : base_height;

translate([0, 0, layer_z])
  linear_extrude(height = layer_height)
    scale([scale_factor, scale_factor, 1])
      import(svg_file);
