// ============================================
// Puzzle-Gehaeuse fuer zwei Puzzle-Teile (88mm / A1 Mini)
// Fenster zeigt nur 3 Ziffern je Piece; Zacken gleiche Laenge
// ============================================

puzzle_height = 1.2;

xy_scale_from_108 = 88 / 108;
two_pieces_width = 55 * xy_scale_from_108;

piece_svg = "../public/svg-simplified/5a4_layer4.svg";
piece_svg_b = "../public/svg-simplified/7a6_layer1.svg";
piece_xy_scale = 88 / 360;
piece_length = 360 * piece_xy_scale;
piece_depth = 100 * piece_xy_scale;

// OpenSCAD SVG-Import Bounds (alle a1mini-v4 layer1 gleich)
piece_import_y_min = -15.82098765472571;
piece_import_y_max = 8.623456789718734;

wall_thickness = 3;
tolerance = 0.25;

funnel_top_height = 5;
funnel_length = 25;
min_opening_height = 1.4;

jagged_wall_side = "min"; // ["min", "max"]

jagged_amplitude = 10 * piece_xy_scale;
jagged_lip_depth = jagged_amplitude + tolerance + 0.6;

// Fensterbreite (mm) und horizontale Lage von Pieces + Zacken
fixed_inner_length = 30.0;
// groesser = alles nach LINKS, kleiner = alles nach RECHTS (Pieces und Zacken)
digits_center_svg = 160;

inner_length = fixed_inner_length;
// + jagged_amplitude: Zacken ragen nach innen, brauchen Extra-Platz in Y
inner_width = two_pieces_width + tolerance * 2 + jagged_amplitude - 1.5;
inner_height = puzzle_height + tolerance * 2;

total_length = inner_length + wall_thickness * 2;
total_width = inner_width + wall_thickness * 2;
total_height = inner_height + wall_thickness * 2 + 1;

show_puzzle_preview = true;
render_mode = "print"; // ["preview", "print"]

// Zackprofil: doppelte Frequenz (Pitch 20 SVG = halber Beat)
// Flanken 45° (Amplitude 10 ueber 10 SVG); Phase folgt digits_center_svg
jagged_pitch_svg = 20;

function piece_origin_x() =
    wall_thickness + inner_length / 2 - digits_center_svg * piece_xy_scale;
function jagged_origin_x() = piece_origin_x() + 100 * piece_xy_scale;
function jagged_is_min() = jagged_wall_side == "min";
function piece_stack_pitch() = piece_depth - 2 * jagged_amplitude;
function piece_y_on_min_wall() = wall_thickness - piece_import_y_min;
function piece_y_on_max_wall() = wall_thickness + inner_width - piece_import_y_max;

function jagged_period() = jagged_pitch_svg * piece_xy_scale;
function jagged_rise() = 10 * piece_xy_scale;
// Erste Spike-Kerbe, gekoppelt an Piece-Lage
function jagged_phase0() = jagged_origin_x() + jagged_rise();
function mod_pos(a, m) = a - m * floor(a / m);
function clamp_win(x) = min(inner_length, max(0, x));

function jagged_h(t) =
    let (p = jagged_period(), r = jagged_rise(), a = jagged_amplitude)
        (t <= 1e-9) ? 0 :
        (t <= r) ? (a * t / r) :
        (t <= p) ? (a * (1 - (t - r) / (p - r))) :
        0;

// Zackpunkte rekursiv, sortiert nach k — wandert mit digits_center_svg
function jagged_pts_k(k, k_max) =
    (k > k_max) ? [] :
    let (
        p = jagged_period(),
        r = jagged_rise(),
        ph = jagged_phase0(),
        x_notch = clamp_win(ph + k * p - wall_thickness),
        x_peak = clamp_win(ph + k * p + r - wall_thickness),
        here = concat(
            (x_notch > 0.001 && x_notch < inner_length - 0.001) ? [[x_notch, 0]] : [],
            (x_peak > 0.001 && x_peak < inner_length - 0.001) ? [[x_peak, jagged_amplitude]] : []
        )
    )
    concat(here, jagged_pts_k(k + 1, k_max));

function jagged_envelope() =
    let (
        p = jagged_period(),
        ph = jagged_phase0(),
        k0 = floor((wall_thickness - ph) / p) - 1,
        k1 = ceil((wall_thickness + inner_length - ph) / p) + 1,
        mid = jagged_pts_k(k0, k1),
        h0 = jagged_h(mod_pos(wall_thickness - ph, p)),
        h1 = jagged_h(mod_pos(wall_thickness + inner_length - ph, p))
    )
    concat([[0, h0]], mid, [[inner_length, h1]]);

module jagged_cut_2d() {
    raw = jagged_envelope();
    pts = [for (i = [0:len(raw) - 1])
        if (i == 0 || abs(raw[i][0] - raw[i - 1][0]) > 0.001)
            [raw[i][0], max(0, raw[i][1] - tolerance)]];
    n = len(pts);
    cavity_y = jagged_lip_depth + 1;
    polygon(points = concat(
        [for (i = [0:n - 1]) [pts[i][0], pts[i][1]]],
        [[pts[n - 1][0], cavity_y]],
        [[pts[0][0], cavity_y]]
    ));
}

