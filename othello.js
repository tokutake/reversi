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
var DEBUG = true;
var BOARD_WIDTH = 8;

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
    cell.width = cell.height = 55;
    cell.setAttribute('x', i % BOARD_WIDTH);
    cell.setAttribute('y', Math.floor(i / BOARD_WIDTH));
  }

  for (var i = 0; i < tds.length; i++) {
    tds[i].onclick = function() {
      var x = parseInt(this.getAttribute('x'));
      var y = parseInt(this.getAttribute('y'));

      var next = put(x, y, turn);

      if (next) {
        turn = turn == BLACK ? WHITE : BLACK;
        refresh();

        if (no_move(turn)) {
          turn = opposite(turn);
          refresh();
        }
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

  var move = function() {
    if (no_move(WHITE)) {
      return;
    }

    if (turn == WHITE) {
      putByScore(turn);
      turn = opposite(turn);
      refresh();
    }
  };

  var intervalId = setInterval(move, 10);
}

var init_table = function() {
  cells[3][3] = BLACK;
  cells[4][4] = BLACK;
  cells[3][4] = WHITE;
  cells[4][3] = WHITE;

  refresh();
}

var create_disc = function(color) {
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

      if (cells[i][j] != EMPTY) {
        var color = cells[i][j];
        if (!td.hasChildNodes()) {
          td.appendChild(create_disc(color));
        } else {
          var circle = td.getElementsByTagName('circle')[0];
          circle.setAttribute('fill', color);
        }
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

  if (turn == BLACK) {
    $('turn').appendChild(create_disc('black'));
  } else {
    $('turn').appendChild(create_disc('white'));
  }
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

var put_random = function(color) {
  for (var i = 0; i < BOARD_WIDTH; i++) {
    for (var j = 0; j < BOARD_WIDTH; j++) {
      if (can_put(i, j, color)) {
        put(i, j, color);
        return true;
      }
    }
  }
  return false;
}

var scores = [
[50,  -20, 20, 5, 5, 20, -20,  50],
[-20, -20, 20, 5, 5, 20, -20, -20],
[ 20,  20, 20, 5, 5, 20,  20,  20],
[  5,   5,  5, 5, 5,  5,   5,   5],
[  5,   5,  5, 5, 5,  5,   5,   5],
[ 20,  20, 20, 5, 5, 20,  20,  20],
[-20, -20, 20, 5, 5, 20, -20, -20],
[50,  -20, 20, 5, 5, 20, -20,  50],
];

var put_random = function(color) {
  for (var i = 0; i < BOARD_WIDTH; i++) {
    for (var j = 0; j < BOARD_WIDTH; j++) {
      if (can_put(i, j, color)) {
        console.log("x:" + i + " y:" + j + " color:" + color);
        put(i, j, color);
        return true;
      }
    }
  }
  return false;
}

var positions = []; 
var initPositions = function() {
  for (var i = 0; i < BOARD_WIDTH; i++) {
    for (var j = 0; j < BOARD_WIDTH; j++) {
      positions.push [i, j];
    }
  }
}

var putByScore = function(color) {
  initPositions();
  var max = -1000;
  var move = [];
  for (var i = 0; i < BOARD_WIDTH; i++) {
    for (var j = 0; j < BOARD_WIDTH; j++) {
      var x = i;
      var y = j;
      if (can_put(x, y, color) && scores[x][y] > max) {
        console.log("x:" + x + " y:" + y + " color:" + color);
        max = scores[x][y];
        move = [x, y];
      }
    }
  }

  if (move.length != 0) {
    put(move[0], move[1], color);
    return true;
  } else {
    return false;
  }
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
    return false;
  }

  for (; on_table(x, y); x += move[0], y += move[1]) {
    if (table[x][y] == color) {
      return true;
    }
  }
  return false;
}

var can_put = function(x, y, color) {
  if (cells[x][y] != EMPTY) {
    return false;
  }

  var moves = [[1, 0], [-1, 0], [0, 1], [0, -1], [-1, -1], [1, 1], [-1, 1], [1, -1]];

  for (var i = 0; i < moves.length; i++) {
    if (search(cells, x, y, moves[i], color)) {
      return true;
    }
  }

  return false;
}

var no_move = function(color) {
  for (var i = 0; i < BOARD_WIDTH; i++) {
    for (var j = 0; j < BOARD_WIDTH; j++) {
      if (cells[i][j] == EMPTY) {
        if (can_put(i, j, color)) {
          return false;
        }
      }
    }
  }
  return true;
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

