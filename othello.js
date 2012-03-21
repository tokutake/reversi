$ = function(name) {
  if (name == 'body') {
    return document.getElementsByTagName('body')[0];
  } else if (name == 'td') {
    return document.getElementsByTagName('td');
  }

  return document.getElementById(name);
}

const EMPTY = 'empty';
const WHITE = 'white';
const BLACK = 'black';
const DEBUG = true;
const BOARD_WIDTH = 8;

var body;
var tds;
var cells = [];
var turn = BLACK;
var AI = true;

window.onload = function() {
  body = document.getElementsByTagName('body')[0];
  tds = document.getElementsByTagName('td');

  for (var i = 0; i < tds.length; i++) {
    var cell = tds[i];
    cell.bgColor = 'green';
    cell.width = cell.height = 50;
    cell.setAttribute('x', i % BOARD_WIDTH);
    cell.setAttribute('y', Math.floor(i / BOARD_WIDTH));
  }

  for (var i = 0; i < tds.length; i++) {
    tds[i].onclick = function() {
      var x = parseInt(this.getAttribute('x'));
      var y = parseInt(this.getAttribute('y'));

      console.log('put x:' + x + ' :y' + y);
      var next = put(x, y, turn);

      if (next) {
        turn = turn == BLACK ? WHITE : BLACK;
        refresh();
      }
    }
  }

  for (var i = 0; i < BOARD_WIDTH; i++) {
    cells[i] = [];
    for (var j = 0; j < BOARD_WIDTH; j++) {
      cells[i][j] = EMPTY;
    }
  }

  init_table();
}

var init_table = function() {
  cells[3][3] = BLACK;
  cells[4][4] = BLACK;
  cells[3][4] = WHITE;
  cells[4][3] = WHITE;

  refresh();
}

var refresh = function() {
  var num_black = 0;
  var num_white = 0;


  var create_black = function() {
    var black = document.createElement('embed');
    black.setAttribute('width', '50');
    black.setAttribute('height', '50');
    black.setAttribute('src', 'black.svg');
    black.setAttribute('type', 'image/svg+xml');

    return black;
  }
  var black = create_black();

  var create_white = function() {
    var white = document.createElement('embed');
    white.setAttribute('width', '50');
    white.setAttribute('height', '50');
    white.setAttribute('src', 'white.svg');
    white.setAttribute('type', 'image/svg+xml');

    return white;
  }

  var white = create_white();

  for (var i = 0; i < BOARD_WIDTH; i++) {
    for (var j = 0; j < BOARD_WIDTH; j++) {
      var td = tds[i + j * BOARD_WIDTH];

      if (td.hasChildNodes()) {
        console.log(td.hasChildNodes);
        console.log(td.firstChild);
        td.removeChild(td.firstChild);
      }

      if (cells[i][j] == BLACK) {
        td.appendChild(create_black());
      } else if (cells[i][j] == WHITE) {
        td.appendChild(create_white());
      } else if (cells[i][j] == EMPTY) {
      }
    }
  }

  for (var i = 0; i < cells.length; i++) {
    for (var j = 0; j < cells[i].length; j++) {
      var color = cells[i][j];
      if (color == BLACK) {
        num_black++;
      } else if (color == WHITE) {
        num_white++;
      }
    }
  }

  $('num_black').textContent = num_black;
  $('num_white').textContent = num_white;
  $('turn').textContent = turn;
}

var put = function(x, y, color) {
  var cell = cells[x][y];
  var next = false;

  if (cell == EMPTY) {
    var moves = [[1, 0], [-1, 0], [0, 1], [0, -1], [-1, -1], [1, 1], [-1, 1], [1, -1]];

    for (var i = 0; i < moves.length; i++) {
      var move = moves[i];
      if (search(cells, x, y, move, color)) {
        cells[x][y] = color;
        reverse(x + move[0], y + move[1], move, color);
        next = true;
      }
    }
  }

  return next;
}

var on_table = function(x, y) {
  return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_WIDTH;
}

var reverse = function(x, y, move, color) {
  for (; cells[x][y] != color && on_table(x, y); x += move[0], y += move[1]) {
    cells[x][y] = color;
  }
}

