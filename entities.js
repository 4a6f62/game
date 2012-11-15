/*-------------------
 a player entity
 -------------------------------- */
var PlayerEntity = me.ObjectEntity.extend({

    /* -----

     constructor

     ------ */

    init: function(x, y, settings) {
        // call the constructor
        this.parent(x, y, settings);

        this.setRespawnPosition(x, y);

        this.setTransparency('#ffffff');

        // add friction
        this.setFriction(1, 0);
		
		// set the default horizontal & vertical speed (accel vector)
        this.setVelocity(3, 5);
		this.setMaxVelocity(12, 12);
		this.gravity = 0.7;
		this.facing = 1;
		
        this.updateColRect(4, 24, 0, 32);

        // set the display to follow our position on both axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

        // adjust the deadzone
        me.game.viewport.setDeadzone( me.game.viewport.width/6,  me.game.viewport.height/4);

        // standing animation
        this.addAnimation ("stand",  [0]);
        // walking animation
        this.addAnimation ("walk",  [1,2,3]);

        this.addAnimation ("jump",  [5]);

        this.addAnimation ("fall",  [4,5]);
		
		this.addAnimation ("hang",  [6]);

        // set default one
        this.setCurrentAnimation("stand");
		
		// make it collidable
        this.collidable = true;
		
		this.ToD = 0;
		this.lastHit = 0;
		this.wallJump = 0;
		
		this.tag = new me.Font("Verdana", 14, "white");
        this.tag.bold();
    },

    /* -----

     update the player pos

     ------ */
    update: function() {
	
		if(!this.alive)
		{
			return false;
		}
        if (me.input.isKeyPressed('left')) {
            // flip the sprite on horizontal axis
            this.flipX(true);
			this.facing = 0;
            // update the entity velocity
			if(this.vel.x > -5)
            this.vel.x -= this.accel.x * me.timer.tick;
	   
        } else if (me.input.isKeyPressed('right')) {
            // unflip the sprite
            this.flipX(false);
			this.facing = 1;
            // update the entity velocity
			if(this.vel.x < 5)
            this.vel.x += this.accel.x * me.timer.tick;
        }
        if (me.input.isKeyPressed('jump')) {
            // make sure we are not already jumping or falling
            if (!this.jumping && !this.falling) {
                // set current vel to the maximum defined value
                // gravity will then do the rest
                this.vel.y = -this.maxVel.y * me.timer.tick;
                // set the jumping flag
                this.jumping = true;
				me.audio.play('jump');
				this.wallJump = 0;
            }
        }
		
		if(me.input.isKeyPressed('fire'))
		{
			//me.state.change(me.state.READY)
		}

        if (this.vel.x===0 && this.vel.y===0)
        {
            this.setCurrentAnimation("stand");
        }
        if(this.vel.y===0 && this.vel.x!==0)
        {
            this.setCurrentAnimation("walk");
        }
        if(this.jumping)
        {
            this.setCurrentAnimation("jump");
        }
        if(this.falling)
        {
            this.setCurrentAnimation("fall");
        }
		
		var res = me.game.collide(this);
 
		if (res) {
			// if we collide with an enemy
			if (res.obj.type == me.game.ENEMY_OBJECT) {
				// check if we jumped on it
				if (me.input.keyStatus("jump"))
				{
					this.vel.y = -this.maxVel.y * me.timer.tick;
					// set the jumping flag
					this.jumping = true;
				}
				else
				{
					// bounce (force jump)
					this.halfJump();
				}	
				
			}
			else if(res.obj.type == me.game.COLLECTABLE_OBJECT)
			{
			
			}
		}

        // check & update player movement
        updated = this.updateMovement();
		
		if(this.falling && (updated.xprop.isSolid == true || updated.xprop.isBreakable == true))
		{
			if ((me.input.keyStatus('left') && this.wallJump == 1) || (me.input.keyStatus('right') && this.wallJump == 2) || this.wallJump == 0)
			{
				this.vel.y /= 2;
				this.setCurrentAnimation("hang");
			}
			
			if(me.input.keyStatus("jump"))
			{
				
				
				if(updated.x < 0 && me.input.keyStatus("left") && (this.wallJump == 0 || this.wallJump == 1))
				{
					this.vel.x = this.maxVel.x;
					this.wallJump = 2;
					
					this.vel.y = -this.maxVel.y;
					// set the jumping flag
					this.jumping = true;
				}
				
				if(updated.x > 0 && me.input.keyStatus("right") && (this.wallJump == 0 || this.wallJump == 2))
				{
					this.vel.x = -this.maxVel.x;
					this.wallJump = 1;
					this.vel.y = -this.maxVel.y;
					// set the jumping flag
					this.jumping = true;
				}
			}
		}
				

        if (this.pos.y > me.game.currentLevel.realheight + 32) {
            this.die();
        }

        // update objet animation
        this.parent(this);
        return updated;
    },

    die: function()
    {
		this.alive = false;
	
		var score = me.game.HUD.getItemValue("score");

		me.game.viewport.shake(3,30);
		me.game.viewport.fadeOut('#000000', 300, this.respawn());
		levelScore = levelScore / 2;
		var score = totalScore + levelScore;
				
		if(score <= 0)
			score = 0;
					
		me.game.HUD.setItemValue('score', score.round(0));
        this.flicker(45);		
    },
	
	halfJump: function()
    {
		this.falling = false;
		this.vel.y = -(this.maxVel.y * me.timer.tick) * 0.8;
		// set the jumping flag
		this.jumping = true;
    },

    setRespawnPosition: function (x,y) {
        this.respawn.x = x;
        this.respawn.y = y;
    },

    respawn: function ()
    {
		this.vel.x = 0;
		this.vel.y = 0;
		this.pos.x = this.respawn.x;
        this.pos.y = this.respawn.y;
		
		me.game.viewport.fadeOut('#000000', 300, this.unDie());
    },
	
	unDie: function()
	{
		this.alive = true;
	}

});

