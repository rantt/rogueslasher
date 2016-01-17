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
var scoreText;
var winMsg;
var loseMsg;
var level = 0;
var enemy_count = 3;

var FLOOR,WALL;
var heartGauge;
var twitterButton;

var map;
var player,actorList,actorMap,livingEnemies,acted;

function moveActor(actor, dir) {
  if (!canGo(actor, dir))
    return false;
  
  var newKey = (actor.ty + dir.y) + '_' + (actor.tx + dir.x);
  if (actorMap[newKey] != undefined) {
    var enemy = actorMap[newKey];
    enemy.health--;
    if (enemy === player) {
      for(var i=0;i < 3;i++) {
        if (i < enemy.health) {
          heartGauge[i].frame = 0;
        }else {
          heartGauge[i].frame = 4;
        }
      }
    }
    attackSnd.play();
    if (actor.direction === 'left') {
      actor.animations.play('atk_left');
    }else {
      actor.animations.play('atk_right');
    }

    if (enemy.health <= 0) {
      score++; //score one point for mob kills
      if (actor === player)
        score++; //score two points for player kills
        scoreText.setText('Score: '+score);
      
      actorMap[newKey] = null;
      actorList[actorList.indexOf(enemy)] = null;
      if (enemy !== player) {
        livingEnemies--;
        if (livingEnemies === 0) {
          level += 1 ;
          if (enemy_count <= 15) {
            enemy_count++;
          }
          winMsg = this.game.add.bitmapText(Game.w/2, Game.h/2, 'minecraftia', "Victory!\nClick to Continue.", 24); 
          winMsg.tint = 0x00ff00;
          winMsg.anchor.setTo(0.5);
        }
      }
      enemy.kill();
    }
  }else {
    //remove old position reference
    actorMap[actor.ty + '_' + actor.tx] = null;

    //update position
    actor.ty+=dir.y;  
    actor.tx+=dir.x;  

    actor.y = actor.ty*TILE_SIZE;
    actor.x = actor.tx*TILE_SIZE;

    //Add reference to the actors new position
    actorMap[actor.ty+ '_'+ actor.tx]=actor; 
  }
  return true;

}
function canGo(actor, dir) {
  return actor.tx+dir.x >= 0 &&
         actor.tx+dir.x <= COLS - 1 &&
         actor.ty+dir.y >= 0 &&
         actor.ty+dir.y <= ROWS - 1 && 
         map[actor.ty+dir.y][actor.tx +dir.x] == FLOOR
}
function randomInt(max) {
  return Math.floor(Math.random() * max);
}
function aiAct(actor) {
  var directions = [ { x: -1, y:0 }, { x:1, y:0 }, { x:0, y: -1 }, { x:0, y:1 } ];
  var dx = player.tx - actor.tx;
  var dy = player.ty - actor.ty;

  // if player is far away, walk randomly
  if (Math.abs(dx) + Math.abs(dy) > 6)
    // try to walk in random directions until you succeed once
    while (!moveActor(actor, directions[randomInt(directions.length)])) { };

  // otherwise walk towards player
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) {
        // left
        actor.frame = 2;
        actor.direction = 'left';
        moveActor(actor, directions[0]);
    }else {
      // right
      actor.frame = 0;
      actor.direction = 'right';
      moveActor(actor, directions[1]);
    }
  }else {
    if (dy < 0) {
      // up
      moveActor(actor, directions[2]);
    } else {
      // down
      moveActor(actor, directions[3]);
    }
  }
  if (player.health < 1) {
    level = 0;
    enemy_count = 3;
    deadSnd.play();
    loseMsg = this.game.add.bitmapText(Game.w/2, Game.h/2, 'minecraftia', "Game Over!\nClick to Play Again.", 24); 
    loseMsg.tint = 0xff0000;
    loseMsg.anchor.setTo(0.5);
    twitterButton.visible = true;
  }
}

Game.Play = function(game) {
  this.game = game;
};