module jagged_cut_3d() {
    translate([0, 0, wall_thickness])
        linear_extrude(height = inner_height + 0.02, convexity = 10)
            if (jagged_is_min()) {
                translate([wall_thickness, wall_thickness])
                    jagged_cut_2d();
            } else {
                translate([wall_thickness, wall_thickness + inner_width])
                    mirror([0, 1, 0])
                        jagged_cut_2d();
            }
}

module outer_shell() {
    union() {
        cube([total_length, total_width, total_height]);
        translate([-funnel_length, 0, 0])
            cube([funnel_length, total_width, total_height]);
        translate([total_length, 0, 0])
            cube([funnel_length, total_width, total_height]);
    }
}

module rectangular_cavity() {
    translate([wall_thickness, wall_thickness, wall_thickness])
        cube([inner_length, inner_width, inner_height + wall_thickness + 1]);
}

module jagged_lip_block() {
    if (jagged_is_min()) {
        translate([wall_thickness, wall_thickness, wall_thickness])
            cube([inner_length, jagged_lip_depth, inner_height]);
    } else {
        translate([wall_thickness, wall_thickness + inner_width - jagged_lip_depth, wall_thickness])
            cube([inner_length, jagged_lip_depth, inner_height]);
    }
}

module funnel_cuts() {
    translate([-funnel_length - 1, wall_thickness, wall_thickness]) {
        hull() {
            cube([1, inner_width, funnel_top_height]);
            translate([funnel_length + wall_thickness + 2, 0, 0])
                cube([1, inner_width, min_opening_height]);
        }
    }
    translate([wall_thickness + inner_length - 2, wall_thickness, wall_thickness]) {
        hull() {
            cube([1, inner_width, min_opening_height]);
            translate([wall_thickness + funnel_length + 2, 0, 0])
                cube([1, inner_width, funnel_top_height]);
        }
    }
}

module window_cutout() {
    translate([wall_thickness, wall_thickness, total_height - wall_thickness - 1])
        cube([inner_length, inner_width, wall_thickness + 2]);
}

module main_housing() {
    difference() {
        union() {
            difference() {
                outer_shell();
                rectangular_cavity();
                funnel_cuts();
                window_cutout();
            }
            jagged_lip_block();
        }
        jagged_cut_3d();
    }
}

module piece_layer_2d(file, layer_id) {
    scale([piece_xy_scale, piece_xy_scale])
        import(file, id = layer_id);
}

// Beat: voller Beat = 40 SVG, halber = Zack-Pitch 20 SVG
function half_beat_mm() = jagged_pitch_svg * piece_xy_scale;
function full_beat_mm() = 2 * half_beat_mm();

module puzzle_preview_piece(is_second = false) {
    z = wall_thickness + tolerance;
    file1 = is_second ? piece_svg_b : piece_svg;
    // layer3 = Ziffern (gleiche Basisdatei mit _layer3)
    file3 = is_second
        ? "../public/svg-simplified/7a6_layer3.svg"
        : "../public/svg-simplified/5a4_layer3.svg";
    y_first = jagged_is_min() ? piece_y_on_min_wall() : piece_y_on_max_wall();
    y_second = jagged_is_min() ? (y_first + piece_stack_pitch()) : (y_first - piece_stack_pitch());
    y = is_second ? y_second : y_first;
    // Oberes Piece: +1/2 Beat, dann noch 1 Beat nach links → Netto -1/2 Beat
    x = piece_origin_x() + (is_second ? (half_beat_mm() - full_beat_mm()) : 0);

    translate([x, y, z]) {
        // Base
        color(is_second ? "#9B7EBD" : "#5E43B7", 0.92)
            linear_extrude(height = 1.0)
                piece_layer_2d(file1, "layer1");
        // Ziffern oben drauf
        color("#F2F0E6", 0.98)
            translate([0, 0, 1.0])
                linear_extrude(height = 0.2)
                    piece_layer_2d(file3, "layer3");
    }
}

module puzzle_case_assembly() {
    color("#888888", 0.4)
        main_housing();
    if (show_puzzle_preview) {
        puzzle_preview_piece(false);
        puzzle_preview_piece(true);
    }
}

module puzzle_case_for_print() {
    main_housing();
}

if (render_mode == "preview") {
    puzzle_case_assembly();
} else {
    puzzle_case_for_print();
}

echo("=== GEHAEUSE (Fenster = 3 Ziffern) ===");
echo(str("Gesamt: ", total_length, " x ", total_width, " x ", total_height, " mm"));
echo(str("Fenster/Innen: ", inner_length, " x ", inner_width, " x ", inner_height, " mm"));
echo(str("Zacken = Fensterlaenge, Pitch (1/2 Beat): ", jagged_pitch_svg * piece_xy_scale, " mm"));
