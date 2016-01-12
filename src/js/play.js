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
var score = 0;

var FILLED = '0';
var EMPTY = '3';

Game.Play = function(game) {
  this.game = game;
};

Game.Play.prototype = {
  create: function() {
    this.game.world.setBounds(0, 0 ,Game.w ,Game.h);
    this.game.physics.startSystem(Phaser.Physics.P2JS); // start the physics

    this.auto = new Automata(2*Game.w/TILE_SIZE, 2*Game.h/TILE_SIZE);
    this.auto.generate();
    this.auto.cleanup();

    this.bmdTiles = this.genTileset(TILE_SIZE, TILE_SIZE);

    var cave = this.auto.csv();
    
    console.log('cave length'+cave.split("\n")[0].split(",").length);
    var cave_cols = cave.split("\n")[0].split(",").length;
    var cave_rows = cave.split("\n").length;
    console.log('widthXheight: '+ cave_cols +' X '+ cave_rows);
    

    //Instantiate Player

    this.game.load.tilemap('level', null, cave, Phaser.Tilemap.CSV );
    this.map = this.game.add.tilemap('level', TILE_SIZE, TILE_SIZE);

    // this.map.addTilesetImage('tiles',this.bmdTiles); //use generated sheet
    this.map.addTilesetImage('dungeon'); //use generated sheet
    this.layer = this.map.createLayer(0);

    this.map.setCollision(0); //Black Empty Space
    
    // this.map.setCollision(0); //Black Empty Space
    // this.map.setCollision(1); //Full Wall
    // this.map.setCollision(2); //Half Wall
    this.layer.resizeWorld();
    this.physics.p2.convertTilemap(this.map, this.layer);

		this.player = this.game.add.sprite(Game.w/2, Game.h/2, 'player');	

    this.player.anchor.setTo(0.5,0.5);
    this.game.physics.p2.enable(this.player); // set up player physics
    this.player.body.fixedRotation = true; // no rotation
    this.player.body.collideWorldBounds = true;
    this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);
    this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);

    //Create a rectangular hitbox around players body
    // this.player.body.clearShapes();
    // this.player.body.addRectangle(16,32,0,16);

    this.player.direction = 'down';
    this.player.animations.add('down', [6, 7], 6, true);
    this.player.animations.add('up', [8, 9], 6, true);
    this.player.animations.add('right', [4, 11], 6, true);
    this.player.animations.add('left', [5, 10], 6, true);



    // // Music
    // this.music = this.game.add.sound('music');
    // this.music.volume = 0.5;
    // this.music.play('',0,1,true);

    //Setup WASD and extra keys
    this.cursor = this.game.input.keyboard.createCursorKeys();
    wKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
    aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
    sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
    // muteKey = game.input.keyboard.addKey(Phaser.Keyboard.M);


    //Create Twitter button as invisible, show during win condition to post highscore
    this.twitterButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY + 200,'twitter', this.twitter, this);
    this.twitterButton.anchor.set(0.5);
    this.twitterButton.visible = false;
  },
  genTileset: function(width, height) {
    bmd = this.game.make.bitmapData(width * 25, height * 2);

    var colors = Phaser.Color.HSVColorWheel();

    var i = 0;

    for (var y = 0; y < 2; y++)
    {
        for (var x = 0; x < 25; x++)
        {
            bmd.rect(x * width, y * height, width, height, colors[i].rgba);
            i += 6;
        }
    }
		return bmd;
	},
  update: function() {

    this.updatePlayerMovements();

    // // Toggle Music
    // muteKey.onDown.add(this.toggleMute, this);

  },
  updatePlayerMovements: function() {
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;
    var speed = 275;

    if (!this.player.alive){
      return;
    }


    if (this.tweening) {
      this.player.body.velocity.x = 0;
      this.player.body.velocity.y = 0;
    }else{
      if (this.cursor.left.isDown || aKey.isDown) {
        this.player.body.velocity.x = -speed;
        this.player.direction = 'left';
        this.player.animations.play('left');
      }
      else if (this.cursor.right.isDown || dKey.isDown) {
        this.player.body.velocity.x = speed;
        this.player.direction = 'right';
        this.player.animations.play('right');
      }
      else if (this.cursor.up.isDown || wKey.isDown) {
        this.player.body.velocity.y = -speed;
        this.player.direction = 'up';
        this.player.animations.play('up');
      }
      else if (this.cursor.down.isDown || sKey.isDown) {
        this.player.body.velocity.y = speed;
        this.player.direction = 'down';
        this.player.animations.play('down');
      }
      else {
        if (this.player.direction === 'up') {
          this.player.frame = 1;
        }
        else if (this.player.direction === 'down') {
          this.player.frame = 0;
        }
        else if (this.player.direction === 'right') {
          this.player.frame = 2;
        }
        else if (this.player.direction === 'left') {
          this.player.frame = 3;
        }
        this.player.animations.stop();
      }
    } 
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
  // render: function() {
  //   game.debug.text('Health: ' + tri.health, 32, 96);
  // }

};