/*----------------
 a Coin entity
 ------------------------ */
var CoinEntity = me.CollectableEntity.extend({
    // extending the init function is not mandatory
    // unless you need to add some extra initialization
    init: function(x, y, settings) {
        // call the parent constructor
		settings.spritewidth = 32;
		settings.spriteheight = 32;
        this.parent(x, y, settings);
		this.collidable = true;
		this.setTransparency('#ffffff');
    },
	
    // this function is called by the engine, when
    // an object is touched by something (here collected)
    onCollision : function ()
    {
        // make sure it cannot be collected "again"
        this.collidable = false;
        // remove it
        me.game.remove(this);
		me.game.HUD.updateItemValue("score", 1);
		levelScore += 1;
    }
});


var generalEnemy = me.ObjectEntity.extend({
	init: function(x, y, settings) {
	 	// call the parent constructor
	 	this.score = settings.score;
        this.parent(x, y, settings);
	},
	 
	draw : function(context) {
        this.parent(context);
		if(!this.alive)
		{
			now = (me.timer.getTime() - this.ToD) / 10;
			this.tag.draw(context, this.score ,this.pos.x - me.game.viewport.pos.x, this.pos.y - me.game.viewport.pos.y - 20 - now);
		}
    },
    
    die: function()
    {
		now = me.timer.getTime() - lastHit;
		
		if(now > 1000)
		{
			combo = 0;
		}
		else
		{
			combo += 1;
		}
				
		lastHit = me.timer.getTime();
		if(combo)
		{
			this.score += this.score * combo;
		}
		this.alive = false;
		this.collidable = false;
		this.ToD = me.timer.getTime();
		me.audio.play('hit');
		this.setCurrentAnimation("die","dead");
		me.game.HUD.updateItemValue("score", this.score);
		levelScore += this.score;
    },
	
	dead: function()
	{
		if(!this.visible)
		{
			me.game.remove(this);
		}
		now = me.timer.getTime() - this.ToD;
		if (now > 2500) {
			this.flicker(10);
		} 
        if (now > 3000) {
            me.game.remove(this);
        }
	},
	
	onCollision: function(res, obj)
	{		
		if(obj.name != 'mainplayer')
		{
			return;
		}
		
		var dif = this.pos.y - obj.pos.y;
		
        if (this.alive && (dif > 0 || res.y > 0))
		{
            this.die();
        }
		else
		{
			obj.die();
		}
    }
});

/*----------------
 a zombie entity
 ------------------------ */
