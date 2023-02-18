const queen_locs = {};
const N = 8;

// squares have integer locations that map to x/y zero-based coordinates
function integer_loc(x, y) {
    return N * y + x;
}

function x_coord(loc) {
    return loc % N;
}

function y_coord(loc) {
    return Math.floor(loc / N);
}

function coords_string(loc) {
    return "(" + x_coord(loc) + "," + y_coord(loc) + ")";
}

function is_dark_square(loc) {
    const x = x_coord(loc);
    const y = y_coord(loc);
    return x % 2 == y % 2;
}

function for_all_squares(f) {
    for (var i = 0; i < N*N; ++i) {
        f(i);
    }
}

function reset_queen_locations() {
    for (const loc in queen_locs) {
        delete queen_locs[loc];
    }
}

function get_attacked_squares() {
    const rows = {};
    const cols = {};
    const up_diags = {};
    const down_diags = {};
    const attacks = {};

    for_all_squares((loc) => {
        const x = x_coord(loc);
        const y = y_coord(loc);
        attacks[loc] = 0; // for now
        rows[y] = 0;
        cols[x] = 0;
        up_diags[x - y] = 0;
        down_diags[x + y] = 0;
    });

    for (const loc in queen_locs) {
        const x = x_coord(loc);
        const y = y_coord(loc);
        rows[y] += 1;
        cols[x] += 1;
        up_diags[x - y] += 1;
        down_diags[x + y] += 1;
    }

    for_all_squares((loc) => {
        const x = x_coord(loc);
        const y = y_coord(loc);
        attacks[loc] += rows[y];
        attacks[loc] += cols[x];
        attacks[loc] += up_diags[x - y];
        attacks[loc] += down_diags[x + y];
    });

    return attacks;
}

function under_attack(loc) {
    const attacked_squares = get_attacked_squares();

    return attacked_squares[loc] > 0;
}

function count_free_squares(attacked_squares) {
    var n = N * N;

    for (const square in attacked_squares) {
        if (attacked_squares[square] > 0) {
            n -= 1;
        }
    }

    return n;
}

function count_num_queens_left() {
    var n = N;

    for (const loc in queen_locs) {
        n -= 1;
    }

    return n;
}

function get_status_message_after_queen_move(attacked_squares) {
    const num_free_squares = count_free_squares(attacked_squares);
    const num_queens_left = count_num_queens_left();

    var status = "";
    if (num_queens_left == 0) {
        temp_flash("GREAT JOB!!!!");
        status = "YOU WIN! ";
    } else if (num_free_squares == 0) {
        temp_flash("OH NO!");
        status = "YOU LOSE! ";
    } 

    return status +
        "free squares: " + num_free_squares + ", " +
        "unplaced queens: " + num_queens_left;
}

function write_status(text) {
    const div = document.getElementById("status");
    div.innerText = text;
}

function clear_flash() {
    const div = document.getElementById("flash");
    div.innerText = "";
}

function write_flash(text) {
    const div = document.getElementById("flash");
    div.innerText = text;
}

function temp_flash(text) {
    write_flash(text);
    setTimeout(clear_flash, 2000);
}

function add_table_styles(table) {
    table.style.border = "1px solid blue";
    table.style["border-collapse"] = "collapse";
}

function draw_queen_square(td) {
    td.style["background-color"] = "cyan";
    td.style["opacity"] = 1;
    td.style["font-size"] = "130%";
    td.innerText = "Q";
}

function draw_normal_square(td, loc, attacked_squares) {
    const num_attacks = attacked_squares[loc];
    const color = num_attacks ? "red" : is_dark_square(loc) ? "lightgray" : "white";
    const opacity = num_attacks ? 0.75 : 1;
    td.style["background-color"] = color;
    td.style["opacity"] = opacity;
    td.style["font-size"] = "80%";
    td.innerText = coords_string(loc);
}

function make_cell(loc) {
    const td = document.createElement('td');
    td.id = loc;
    td.style.height = "50px";
    td.style.width = "50px";
    td.style.border = "1px solid blue";
    td.style["text-align"] = "center";
    draw_normal_square(td, loc, {});
    return td;
}

function update_square(loc, attacked_squares) {
    const td = document.getElementById(loc);
    if (queen_locs[loc]) {
        draw_queen_square(td);
    } else {
        draw_normal_square(td, loc, attacked_squares);
    }
}

function redraw_board() {
    const attacked_squares = get_attacked_squares();
    for_all_squares((loc) => {
        update_square(loc, attacked_squares);
    });

    const message = get_status_message_after_queen_move(attacked_squares);
    write_status(message);
}

function handle_square_click(td, loc) {
    clear_flash();
    if (queen_locs[loc]) {
        delete queen_locs[loc];
    } else {
        if (under_attack(loc)) {
            temp_flash("The square you clicked is under attack!");
            return;
        }
        queen_locs[loc] = true;
    }
    redraw_board();
}

function set_click_handler(td, loc) {
    td.onclick = () => {
        handle_square_click(td, loc);
    };
}

function make_board() {
    const table = document.getElementById("chessboard");
    table.children = [];
    for (var y = N - 1; y >= 0; --y) {
        const tr = document.createElement('tr');
        for (var x = 0; x < N; ++x) {
            const loc = integer_loc(x, y);
            var td = make_cell(loc);
            set_click_handler(td, loc);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    add_table_styles(table);
}

function reset_the_game() {
    clear_flash();
    reset_queen_locations();
    redraw_board();
}

function set_reset_handler() {
    const reset_button = document.getElementById("reset");
    reset_button.onclick = reset_the_game;
}

make_board();
set_reset_handler();
