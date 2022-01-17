/*
	IMPORTANT VARIABLES FOR VARIOUS GAME ASPECTS.
*/
var player_explosion_scale_size = 15;
var enemy_explosion_scale_size = 3;
var player_world_ratio = 0.3;
var enemy_world_ratio = 0.15;
var boss_world_ratio = 0.2;
var SCORE_WIDTH_SCALE = 0.05;
var SCORE_HEIGHT_SCALE = 0.05;
var LASER_WIDTH_SCALE = 0.002;
var game_points = 0;
var events = [];

// Game level
var level = 
{
	// Game level
	level: 0,
	// Level required kill count
	required_destroy_count: 10,
	// Level kill count
	destroy_count: 0,
	// level_laser_damage decrement
	laser_damage: 1,
	// level_laser_damage decrement
	enemy_health_decrement: 1,
	// level enemy spawn time ms
	enemy_spawn_time: 1000,
}


// Global spawn variable
var spawnActive = false;
// For the different groups of objects/sprites
var master_group;
var enemy_group;
var explosion_group;
// Main character sprite
var player;

var temp_spawn_time;
var mainGame = function(game){};
var bgm_music;
var laser_sound;
var laserSoundStatus = false;
var samplecount = 0;
var space;

var current_laser_one_intersect_y;
var current_laser_two_intersect_y;
mainGame.prototype = 
{
  	create: 
	function()
	{
		space = this.game.add.tileSprite(0,0,this.game.world.width,this.game.world.height,'bg');
		game.input.addPointer();
		game.input.addPointer();
		game.load.enableParallel = true;
		master_group = game.add.group();
		explosion_group = game.add.group();
		enemy_group = game.add.group();
		this.game.physics.startSystem(Phaser.Physics.ARCADE);

		score_text = game.add.text(5, 13, "A polite reminder that this is satire...", { font: '10px Arial', fill: '#fff' });
	
		// This sets up the correct laser offset for each character which ensures the
		// Lasers look like they are coming from the centre of each eye.
		// function laserSprite(sprite_key, sprite_x, sprite_y, sprite_anchor, laser1_x, laser1_y, laser2_x, laser2_y)//, laser3_x, laser3_y)

		player = new laserSprite('scomo', this.game.world.width/2, 55, 0.5, -23, -8, 18, -13);//, 15, 50)
		player.sprite.visible = true;
		spawnActive = true;
		// Game level
		level.level = 0;
		level.required_destroy_count = 10;
		level.destroy_count = 0;
		level.enemy_sprite_key = '';
		// level_laser_damage decrement
		level.laser_damage = 1;
		// level_laser_damage decrement
		level.enemy_health_decrement = 5;
		// level enemy spawn time ms
		level.enemy_spawn_time = 1500;



		levelUp();
		queEnemy(2000);

		differentlySound = this.game.add.audio('n_differently', 1.5, false);
		difficultSound = this.game.add.audio('n_difficult', 1.5, false);
		respectSound = this.game.add.audio('n_respect', 1.5, false);
		unbelieveable_sound = this.game.add.audio('n_unbelievable', 1.5, false);
		home_sound = this.game.add.audio('s_home', 1, false);
		muppet_sound = this.game.add.audio('s_muppet', 2.5, false);
		now_sound = this.game.add.audio('s_now', 1, false);

		bgm_music = this.game.add.audio('bgm', 0.85, true);
		bgm_music.play();
		laser_sound = this.game.add.audio('laser', 1, true);
		game_points = 0;
		instructions();
	},

	update:
	function() 
	{
		space.tilePosition.y += 1;
		changeSpriteFrame(player.sprite);
		// If mouse is clicked and player is not dead.
		if(this.game.input.activePointer.isDown && (player.sprite.health > 0) && player.laser.active)
		{
			if(laserSoundStatus == false)
			{
				laser_sound.play();
				laserSoundStatus = true;
				if(!now_sound.isPlaying && !home_sound.isPlaying && !muppet_sound.isPlaying)
				{
					console.log(samplecount)
					switch(samplecount)
					{
						case 0:
						{
							now_sound.play();
							break;
						};
						case 1:
						{
							home_sound.play();
							break;
						};
						case 2:
						{
							muppet_sound.play();
							break;
						};
					}
					samplecount++;
					if(samplecount >= 3)
					{
						samplecount = 0;
					}
				}
			}
			decreaseLaserCharge(player);
			// change laser shake based on laser charge value.		
			adjustLaserShake(player);

			/*
				change sprite position based on sprite.shake
				level.			
			*/
			adjustSpritePosition(player);
			/* 
				change laser position based on mouse click position
				and laser shake if laser charge is greater than 0.
			*/
			adjustLaserPosition(player);
			/* 
				Test for laser collisions with enemies.
				If there is, redraw the laser and fireball 
				coordinates so they are hitting the edge of
				the enemy.
			*/
		
			current_laser_one_intersect_y = this.game.world.height;
			current_laser_two_intersect_y = this.game.world.height;
			enemy_group.forEach(enemy_laser_collision_test);
	
			/* 
				Enable the visibility of the lasers after 
				redraw.
			*/			
			enableLaserVisibility(player);
		}
		else
		{
			if(laserSoundStatus == true)
			{
				laser_sound.stop();
				laserSoundStatus = false;
			}
			/* 
				Mouse has not been clicked. make lasers invisible.
				inscrease the laser charge.
			*/
			disableLaserVisibility(player);	
			increaseLaserCharge(player);	
		}

		/*
			See if a new spawn may be created. Spawn enemy if the
			flag is high.
		*/
		levelHandler();
	},

	render:
	function()
	{
	},
}

