$ = function(name) {
  if (name == 'body') {
    return document.getElementsByTagName('body')[0];
  } else if (name == 'td') {
    return document.getElementsByTagName('td');
  }

  return document.getElementById(name);
}

var EMPTY = 'empty';
var WHITE = 'white';
var BLACK = 'black';
var BOARD_WIDTH = 8;

var tds;
var table;
var lastTime;

window.onload = function() {
  tds = document.getElementsByTagName('td');
  table = new Table();

  for (var i = 0; i < tds.length; i++) {
    var cell = tds[i];
    cell.bgColor = 'green';
    cell.width = cell.height = 55;
    cell.setAttribute('x', i % BOARD_WIDTH);
    cell.setAttribute('y', Math.floor(i / BOARD_WIDTH));
  }

  for (var i = 0; i < tds.length; i++) {
    tds[i].onclick = function() {
      var x = parseInt(this.getAttribute('x'));
      var y = parseInt(this.getAttribute('y'));

      var next = table.put(x, y, table.turn);
      refresh();

      if (next) {
        lastTime = new Date();
        table.turn = table.turn == BLACK ? WHITE : BLACK;

        if (table.noMove(table.turn)) {
          table.turn = opposite(table.turn);
          refresh();
        }
        refresh();
      }
    }
  }

  table.init();
  refresh();

  var move = function() {
    if (new Date() - lastTime < 500) {
      return;
    }

    if (table.turn == WHITE) {
      table.putByScore(table.turn);
      table.turn = opposite(table.turn);
      refresh();
    }
  };

  var intervalId = setInterval(move, 500);
}

var createDisc = function(color) {
  var svgnode = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svgnode.setAttribute("width", "50");
  svgnode.setAttribute("height", "50");
  var circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
  var rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
  circle.setAttribute("cx", "25");
  circle.setAttribute("cy", "25");
  circle.setAttribute("r", "25");
  circle.setAttribute("fill", color);
  rect.setAttribute("width", "50");
  rect.setAttribute("height", "50");
  rect.setAttribute("fill", "green");

  svgnode.appendChild(rect);
  svgnode.appendChild(circle);
  return svgnode;
}

var refresh = function() {
  var num_black = 0;
  var num_white = 0;

  for (var i = 0; i < BOARD_WIDTH; i++) {
    for (var j = 0; j < BOARD_WIDTH; j++) {
      var td = tds[i + j * BOARD_WIDTH];

      if (table.cells[i][j] != EMPTY) {
        var color = table.cells[i][j];
        if (!td.hasChildNodes()) {
          td.appendChild(createDisc(color));
        } else {
          var circle = td.getElementsByTagName('circle')[0];
          circle.setAttribute('fill', color);
        }
      }
    }
  }

  for (var i = 0; i < table.cells.length; i++) {
    for (var j = 0; j < table.cells[i].length; j++) {
      var color = table.cells[i][j];
      if (color == BLACK) {
        num_black++;
      } else if (color == WHITE) {
        num_white++;
      }
    }
  }

  $('num_black').textContent = num_black;
  $('num_white').textContent = num_white;
  $('turn').textContent = table.turn;

  $('turn').appendChild(createDisc(table.turn));
}

var scores = [
  [120, -20, 20, 5, 5, 20, -20, 120],
  [-20, -40, -5,-5,-5, -5, -40, -20],
  [ 20,  -5, 15, 3, 5, 15,  -5,  20],
  [  5,  -5,  5, 5, 5,  5,  -5,   5],
  [  5,  -5,  5, 5, 5,  5,  -5,   5],
  [ 20,  -5, 15,-5,-5, 15,  -5,  20],
  [-20, -40, -5,-5,-5, -5, -40, -20],
  [120, -20, 20, 5, 5, 20, -20, 120],
  ];

function Table() {
  this.cells = [];
  this.turn = BLACK;

  this.init = function() {
    for (var i = 0; i < BOARD_WIDTH; i++) {
      this.cells[i] = [];
      for (var j = 0; j < BOARD_WIDTH; j++) {
        this.cells[i][j] = EMPTY;
      }
    }
    this.cells[3][3] = BLACK;
    this.cells[4][4] = BLACK;
    this.cells[3][4] = WHITE;
    this.cells[4][3] = WHITE;
  }

  this.reverse = function(x, y, move, color) {
    for (; this.cells[x][y] != color && this.onTable(x, y); x += move[0], y += move[1]) {
      this.cells[x][y] = color;
    }
  }

  this.search = function(x, y, move, color) {
    x += move[0];
    y += move[1];
    if (this.onTable(x, y) && this.cells[x][y] != opposite(color)) {
      return false;
    }

    for (; this.onTable(x, y); x += move[0], y += move[1]) {
      if (this.cells[x][y] == color) {
        return true;
      }
    }
    return false;
  }

  this.put = function(x, y, color) {
    var cell = this.cells[x][y];

    var next = false;
    if (cell == EMPTY) {
      var moves = [[1, 0], [-1, 0], [0, 1], [0, -1], [-1, -1], [1, 1], [-1, 1], [1, -1]];

      for (var i = 0; i < moves.length; i++) {
        var move = moves[i];
        if (this.search(x, y, move, color)) {
          this.cells[x][y] = color;
          this.reverse(x + move[0], y + move[1], move, color);
          next = true;
        }
      }
    }
    return next;
  }

  this.canPut = function(x, y, color) {
    if (this.cells[x][y] != EMPTY) {
      return false;
    }

    var moves = [[1, 0], [-1, 0], [0, 1], [0, -1], [-1, -1], [1, 1], [-1, 1], [1, -1]];

    for (var i = 0; i < moves.length; i++) {
      if (this.search(x, y, moves[i], color)) {
        return true;
      }
    }

    return false;
  }

  this.eval = function() {
    for (var i = 0; i < BOARD_WIDTH; i++) {
      for (var j = 0; j < BOARD_WIDTH; j++) {
      }
    }
  }

  this.putByScore = function(color) {
    var max = -1000;
    var move = [];
    for (var i = 0; i < BOARD_WIDTH; i++) {
      for (var j = 0; j < BOARD_WIDTH; j++) {
        var x = i;
        var y = j;
        if (this.canPut(x, y, color) && scores[x][y] > max) {
          max = scores[x][y];
          move = [x, y];
        }
      }
    }

    if (move.length != 0) {
      this.put(move[0], move[1], color);
      return true;
    } else {
      return false;
    }
  }

  this.onTable = function(x, y) {
    return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_WIDTH;
  }

  this.noMove = function(color) {
    for (var i = 0; i < BOARD_WIDTH; i++) {
      for (var j = 0; j < BOARD_WIDTH; j++) {
        if (this.cells[i][j] == EMPTY) {
          if (this.canPut(i, j, color)) {
            return false;
          }
        }
      }
    }
    return true;
  }
}

var opposite = function(color) {
  return color == BLACK ? WHITE : BLACK;
}

