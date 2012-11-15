/*!
 * 
 *   Alex the Allegator 4 - Web Edition
 *   an HTML5 remake of the classic "Alex the allegator 4" game.
 *   made using the melonJS game library
 *   http://www.melonjs.org
 *		
 *   Originally Created by Johan Peitz from Free Lunch Design.
 *   http://allegator.sourceforge.net/
 *   http://www.freelunchdesign.com/
 *
 **/
var jsApp = {version:"1.4", objRef:null, onload:function () {
    me.sys.fps = 60;
    if (!me.video.init("jsapp", 640, 480)) {
        alert("Sorry but your browser does not support html 5 canvas. Please try with another one!");
        return
    }
    me.audio.init("mp3,ogg");
    me.loader.onload = this.loaded.bind(this);
    me.loader.preload(g_ressources);
    me.state.change(me.state.LOADING)
}, loaded:function () {
    me.state.set(me.state.MENU, new TitleScreen());
    me.state.set(me.state.CREDITS, new CreditsScreen());
    me.state.set(me.state.SETTINGS, new SettingsScreen());
    me.state.set(me.state.READY, new LevelCompleteScreen());
    me.state.set(me.state.PLAY, new PlayScreen());
    me.state.transition("fade", "#DFEDD2", 15);
    me.state.setTransition(me.state.READY, false);
    me.entityPool.add("playerspawnpoint", PlayerEntity);
    me.entityPool.add("cherryentity", CherryEntity);
    me.entityPool.add("heartentity", HeartEntity);
    me.entityPool.add("starentity", StarEntity);
    me.entityPool.add("1upentity", OneUpEntity);
    me.entityPool.add("rollblockentity", RollBlockEntity);
    me.entityPool.add("enemy1entity", Enemy1Entity);
    me.entityPool.add("enemy2entity", Enemy2Entity);
    me.entityPool.add("boss1entity", Boss1Entity);
    me.entityPool.add("canonentity", CanonEntity);
    me.entityPool.add("spikeentity", SpikeEntity);
    me.entityPool.add("lets_go_msg", LetsGoMessage);
    me.entityPool.add("game_end_msg", GameEndMessage);
    me.entityPool.add("tmxlevelentity", TMXLevelEntity);
    me.gamestat.add("stars", 0);
    me.gamestat.add("cherries", 0);
    me.audio.play("startup", false);
    me.state.onPause = function () {
        context = me.video.getScreenFrameBuffer();
        context.fillStyle = "rgba(0, 0, 0, 0.8)";
        context.fillRect(0, (me.video.getHeight() / 2) - 30, me.video.getWidth(), 60);
        font = new me.BitmapFont("atascii_40px", 40);
        font.set("left");
        measure = font.measureText("P A U S E");
        font.draw(context, "P A U S E", (me.video.getWidth() / 2) - (measure.width / 2), (me.video.getHeight() / 2) - (measure.height / 2))
    };
    me.state.change(me.state.MENU)
}};
var PlayScreen = me.ScreenObject.extend({onResetEvent:function (a) {
    me.levelDirector.loadLevel(a || "a4_level1");
    if (!a) {
        me.game.addHUD(0, 440, 640, 40, "rgb(12,69,0)");
        me.game.HUD.addItem("life", new HUDLifeObject(4, 4));
        me.game.HUD.addItem("energy", new HUDEnergyObject(180, 4));
        me.game.HUD.addItem("eggs", new HUDEggObject(310, 4));
        me.game.HUD.addItem("score", new HUDScoreObject(640, 2));
        try {
            tapjs.play()
        } catch (b) {
        }
    }
    me.input.bindKey(me.input.KEY.LEFT, "left");
    me.input.bindKey(me.input.KEY.RIGHT, "right");
    me.input.bindKey(me.input.KEY.X, "jump", true);
    me.gamestat.reset();
    this.playLevelSong()
}, onGameOver:function () {
    this.onGameEnd();
    me.game.add(new gameOverMessage(0, 0, function () {
        me.game.disableHUD();
        me.state.change(me.state.MENU)
    }), 999);
    me.game.sort();
    me.audio.stopTrack();
    me.audio.play("Game_Over")
}, playLevelSong:function () {
    if (me.levelDirector.getCurrentLevelId() == "a4_level6") {
        me.audio.play("Boss_Start", false, function () {
            me.audio.playTrack("Boss_Song")
        })
    } else {
        if (me.levelDirector.getCurrentLevelId() == "a4_game_end") {
            me.audio.play("Level_Start", false, function () {
                me.audio.playTrack("Level_Song")
            })
        } else {
            me.audio.play("Level_Start", false, function () {
                me.audio.playTrack("Level_Song")
            })
        }
    }
}, onGameEnd:function () {
    try {
        tapjsHighScores.save(me.game.HUD.getItemValue("score"), "Level " + me.game.currentLevel.levelid, "yes")
    } catch (a) {
    }
}, onDestroyEvent:function () {
    me.input.unbindKey(me.input.KEY.LEFT);
    me.input.unbindKey(me.input.KEY.RIGHT);
    me.input.unbindKey(me.input.KEY.X);
    me.audio.stopTrack("Level_Song")
}});
window.onReady(function () {
    jsApp.onload()
});
var PlayerEntity = me.ObjectEntity.extend({init:function (a, c, b) {
    b.image = "alex4";
    b.spritewidth = 64;
    this.parent(a, c, b);
    this.initialyvel = 18;
    this.setVelocity(4, this.initialyvel);
    this.updateColRect(16, 32, 4, 60);
    this.addAnimation("walk", [0, 1, 2, 3, 4, 5]);
    this.addAnimation("eat", [6, 6]);
    this.addAnimation("roll", [7, 8, 9, 10]);
    this.setCurrentAnimation("walk");
    this.ylimit = me.game.currentLevel.tileheight * 7;
    this.onTileBreak = function () {
        me.audio.play("crush", false)
    };
    me.game.viewport.follow(this.pos, me.game.viewport.AXIS.HORIZONTAL);
    this.isRolling = false
}, update:function () {
    if (!this.alive) {
        this.vel.x = 0;
        updated = this.updateMovement()
    } else {
        if (this.isRolling === false) {
            this.vel.x = 0;
            if (me.input.isKeyPressed("left")) {
                this.doWalk(true)
            } else {
                if (me.input.isKeyPressed("right")) {
                    this.doWalk(false)
                }
            }
        }
        if (me.input.isKeyPressed("jump")) {
            if (this.doJump()) {
                me.audio.play("jump", false)
            }
        }
        updated = this.updateMovement();
        if ((this.isRolling === true) && (this.vel.x == 0)) {
            this.setWalk()
        }
        var a = me.game.collide(this);
        if (a) {
            switch (a.type) {
                case me.game.ENEMY_OBJECT:
                    if ((a.y > 0) && this.falling) {
                        if (me.input.keyStatus("jump")) {
                            this.setVelocity(4, 18);
                            this.forceJump();
                            me.audio.play("stomp", false);
                            me.audio.play("jump", false);
                            this.setVelocity(4, this.initialyvel)
                        } else {
                            this.halfJump()
                        }
                    } else {
                        if (!this.flickering && !this.isRolling) {
                            this.touch()
                        }
                    }
                    break;
                case me.game.COLLECTABLE_OBJECT:
                    if (!this.isRolling) {
                        this.setCurrentAnimation("eat", "walk")
                    }
                    break;
                case"roll":
                    this.setRoll();
                    break;
                default:
                    break
            }
        }
        if (updated) {
            if (this.pos.y > this.ylimit) {
                this.die()
            }
        }
        if (updated || !this.isCurrentAnimation("walk")) {
            this.parent();
            updated = true
        }
    }
    return updated
}, setRoll:function () {
    me.audio.play("turn", false);
    this.canBreakTile = true;
    this.setCurrentAnimation("roll");
    this.isRolling = true;
    this.setVelocity(4, 18);
    this.vel.x = (this.vel.x < 0) ? -7 : 7
}, setWalk:function () {
    me.audio.play("impact", false);
    this.canBreakTile = false;
    this.setCurrentAnimation("walk");
    this.isRolling = false;
    this.vel.x = 0;
    this.setVelocity(4, this.initialyvel)
}, halfJump:function () {
    me.audio.play("stomp", false);
    this.setVelocity(4, this.initialyvel / 2);
    this.forceJump();
    this.setVelocity(4, this.initialyvel)
}, die:function () {
    this.alive = false;
    this.flipY(true);
    this.forceJump();
    me.game.HUD.updateItemValue("life", -1);
    me.audio.stopTrack();
    me.audio.play("die", false);
    if (me.game.HUD.getItemValue("life") == 0) {
        this.flicker(40, function () {
            me.game.remove(this)
        });
        me.game.HUD.reset("energy");
        me.game.HUD.reset("eggs");
        me.state.current().onGameOver()
    } else {
        me.audio.play("Player_Dies");
        this.flicker(40, function () {
            me.game.HUD.reset("energy");
            me.game.HUD.reset("eggs");
            me.gamestat.reset();
            me.levelDirector.reloadLevel();
            me.game.viewport.fadeOut("#DFEDD2", 15);
            me.state.current().playLevelSong()
        })
    }
}, touch:function () {
    me.game.HUD.updateItemValue("energy", -1);
    if (me.game.HUD.getItemValue("energy") == 0) {
        this.die()
    } else {
        me.audio.play("hurt", false);
        this.flicker(me.sys.fps * 2)
    }
}});
var GenericEnemyEntity = me.ObjectEntity.extend({init:function (a, c, b) {
    this.parent(a, c, b);
    this.walkLeft = true;
    this.collisionEnable = true;
    this.setVelocity(2, 16);
    this.collidable = true;
    this.type = me.game.ENEMY_OBJECT;
    this.ylimit = me.game.currentLevel.tileheight * 7;
    this.ToD = 0
}, unDie:function () {
    if (!this.alive) {
        now = me.timer.getTime() - this.ToD;
        if (now > 3000) {
            this.type = me.game.ENEMY_OBJECT;
            this.setCurrentAnimation("walk");
            this.alive = true;
            return
        }
    }
}, onDestroyEvent:function () {
    if (!this.alive) {
        me.audio.play("eat", false);
        me.game.HUD.updateItemValue("score", 50)
    }
}, onCollision:function (a, b) {
    if (this.alive) {
        if (b.isRolling) {
            this.die()
        } else {
            if ((a.y > 0) && b.falling) {
                this.alive = false;
                this.setCurrentAnimation("dead");
                this.ToD = me.timer.getTime()
            }
        }
    } else {
        if (a.y == 0) {
            this.type = me.game.COLLECTABLE_OBJECT
        } else {
            this.type = me.game.NO_OBJECT
        }
    }
    this.parent()
}, die:function () {
    me.audio.play("kill", false);
    this.alive = false;
    this.collisionEnable = false;
    this.flipY(true);
    this.forceJump();
    this.ToD = me.timer.getTime();
    this.flicker(me.sys.fps, function () {
        me.game.remove(this)
    })
}});
var Enemy1Entity = GenericEnemyEntity.extend({init:function (a, c, b) {
    b.image = "enemy1";
    b.spritewidth = 64;
    this.parent(a, c, b);
    this.addAnimation("walk", [0, 4, 1, 2]);
    this.addAnimation("dead", [6]);
    this.setCurrentAnimation("walk");
    this.updateColRect(8, 48, 4, 60)
}, update:function () {
    if (!this.visible) {
        return false
    }
    if (this.alive) {
        this.doWalk(this.walkLeft)
    } else {
        this.vel.x = 0
    }
    updated = this.updateMovement();
    if (this.alive) {
        this.walkLeft = (this.vel.x == 0) ? !this.walkLeft : this.walkLeft
    }
    if (this.pos.y > this.ylimit) {
        me.game.remove(this)
    } else {
        if (updated) {
            this.parent()
        }
    }
    if (!this.alive) {
        this.unDie()
    }
    return updated
}});
var Enemy2Entity = GenericEnemyEntity.extend({init:function (a, c, b) {
    b.image = "enemy2";
    b.spritewidth = 64;
    this.parent(a, c, b);
    this.startX = a;
    this.endX = a + b.width - 64;
    this.pos.x = a + b.width - 64;
    this.walkLeft = true;
    this.updateColRect(8, 48, 12, 64);
    this.addAnimation("walk", [0, 1, 2, 1, 3]);
    this.addAnimation("dead", [4]);
    this.setCurrentAnimation("walk")
}, update:function () {
    if (!this.visible) {
        return false
    }
    if (this.alive) {
        if (this.walkLeft && this.pos.x <= this.startX) {
            this.walkLeft = false
        } else {
            if (!this.walkLeft && this.pos.x >= this.endX) {
                this.walkLeft = true
            }
        }
        this.doWalk(this.walkLeft)
    } else {
        this.vel.x = 0
    }
    updated = this.updateMovement();
    if (this.pos.y > this.ylimit) {
        me.game.remove(this)
    } else {
        if (updated) {
            this.parent()
        }
    }
    if (!this.alive) {
        this.unDie()
    }
    return updated
}});
var Boss1Entity = me.ObjectEntity.extend({init:function (a, c, b) {
    b.image = "boss1";
    b.spritewidth = 128;
    this.parent(a, c, b);
    this.walkLeft = true;
    this.collisionEnable = true;
    this.setVelocity(2, 6);
    this.collidable = true;
    this.type = "boss1";
    this.updateColRect(-1, 0, 28, 100);
    this.energy = 4
}, onCollision:function (a, b) {
    if (b.isRolling && (((a.x < 0) && (this.walkLeft)) || ((a.x > 0) && (!this.walkLeft)))) {
        this.die()
    } else {
        b.die()
    }
    this.parent()
}, die:function (a, b) {
    this.energy--;
    me.audio.play("hit", false);
    if (this.energy > 0) {
        this.collidable = false;
        this.flicker(me.sys.fps, this.undie.bind(this))
    } else {
        this.alive = false;
        this.collidable = false;
        this.flipY(true);
        this.forceJump();
        this.flicker(me.sys.fps / 2, function () {
            me.game.remove(this);
            me.state.change(me.state.READY, "a4_game_end")
        })
    }
}, undie:function () {
    this.collidable = true
}, update:function () {
    this.vel.x = 0;
    if (this.alive) {
        this.doWalk(this.walkLeft)
    }
    updated = this.updateMovement();
    this.walkLeft = (this.vel.x == 0) ? !this.walkLeft : this.walkLeft;
    if (updated) {
        this.parent()
    }
    return true
}});
var CanonEntity = me.InvisibleEntity.extend({init:function (a, c, b) {
    this.parent(a, c, b);
    this.collidable = false;
    this.last = me.timer.getTime()
}, update:function () {
    now = me.timer.getTime();
    if (now - this.last > 4000) {
        me.audio.play("crush", false);
        me.game.add(new BulletEntity(this.pos.x - 64, this.pos.y, true), this.z);
        me.game.add(new BulletEntity(this.pos.x + 64, this.pos.y, false), this.z);
        me.game.sort();
        this.last = now;
        return true
    }
    return false
}});
var BulletEntity = me.ObjectEntity.extend({init:function (a, c, b) {
    settings = {};
    settings.image = "bullet";
    settings.spritewidth = 64;
    this.parent(a, c, settings);
    this.collisionEnable = true;
    this.collidable = true;
    this.type = me.game.ENEMY_OBJECT;
    this.visible = true;
    this.setVelocity(8, 10);
    this.doWalk(b);
    this.update = function () {
        this.vel.y -= this.gravity;
        updated = this.updateMovement();
        if (this.vel.x == 0) {
            me.game.remove(this)
        }
        return updated
    }
}});
var SpikeEntity = me.InvisibleEntity.extend({init:function (a, c, b) {
    this.parent(a, c, b);
    this.collidable = true;
    this.visible = true;
    this.type = me.game.ENEMY_OBJECT;
    if (b.direction) {
        switch (b.direction) {
            case"up":
                this.updateColRect(-1, 0, 32, 32);
                break;
            case"left":
                this.updateColRect(32, 32, -1, 0);
                break;
            case"down":
                this.updateColRect(-1, 0, 0, 32);
                break;
            case"right":
                this.updateColRect(0, 32, -1, 0);
                break;
            default:
                break
        }
    }
}, onCollision:function (a, b) {
    b.die();
    this.parent()
}, update:function () {
    return false
}});
var RollBlockEntity = me.CollectableEntity.extend({init:function (a, c, b) {
    b.image = "roll";
    b.spritewidth = 64;
    this.parent(a, c, b);
    this.autodestroy = false;
    this.type = "roll"
}});
var CherryEntity = me.CollectableEntity.extend({init:function (a, c, b) {
    b.image = "cherry";
    b.spritewidth = 64;
    this.parent(a, c, b);
    this.updateColRect(8, 48, 8, 48)
}, onDestroyEvent:function () {
    me.audio.play("cherry", false);
    me.game.HUD.updateItemValue("score", 10);
    me.gamestat.updateValue("cherries", 1)
}});
var HeartEntity = me.CollectableEntity.extend({init:function (a, c, b) {
    b.image = "heart";
    b.spritewidth = 64;
    this.parent(a, c, b);
    this.updateColRect(8, 48, 8, 48)
}, onDestroyEvent:function () {
    me.audio.play("heart", false);
    me.game.HUD.updateItemValue("energy", 1)
}});
var OneUpEntity = me.CollectableEntity.extend({init:function (a, c, b) {
    b.image = "1up";
    b.spritewidth = 64;
    this.parent(a, c, b);
    this.updateColRect(8, 48, 8, 48)
}, onDestroyEvent:function () {
    me.audio.play("xtralife", false);
    me.game.HUD.updateItemValue("life", 1)
}});
var StarEntity = me.CollectableEntity.extend({init:function (a, c, b) {
    b.image = "stars";
    b.spritewidth = 64;
    this.parent(a, c, b);
    this.updateColRect(8, 48, 8, 48)
}, onDestroyEvent:function () {
    me.audio.play("star", false);
    me.game.HUD.updateItemValue("score", 100);
    me.gamestat.updateValue("stars", 1)
}});
var TMXLevelEntity = me.LevelEntity.extend({init:function (a, c, b) {
    b.to = b.nextlevel;
    this.parent(a, c, b);
    this.updateColRect(20, 24, 24, 40)
}, onCollision:function () {
    this.collidable = false;
    me.state.change(me.state.READY, this.nextlevel)
}});
var HUDScoreObject = me.HUD_Item.extend({init:function (a, b) {
    this.parent(a, b);
    this.font = new me.BitmapFont("atascii_40px", 40)
}, draw:function (b, a, c) {
    this.font.draw(b, this.value, this.pos.x + a, this.pos.y + c)
}});
var HUDLifeObject = me.HUD_Item.extend({init:function (a, b) {
    this.parent(a, b, 2);
    this.font = new me.BitmapFont("atascii_40px", 40);
    this.font.set("left");
    this.lifeIcon = me.loader.getImage("hud_life")
}, draw:function (b, a, c) {
    b.drawImage(this.lifeIcon, this.pos.x + a, this.pos.y + c);
    this.font.draw(b, this.value, this.pos.x + a + this.lifeIcon.width, this.pos.y + c - 2)
}});
var HUDEggObject = me.HUD_Item.extend({init:function (a, b) {
    this.parent(a, b);
    this.font = new me.BitmapFont("atascii_40px", 40);
    this.font.set("left");
    this.EggIcon = me.loader.getImage("hud_egg")
}, draw:function (b, a, c) {
    b.drawImage(this.EggIcon, this.pos.x + a, this.pos.y + c);
    this.font.draw(b, this.value, this.pos.x + a + this.EggIcon.width, this.pos.y + c - 2)
}});
var HUDEnergyObject = me.HUD_Item.extend({init:function (a, b) {
    this.parent(a, b, 1);
    this.heartIcon = me.loader.getImage("hud_heart")
}, update:function (a) {
    if (this.value + a < 0) {
        return false
    }
    if (this.value + a <= 2) {
        return this.parent(a)
    } else {
        me.game.HUD.updateItemValue("score", 100)
    }
    return false
}, draw:function (c, b, d) {
    var a = this.pos.x + b;
    for (i = 0; i < this.value; i++) {
        c.drawImage(this.heartIcon, a, this.pos.y + d);
        a += this.heartIcon.width
    }
}});
var LetsGoMessage = me.SpriteObject.extend({init:function (a, b) {
    this.parent(a, b, me.loader.getImage("lets_go_msg"));
    this.pos.x = me.game.viewport.pos.x + ((me.game.viewport.width - this.image.width) / 2);
    this.pos.y = me.game.viewport.pos.y - this.image.height;
    this.font = new me.BitmapFont("atascii_32px", 32);
    this.font.set("left");
    this.leveltitle = me.game.currentLevel.label.toUpperCase();
    this.size = (this.font.measureText(this.leveltitle)).width;
    this.labelx = 0 - this.size;
    this.tween = new me.Tween(this.pos).to({y:140}, 1500).onComplete(this.AnimStep.bind(this));
    this.tween.easing(me.Tween.Easing.Bounce.EaseOut);
    this.texttween = new me.Tween(this).to({labelx:((me.game.viewport.width - this.size) / 2)}, 750);
    this.tween.start();
    this.texttween.start()
}, AnimStep:function () {
    this.tween.easing(me.Tween.Easing.Circular.EaseOut);
    this.tween.to({y:me.game.currentLevel.realheight}, 1500).start();
    this.tween.onComplete(this.AnimFinished.bind(this));
    this.texttween.to({labelx:me.game.viewport.width}, 500).start()
}, AnimFinished:function () {
    me.game.remove(this)
}, draw:function (a) {
    this.pos.x = me.game.viewport.pos.x + ((me.game.viewport.width - this.image.width) / 2);
    this.parent(a);
    this.font.draw(a, this.leveltitle, this.labelx, 250)
}});
var gameOverMessage = me.SpriteObject.extend({init:function (a, c, b) {
    this.parent(a, c, me.loader.getImage("gameover"));
    this.pos.x = me.game.viewport.pos.x + ((me.game.viewport.width - this.image.width) / 2);
    this.pos.y = 0 - this.image.height;
    this.callback = b;
    this.tween = new me.Tween(this.pos).to({y:200}, 3000).onComplete(b);
    this.tween.easing(me.Tween.Easing.Bounce.EaseOut);
    this.tween.start()
}});
var GameEndMessage = me.InvisibleEntity.extend({init:function (a, c, b) {
    settings = {};
    settings.width = 64;
    settings.height = 64;
    this.parent(a, c, settings);
    this.collidable = false;
    this.yoff = -270;
    this.tween = new me.Tween(this).to({yoff:50}, 2000).onComplete(this.animDone.bind(this));
    this.tween.easing(me.Tween.Easing.Bounce.EaseOut);
    this.animover = false;
    this.font = new me.BitmapFont("atascii_32px", 32);
    this.font.set("left");
    me.input.bindKey(me.input.KEY.ENTER, "enter", true);
    this.tween.start()
}, update:function () {
    if (this.animover && me.input.isKeyPressed("enter")) {
        me.state.current().onGameEnd();
        me.input.unbindKey(me.input.KEY.ENTER);
        me.game.disableHUD();
        me.state.change(me.state.CREDITS)
    }
    return true
}, animDone:function () {
    this.animover = true
}, draw:function (a) {
    a.fillStyle = "rgba(12,69,0,0.5)";
    a.fillRect(85, this.yoff, 490, 240);
    a.fillRect(90, this.yoff + 5, 480, 230);
    this.font.draw(a, "CONGRATULATIONS", 90, this.yoff + 10);
    this.font.draw(a, "WAS NOT SO HARD", 90, this.yoff + 50);
    this.font.draw(a, "I GUESS ?", 90, this.yoff + 80);
    this.font.draw(a, "COME BACK FOR", 90, this.yoff + 120);
    this.font.draw(a, "MORE LEVEL SOON", 90, this.yoff + 150);
    if (this.animover == true) {
        this.font.draw(a, "PRESS <ENTER>", 130, this.yoff + 200)
    }
}});
var TitleScreen = me.ScreenObject.extend({init:function () {
    this.parent(true);
    this.title = null;
    this.font = null;
    this.scrollerfont = null;
    this.arrow = null;
    this.tween = null;
    this.menuItems = [];
    this.selectedItem = 0;
    this.scroller = "GUIDE ALEX TO THE EXIT OF EACH LEVEL , USING ARROWS TO MOVE , X TO JUMP ON ENEMIES AND PICK UP STARS AND CHERRIES ON THE WAY     ";
    this.scrollerpos = 600
}, onResetEvent:function () {
    if (this.title == null) {
        this.title = me.loader.getImage("menu_title");
        this.font = new me.BitmapFont("atascii_40px", 40);
        this.font.set("left");
        this.scrollerfont = new me.BitmapFont("atascii_32px", 32);
        this.scrollerfont.set("left");
        this.arrow = new me.SpriteObject(80, 225, me.loader.getImage("menu_arrow"));
        this.menuItems[0] = new me.Vector2d(0, 210);
        this.menuItems[1] = new me.Vector2d(0, 270);
        this.menuItems[2] = new me.Vector2d(0, 330);
        this.menuItems[3] = new me.Vector2d(0, 390);
        this.selectedItem = 0
    }
    this.scrollerpos = 640;
    this.scrollertween = new me.Tween(this).to({scrollerpos:-4000}, 20000).onComplete(this.scrollover.bind(this)).start();
    this.tween = new me.Tween(this.arrow.pos).to({x:90}, 400).onComplete(this.tweenbw.bind(this)).start();
    this.arrow.pos.y = this.menuItems[this.selectedItem].y;
    pb = new me.ParallaxBackgroundEntity(1);
    pb.addLayer("p_layer1", 1, 1);
    pb.addLayer("p_layer2", 2, 2);
    pb.addLayer("p_layer3", 3, 3);
    me.game.add(pb);
    me.game.add(this.arrow, 10);
    me.input.bindKey(me.input.KEY.UP, "up", true);
    me.input.bindKey(me.input.KEY.DOWN, "down", true);
    me.input.bindKey(me.input.KEY.ENTER, "enter", true);
    me.input.bindKey(me.input.KEY.X, "enter", true);
    me.audio.playTrack("Menu_Song")
}, tweenbw:function () {
    this.tween.to({x:80}, 400).onComplete(this.tweenff.bind(this)).start()
}, tweenff:function () {
    this.tween.to({x:90}, 400).onComplete(this.tweenbw.bind(this)).start()
}, scrollover:function () {
    this.scrollerpos = 640;
    this.scrollertween.to({scrollerpos:-4000}, 20000).onComplete(this.scrollover.bind(this)).start()
}, update:function () {
    if (me.input.isKeyPressed("up")) {
        if (this.selectedItem > 0) {
            this.selectedItem--
        }
        this.arrow.pos.y = this.menuItems[this.selectedItem].y;
        me.audio.play("menu", false);
        return true
    }
    if (me.input.isKeyPressed("down")) {
        if (this.selectedItem < this.menuItems.length - 1) {
            this.selectedItem++
        }
        this.arrow.pos.y = this.menuItems[this.selectedItem].y;
        me.audio.play("menu", false);
        return true
    }
    if (me.input.isKeyPressed("enter")) {
        me.audio.play("menu", false);
        if (this.selectedItem == 0) {
            me.state.change(me.state.PLAY)
        }
        if (this.selectedItem == 2) {
            me.state.change(me.state.SETTINGS)
        }
        if (this.selectedItem == 3) {
            me.state.change(me.state.CREDITS)
        }
        return true
    }
    return false
}, draw:function (a) {
    a.drawImage(this.title, (a.canvas.width - this.title.width) / 2, 80);
    this.font.draw(a, "START GAME", 140, 215);
    this.font.draw(a, "HIGH SCORES", 140, 275);
    this.font.draw(a, "SETTINGS", 140, 335);
    this.font.draw(a, "CREDITS", 140, 395);
    this.scrollerfont.draw(a, this.scroller, this.scrollerpos, 450)
}, onDestroyEvent:function () {
    me.input.unbindKey(me.input.KEY.UP);
    me.input.unbindKey(me.input.KEY.DOWN);
    me.input.unbindKey(me.input.KEY.ENTER);
    me.input.unbindKey(me.input.KEY.X);
    me.audio.stopTrack("Menu_Song");
    this.scrollertween.stop()
}, });
CreditsScreen = me.ScreenObject.extend({init:function () {
    this.parent(true);
    this.title = null;
    this.font = null
}, onResetEvent:function () {
    if (this.title == null) {
        this.title = me.loader.getImage("menu_title");
        this.font = new me.BitmapFont("atascii_32px", 32);
        this.font.set("left")
    }
    pb = new me.ParallaxBackgroundEntity(1);
    pb.addLayer("p_layer1", 1, 1);
    pb.addLayer("p_layer2", 2, 2);
    pb.addLayer("p_layer3", 3, 3);
    me.game.add(pb);
    me.input.bindKey(me.input.KEY.ENTER, "enter", true);
    me.input.bindKey(me.input.KEY.X, "enter", true);
    me.input.bindKey(me.input.KEY.ESC, "enter", true);
    me.audio.playTrack("Menu_Song")
}, update:function () {
    if (me.input.isKeyPressed("enter")) {
        me.audio.play("menu", false);
        me.state.change(me.state.MENU)
    }
    me.game.viewport.pos.x += 1;
    return true
}, draw:function (a) {
    a.drawImage(this.title, (a.canvas.width - this.title.width) / 2, 80);
    this.font.draw(a, jsApp.version, 525, 170);
    this.font.draw(a, ">HTML5 REMAKE<", 50, 220);
    this.font.draw(a, "O.BIOT / MELONJS", 100, 250);
    this.font.draw(a, ">ORIGINAL GAME<", 50, 310);
    this.font.draw(a, "DESIGN CODE GFX :", 50, 350);
    this.font.draw(a, "JOHAN PEITZ", 100, 380);
    this.font.draw(a, "MUSIC SFX :", 50, 410);
    this.font.draw(a, "ANDERS SVENSSON", 100, 440)
}, onDestroyEvent:function () {
    me.input.unbindKey(me.input.KEY.ENTER);
    me.input.unbindKey(me.input.KEY.X);
    me.input.unbindKey(me.input.KEY.ESC);
    me.audio.playTrack("Menu_Song")
}, });
SettingsScreen = me.ScreenObject.extend({init:function () {
    this.parent(true);
    this.title = null;
    this.font = null;
    this.arrow = null;
    this.tween = null
}, onResetEvent:function () {
    if (this.title == null) {
        this.title = me.loader.getImage("menu_title");
        this.font = new me.BitmapFont("atascii_32px", 32);
        this.font.set("left");
        this.arrow = new me.SpriteObject(80, 345, me.loader.getImage("menu_arrow"))
    }
    this.tween = new me.Tween(this.arrow.pos).to({x:90}, 400).onComplete(this.tweenbw.bind(this)).start();
    pb = new me.ParallaxBackgroundEntity(1);
    pb.addLayer("p_layer1", 1, 1);
    pb.addLayer("p_layer2", 2, 2);
    pb.addLayer("p_layer3", 3, 3);
    me.game.add(pb);
    me.game.add(this.arrow, 10);
    me.input.bindKey(me.input.KEY.ENTER, "enter", true);
    me.input.bindKey(me.input.KEY.X, "enter", true);
    me.input.bindKey(me.input.KEY.ESC, "exit", true)
}, tweenbw:function () {
    this.tween.to({x:80}, 400).onComplete(this.tweenff.bind(this)).start()
}, tweenff:function () {
    this.tween.to({x:90}, 400).onComplete(this.tweenbw.bind(this)).start()
}, update:function () {
    if (me.input.isKeyPressed("exit")) {
        me.audio.play("menu", false);
        me.state.change(me.state.MENU)
    }
    if (me.input.isKeyPressed("enter")) {
        if (me.audio.isAudioEnable()) {
            me.audio.disable()
        } else {
            me.audio.enable();
            me.audio.play("menu", false)
        }
    }
    return true
}, draw:function (a) {
    a.drawImage(this.title, (a.canvas.width - this.title.width) / 2, 80);
    this.font.draw(a, "SETTINGS ", 50, 250);
    audiostr = me.audio.isAudioEnable() ? "ON" : "OFF";
    this.font.draw(a, "AUDIO : " + audiostr, 150, 350)
}, onDestroyEvent:function () {
    me.input.unbindKey(me.input.KEY.ENTER);
    me.input.unbindKey(me.input.KEY.X);
    me.input.unbindKey(me.input.KEY.ESC)
}});
LevelCompleteScreen = me.ScreenObject.extend({init:function () {
    this.parent(true);
    this.title = null;
    this.font = null;
    this.levelId = null;
    this.levelpoint = 0;
    this.livespoint = 0;
    this.starspoint = 0;
    this.cherriespoint = 0;
    this.postitle = 0;
    this.tween = null;
    this.background = null;
    this.scoreadded = false
}, onResetEvent:function (a) {
    this.levelId = a;
    if (this.font == null) {
        this.title = me.loader.getImage("levelcomplete");
        this.font = new me.BitmapFont("atascii_32px", 32)
    }
    this.scoreadded = false;
    this.tweenfinished = false;
    this.scorestate = 0;
    this.postitle = 0 - this.title.height;
    this.tween = new me.Tween(this).to({postitle:0}, 750).onComplete(this.tweencb.bind(this));
    this.tween.easing(me.Tween.Easing.Bounce.EaseOut);
    this.background = me.video.applyRGBFilter("brightness", 0.7);
    this.levelpoint = me.game.currentLevel.levelid * 100;
    this.livespoint = me.game.HUD.getItemValue("life") * 100;
    this.starspoint = me.gamestat.getItemValue("stars") * 100;
    this.cherriespoint = me.gamestat.getItemValue("cherries") * 100;
    me.input.bindKey(me.input.KEY.ENTER, "enter");
    me.input.bindKey(me.input.KEY.X, "enter");
    me.audio.play("Level_Done");
    this.tween.start()
}, tweencb:function () {
    this.tweenfinished = true
}, addscore:function () {
    if (!this.scoreadded) {
        switch (this.scorestate) {
            case 0:
                me.audio.play("point");
                me.game.HUD.updateItemValue("score", this.levelpoint);
                break;
            case 1:
                this.levelpoint = 0;
                break;
            case 2:
                me.game.HUD.updateItemValue("score", this.livespoint);
                break;
            case 3:
                this.livespoint = 0;
                break;
            case 4:
                me.game.HUD.updateItemValue("score", this.starspoint);
                break;
            case 5:
                this.starspoint = 0;
                break;
            case 6:
                me.game.HUD.updateItemValue("score", this.cherriespoint);
                break;
            case 7:
                this.cherriespoint = 0;
                break;
            case 8:
                this.scoreadded = true;
                break;
            default:
                break
        }
        this.scorestate++
    }
}, update:function () {
    if (this.tweenfinished && !this.scoreadded) {
        this.addscore()
    }
    if (me.input.isKeyPressed("enter") && this.scoreadded) {
        me.state.change(me.state.PLAY, this.levelId)
    }
    return true
}, draw:function (a) {
    a.drawImage(this.background.canvas, 0, 0);
    a.drawImage(this.title, (a.canvas.width - this.title.width) / 2, this.postitle);
    this.font.set("left");
    this.font.draw(a, "LEVEL", 4, 200);
    this.font.draw(a, "LIFES", 4, 260);
    this.font.draw(a, "STARS", 4, 320);
    this.font.draw(a, "CHERRIES", 4, 380);
    this.font.set("right");
    this.font.draw(a, me.game.currentLevel.levelid, 336, 200);
    this.font.draw(a, me.game.HUD.getItemValue("life"), 336, 260);
    this.font.draw(a, me.gamestat.getItemValue("stars"), 336, 320);
    this.font.draw(a, me.gamestat.getItemValue("cherries"), 336, 380);
    this.font.set("right");
    this.font.draw(a, "X100=", 496, 200);
    this.font.draw(a, "X100=", 496, 260);
    this.font.draw(a, "X100=", 496, 320);
    this.font.draw(a, "X100=", 496, 380);
    this.font.set("right");
    this.font.draw(a, this.levelpoint, 640, 200);
    this.font.draw(a, this.livespoint, 640, 260);
    this.font.draw(a, this.starspoint, 640, 320);
    this.font.draw(a, this.cherriespoint, 640, 380)
}, onDestroyEvent:function () {
    me.input.unbindKey(me.input.KEY.ENTER);
    me.input.unbindKey(me.input.KEY.X);
    this.tween.stop()
}});
var g_ressources = [
    {name:"a4_tileset", type:"image", src:"data/level/a4_tileset.png"},
    {name:"alex4", type:"image", src:"data/sprites/alex4.png"},
    {name:"enemy1", type:"image", src:"data/sprites/enemy1.png"},
    {name:"enemy2", type:"image", src:"data/sprites/enemy2.png"},
    {name:"boss1", type:"image", src:"data/sprites/boss1.png"},
    {name:"bullet", type:"image", src:"data/sprites/bullet.png"},
    {name:"heart", type:"image", src:"data/sprites/heart.png"},
    {name:"stars", type:"image", src:"data/sprites/stars.png"},
    {name:"cherry", type:"image", src:"data/sprites/cherry.png"},
    {name:"1up", type:"image", src:"data/sprites/1up.png"},
    {name:"roll", type:"image", src:"data/sprites/roll.png"},
    {name:"p_layer1", type:"image", src:"data/background/layer1.png"},
    {name:"p_layer2", type:"image", src:"data/background/layer2.png"},
    {name:"p_layer3", type:"image", src:"data/background/layer3.png"},
    {name:"atascii_40px", type:"image", src:"data/hud/atascii_40px.png"},
    {name:"atascii_32px", type:"image", src:"data/hud/atascii_32px.png"},
    {name:"hud_life", type:"image", src:"data/hud/hud_life.png"},
    {name:"hud_egg", type:"image", src:"data/hud/hud_egg.png"},
    {name:"hud_heart", type:"image", src:"data/hud/hud_heart.png"},
    {name:"menu_title", type:"image", src:"data/hud/menu_title.png"},
    {name:"menu_arrow", type:"image", src:"data/hud/menu_arrow.png"},
    {name:"lets_go_msg", type:"image", src:"data/hud/lets_go_msg.png"},
    {name:"gameover", type:"image", src:"data/hud/gameover.png"},
    {name:"levelcomplete", type:"image", src:"data/hud/levelcomplete.png"},
    {name:"startup", type:"audio", src:"data/audio/sfx/", channel:1},
    {name:"menu", type:"audio", src:"data/audio/sfx/", channel:2},
    {name:"jump", type:"audio", src:"data/audio/sfx/", channel:1},
    {name:"cherry", type:"audio", src:"data/audio/sfx/", channel:2},
    {name:"xtralife", type:"audio", src:"data/audio/sfx/", channel:1},
    {name:"heart", type:"audio", src:"data/audio/sfx/", channel:1},
    {name:"star", type:"audio", src:"data/audio/sfx/", channel:2},
    {name:"eat", type:"audio", src:"data/audio/sfx/", channel:1},
    {name:"stomp", type:"audio", src:"data/audio/sfx/", channel:1},
    {name:"hurt", type:"audio", src:"data/audio/sfx/", channel:1},
    {name:"die", type:"audio", src:"data/audio/sfx/", channel:1},
    {name:"turn", type:"audio", src:"data/audio/sfx/", channel:1},
    {name:"impact", type:"audio", src:"data/audio/sfx/", channel:1},
    {name:"point", type:"audio", src:"data/audio/sfx/", channel:1},
    {name:"crush", type:"audio", src:"data/audio/sfx/", channel:1},
    {name:"hit", type:"audio", src:"data/audio/sfx/", channel:1},
    {name:"kill", type:"audio", src:"data/audio/sfx/", channel:2},
    {name:"Menu_Song", type:"audio", src:"data/audio/music/", channel:1},
    {name:"Level_Start", type:"audio", src:"data/audio/music/", channel:1},
    {name:"Level_Song", type:"audio", src:"data/audio/music/", channel:1},
    {name:"Boss_Start", type:"audio", src:"data/audio/music/", channel:1},
    {name:"Boss_Song", type:"audio", src:"data/audio/music/", channel:1},
    {name:"Game_Over", type:"audio", src:"data/audio/music/", channel:1},
    {name:"Level_Done", type:"audio", src:"data/audio/music/", channel:1},
    {name:"Player_Dies", type:"audio", src:"data/audio/music/", channel:1},
    {name:"a4_level1", type:"tmx", src:"data/level/a4_level1.tmx"},
    {name:"a4_level2", type:"tmx", src:"data/level/a4_level2.tmx"},
    {name:"a4_level3", type:"tmx", src:"data/level/a4_level3.tmx"},
    {name:"a4_level4", type:"tmx", src:"data/level/a4_level4.tmx"},
    {name:"a4_level5", type:"tmx", src:"data/level/a4_level5.tmx"},
    {name:"a4_level6", type:"tmx", src:"data/level/a4_level6.tmx"},
    {name:"a4_game_end", type:"tmx", src:"data/level/a4_game_end.tmx"},
];