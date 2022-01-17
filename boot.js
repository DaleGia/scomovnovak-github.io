var boot = function(game)
{
};
  
boot.prototype = 
{
	preload: 
		function()
		{
				this.game.load.image("loading_bar","loading_bar.png");  
		},
	create: 
	function()
	{
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.updateLayout();
		this.game.state.start("Preload");
	}
}