var ZombieEntity = generalEnemy.extend({
    // extending the init function is not mandatory
    // unless you need to add some extra initialization
    init: function(x, y, settings){
    	
		settings.spritewidth = 32;
		settings.spriteheight = 32;
		settings.score = 100;
						
		// call the parent constructor
        this.parent(x, y, settings);
		
		this.updateColRect(4, 26, 0, 32);
		
		// walking animation
        this.addAnimation ("stand", [0]);
        this.addAnimation ("walk", [0,1,2,3]);
        this.addAnimation ("die",  [4,5,6]);
		this.addAnimation ("dead", [7]);
		
		this.startX = x;
        this.endX = x + settings.width - settings.spritewidth;
		
		this.collidable = true;
		this.setTransparency('#ffffff');
		
		 // walking & jumping speed
        this.setVelocity(1, 1);
		
		this.pos.x = x + settings.width - settings.spritewidth;
		this.walkLeft = true;
				
		// make it collidable
        this.collidable = true;
				
		// make it a enemy object
        this.type = me.game.ENEMY_OBJECT;
		
		this.setCurrentAnimation("walk");
		
		this.ToD = 0;
		this.sleep = 0;
		
		this.tag = new me.Font("Verdana", 14, "white");
        this.tag.bold();
    },
	
	// manage the enemy movement
    update: function()
	{	
		if(!this.alive)
		{
			this.dead();
		}
        // do nothing if not visible
        if (!this.visible)
            return false;
 
        if (this.alive && this.sleep === 0) {			
            if (this.walkLeft && this.pos.x <= this.startX) {
                this.walkLeft = false;
				this.sleep = 60 * me.timer.tick;
            } else if (!this.walkLeft && this.pos.x >= this.endX) {
                this.walkLeft = true;
				this.sleep = 60 * me.timer.tick;
            }
            // make it walk
            
			if((this.endX - this.startX) >= 32)
			{
				this.vel.x += (this.walkLeft) ? -this.accel.x * me.timer.tick : this.accel.x * me.timer.tick;
			}
			else
			{
				this.flipX(this.walkLeft);
			}
						
			if(this.vel.x === 0)
			{
				this.setCurrentAnimation("stand");
			}
			else
			{
				this.flipX(this.walkLeft);
				this.setCurrentAnimation("walk");
			}
                 
        } else {
            this.vel.x = 0;
			
        }
		
		if(this.sleep !== 0)
		{
			this.sleep -= 1;
		}
         
        // check and update movement
        updated = this.updateMovement();
         
        // update animation if necessary
        if (updated)
		{
            // update objet animation
            this.parent(this);
        }
		
		
        return updated;
    }
});

var Zombie = ZombieEntity.extend({
	init: function(x, y, settings) {
		settings.image = "zombie";
		this.parent(x, y, settings);
	}
});

var Zombie2 = ZombieEntity.extend({
	init: function(x, y, settings) {
		settings.image = "zombie2";
		this.parent(x, y, settings);
	}
});

var Zombie3 = ZombieEntity.extend({
	init: function(x, y, settings) {
		settings.image = "zombie3";
		this.parent(x, y, settings);		
	}
});

var Eskimo = ZombieEntity.extend({
	init: function(x, y, settings) {
		settings.image = "eskimo";
		this.parent(x, y, settings);		
	}
});

/*----------------
 a barrel entity
 ------------------------ */
var BarrelEntity = me.ObjectEntity.extend({
    // extending the init function is not mandatory
    // unless you need to add some extra initialization
    init: function(x, y, settings) {
       	settings.image = 'barrel';			
		settings.spritewidth = 32;
		settings.spriteheight = 32;
						
		// call the parent constructor
        this.parent(x, y, settings);
		
		this.updateColRect(0, 32, 0, 32);
		
		// walking animation
        this.addAnimation ("roll", [0,1,2,3]);
        this.addAnimation ("smash", [0,1,2,3]);
		this.addAnimation ("dead", [4]);
    				
		this.collidable = true;
		this.setTransparency('#ffffff');
		
		 // walking & jumping speed
        this.setVelocity(5, 15);
		this.vel.y = -4;
		if(settings.dir)
		this.vel.x = 5;
		else
		this.vel.x = -5;
		
		this.bounces = 10;
					
		// make it a enemy object
        this.type = me.game.ENEMY_OBJECT;
		
		this.setCurrentAnimation("roll");
    },

    onCollision: function(res, obj) {
		obj.die();
    },
	
	// manage the enemy movement
    update: function()
	{			
		// check for collision result with the environment
		// update player position
		var res = this.updateMovement();
		
		// update objet animation
        this.parent(this);
		
		if(res.y)
		{
			if(res.y < 0)
				this.vel.y = (1 + this.bounces / 2);
			else
				this.vel.y = -(1 + this.bounces / 2); 
		}
		
		if(res.x)
		{
		  if(res.x < 0)
				this.vel.x = (1 + this.bounces);
			else
				this.vel.x = -(1 + this.bounces);
		}
		
		if(res.y || res.x)
		{
			this.bounces -= 1;
			if(this.bounces <= 0)
			{
				this.die();
			}
		}		
    },
	
	die: function()
    {
		me.game.remove(this);
    }
});

