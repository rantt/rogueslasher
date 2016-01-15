var Actor = function(game, tilex, tiley, tile_size, sprite_sheet, frame) {
  this.game = game;

  this.tx = tilex;
  this.ty = tiley;
  this.tile_size = tile_size;
  Phaser.Sprite.call(this, game, tilex*tile_size, tiley*tile_size, sprite_sheet, frame);
  this.game.physics.arcade.enable(this);

  this.body.collideWorldBounds = true;
  // this.game.camera.follow(this, Phaser.Camera.FOLLOW_PLATFORMER);

  this.game.add.existing(this);
  this.direction = 'right';
  this.animations.add('atk_right',[0,1,0],10);
  this.animations.add('atk_left',[2,3,2],10);

};

Actor.prototype = Object.create(Phaser.Sprite.prototype);
Actor.prototype.constructor = Actor;