function changeSpriteFrame(sprite)
{
	var degrees = 0;
	if(this.game.input.activePointer.isDown && (sprite.health > 0))
	{

		if(game.input.totalActivePointers < 2)
		{
			var x = this.game.input.activePointer.x;
			var y = this.game.input.activePointer.y;
			var z = Math.abs(x - sprite.x);
			var degrees = Math.atan(y/z)*(180/Math.PI);
			var direction;
			if(x < sprite.x)
			{
				direction = -1;
			}
			else
			{
				direction = 1;
			}
		}
		
		if(direction == -1)
		{
			if(degrees < 22.5)
			{
				sprite.frame = 1;
			}
			else if(degrees < 45)
			{
				sprite.frame = 2;
			}
			else if(degrees < 67.5)
			{
				sprite.frame = 3;
			}
			else if(degrees < 90)
			{
				sprite.frame = 4;
			}
		}
		else
		{
			if(degrees < 22.5)
			{
				sprite.frame = 8;
			}
			else if(degrees < 45)
			{
				sprite.frame = 7;
			}
			else if(degrees < 67.5)
			{
				sprite.frame = 6;
			}
			else if(degrees < 90)
			{
				sprite.frame = 5;
			}
		}
	}
	else
	{

		if(sprite.frame != 10)
		{
			sprite.frame = 0;
		}

	}
}
		
function unpause(event)
{
   	if(game.paused)
	{
        menu_text.destroy();
		menu_graphics.destroy();

        game.paused = false;
	}
};

function addMenuButton(x,y,text, callback)
{
	var menu_button_style = 
	{ 
		fill: 'white', 
		align: 'left', 
		stroke: 'rgba(0,0,0,0)', 
		strokeThickness: 4,
	};

    var menu_button_text = game.add.text(x, y, text, menu_button_style);
    menu_button_text.anchor.setTo(0.5);
    menu_button_text.stroke = "rgba(0,0,0,0)";
    menu_button_text.strokeThickness = 4;
    var on_over_menu_button = function(target) 
	{
      	target.fill = "#FEFFD5";
      	target.stroke = "rgba(200,200,200,0.5)";
      	menu_button_text.useHandCursor = true;
	};

	var on_out_menu_button = function(target) 
	{
		target.fill = "white";
	  	target.stroke = "rgba(0,0,0,0)";
	  	menu_button_text.useHandCursor = false;
	};

	menu_button_text.inputEnabled = true;
	menu_button_text.events.onInputUp.add(callback, this);
	menu_button_text.events.onInputOver.add(on_over_menu_button, this);
	menu_button_text.events.onInputOut.add(on_out_menu_button, this);
}


