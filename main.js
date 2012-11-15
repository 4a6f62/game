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

//game resources
var g_resources = [{
    name: "lvl_rocks",
    type: "image",
    src: "data/lvl_rocks/lvl_rocks.png"
},
{
    name: "lvl_snow",
    type: "image",
    src: "data/lvl_rocks/lvl_snow.png"
},
{
    name: "metatiles32x32",
    type: "image",
    src: "data/meta/metatiles32x32.png"
},
{
    name: "atascii_40px",
    type: "image",
    src: "data/meta/atascii_40px.png"
},
{
    name: "atascii_16px",
    type: "image",
    src: "data/meta/atascii_16px.png"
},
{
    name: "coin",
    type: "image",
    src: "data/sprite/coin.png"
}, {
    name: "run_right",
    type: "image",
    src: "data/sprite/run_right.png"
},
{
    name: "zombie",
    type: "image",
    src: "data/sprite/zombie.png"
},
{
    name: "zombie2",
    type: "image",
    src: "data/sprite/zombie2.png"
},
{
    name: "zombie3",
    type: "image",
    src: "data/sprite/zombie3.png"
},
{
    name: "eskimo",
    type: "image",
    src: "data/sprite/eskimo.png"
},
{
    name: "barrel",
    type: "image",
    src: "data/sprite/barrel.png"
},
{
    name: "barrelzombie",
    type: "image",
    src: "data/sprite/barrelzombie.png"
},
{
    name: "checkpoint",
    type: "image",
    src: "data/sprite/checkpoint.png"
},
{
    name: "chainsaw",
    type: "image",
    src: "data/sprite/chainsaw.png"
},
{
    name: "back_rocks",
    type: "image",
    src: "data/lvl_rocks/back_rocks.png"
},
{
    name: "snow_back",
    type: "image",
    src: "data/lvl_rocks/snow_back.png"
},
{
    name: "snow_back2",
    type: "image",
    src: "data/lvl_rocks/snow_back2.png"
},   
{
    name: "back2_rocks",
    type: "image",
    src: "data/lvl_rocks/back2_rocks.png"
},   
{
	name:"jump",
	type:"audio",
	src:"data/audio/sfx/",
	channel:1
},
{
	name:"hit",
	type:"audio",
	src:"data/audio/sfx/",
	channel:1
},{
	name:"nosleep",
	type:"audio",
	src:"data/audio/music/",
	channel:2
},{
	name:"tubelectric",
	type:"audio",
	src:"data/audio/music/",
	channel:2
},{
    name: "level_1",
    type: "tmx",
    src: "data/lvl1.tmx"
},{
    name: "level_2",
    type: "tmx",
    src: "data/lvl2.tmx"
},{
    name: "level_3",
    type: "tmx",
    src: "data/lvl3.tmx"
},{
    name: "level_4",
    type: "tmx",
    src: "data/lvl4.tmx"
},{
    name: "boss_1",
    type: "tmx",
    src: "data/boss1.tmx"
},{
    name: "level2_1",
    type: "tmx",
    src: "data/lvl2_1.tmx"
}];

var jsApp	= 
{	
	/* ---
	
		Initialize the jsApp
		
		---			*/
	onload: function()
	{
		
		// init the video
		if (!me.video.init('jsapp', 640, 480))
		{
			alert("Sorry but your browser does not support html 5 canvas.");
         return;
		}
				
		// initialize the "audio"
		me.audio.init("mp3,ogg");
		
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
		me.input.bindKey(me.input.KEY.Z,  "jump");
		me.input.bindKey(me.input.KEY.ENTER,  "enter", true);

        // start the game
        me.state.change(me.state.PLAY);
		me.audio.playTrack('tubelectric');
		
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

		if (_gaq && lastLvl)
		{
			_gaq.push(['_trackEvent', 'game', 'score', lastLvl, levelScore]);			
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