var search = function(table, x, y, move, color) {
  x += move[0];
  y += move[1];
  if (on_table(x, y) && table[x][y] != opposite(color)) {
    console.log('x:' + x + ' y:' + y + ' color:' + color + ' not found');
    return false;
  }

  for (; on_table(x, y); x += move[0], y += move[1]) {
    if (table[x][y] == color) {
      console.log('x:' + x + ' y:' + y + ' color:' + color + ' found');
      return true;
    }
  }
  console.log('x:' + x + ' y:' + y + ' color:' + color + ' not found');
  return false;
}

function Table() {
  this.cells = [];

  this.init = function() {
    for (var i = 0; i < BOARD_WIDTH; i++) {
      this.cells[i] = [];
      for (var j = 0; j < BOARD_WIDTH; j++) {
        this.cells[i][j] = EMPTY;
      }
    }
  }

  this.initWithCells = function(cells) {
    for (var i = 0; i < BOARD_WIDTH; i++) {
      this.cells[i] = [];
      for (var j = 0; j < BOARD_WIDTH; j++) {
        this.cells[i][j] = cells[i][j];
      }
    }
  }

  this.reverse = function(x, y, move, color) {
    for (; this.cells[x][y] != color && on_table(x, y); x += move[0], y += move[1]) {
      this.cells[x][y] = color;
    }
  }

  this.search = function(x, y, move, color) {
    x += move[0];
    y += move[1];
    if (on_table(x, y) && this.cells[x][y] != opposite(color)) {
      return false;
    }

    for (; on_table(x, y); x += move[0], y += move[1]) {
      if (this.cells[x][y] == color) {
        return true;
      }
    }
    return false;
  }

  this.put = function(x, y, color) {
    var cell = this.cells[x][y];

    if (cell == EMPTY) {
      var moves = [[1, 0], [-1, 0], [0, 1], [0, -1], [-1, -1], [1, 1], [-1, 1], [1, -1]];

      for (var i = 0; i < moves.length; i++) {
        var move = moves[i];
        if (this.search(x, y, move, color)) {
          cells[x][y] = color;
          reverse(x + move[0], y + move[1], move, color);
        }
      }
    }
  }

  this.eval = function() {
      var value = 0;
      for (var i = 0; i < BOARD_WIDTH; i++) {
        for (var j = 0; j < BOARD_WIDTH; j++) {
          value = can_put(table, i, j, color) ? 1 : 0;
        }
      }

      return value;
    } 

  this.can_put = function(x, y, color) {
      var moves = [[1, 0], [-1, 0], [0, 1], [0, -1], [-1, -1], [1, 1], [-1, 1], [1, -1]];

      for (var i = 0; i < moves.length; i++) {
        if (search(table, x, y, move, color)) {
          return true;
        }
      }

      return false;
    }

  this.clone = function() {
      var new_table = new Table(); 
      for (var i = 0; i < BOARD_WIDTH; i++) {
        new_table.cells[i] = [];
        for (var j = 0; j < BOARD_WIDTH; j++) {
          new_table.cells[i][j] = this.cells[i][j];
        }
      }

      return new_table;
    }
}

var Com = {
  color: 'none',

  eval_move:
    function(table, x, y) {
      var cand = new Array();

      if (table.can_put(i, j, this.color)) {
        var temp = table.clone();
        temp.put(i, j, this.color);
        return temp.eval;
      } else {
        return 0;
      }
    },

  decide_move:
    function(table) {
      var candidates = new Array();

      for (var i = 0; i < BOARD_WIDTH; i++) {
        for (var j = 0; j < BOARD_WIDTH; j++) {
          var value = this.eval_move(table, i, j);
          candidates.push({ x:i, y:j, value:value});
        }
      }

      var max = 0;
      var max_move = new Object();
      candidates.forEach( function(elem) {
        if (elem.value > max) {
          max = elem.value;
          max_move = elem;
        }
      });
    }
}

var opposite = function(color) {
  return color == BLACK ? WHITE : BLACK;
}

var pass = function() {
  turn = opposite(turn);
}

