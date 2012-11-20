/*!
 * 
 *   First playable demo
 *   http://www.jobcastrop.nl
 *		
 *
 **/
var gameId = "fvuHcObgM";
var APIkey = "6a3865f745cd503179e0fd7309a37fcc2f712129";
var currentLvl = 'level_1';
var lastLvl = '';
var totalScore = 0;
var levelScore = 0;
var combo = 0;
var lastHit = 0;
var kills = 0;
var deaths = 0;
var monsters = 0;

var jsApp	= 
{	
	/* ---
	
		Initialize the jsApp
		
		---			*/
	onload: function()
	{
		
		// init the video
		if (!me.video.init('jsapp', 640, 480, true, 1))
		{
			alert("Sorry but your browser does not support html 5 canvas.");
         return;
		}
				
		// initialize the "audio"
		me.audio.init("mp3,ogg");
	
		me.sys.fps = 30;

		
		// set all resources to be loaded
		me.loader.onload = this.loaded.bind(this);
		
		// set all resources to be loaded
		me.loader.preload(g_resources);

		// load everything & display a loading screen
		me.state.change(me.state.LOADING);
		
		//me.debug.renderHitBox = true;
		
	},


    /* ---

     callback when everything is loaded

     ---  */

    loaded: function ()
    {
        // set the "Play/Ingame" Screen Object
		me.state.set(me.state.PLAY, new PlayScreen());
		me.state.set(me.state.READY, new ReadyScreen());
		
		me.state.transition("fade", "#000", 100);
		me.state.setTransition(me.state.READY, false);
				
        // add our player entity in the entity pool
        me.entityPool.add("mainPlayer", PlayerEntity);
        me.entityPool.add("coinEntity", CoinEntity);
        me.entityPool.add("zombie", Zombie);
		me.entityPool.add("zombie2", Zombie2);
		me.entityPool.add("zombie3", Zombie3);
		me.entityPool.add("eskimo", Eskimo);
		me.entityPool.add("penguin", Penguin);
		me.entityPool.add("EndPoint", EndPoint);
		me.entityPool.add("BarrelEntity", BarrelEntity);
		me.entityPool.add("BarrelZombie", BarrelZombie);
		me.entityPool.add("checkpoint", CheckpointEntity);
		me.entityPool.add("chainsaw", Chainsaw);

        // enable the keyboard
        me.input.bindKey(me.input.KEY.LEFT,  "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.UP,    "jump", true);
        me.input.bindKey(me.input.KEY.DOWN,  "duck", true);
		me.input.bindKey(me.input.KEY.Z,  "jump", true);
		me.input.bindKey(me.input.KEY.X,  "fire", true);
		me.input.bindKey(me.input.KEY.ENTER,  "enter", true);

        // start the game
        me.state.change(me.state.PLAY);
		
		me.state.onPause = function () {
			context = me.video.getScreenFrameBuffer();
			context.fillStyle = "rgba(0, 0, 0, 0.2)";
			context.fillRect(0, (me.video.getHeight() / 2) - 30, me.video.getWidth(), 60);
			background = me.video.applyRGBFilter(me.video.getScreenCanvas(), "b&w");
			font = new me.BitmapFont("atascii_40px", 40);
			font.set("left");
			measure = font.measureText("PAUSE");
			context.drawImage(background.canvas, 0, 0);
			font.draw(context, "PAUSE", (me.video.getWidth() / 2) - (measure.width / 2), (me.video.getHeight() / 2) - (measure.height / 2));		
			
		};
		
		if(window.location.href.indexOf('?boss=1') != -1)
		{
			currentLvl = 'boss_1';
		}
		
		if(window.location.href.indexOf('?snow=1') != -1)
		{
			currentLvl = 'level2_1';
		}
    }

}; // jsApp

/* the in game stuff*/
var PlayScreen = me.ScreenObject.extend({

    onResetEvent: function()
	{
		// load a level
        me.levelDirector.loadLevel(currentLvl);		
		
        // stuff to reset on state change
		// add a default HUD to the game mngr
        me.game.addHUD(0, 0, 640, 100);
 
        // add a new HUD item
        me.game.HUD.addItem("score", new HUDScoreObject(630, 10));
		me.game.HUD.setItemValue("score", totalScore)
        // make sure everyhting is in the right order
        me.game.sort();

		if(currentLvl == 'level_1' || currentLvl == 'level_2' || currentLvl == 'level_3' || currentLvl == 'level_4')
		{
			me.audio.playTrack('deadshoulddance');
		}
		
		if(currentLvl == 'boss_1')
		{
			me.audio.playTrack('twolead');
		}
		
		if(currentLvl == 'level2_1')
		{
			me.audio.playTrack('hello');
		}
		
		levelScore = 0;
    },

    /* ---

     action to perform when game is finished (state change)

     --- */
   onDestroyEvent: function() {
		totalScore = me.game.HUD.getItemValue("score");
        // remove the HUD
        me.game.disableHUD();
    }

});

var HUDScoreObject = me.HUD_Item.extend({init:function (a, b) {
    this.parent(a, b);
    this.font = new me.BitmapFont("atascii_16px", 16)
}, draw:function (b, a, c) {
    this.font.draw(b, this.value, this.pos.x + a, this.pos.y + c)
}});

var ReadyScreen = me.ScreenObject.extend({

    // constructor
   init: function()
   {
		// pass true to the parent constructor
		// as we draw our progress bar in the draw function
		this.parent(true);
	  
		me.input.bindKey(me.input.KEY.ENTER, "enter");
		me.input.bindKey(me.input.KEY.X, "enter");
		
		
   },
   
   onResetEvent: function()
   {
		this.background = me.video.applyRGBFilter(me.video.getScreenCanvas(), "brightness", .5);
		this.zombies = me.loader.getImage("zombies");
   },

 
   // make sure the screen is only refreshed on load progress
   update: function()
   {
	if (me.input.isKeyPressed("enter")) {
        me.state.change(me.state.PLAY, currentLvl)
    }
      return true;
   },

   // on destroy event
   onDestroyEvent : function ()
   {
      // "nullify" all fonts
      this.logo = null;
   },

	//	draw function
	draw : function(context)
	{
		
		font40 = new me.BitmapFont("atascii_40px", 40);
		font16 = new me.BitmapFont("atascii_16px", 16);
		font40.set("left");
		font16.set("left");
		measure = font40.measureText("LEVEL CLEARED");
		
		context.drawImage(this.background.canvas, 0, 0);
		font40.draw(context, "LEVEL CLEARED", (me.video.getWidth() / 2) - (measure.width / 2), 50 - (measure.height / 2));
		
		measure = font16.measureText("PRESS ENTER");
		font16.draw(context, "PRESS ENTER", (me.video.getWidth() / 2) - (measure.width / 2), me.video.getHeight() - 48);
		
		measure = font16.measureText(":");
		font16.draw(context, ":", (me.video.getWidth() / 2) - (measure.width / 2),(me.video.getHeight() / 3) - (measure.height / 2));
		
		measure = font16.measureText(kills + "/" + monsters);
		font16.draw(context, kills + "/" + monsters, (me.video.getWidth() / 3) * 2 - (measure.width / 2),(me.video.getHeight() / 3) - (measure.height / 2));
		
		context.drawImage(this.zombies, (me.video.getWidth() / 3) - 22, (me.video.getHeight() / 3 - 21));
   },

});

/*-------------- 
a score HUD Item
--------------------- */
 
var ScoreObject = me.HUD_Item.extend({
    init: function(x, y) {
        // call the parent constructor
        this.parent(x, y);
        // create a font
        this.font = new me.Font("Verdana", 14, "white");
    },
 
    /* -----
 
    draw our score
 
    ------ */
    draw: function(context, x, y) {
        this.font.draw(context, this.value, this.pos.x + x, this.pos.y + y);
    }
 
});


//bootstrap :)
window.onReady(function() 
{
	jsApp.onload();
});