function sprite(sprite_key, sprite_x, sprite_y, sprite_anchor, sprite_scale)
{
	// Creates new sprite objet
	var sprite = new Object;

	//sprite.sprite = new Object;	
	// Defines sprite image/animation key used for game.add.sprite
	sprite.key = sprite_key;
	// Defines sprite offset x position
	sprite.x = sprite_x;
	// Defines sprite offset y position.
	sprite.y = sprite_y;
	// defines starting sprite shake.
	sprite.shake = 0;
	// creates sprite
	sprite.sprite = this.game.add.sprite(sprite_x, sprite_y, sprite_key);
	// sets central anchor point	
	sprite.sprite.anchor.setTo(sprite_anchor);
	// sets starting sprite frame
	sprite.sprite.frame = 0;
	// enables body for physics
	sprite.sprite.enableBody = true;
	// stores sprite anmation.
	sprite.animation = null;
	// sprite scale for different sizes
	sprite.sprite.scale.set(sprite_scale);
	// enables physics
	this.game.physics.arcade.enable(sprite.sprite);
	// Add sprite to master group
	master_group.add(sprite.sprite);

	// returns object	
	return sprite;
}

function laserSprite(sprite_key, sprite_x, sprite_y, sprite_anchor, laser1_x, laser1_y, laser2_x, laser2_y)//, laser3_x, laser3_y)
{
	// Creates new sprite objet
	var sprite = new Object;

	//sprite.sprite = new Object;	
	// Defines sprite image/animation key used for game.add.sprite
	sprite.key = sprite_key;
	// Defines sprite offset x position
	sprite.x = sprite_x;
	// Defines sprite offset y position.
	sprite.y = sprite_y;
	// defines starting sprite shake.
	sprite.shake = 0;
	// creates sprite
	sprite.sprite = game.add.sprite(sprite_x, sprite_y, sprite_key);
	// sets central anchor point	
	sprite.sprite.anchor.setTo(sprite_anchor);
	// Sets health to 100
	sprite.sprite.health = 100;	
	sprite.sprite.maxHealth = 100;
	// enables body for physics
	sprite.sprite.enableBody = true;
	// Sets starting sprite frame
	sprite.sprite.frame = 0;
	sprite.sprite.scale.set(0.5)
	// enables physics
	game.physics.arcade.enable(sprite.sprite);
	// Add sprite to master group
	master_group.add(sprite.sprite);

	sprite.laser = new Object;
	// defines starting laser charge. 
	sprite.laser.charge = 100;
	// defines starting laser shake
	sprite.laser.shake = 0;
	// defines laser charge increment and decrement
	sprite.laser.charge_decrement = 0.5;	
	sprite.laser.charge_increment = 4;
	sprite.laser.active = true;

	//first laser 
	sprite.laser.one = new Object;
	// Defines activity of laser1
	//sprite.laser.one.active = false;
	// Defines laser1 offset x position
	sprite.laser.one.x_offset = laser1_x;
	// Defines laser1 offset y position
	sprite.laser.one.y_offset = laser1_y;
	// Defines laser1 x position
	sprite.laser.one.x_position = laser1_x + sprite_x;
	// Defines laser1 y position
	sprite.laser.one.y_position = laser1_y + sprite_y;
	// adds graphics and line style
	sprite.laser.one.laser = game.add.graphics(0, 0);
	sprite.laser.one.laser.lineStyle(3*(LASER_WIDTH_SCALE*game.world.width), 0xFF0000, 0.5);
	// adds laser fireball
	sprite.laser.one.fire = game.add.sprite(0, 0, 'laser_fire');	
	sprite.laser.one.fire.visible = false;
	// Sets laser fireball animation frames.	
	sprite.laser.one.fire.animations.add('fire', [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40], 1, true);	
	// Starts laser fireball animation	
	sprite.laser.one.fire.animations.play('fire', 25, true);
	// Enables laser fireball body
	sprite.laser.one.fire.enableBody = sprite.laser.one.fire;
	// Centers laser fireball anchor
	sprite.laser.one.fire.anchor.setTo(0.535);
	// Enables laser fireball physics	
	game.physics.arcade.enable(sprite.laser.one.fire);
	// Add laser and fire to master group
	master_group.add(sprite.laser.one.laser);
	master_group.add(sprite.laser.one.fire);


	//Second laser
	sprite.laser.two = new Object;
	// Defines activity of laser1
	//sprite.laser.two.active = false;
	// Defines laser1 offset x position
	sprite.laser.two.x_offset = laser2_x;
	// Defines laser1 offset y position
	sprite.laser.two.y_offset = laser2_y;
	// Defines laser1 x position
	sprite.laser.two.x_position = laser2_x + sprite_x;
	// Defines laser1 y position
	sprite.laser.two.y_position = laser2_y + sprite_y;
	sprite.laser.two.laser = game.add.graphics(0, 0);
	sprite.laser.two.laser.lineStyle(3*(LASER_WIDTH_SCALE*game.world.width), 0xFF0000, 0.5);
	// adds laser fireball
	sprite.laser.two.fire = game.add.sprite(0, 0, 'laser_fire');
	sprite.laser.two.fire.visible = false;
	// Sets laser fireball animation frames.	
	sprite.laser.two.fire.animations.add('fire', [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40], 1, true);	
	// Starts laser fireball animation	
	sprite.laser.two.fire.animations.play('fire', 25, true);
	// Enables laser fireball body
	sprite.laser.two.fire.enableBody = sprite.laser.two.fire;
	// Centers laser fireball anchor
	sprite.laser.two.fire.anchor.setTo(0.535);
	// Enables laser fireball physics	
	game.physics.arcade.enable(sprite.laser.two.fire);
	// Add laser and fire to master group
	master_group.add(sprite.laser.two.laser);
	master_group.add(sprite.laser.two.fire);
	
	return sprite;
}