Game.Play.prototype = {
  create: function() {
    this.game.world.setBounds(0, 0 ,Game.w ,Game.h);
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
		this.game.stage.backgroundColor = '#000';


    this.highestScore = parseInt(JSON.parse(localStorage.getItem('atRogueSlasherHighestScore')));
    // this.game.input.keyboard.addCallbacks(null, null, onKeyUp);



    //SFX
    attackSnd = this.game.add.sound('attack');
    deadSnd = this.game.add.sound('dead');
    
    // Music
    this.music = this.game.add.sound('music');
    this.music.play('',0,0.3,true);


    // //Setup WASD and extra keys
    this.cursors = this.game.input.keyboard.createCursorKeys();
    wKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
    aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
    sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
    spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // muteKey = game.input.keyboard.addKey(Phaser.Keyboard.M);


    this.movement = {
      up: function() {
        acted = moveActor(player, {x:0, y:-1});
      },
      down: function() {
        acted = moveActor(player, {x:0, y:1});
      },
      left: function() {
        player.frame = 2;
        player.direction = 'left';
        acted = moveActor(player, {x:-1, y:0});
      },
      right: function() {
            player.direction = 'right';
            player.frame = 0;
            acted = moveActor(player,{x:1, y:0});
      }
    }; 

    //Up Key
    this.cursors.up.onUp.add(this.onKeyUp,this);
    wKey.onUp.add(this.onKeyUp,this);

    //Down Key
    this.cursors.down.onUp.add(this.onKeyUp,this);
    sKey.onUp.add(this.onKeyUp,this);

    //Left Key
    this.cursors.left.onUp.add(this.onKeyUp,this);
    aKey.onUp.add(this.onKeyUp,this);

    //Right Key
    this.cursors.right.onUp.add(this.onKeyUp,this);
    dKey.onUp.add(this.onKeyUp,this);

    //Reset Game w/ space on mouse click
    spaceKey.onUp.add(this.resetGame, this);
    this.game.input.onUp.add(this.resetGame, this);

    this.loadLevel();
    this.loadActors();

  },
  loadTouchControls: function() {

    //Draw Arrow w/ Bitmap Data
    var bmdsize = 80;
    this.arrowbmd = this.game.add.bitmapData(bmdsize,bmdsize);
    this.arrowbmd.ctx.clearRect(0,0,bmdsize,bmdsize);
    // this.arrowbmd.ctx.fillStyle = '#dcdcdc';
    this.arrowbmd.ctx.strokeStyle = 'white';
    this.arrowbmd.ctx.lineWidth = 2;
    this.arrowbmd.ctx.fill();
    this.arrowbmd.ctx.beginPath();
    this.arrowbmd.ctx.moveTo(bmdsize*1/2,0);
    this.arrowbmd.ctx.lineTo(0,bmdsize*1/2);
    this.arrowbmd.ctx.lineTo(bmdsize*1/4,bmdsize*1/2);
    this.arrowbmd.ctx.lineTo(bmdsize*1/4,bmdsize);
    this.arrowbmd.ctx.lineTo(bmdsize*3/4,bmdsize);
    this.arrowbmd.ctx.lineTo(bmdsize*3/4,bmdsize*1/2);
    this.arrowbmd.ctx.lineTo(bmdsize,bmdsize*1/2);
    this.arrowbmd.ctx.fill();

    //Add Touch Controls for mobile
    //Up Arrow
    this.upArrow = this.game.add.sprite(140, Game.h - 160, this.arrowbmd);
    this.upArrow.tint = 0xdcdcdc;
    this.upArrow.alpha = 0.5;
    this.upArrow.anchor.setTo(0.5, 0.5);
    this.upArrow.inputEnabled = true;
    this.upArrow.events.onInputUp.add(this.onKeyUp, this);
    this.upArrow.visible = false;

    //Up Down
    this.downArrow = this.game.add.sprite(140, Game.h - 40, this.arrowbmd);
    this.downArrow.tint = 0xdcdcdc;
    this.downArrow.alpha = 0.5;
    this.downArrow.anchor.setTo(0.5, 0.5);
    this.downArrow.inputEnabled = true;
    this.downArrow.angle = 180;
    this.downArrow.events.onInputUp.add(this.onKeyUp, this);
    this.downArrow.visible = false;

    //Up Left 
    this.leftArrow = this.game.add.sprite(60, Game.h - 100, this.arrowbmd);
    this.leftArrow.tint = 0xdcdcdc;
    this.leftArrow.alpha = 0.5;
    this.leftArrow.anchor.setTo(0.5, 0.5);
    this.leftArrow.inputEnabled = true;
    this.leftArrow.angle = -90;
    this.leftArrow.events.onInputUp.add(this.onKeyUp, this);
    this.leftArrow.visible = false;

    //Up Right 
    this.rightArrow = this.game.add.sprite(220, Game.h - 100, this.arrowbmd);
    this.rightArrow.tint = 0xdcdcdc;
    this.rightArrow.alpha = 0.5;
    this.rightArrow.anchor.setTo(0.5, 0.5);
    this.rightArrow.inputEnabled = true;
    this.rightArrow.angle = 90;
    this.rightArrow.events.onInputUp.add(this.onKeyUp, this);
    this.rightArrow.visible = false;

    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      this.upArrow.visible = true;
      this.downArrow.visible = true;
      this.leftArrow.visible = true;
      this.rightArrow.visible = true;
    }else{
      this.upArrow.visible = false;
      this.downArrow.visible = false;
      this.leftArrow.visible = false;
      this.rightArrow.visible = false;
    }

  },
  resetGame: function() {
    if (livingEnemies === 0) {
      this.loadLevel();
      this.loadActors();
    }else if (!player.alive) {
      score = 0;
      this.loadLevel();
      this.loadActors();
    }
  },
  onKeyUp: function(key) {
    if (player.alive === false)
      return

    acted = false;

    if (key === this.cursors.up || key === wKey || key === this.upArrow ) {
      this.movement.up();
    }else if (key === this.cursors.down || key === sKey || key === this.downArrow ) {
      this.movement.down();
    }else if (key === this.cursors.left || key === aKey || key === this.leftArrow ) {
      this.movement.left();
    }else if (key === this.cursors.right || key === dKey || key === this.rightArrow ) {
      this.movement.right();
    }

    // Mobs Move/Attack
    if (acted) {
      for (var enemy in actorList) {
        // skip the player
        if(enemy==0)
          continue;

        var e = actorList[enemy];
        if (e != null)
          aiAct(e);
      }
    }
  },
  loadActors: function() {
    function randomInt(max) {
         return Math.floor(Math.random() * max);
    }

    actorList = [];
    actorMap = {};
		// enemy_count = 3;

    for(var i=0;i < enemy_count;i++) {
      var actor;
      if (i === 0) {
        actor = new Actor(this.game, 0, 0, TILE_SIZE, 'player',0);
        actor.health = 3;
      }else {
        // actor = new Actor(this.game, 0, 0, TILE_SIZE, 'enemy',0);
        actor = new Actor(this.game, 0, 0, TILE_SIZE, 'player',0);
        actor.tint = 0xff0000;
        actor.health = 1;
      }
      do {
        actor.ty = randomInt(ROWS); 
        actor.tx = randomInt(COLS); 
        actor.y = actor.ty*TILE_SIZE;
        actor.x = actor.tx*TILE_SIZE;
      } while( map[actor.ty][actor.tx] == WALL  || actorMap[actor.ty + "_" + actor.tx] != null );

      //Add references
      actorMap[actor.ty + "_" + actor.tx] = actor;
      actorList.push(actor);
			livingEnemies = enemy_count - 1;
    }

    player = actorList[0];
    this.game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);
  },
  loadLevel: function() {

    if (level < 2) {
      //Grass and Water 
      FLOOR = '6';
      WALL = '5';
    }else if (level < 4) {
      //Grass Lands
      FLOOR = '6';
      WALL = '2';
    }else if (level < 6) {
      //Stone Islands
      FLOOR = '2';
      WALL = '5';
    }else if (level < 8) {
      //Frozen Wastes
      FLOOR = '2';
      WALL = '4';
    }else if (level < 10) {
      //Caves
      FLOOR = '1';
      WALL = '2';
    }else {
      //Fire Pits
      FLOOR = '1';
      WALL = '3';
    }

    this.auto = new Automata(COLS, ROWS);
    this.auto.generate();
    this.auto.cleanup();

    var cave = this.auto.csv();
		map = this.auto.map;

    this.game.load.tilemap('level', null, cave, Phaser.Tilemap.CSV );
    this.map = this.game.add.tilemap('level', TILE_SIZE, TILE_SIZE);
    this.map.addTilesetImage('dungeon'); //use generated sheet
    this.layer = this.map.createLayer(0);

    this.map.setCollision(0); //Black Empty Space
    this.layer.resizeWorld();

    heartGauge = [  this.game.add.sprite(20, 15,'hearts'),
                    this.game.add.sprite(60, 15,'hearts'),
                    this.game.add.sprite(100, 15,'hearts')
                 ];

    scoreText = this.game.add.bitmapText(Game.w - 120, 48,'minecraftia', 'Score: '+ score,32); 
    scoreText.anchor.setTo(0.5, 0.5);

    this.loadTouchControls();




    twitterButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY + 100,'twitter', this.twitter, this);
    twitterButton.anchor.set(0.5);
    twitterButton.visible = false;


  },
  update: function() {
    this.game.physics.arcade.collide(player, this.layer);

    if (score > this.highestScore) {
      this.highestScore = score;
      localStorage.setItem('atRogueSlasherHighestScore', score);
    }

    
    // // Toggle Music
    // muteKey = game.input.keyboard.addKey(Phaser.Keyboard.M);
    // muteKey.onDown.add(this.toggleMute, this);

  },
  twitter: function() {
    //Popup twitter window to post highscore
    var game_url = 'http://www.divideby5.com/games/rogueslasher/'; 
    // var game_url = 'http://rantt.itch.io/rogue-slasher'; 
    var twitter_name = 'rantt_';
    var tags = ['onegameaweek'];

    window.open('http://twitter.com/share?text=My+best+score+is+'+this.highestScore+'+playing+ROGUE+SLASHER+See+if+you+can+beat+it.+at&via='+twitter_name+'&url='+game_url+'&hashtags='+tags.join(','), '_blank');
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
  //   // this.game.debug.bodyInfo(player,64, 64);
  //   // this.game.debug.body(player);
  //   game.debug.text('Score: ' + score + ' living: '+ livingEnemies + ' health: ' + player.health +' level: '+level, 32, 32);
  // }

};