/*----------------
 a barrel entity
 ------------------------ */
var BarrelZombie = generalEnemy.extend({
    // extending the init function is not mandatory
    // unless you need to add some extra initialization
    init: function(x, y, settings) {
		settings.score = 150;
       	settings.image = 'barrelzombie';			
		settings.spritewidth = 32;
		settings.spriteheight = 64;
						
		// call the parent constructor
        this.parent(x, y, settings);
		
		this.updateColRect(0, 32, 32, 32);
		
		// walking animation
        this.addAnimation ("stand", [0,1,2,3]);
        this.addAnimation ("throw", [4,5,6,7]);
		this.addAnimation ("die",  [8,9,10,11]);
		this.addAnimation ("dead",  [11]);
    				
		this.collidable = true;
		this.setTransparency('#ffffff');
		
		 // walking & jumping speed
        this.setVelocity(5, 10);
		this.facing = settings.dir;
		if(!settings.dir)
		this.flipX();
							
		// make it a enemy object
        this.type = me.game.ENEMY_OBJECT;
		
		this.setCurrentAnimation("stand");
		this.wait = 1;
		this.ToT = 0;
		this.ToD = 0;
		
		this.tag = new me.Font("Verdana", 14, "white");
        this.tag.bold();
    },
		
	// manage the enemy movement
    update: function()
	{
		if(!this.alive)
		{
			this.dead();
		}
		// do nothing if not visible
        if (!this.visible && this.wait == 0)
		{
			this.wait = 1;
			this.ToT = 0;
            return false;
		}
		
		if(this.alive)
		{
			if(this.wait == 0)
			{
				this.throwbarrel();
				this.ToT = me.timer.getTime();
			}
			else if(this.ToT !== 0)
			{
				now = me.timer.getTime() - this.ToT;
				if(now > this.wait)
				{
					this.wait = 0;
				}
			}
			else
			{
				this.ToT = me.timer.getTime();
				this.wait = 1000;
			}
		}
		
		// update objet animation
        this.parent(this);
			
		return true;
    },
	
	throwbarrel: function()
    {
		this.setCurrentAnimation("throw","stand");
		this.wait = 3000;
		var b = new BarrelEntity(this.pos.x,this.pos.y, {image: "barrel", dir: this.facing});
		me.game.add(b, this.z);
		me.game.sort();
    }
});

/*----------------
 a barrel entity
 ------------------------ */