function spawn()
{		
		var x = this.game.world.randomX;
		var enemy = sprite('djokovic', x, this.game.world.height, 0, 0.4);
		//enemy.sprite.scale.set((this.game.world.width/enemy.sprite.width)*enemy_world_ratio);				
		enemy.sprite.inputEnabled = true;		
		enemy.sprite.health = 100;
   	 	enemy.sprite.events.onKilled.add(enemyIsKilled, this);

		this.game.physics.arcade.moveToXY(enemy.sprite, x, 0, 80, 3000);

		enemy.animation = enemy.sprite.animations.add(enemy.key, [6,5,8,4,2,1,7,3,9], 2, true);		
		enemy.animation.play(3, true, false);
		enemy_group.add(enemy.sprite);
		enemy_group.add(enemy.sprite);
		queEnemy(this.game.rnd.integerInRange(temp_spawn_time, temp_spawn_time*2), this);
		temp_spawn_time *= 0.95;
		if(temp_spawn_time < 250)
		{
			temp_spawn_time = 250;
		}
		this.game.world.bringToTop(master_group);
}

function queEnemy(time)
{
	if(spawnActive)
	{
		events[events.length] = this.game.time.events.add(time, spawn, this);
	}
}

function sprite_tint_laser_handler(laser_sprite)
{
	if(laser_sprite.laser.charge > 90)
	{
		sprite.tint = 0xFFFFFF;
	}
	else if(laser_sprite.laser.charge > 80)
	{
		laser_sprite.sprite.tint = 0xFFE6E6;
	}
	else if(laser_sprite.laser.charge > 70)
	{
		laser_sprite.sprite.tint = 0xFFCDCD;
	}
	else if(laser_sprite.laser.charge > 60)
	{
		laser_sprite.sprite.tint = 0xFFB4B4;
	}
	else if(laser_sprite.laser.charge > 50)
	{
		laser_sprite.sprite.tint = 0xFF9B9B;
	}
	else if(laser_sprite.laser.charge > 40)
	{
		laser_sprite.sprite.tint = 0xFF8282;
	}
	else if(laser_sprite.laser.charge > 30)
	{
		laser_sprite.sprite.tint = 0xFF6969;
	}
	else if(Zlaser_sprite.laser.charge > 20)
	{
		laser_sprite.sprite.tint = 0xFF5050;
	}
	else if(laser_sprite.sprite.health > 10 || laser_sprite.laser.charge > 10)
	{
		laser_sprite.sprite.tint = 0xFF3737;
	}
	else
	{
		laser_sprite.sprite.tint = 0xFF0000;
	}
}
function sprite_tint_handler(laser_sprite)
{
	if(laser_sprite.sprite.health > 90)
	{
		laser_sprite.sprite.tint = 0xFFFFFF;
	}
	else if(laser_sprite.sprite.health > 80)
	{
		laser_sprite.sprite.tint = 0xFFE6E6;
	}
	else if(laser_sprite.sprite.health > 70)
	{
		laser_sprite.sprite.tint = 0xFFCDCD;
	}
	else if(laser_sprite.sprite.health > 60)
	{
		laser_sprite.sprite.tint = 0xFFB4B4;
	}
	else if(laser_sprite.sprite.health > 50)
	{
		laser_sprite.sprite.tint = 0xFF9B9B;
	}
	else if(laser_sprite.sprite.health > 40)
	{
		laser_sprite.sprite.tint = 0xFF8282;
	}
	else if(laser_sprite.sprite.health > 30)
	{
		laser_sprite.sprite.tint = 0xFF6969;
	}
	else if(laser_sprite.sprite.health > 20)
	{
		laser_sprite.sprite.tint = 0xFF5050;
	}
	else if(laser_sprite.sprite.health > 10)
	{
		laser_sprite.sprite.tint = 0xFF3737;
	}
	else
	{
		laser_sprite.sprite.tint = 0xFF0000;
	}

	if(laser_sprite.laser.charge > 90)
	{
		laser_sprite.sprite.tint &= 0xFFFFFF;
	}
	else if(laser_sprite.laser.charge > 80)
	{
		laser_sprite.sprite.tint &= 0xFFE6E6;
	}
	else if(laser_sprite.laser.charge > 70)
	{
		laser_sprite.sprite.tint &= 0xFFCDCD;
	}
	else if(laser_sprite.laser.charge > 60)
	{
		laser_sprite.sprite.tint &= 0xFFB4B4;
	}
	else if(laser_sprite.laser.charge > 50)
	{
		laser_sprite.sprite.tint &= 0xFF9B9B;
	}
	else if(laser_sprite.laser.charge > 40)
	{
		laser_sprite.sprite.tint &= 0xFF8282;
	}
	else if(laser_sprite.laser.charge > 30)
	{
		laser_sprite.sprite.tint &= 0xFF6969;
	}
	else if(laser_sprite.laser.charge > 20)
	{
		laser_sprite.sprite.tint &= 0xFF5050;
	}
	else if(laser_sprite.laser.charge > 10)
	{
		laser_sprite.sprite.tint &= 0xFF3737;
	}
	else
	{
		laser_sprite.sprite.tint &= 0xFF0000;
	}
}
function createExplosion(x,y,scale_size)
{
	// Creates explosion sprite.
		var explosion = this.game.add.sprite(x, y, 'explosion', 0);
		explosion.anchor.setTo(0.5);		
		// makes explosion bigger.
		explosion.scale.set(scale_size);		
		// Creates explosion animation for sprite.		
		explosion_animation = explosion.animations.add('explosion_animation');
		/*
 			Animation 30fps, no loop, and destroyed on completion
		*/		
		explosion_animation.play(30,false, true);
		explosion_sound = this.game.add.audio('bang', 0.5, false);
		explosion_sound.play();
		explosion_group.add(explosion);
		this.game.world.bringToTop(explosion_group);
}


