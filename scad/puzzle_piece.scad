// OpenSCAD script for rendering puzzle pieces (v2)
// layer 1 = Base (purple), 1mm height - imports SVG layer1
// layer 2 = Details (white), 0.2mm height on top - imports SVG layer2 + layer3

layer = 1; // [1, 2, 3, 4, "All"]
svg_file = "input/puzzlepiece-v2-776-fixed.svg";

function ExtruderColor(Extruder) =
    (Extruder == 1) ? "purple" :
    (Extruder == 2) ? "white" :
    (Extruder == 3) ? "red" :
    (Extruder == 4) ? "green" :
    "gray";

module Extruder(DoExtruder)
{
    color(ExtruderColor(DoExtruder))
    {
        if (layer == "All" || DoExtruder == layer)
        {
            children();
        }
    }
}

// Scale: SVG width 360 → 88mm length (A1 Mini). Pass svg_file=..._layerN.svg for simplified SVGs.
XY_Scale = 88 / 360;

// layer 1: Base (purple) - 1mm height at z=0
Extruder(DoExtruder = 1){
    scale([XY_Scale, XY_Scale, 1])
        linear_extrude(height = 1)
        {
            import(svg_file, id = "layer1");
        }
};

// layer 2: Details (white) - 0.2mm height at z=1mm
// SVG layer2
Extruder(DoExtruder = 2){
    translate(v = [0, 0, 1])
        scale([XY_Scale, XY_Scale, 1])
            linear_extrude(height = 0.2)
            {
                import(svg_file, id = "layer2");
            }
};

// layer 3: Details (red) - 0.2mm height at z=1.0mm
// SVG layer3
Extruder(DoExtruder = 3){
    translate(v = [0, 0, 1])
        scale([XY_Scale, XY_Scale, 1])
            linear_extrude(height = 0.2)
            {
                import(svg_file, id = "layer3");
            }
};

// layer 4: Details (green) - 0.2mm height at z=1.0mm
// SVG layer4
Extruder(DoExtruder = 4){
    translate(v = [0, 0, 1])
        scale([XY_Scale, XY_Scale, 1])
            linear_extrude(height = 0.2)
            {
                import(svg_file, id = "layer4");
            }
};