var Chainsaw = generalEnemy.extend({
    // extending the init function is not mandatory
    // unless you need to add some extra initialization
    init: function(x, y, settings) {
		this.score = 150;
       	settings.image = 'chainsaw';			
		settings.spritewidth = 56;
		settings.spriteheight = 56;
						
		// call the parent constructor
        this.parent(x, y, settings);
		
		this.startX = this.pos.x;
		this.startY = this.pos.y;
		
		this.updateColRect(20, 26, 10, 32);
		
		// walking animation
        this.addAnimation ("stand", [0,1,2,3]);
        this.addAnimation ("walk", [4,5,6]);
        this.addAnimation ("jump", [6]);
        this.addAnimation ("search", [7,7,7,8,8,8]);
        this.addAnimation ("swing", [9,11,13,15,10,12,14,16]);
		
		this.addAnimation ("die",  [8,9,10,11]);
		this.addAnimation ("dead",  [11]);
    				
		this.collidable = true;
		this.setTransparency('#ffffff');
		
		// add friction
        this.setFriction(2, 0);
		
		 // set the default horizontal & vertical speed (accel vector)
        this.setVelocity(3, 0);
		this.setMaxVelocity(3, 12);
		this.gravity = 0.7;
		
		this.facing = settings.dir;
		//if(!settings.dir)
		//this.flipX();
							
		// make it a enemy object
        this.type = me.game.ENEMY_OBJECT;
		
		this.setCurrentAnimation("stand");
		this.wait = 1;
		this.ToT = me.timer.getTime() + 100;
		this.ToD = 0;
		
		this.state = 'follow';
		
		this.tag = new me.Font("Verdana", 14, "white");
        this.tag.bold();
		
		this.target = me.game.getEntityByName("mainPlayer")[0];
		this.goTo = 0;
		
		this.hitpoints = 3;
		this.score = 500;
    },
		
	// manage the enemy movement
    update: function()
	{
		if(!this.alive)
		{
			this.dead();
			return false;
		}
		// do nothing if not visible
        if (!this.visible)
		{
            return false;
		}
		
		if(!this.flickering && !this.collidable)
		{
			this.collidable = true;
		}				
		
		if(this.state != 'search' && this.state != 'swing')
		{
			if (this.vel.x===0 && this.vel.y===0 && this.state != 'wait')
			{
				this.setCurrentAnimation("stand");
			}
			if(this.vel.y===0 && this.vel.x!==0)
			{
				this.setCurrentAnimation("walk");
			}
			if(this.jumping)
			{
				this.setCurrentAnimation("jump");
			}
			if(this.falling)
			{
				this.setCurrentAnimation("jump");
			}
		}
		
		if(this.state != 'swing' && this.state != 'search' && this.distanceTo(this.target) < 48)
		{
			this.state = 'swing';
			this.ToT = me.timer.getTime() + 1000;
		}
		else if(this.state == 'swing' && this.ToT > me.timer.getTime())
		{
			this.setCurrentAnimation("swing");
			if(this.distanceTo(this.target) < 48 && !this.isFlickering())
			{
				this.target.die();
				this.respawn();
			}
		}
		else if(this.state == 'swing' && this.ToT < me.timer.getTime())
		{
			this.state = 'follow';
			this.ToT = me.timer.getTime() + 10;
		}			
		else if(this.ToT < me.timer.getTime() && this.state == 'roam')
		{
			this.state = 'search'
			this.setCurrentAnimation("search");
			
			this.ToT = me.timer.getTime() + 800;
		}
		else if(this.ToT < me.timer.getTime() && this.state == 'search')
		{
			this.state = 'follow';
			this.ToT = me.timer.getTime() + 200;
		}
		else if(this.state == 'follow' && this.ToT < me.timer.getTime())
		{
			if(this.lastX == this.pos.x)
			{
				this.state = 'roam';
				this.ToT = me.timer.getTime() + 1000;
			}	
		
			if((this.target.pos.x + 16) < this.pos.x)
			{
				this.flipX(true);
				this.facing = 0;
				// update the entity velocity
				this.vel.x -= this.accel.x * me.timer.tick;
			}
			else if((this.target.pos.x - 16) > this.pos.x)
			{
				this.flipX(false);
				this.facing = 1;
				// update the entity velocity
				this.vel.x += this.accel.x * me.timer.tick;
			}
			
			if(this.target.pos.y <= this.pos.y)
			{
				if(this.pos.y > 384)
				{
					this.state = 'goTo';
					
					if(this.target.pos.x < 320)
					{
						this.goTo = 132;
					}
					else
					{
						this.goTo = 464;
					}
				}
			}
		}
		else if(this.state == 'roam')
		{
			if(this.facing == 1)
			{
				this.flipX(false);
				
				// update the entity velocity
				this.vel.x += this.accel.x * me.timer.tick;
			}
			else
			{
				this.flipX(true);
				// update the entity velocity
				this.vel.x -= this.accel.x * me.timer.tick;
			}
						
			if(updated.x)
			{
				if(updated.x < 0 && this.facing == 1 && updated.yprop.type == 'solid')
				{
					this.facing = 0;
				}
				else if(updated.x > 0 && this.facing == 0 && updated.yprop.type == 'solid')
				{
					this.facing = 1;
				}
			}
		}
		else if(this.state == 'goTo')
		{
			if(Math.random() * 1001 < 5)
			{
				this.state = 'roam';
			}
			if(this.goTo + 8 < this.pos.x)
			{
				this.flipX(true);
				this.facing = 0;
				// update the entity velocity
				this.vel.x -= this.accel.x * me.timer.tick;
			}
			else if(this.goTo - 8 > this.pos.x)
			{
				this.flipX(false);
				this.facing = 1;
				// update the entity velocity
				this.vel.x += this.accel.x * me.timer.tick;
			}
			
			if(this.goTo + 16 > this.pos.x && this.goTo - 16 < this.pos.x)
			{
				this.ToT = me.timer.getTime() + 400;
				this.state = 'jumping';
				if(this.pos.x < 300)
				{
					this.facing = 1;
				}
				else
				{
					this.facing = 0;
				}
				if(this.jump())
				{
				
					this.setCurrentAnimation("stand");
				}
			}
		}
		else if(this.state == 'jumping' && !this.jumping && !this.falling)
		{			
			if(this.target.pos.y < this.pos.y)
			{
				if(this.pos.y < 120)
				{
					this.state = 'follow';
					if(this.pos.x < 320)
					{
						this.facing = 0;
					}
					else
					{
						this.facing = 1;
					}
					this.ToT = me.timer.getTime() + 100;
				}				
				else if(this.pos.y < 256)
				{
					if(this.pos.x < 320)
					{
						this.facing = 0;
					}
					else
					{
						this.facing = 1;
					}
					
					this.jump();
				}
				else if(this.pos.y < 320)
				{					
					if(this.pos.x < 320)
					{
						this.facing = 1;
					}
					else
					{
						this.facing = 0;
					}
					
					this.jump();
				}
			}
			else
			{
				this.state = 'follow';
				this.ToT = me.timer.getTime() + 50;
			}
		}
		else if(this.state == 'jumping')
		{
			if(this.facing == 1)
			{
				this.flipX(false);
				
				// update the entity velocity
				this.vel.x += this.accel.x * me.timer.tick;
			}
			else
			{
				this.flipX(true);
				// update the entity velocity
				this.vel.x -= this.accel.x * me.timer.tick;
			}
		}
		
		// check and update movement
        updated = this.updateMovement();
				
		         
        // update animation if necessary
        if (updated)
		{
            // update objet animation
            this.parent(this);
        }
		
		
		
		this.lastX = this.pos.x;
        return true;
    },
	
	jump: function()
	{			
		if(!this.jumping && !this.falling)
		{
			this.jumping = true;
			// update the entity velocity
			this.vel.y = -this.maxVel.y;
			return true;
		}
	},
	
	jump2: function()
	{
		if(!this.jumping && !this.falling)
		{
			if(this.facing == 1)
			{
				this.vel.x = this.maxVel.x; 
			}
			else
			{
				this.vel.x = -this.maxVel.x; 		
			}
			
			this.jumping = true;
			// update the entity velocity
			this.vel.y = -this.maxVel.y;
			
		
			return true;
		}
	},
	
	onCollision: function(a, b)
	{		
		if (this.alive && a.y > 0 && this.state == 'search')
		{
			this.collidable = false;
			this.state = 'swing';
			if(!this.isFlickering())
			{
				this.hitpoints -= 1;
				this.flicker(45);
				if(this.hitpoints <= 0)
				{
					this.die();
				}
			}
		}
		else
		{
			b.die();
			this.respawn();
		}	
    },
	
	onDestroyEvent: function()
	{
		lastLvl = currentLvl;
		currentLvl = 'level2_1';
		
		me.state.change(me.state.READY);
	},
	
	respawn: function()
	{
		this.hitpoints = 3;
		this.pos.x = this.startX;
		this.pos.y = this.startY;
	}
});     