function enemy_laser_collision_test(enemy)
{
	/*
		Check if enemy exists, if it doesn't (maybe it has been 
		destroyed), don't perform the laser collision test.
	*/
	if(enemy == null)
	{
		return;
	}
	/*
		get enemy bounds as we will need this a few times
	*/
	var enemy_bounds = enemy.getBounds();
	if(enemy_bounds == null)
	{
		return;
	}	
	/*
 		Check if the laser object bounds intersects with the enemy
		sprite bounds.
	*/
	if(enemy_bounds.y < current_laser_one_intersect_y)
	{
		if(Phaser.Rectangle.intersects(player.laser.one.laser.getBounds(), enemy_bounds))
		{
			current_laser_one_intersect_y = enemy_bounds.y;
			laserCollisionHandler(player.laser.one, enemy);
		}
	}

	if(enemy_bounds.y < current_laser_two_intersect_y)
	{
		if(Phaser.Rectangle.intersects(player.laser.two.laser.getBounds(), enemy_bounds))
		{
			current_laser_two_intersect_y = enemy_bounds.y;
			laserCollisionHandler(player.laser.two, enemy);
		}
	}
}

function laserCollisionHandler(laser, sprite)
{
	/*
		If they do intersect, do some damage to the sprite 
		because the laser has struck them.
	*/
	if(sprite == null)
	{
		return;
	}
	sprite.damage(level.enemy_health_decrement);
	//sprite_tint_handler(sprite);
	if(sprite.health > 90)
	{
		sprite.tint = 0xFFFFFF;
	}
	else if(sprite.health > 80)
	{
		sprite.tint = 0xFFE6E6;
	}
	else if(sprite.health > 70)
	{
		sprite.tint = 0xFFCDCD;
	}
	else if(sprite.health > 60)
	{
		sprite.tint = 0xFFB4B4;
	}
	else if(sprite.health > 50)
	{
		sprite.tint = 0xFF9B9B;
	}
	else if(sprite.health > 40)
	{
		sprite.tint = 0xFF8282;
	}
	else if(sprite.health > 30)
	{
		sprite.tint = 0xFF6969;
	}
	else if(sprite.health > 20)
	{
		sprite.tint = 0xFF5050;
	}
	else if(sprite.health > 10)
	{
		sprite.tint = 0xFF3737;
	}
	else
	{
		sprite.tint = 0xFF0000;
	}

	/*
		Get the precise world coordinates where the
		laser has struck the sprite so we can make sure the
		laser only appears to hit this point on the sprite.
	*/		
	var intersection = getLaserIntersectionPoint(laser, sprite.y);

	/*
		Draw the laser and laser fireball
	*/		
	drawLaser(laser, intersection.x, intersection.y)
}

