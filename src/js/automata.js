// var WALL = '0';
// var FLOOR = '3';

function Automata(width, height) {
  this.width = Math.floor(width);
  this.height = Math.floor(height);
  this.lifeCycles = 0;
  this.cells = [];
  this.minimumLifeCycles = 40;
  this.spawnChance = 7; //Percentage Chance to Spawn a child cell

  // Initialize Map
  this.resetMap();
}
Automata.prototype.resetMap = function() {
  this.map = [];
  for (var y = 0; y < this.height; y++) {

    // Creates an empty lxne
    this.map.push([]);

    // Adds this.width to the empty lxne:
    this.map[y].push(new Array(this.width));

    // Initialize Map
    for (var x = 0; x < this.width; x++) {
      this.map[y][x] = WALL;
    }
  }
};


Automata.prototype.print = function () {
  //Print the Current Map
  var printed_map = '';
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      var cell = '';
      if (this.map[y][x] === WALL) {
        cell = '#';
      } else {
        cell = '.';
      }
      printed_map += cell;
    }
    printed_map += "\n";
  }
  return printed_map;
};

Automata.prototype.csv = function () {
  //Save the map as a CSV string
  var printed_map = '';
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      printed_map += this.map[y][x];
      if (x < this.width - 1) {
        printed_map += ',';
      }
    }
    printed_map += "\n";
  }
  return printed_map;
};

Automata.prototype.addCell = function (xpos, ypos) {
  var x = xpos || Math.floor(this.width / 2);
  var y = ypos || Math.floor(this.height / 2);
  var cell = new Cell(x, y, this.map[y][x]);
  this.map[cell.y][cell.x] = FLOOR;

  this.cells.push(cell);
};

Automata.prototype.step = function() {
    for (var d = 0; d < this.cells.length; d++) {
      var cell = this.cells[d];
      if (cell.alive) {
        //Live To Win...till you die
        this.lifeCycles += 1;
        this.map = cell.cycle(this.map);

        if (Math.floor(Math.random() * 100) <= this.spawnChance) { //Percent in 100 to spawn a child cell
          if (cell.neighbours(this.map).length > 0) {
            var move_to = cell.neighbours(this.map)[Math.floor(Math.random() * cell.neighbours(this.map).length)];
            this.addCell(move_to.x, move_to.y);
          }
        }
      } else {
        //Remove Cell from Cells 
        var index = this.cells.indexOf(cell);
        if (index > -1) {
          this.cells.splice(index, 1);
        }
      }
    }
};

Automata.prototype.generate = function() {
  if (this.cells.length === 0) {
    this.addCell();
  }

  while (this.cells.length > 0) {
    for (var d = 0; d < this.cells.length; d++) {
      var cell = this.cells[d];
      if (cell.alive) {
        //Live To Win...till you die
        this.lifeCycles += 1;
        this.map = cell.cycle(this.map);

        if (Math.floor(Math.random() * 100) <= this.spawnChance) { //Percent in 100 to spawn a child cell
          if (cell.neighbours(this.map).length > 0) {
            var move_to = cell.neighbours(this.map)[Math.floor(Math.random() * cell.neighbours(this.map).length)];
            this.addCell(move_to.x, move_to.y);
          }
        }
      } else {
        //Remove Cell from Cells 
        var index = this.cells.indexOf(cell);
        if (index > -1) {
          this.cells.splice(index, 1);
        }
      }
    }
  }

  if (this.lifeCycles < this.minimumLifeCycles) {
    console.log('reset lifecycle =>'+ this.lifeCycles);
    this.lifeCycles = 0;
    this.resetMap();
    this.generate();  
  }else {
    // console.log('normal lifecycle =>'+ this.lifeCycles);
  }
};

Automata.prototype.cleanup = function() {
  //Iterate through map and remove isolated cells
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      var cell = new Cell(x, y, this.map[y][x]);
      cell.allowDiagonals = true;
      // console.log('neighbours'+cell.neighbours(this.map));
      if (cell.neighbours(this.map).length < 1) {
        this.map[y][x] = FLOOR;
      }
    }
  }
};

var Cell = function Cell(xpos, ypos, space) {

  this.alive = true;
  // this.allowDiagonals = true;
  this.allowDiagonals = false;
  this.cycleLimit = 30;

  this.x = xpos;
  this.y = ypos;
};

Cell.prototype = {
  north: function north() {
    var x = this.x;
    var y = this.y - 1;
    var direction = 'north';
    return { x: x, y: y, direction: direction };
  },
  north_east: function north_east() {
    var x = this.x + 1;
    var y = this.y - 1;
    var direction = 'north east';
    return { x: x, y: y, direction: direction };
  },
  east: function east() {
    var x = this.x + 1;
    var y = this.y;
    var direction = 'east';
    return { x: x, y: y, direction: direction };
  },
  south_east: function south_east() {
    var x = this.x + 1;
    var y = this.y + 1;
    var direction = 'south east';
    return { x: x, y: y, direction: direction };
  },
  south: function south() {
    var x = this.x;
    var y = this.y + 1;
    var direction = 'south';
    return { x: x, y: y, direction: direction };
  },
  south_west: function south_west() {
    var x = this.x - 1;
    var y = this.y + 1;
    var direction = 'south west';
    return { x: x, y: y, direction: direction };
  },
  west: function west() {
    var x = this.x - 1;
    var y = this.y;
    var direction = 'west';
    return { x: x, y: y, direction: direction };
  },
  north_west: function north_west() {
    var x = this.x - 1;
    var y = this.y - 1;
    var direction = 'north west';
    return { x: x, y: y, direction: direction };
  },
  moveTo: function moveTo(pos) {
    this.x = pos.x;
    this.y = pos.y;
  },
  cycle: function cycle(map) {
    var move_to = this.neighbours(map)[Math.floor(Math.random() * this.neighbours(map).length)];
    if (this.alive) {
      this.x = move_to.x;
      this.y = move_to.y;
      map[move_to.y][move_to.x] = FLOOR;
    }
    return map;
  }
};

Cell.prototype.checkNeighbour = function (pos, map) {
  var width = map[0].length;
  var height = map.length;
  try {
    if (pos.x < 0 || pos.y < 0 || pos.x > width || pos.y > height || map[pos.y][pos.x] === FLOOR) {
      return false;
    } else {
      return true;
    }
  } catch (err) {
    // console.log(pos.x, pos.y, err);
  }
};

Cell.prototype.neighbours = function (map) {
  var neighbours = [];
  if (this.checkNeighbour(this.north(), map)) {
    neighbours.push(this.north());
  }
  if (this.checkNeighbour(this.east(), map)) {
    neighbours.push(this.east());
  }
  if (this.checkNeighbour(this.south(), map)) {
    neighbours.push(this.south());
  }
  if (this.checkNeighbour(this.west(), map)) {
    neighbours.push(this.west());
  }
  if (this.allowDiagonals === true) {
    if (this.checkNeighbour(this.south_west(), map)) {
      neighbours.push(this.south_west());
    }
    if (this.checkNeighbour(this.south_east(), map)) {
      neighbours.push(this.south_east());
    }
    if (this.checkNeighbour(this.north_east(), map)) {
      neighbours.push(this.north_east());
    }
    if (this.checkNeighbour(this.north_west(), map)) {
      neighbours.push(this.north_west());
    }
  }
  if (neighbours.length === 0) {
    this.alive = false;
  }

  return neighbours;
};

