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
    cell.width = cell.height = 30;
    cell.setAttribute('x', i % 8);
    cell.setAttribute('y', Math.floor(i / 8));
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

  for (var i = 0; i < 8; i++) {
    cells[i] = [];
    for (var j = 0; j < 8; j++) {
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

  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      if (cells[i][j] == BLACK) {
        tds[i + j * 8].bgColor = 'black';
      } else if (cells[i][j] == WHITE) {
        tds[i + j * 8].bgColor = 'white';
      } else if (cells[i][j] == EMPTY) {
        tds[i + j * 8].bgColor = 'green';
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
      if (search(x + move[0], y + move[1], move, color)) {
        cells[x][y] = color;
        reverse(x + move[0], y + move[1], move, color);
        next = true;
      }
    }
  }

  return next;
}

var on_table = function(x, y) {
  return x >= 0 && x < 8 && y >= 0 && y < 8;
}

var reverse = function(x, y, move, color) {
  for (; cells[x][y] != color && on_table(x, y); x += move[0], y += move[1]) {
    cells[x][y] = color;
  }
}

var search = function(x, y, move, color) {
  for (; on_table(x, y); x += move[0], y += move[1]) {
    if (cells[x][y] == color) {
      console.log('x:' + x + ' y:' + y + ' color:' + color + ' found');
      return true;
    }
  }
  console.log('x:' + x + ' y:' + y + ' color:' + color + ' not found');
  return false;
}

var com = {
  color: 'none',
  search: function() {

          }
}
