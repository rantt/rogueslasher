/*global Game*/

/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */

// // Choose Random integer in a range
// function rand (min, max) {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// var musicOn = true;

var wKey;
var aKey;
var sKey;
var dKey;
var left_key;
var score = 0;

var FILLED = '0';
var EMPTY = '3';
var map;
var player,actorList,actorMap,acted;

function onKeyUp(event) {
        // act on player input
		acted = false;
    switch (event.keyCode) {
			case Phaser.Keyboard.LEFT:
							acted = moveActor(player, {x:-1, y:0});
							break;

			case Phaser.Keyboard.RIGHT:
							acted = moveActor(player,{x:1, y:0});
							break;

			case Phaser.Keyboard.UP:
							acted = moveActor(player, {x:0, y:-1});
							break;

			case Phaser.Keyboard.DOWN:
							acted = moveActor(player, {x:0, y:1});
							break;
    }
    
  }

function moveActor(actor, dir) {
		console.log(!canGo(actor, dir));
    if (!canGo(actor, dir))
      return false;
    
    var newKey = (actor.ty + dir.y) + '_' + (actor.tx + dir.x);
		console.log(newKey);
		console.log(actorMap);
		console.log(actorMap[newKey]);
    // if (actorMap[newKey] != null) {
    if (actorMap[newKey] != undefined) {
      var enemy = actorMap[newKey];
      enemy.health--;

      if (enemy.health <= 0) {
        actorMap[newKey] = null;
        actorList[actorList.indexOf(enemy)] = null;
				enemy.kill();
        //add dealing with kill stuff
      }
	    }else {
        //remove old position reference
        actorMap[actor.ty + '_' + actor.tx] = null;

        //update position
        actor.ty+=dir.y;  
        actor.tx+=dir.x;  

        actor.y = actor.ty*TILE_SIZE;
        actor.x = actor.tx*TILE_SIZE;
				console.log(actor);

        //Add reference to the actors new position
        actorMap[actor.ty+ '_'+ actor.tx]=actor; 
      }
			return true;

  }
  function canGo(actor, dir) {
		// console.log(actor.tx+dir.x>=0);
		// console.log(actor.tx+dir.x <= COLS - 1);
		return actor.tx+dir.x >= 0 &&
					 actor.tx+dir.x <= COLS - 1 &&
					 actor.ty+dir.y >= 0 &&
					 actor.ty+dir.y <= ROWS - 1 && 
					 map[actor.ty+dir.y][actor.tx +dir.x] == EMPTY
  }


Game.Play = function(game) {
  this.game = game;
};

Game.Play.prototype = {
  create: function() {
    this.game.world.setBounds(0, 0 ,Game.w ,Game.h);
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
		this.game.stage.backgroundColor = '#000';

    this.game.input.keyboard.addCallbacks(null, null, onKeyUp);

    this.auto = new Automata(COLS, ROWS);
    this.auto.generate();
    this.auto.cleanup();

    // this.bmdTiles = this.genTileset(TILE_SIZE, TILE_SIZE);

    var cave = this.auto.csv();
		map = this.auto.map;

    this.game.load.tilemap('level', null, cave, Phaser.Tilemap.CSV );
    this.map = this.game.add.tilemap('level', TILE_SIZE, TILE_SIZE);
    this.map.addTilesetImage('dungeon'); //use generated sheet
    this.layer = this.map.createLayer(0);

    this.map.setCollision(0); //Black Empty Space
    this.layer.resizeWorld();
      
    function randomInt(max) {
         return Math.floor(Math.random() * max);
    }

    actorList = [];
    actorMap = {};
    this.livingEnemies;

    for(var i=0;i < 10;i++) {
      var actor;
      if (i === 0) {
        actor = new Actor(this.game, 0, 0, TILE_SIZE, 'player',0);
        actor.health = 3;
      }else {
        actor = new Actor(this.game, 0, 0, TILE_SIZE, 'enemy',0);
        actor.health = 1;
      }
      do {
        actor.ty = randomInt(ROWS); 
        actor.tx = randomInt(COLS); 
        actor.y = actor.ty*TILE_SIZE;
        actor.x = actor.tx*TILE_SIZE;
      } while( map[actor.ty][actor.tx] == FILLED  || actorMap[actor.ty + "_" + actor.tx] != null );

      //Add references
      actorMap[actor.ty + "_" + actor.tx] = actor;
      actorList.push(actor);
    }
    // console.log(actorMap);

    player = actorList[0];
    this.game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);

    player.direction = 'down';
    player.animations.add('down', [6, 7], 6, true);
    player.animations.add('up', [8, 9], 6, true);
    player.animations.add('right', [4, 11], 6, true);
    player.animations.add('left', [5, 10], 6, true);

    // // Music
    // this.music = this.game.add.sound('music');
    // this.music.volume = 0.5;
    // this.music.play('',0,1,true);

    // //Setup WASD and extra keys
    // this.cursor = this.game.input.keyboard.createCursorKeys();
    // wKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
    // aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);

    // sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    // dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
    // muteKey = game.input.keyboard.addKey(Phaser.Keyboard.M);


    // //Create Twitter button as invisible, show during win condition to post highscore
    // this.twitterButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY + 200,'twitter', this.twitter, this);
    // this.twitterButton.anchor.set(0.5);
    // this.twitterButton.visible = false;

		left_key = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
  },

  // genTileset: function(width, height) {
  //   bmd = this.game.make.bitmapData(width * 25, height * 2);
  //
  //   var colors = Phaser.Color.HSVColorWheel();
  //
  //   var i = 0;
  //
  //   for (var y = 0; y < 2; y++)
  //   {
  //       for (var x = 0; x < 25; x++)
  //       {
  //           bmd.rect(x * width, y * height, width, height, colors[i].rgba);
  //           i += 6;
  //       }
  //   }
	// 	return bmd;
	// },
  update: function() {
    this.game.physics.arcade.collide(player, this.layer);


		// this.game


    // // Toggle Music
    // muteKey = game.input.keyboard.addKey(Phaser.Keyboard.M);
    // muteKey.onDown.add(this.toggleMute, this);

  },
  twitter: function() {
    //Popup twitter window to post highscore
    var game_url = 'http://www.divideby5.com/games/GAMETITLE/'; 
    var twitter_name = 'rantt_';
    var tags = ['1GAM'];

    window.open('http://twitter.com/share?text=My+best+score+is+'+score+'+playing+GAME+TITLE+See+if+you+can+beat+it.+at&via='+twitter_name+'&url='+game_url+'&hashtags='+tags.join(','), '_blank');
  },

  // toggleMute: function() {
  //   if (musicOn == true) {
  //     musicOn = false;
  //     this.music.volume = 0;
  //   }else {
  //     musicOn = true;
  //     this.music.volume = 0.5;
  //   }
  // },
  render: function() {
    this.game.debug.bodyInfo(player,64, 64);
    this.game.debug.body(player);
    // game.debug.text('Health: ' + tri.health, 32, 96);
  }

};
