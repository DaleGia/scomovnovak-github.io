var preload = function(game){}

preload.prototype = 
{
	preload: function()
	{ 
		var optionStyle = 
		{ 
			fill: 'white', 
			align: 'center', 
			stroke: 'rgba(0,0,0,0)', 
			srokeThickness: 4
		};
		var txt = game.add.text(game.world.centerX, this.game.world.centerY-20, "loading...", optionStyle);
	    txt.anchor.setTo(0.5);
		txt.scale.set((game.world.height*0.05)/txt.height);
        var loadingBar = this.add.sprite(this.game.world.centerX,this.game.world.centerY,"loading_bar");
        loadingBar.anchor.setTo(0.5,0.5);
		loadingBar.scale.set(0.5);
        this.load.setPreloadSprite(loadingBar);
		

   		this.game.load.crossOrigin = 'anonymous';
		/* Load scomo and dokovic sprite sheet here */
		this.game.load.spritesheet('djokovic', 'djokovic_sprites.png', 224, 297, 11, 0);
		this.game.load.spritesheet('scomo', 'scomo_sprites.png', 224, 297, 11, 0);

		this.game.load.image('bg', 'bg.png');
		this.game.load.audio('bang', 'explosion.mp3');
		this.game.load.audio('laser', 'laser.mp3');
		this.game.load.audio('bgm', 'bgm.mp3');

		this.game.load.audio('n_differently', 'n_differently.mp3');
		this.game.load.audio('n_difficult', 'n_difficult.mp3');
		this.game.load.audio('n_respect', 'n_lack_of_respect.mp3');
		this.game.load.audio('n_unbelievable', 'n_unbelievable.mp3');
		this.game.load.audio('s_home', 's_home.mp3');
		this.game.load.audio('s_muppet', 's_muppet.mp3');
		this.game.load.audio('s_now', 's_now.mp3');

		this.game.load.spritesheet('laser_fire', 'fire.png',76,76);
		this.game.load.spritesheet('explosion', 'explosion.png',64,64,16);
	},
  	create: function(){
		this.game.state.start("TheGame");
	}
}