var EndPoint = me.LevelEntity.extend({
    // extending the init function is not mandatory
    // unless you need to add some extra initialization
    init: function(x, y, settings) {
		lastLvl = currentLvl;
		currentLvl = settings.nextlevel;
        this.parent(x, y, settings);
        this.collidable = true;
		//this.width = 32;
    },
    onCollision: function(a, b) {
		this.collidable = false;
		me.state.change(me.state.PLAY, currentLvl);
    },
	update: function()
	{
		return true;
	}
});

var CheckpointEntity = me.ObjectEntity.extend({

    /* -----

     constructor

     ------ */

    init: function(x, y, settings) {
        // call the constructor
		settings.image = 'checkpoint';
		settings.spriteheight = 32;
		settings.spritewidth = 32;
        this.parent(x, y, settings);
		this.collidable = true;
		this.setTransparency('#ffffff');
		this.updateColRect(0, 32, 0, 32);
		
		// walking animation
        this.addAnimation ("off", [1]);
		this.addAnimation ("on", [3]);
        this.addAnimation ("spin", [0,1,2,3,4]);
		
		this.setCurrentAnimation("off");
	},
	
	onCollision: function(a, b) {
		this.collidable = false;
		this.setCurrentAnimation("spin","on");
		b.setRespawnPosition(this.pos.x, this.pos.y);
    },
});