// var Game = {
//   w: 800,
//   h: 600
// };

var ROWS = 10;
var COLS = 15; 
var TILE_SIZE = 64;

var Game = {
  w: COLS*TILE_SIZE,
  h: ROWS*TILE_SIZE 
};




// var w = 800;
// var h = 600;

Game.Boot = function(game) {
  this.game = game;
};

Game.Boot.prototype = {
  preload: function() {
    // console.log('blah'+Game.w);
		this.game.stage.backgroundColor = '#FFF';
		this.game.load.image('loading', 'assets/images/loading.png');
		this.game.load.image('title', 'assets/images/title.png');
		this.game.load.image('instructions', 'assets/images/instructions.png');
    this.game.load.bitmapFont('minecraftia', 'assets/fonts/font.png', 'assets/fonts/font.xml'); //load default font

    // //Scale Image to Fit Window
    // this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    // this.game.scale.maxHeight = window.innerHeight;
    // this.game.scale.maxWidth = window.innerHeight*(Game.w/Game.h);

  },
  create: function() {
   this.game.state.start('Load');
  }
};

Game.Load = function(game) {
  this.game = game;
};

Game.Load.prototype = {
  preload: function() {
    
    //Debug Plugin
    // this.game.add.plugin(Phaser.Plugin.Debug);

    //Loading Screen Message/bar
    var loadingText = this.game.add.text(Game.w, Game.h, 'Loading...', { font: '30px Helvetica', fill: '#000' });
  	loadingText.anchor.setTo(0.5, 0.5);
  	var preloading = this.game.add.sprite(Game.w/2-64, Game.h/2+50, 'loading');
  	this.game.load.setPreloadSprite(preloading);

    //Load button for twitter
    this.game.load.image('twitter','assets/images/twitter.png');

    //Temporary Sprites
    // this.game.load.spritesheet('player','assets/images/hero_x32.png',32,32,12);
    // this.game.load.spritesheet('dungeon', 'assets/images/dungeon.png',32,32,16);

    this.game.load.spritesheet('dungeon', 'assets/images/well.png',64,64,16);
    this.game.load.spritesheet('enemy','assets/images/npc_jack.png',64,64,15);
    this.game.load.spritesheet('player','assets/images/hero_x64.png',64,64,12);

    // Music Track
    // this.game.load.audio('music','soundtrack.mp3');

  },
  create: function() {
    this.game.state.start('Menu');
  }
};