function getLaserIntersectionPoint(laser, enemy_y)
{
	var a_player;
	var negative;

	if(laser.fire.x > player.x)
	{
		a_player = laser.fire.x - laser.x_position;
		negative = false;
	}
	else
	{
		a_player = laser.x_position-laser.fire.x;	
		negative = true;
	}
	var b_player = laser.fire.y-laser.y_position;
	
	var laser_collision_angle = Math.sin(a_player/b_player);	
	if(negative)
	{
		laser_collision_angle = -laser_collision_angle;
	}
	
	
	var intersect_a = enemy_y-laser.y_position;
	var intersect_ang = Math.sin(laser_collision_angle);
	var intersect_b = intersect_a*intersect_ang;

	var intersection = new Object();	
	intersection.x = intersect_b+laser.x_position;
	intersection.y = intersect_a+laser.y_position;
	return intersection;
}

function disableLaserVisibility(laser_sprite)
{

		player.laser.one.laser.visible = false;
		player.laser.one.fire.visible = false;

		player.laser.two.laser.visible = false;
		player.laser.two.fire.visible = false;


}

function enableLaserVisibility(laser_sprite)
{

		player.laser.one.laser.visible = true;
		player.laser.one.fire.visible = true;

		player.laser.two.laser.visible = true;
		player.laser.two.fire.visible = true;

}


function adjustSpritePosition(laser_sprite)
{

		laser_sprite.sprite.x = laser_sprite.x + this.game.rnd.integerInRange(-laser_sprite.shake,laser_sprite.shake);
		laser_sprite.laser.one.x_position = laser_sprite.laser.one.x_offset + laser_sprite.sprite.x;
		laser_sprite.laser.two.x_position = laser_sprite.laser.two.x_offset + laser_sprite.sprite.x;

}

function returnSpritePosition(laser_sprite)
{
	laser_sprite.sprite.x = laser_sprite.x;
	laser_sprite.laser.one.x_position = laser_sprite.laser.one.x_offset + laser_sprite.sprite.x;

	laser_sprite.laser.two.x_position = laser_sprite.laser.two.x_offset + laser_sprite.sprite.x;
}
	
function adjustLaserPosition(laser_sprite)
{
	if(game.input.totalActivePointers < 2)
	{
		var x = this.game.input.activePointer.x + this.game.rnd.integerInRange(-laser_sprite.laser.shake,laser_sprite.laser.shake);
		var y = this.game.input.activePointer.y;
	
		drawLaser(laser_sprite.laser.one, x, y);
		drawLaser(laser_sprite.laser.two, x, y);
	}
	else
	{
		var x1 = this.game.input.pointer1.x + this.game.rnd.integerInRange(-laser_sprite.laser.shake,laser_sprite.laser.shake);
		var y1 = this.game.input.pointer1.y;
		var x2 = this.game.input.pointer2.x + this.game.rnd.integerInRange(-laser_sprite.laser.shake,laser_sprite.laser.shake);
		var y2 = this.game.input.pointer2.y;
		if(x1 <x2)
		{
			drawLaser(laser_sprite.laser.one, x1, y1);	
			drawLaser(laser_sprite.laser.two, x2, y2);
		}
		else
		{	
			drawLaser(laser_sprite.laser.one, x2, y2);	
			drawLaser(laser_sprite.laser.two, x1, y1);	
		}
	}
		
}

function drawLaser(laser, x, y)
{
	debug_x = x;
	debug_y = y;
	laser.laser.clear();
	laser.laser.lineStyle(3*(game.world.width*LASER_WIDTH_SCALE), 0xFF0000, 0.5);
	laser.laser.moveTo(laser.x_position, laser.y_position);
	laser.laser.lineTo(x, y);
	laser.fire.x = x;
	laser.fire.y = y;	
}
	

function increaseLaserCharge(laser_sprite)
{
	if((laser_sprite.laser.charge < 100) && laser_sprite.laser.active)
	{
		laser_sprite.laser.charge+=laser_sprite.laser.charge_increment;
	}
	sprite_tint_handler(laser_sprite);
}

function decreaseLaserCharge(laser_sprite)
{
	if(laser_sprite.laser.charge > 0)
	{
		laser_sprite.laser.charge-=laser_sprite.laser.charge_decrement;
	}

	sprite_tint_handler(laser_sprite);
}


function adjustLaserShake(laser_sprite)
{
	if(laser_sprite.laser.charge > 90)
	{
		laser_sprite.laser.shake = 15;
		laser_sprite.shake = 2;
	}
	else if(laser_sprite.laser_charge > 80)
	{
		laser_sprite.laser.shake = 30;
		laser_sprite.shake = 2;
	}
	else if(laser_sprite.laser.charge > 70)
	{
		laser_sprite.laser.shake = 45;
		laser_sprite.shake = 4;
	}
	else if(laser_sprite.laser.charge > 60)
	{
		laser_sprite.laser.shake = 60;
		laser_sprite.shake = 4;
	}
	else if(laser_sprite.laser.charge > 50)
	{
		laser_sprite.laser.shake = 75;
		laser_sprite.shake = 6;
	}
	else if(laser_sprite.laser.charge > 40)
	{
		laser_sprite.laser.shake = 90;
		laser_sprite.shake = 6;
	}
	else if(laser_sprite.laser.charge > 30)
	{
		laser_sprite.laser.shake = 105;
		laser_sprite.shake = 8;
	}
	else if(laser_sprite.laser.charge > 20)
	{
		laser_sprite.laser.shake = 120;
		laser_sprite.shake = 8;
	}
	else if(laser_sprite.laser.charge > 10)
	{
		laser_sprite.laser.shake = 135;
		laser_sprite.shake = 8;
	}
	else
	{
		laser_sprite.laser.shake = 150;
		laser_sprite.shake = 8;
	}
}

var d_sampleCount = 0;
function enemyIsKilled(enemy)
{
	game_points += 1;
	// score_text.setText(game_points);
	//score_box_resize_update();
	level.destroy_count += 1;
	createExplosion(enemy.x+(enemy.width/2), enemy.y+(enemy.height/2), enemy_explosion_scale_size);
	enemy_group.remove(enemy,true);
	master_group.remove(enemy,true);

	switch(d_sampleCount)
	{
		case 0:
		{
			differentlySound.play();
			break;
		}
		case 1:
		{
			difficultSound.play();
			break;
		}
		case 2:
		{
			respectSound.play();
			break;
		}
		case 3:
		{
			unbelieveable_sound.play();
			break;
		}
	}

	d_sampleCount++;
	if(d_sampleCount >= 4)
	{
		d_sampleCount = 0;
	}
}

function playerIsKilled(player)
{
	createExplosion(player.x+(player.width/2), player.y, player_explosion_scale_size);
	master_group.remove(player,true);
	game_over();
}

function kill(sprite)
{
	if(sprite != null)
	{
		sprite.kill();
		sprite.destroy();
	}
}

function levelHandler()
{
	if(level.destroy_count >= level.required_destroy_count)
	{
		// Make no new enemies spawn for the time being.
		spawnAllowed = false;
		// Level up in for seconds.
		levelUp();
	}
}


function removeAllEvents()
{
	events.forEach(game.time.events.remove);
}

function removeAllSprites()
{
	master_group.forEach(kill);
}
function instructions()
{
	var menu_button_style = 
	{ 
		fill: 'white', 
		align: 'left', 
		stroke: 'rgba(0,0,0,0)', 
		strokeThickness: 4,
		font: '30px Arial',
	};
    var instructions_text = 
		game.add.text(game.world.centerX, game.world.centerY-(this.game.world.height*0.1), "Touch for dual laser border protection!", menu_button_style);
	
	instructions_text.anchor.setTo(0.5);
    instructions_text.stroke = "rgba(0,0,0,0)";
    instructions_text.strokeThickness = 4;
	instructions_text.visible = true;

	var menu_button_style2 = 
	{ 
		fill: 'white', 
		align: 'left', 
		stroke: 'rgba(0,0,0,0)', 
		strokeThickness: 4,
		font: '20px Arial',
	};

	game.time.events.add(
		Phaser.Timer.SECOND*5, 
		function()
		{
			instructions_text.visible = false;
			instructions_text.destroy();
		},
		this
	);
}

function generate(max, thecount) {
    var r = [];
    var decimals = [];
    var currsum = 0;
    for(var i=0; i<thecount; i++) {
        r.push(Math.random());
        currsum += r[i];
    }

    var remaining = max;
    for(var i=0; i<r.length; i++) {
        var res = r[i] / currsum * max;
        r[i] = Math.floor(res);
        remaining -= r[i];
        decimals.push(res - r[i]);
    }

    while(remaining > 0){
        var maxPos = 0;
        var maxVal = 0;

        for(var i=0; i<decimals.length; i++){
            if(maxVal < decimals[i]){
                maxVal = decimals[i];
                maxPos = i;
            }
        }

        r[maxPos]++;
        decimals[maxPos] = 0; // We set it to 0 so we don't give this position another one.
        remaining--;
    }

    return r;
}

function levelUp()
{
	if(spawnActive)
	{
		level.level++;
		difficulty = level.level*20

		coefficients = generate(difficulty, 3)
		// Level required kill count
		level.required_destroy_count = Math.min(5 + coefficients[0], 40);
		// Level kill count
		level.destroy_count = 0;
		// level_contact_damage decrement
		level.contact_damage = Math.min(1 + coefficients[1]*0.25, 10);
		// level_laser_damage decrement
	
		// level_laser_damage decrement
		// level enemy spawn time ms
		level.enemy_spawn_time = Math.max(1500 - coefficients[2]*100, 500);
		temp_spawn_time = level.enemy_spawn_time;
		level.enemy_health_decrement *= 0.9;
	}
}
