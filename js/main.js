// init phaser game

var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'game', {
    preload: preload,
    create: create,
    update: update
}, true);

game.save = function() {
    delete game.hobo.sprite;
    localStorage.hobo = JSON.stringify(game.hobo);
}

///////////////////////////// ANIMATED //////////////////////////

var Animated = function() {
    game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
    this.sprite.inputEnabled = true;
    this.sprite.body.collideWorldBounds = true;

    if (this.animations) {
        this.addAnimations();
    }
    if (this.events) {
        this.bindEvents();
    }
}

Animated.prototype.addAnimations = function() {
    var that = this;
    this.animations.forEach(function(anim) {
        that.sprite.animations.add(anim);
    });
}
Animated.prototype.bindEvents = function() {
    var that = this;
    var events = this.events;
    for (var e in events) {
        that.sprite.events[e].add(that[events[e]], that);
    }
}


///////////////////////////// HOBO //////////////////////////

var Hobo = function(name) {
    this.sprite = game.add.sprite(40, game.height - 64, 'hobo');
    this.animations = [
        'walk',
        'goRight',
        'goLeft'
    ];

    // call super constructor.
    Animated.call(this);

    this.name = name;

    this.status = {
        energy: 100,
        warmth: 100
    };

    this.speed = 0;

    this.stats = {
        days: 0
    };
    this.inventory = {};
    console.log(this);
}

Hobo.prototype = Object.create(Animated.prototype);
Hobo.prototype.constructor = Animated;

Hobo.prototype.walk = function() {
    this.sprite.animations.play('walk', 0, true);
};

Hobo.prototype.goTo = function(x) {
    var walkTime = 1000;
    var that = this;

    
    if(x > this.sprite.x){
        this.sprite.loadTexture('hoboright', 0);
        this.sprite.animations.add('goRight');
        this.sprite.animations.play('goRight', 6, true);
    } else {
        this.sprite.loadTexture('hoboleft', 0);
        this.sprite.animations.add('goLeft');
        this.sprite.animations.play('goLeft', 6, true);
    }


    game.add.tween(this.sprite).to({
        x: x
    }, walkTime, Phaser.Easing.Linear.In, true, 0, 0, false);

    setTimeout(function() {
        that.sprite.animations.stop();
        that.sprite.loadTexture('hobo', 0);
    }, walkTime);
}
Hobo.prototype.checkTrash = function() {

};
// item: { type: 'head', bonus: {warmth: 3, spee}}
Hobo.prototype.wear = function(item) {

};

/////////////////// TRASH ///////////////////////

var Trash = function(hobo, position) {
    this.hobo = hobo;
    this.sprite = game.add.sprite(position.x, position.y, 'trash');
    this.animations = [
        'open',
        'close',
        'leave'
    ];

    this.events = {
        'onInputDown': 'open'
    };

    // call super constructor.
    Animated.call(this);

    this.isClosed = true;
}

Trash.prototype = Object.create(Animated.prototype);
Trash.prototype.constructor = Animated;

Trash.prototype.open = function() {
    
    
    var that = this;
    this.hobo.goTo(this.sprite.x);

    function pickItem(){

        var randomNumber = Math.floor(Math.random() * (GameItems.length + 1));
        var randomItem = GameItems[randomNumber];
        game.text = '';
        if (randomItem) {
            game.text = "You've found " + randomItem.name + ' !';
        } else {
            game.text = "It's empty!";
        }

        game.textStyle = {
            font: "18px Arial",
            fill: "#000",
            align: "center"
        };
    }

    if (this.isClosed) {
        this.isClosed = false;
        // this.sprite.events.onAnimationComplete.addOnce(function() {
            
        // }, this);
        setTimeout(function() {
            pickItem.apply(this);
            that.sprite.animations.play('open', 10);
            game.opened = game.opened + 1;
            if(game.opened === game.bins) {

            }
            var t = game.add.text(game.world.centerX - 100, 30, game.text, game.textStyle);

            setTimeout(function() {
                t.setText('')
            }, 800);
        }, 1000);
        
    }
}

/////////////////// ITEM ///////////////////////

var GameItems = [{
    name: 'newspaper',
    type: 'cover',
    bonus: {
        warmth: 1
    },
    consumable: false
}];


var Item = function(type, consumable, bonus) {
    this.type = type;
    this.bonus = bonus || {
        speed: 0,
        warmth: 0,
        energy: 0
    };
    this.consumable = consumable;
}

/////////////////// INVENTORY ///////////////////////
var Inventory = function() {
    this.limit = 9;
    this.slots = {};
    this.equipment = {
        head: null,
        chest: null,
        gloves: null,
        trousers: null,
        shoes: null,
        backpack: null,
        cart: null
    }
}

Inventory.prototype = {
    bonus: {},
    setItem: function(item) {
        var current = this.equipment[item.type];

        // swap items
        if (current) {
            current.used = false;
            item.used = true;
            this.slots[item.slot] = current;
        } else {
            this.slots[item.slot] = null
        }

        this.equipment[item.type] = item;
    },
    getTotalBonus: function() {
        var stuff = this.equipment,
            item, bonus, value;

        for (item in stuff) {
            for (type in stuff[item].bonus) {
                value = stuff[item].bonus[type];
                bonus[type] = bonus[type] ? bonus[type] + value : value
            }

        }
    }
}
/////////////////// PRELOAD ///////////////////////
function preload() {

    //  37x45 is the size of each frame

    //  There are 18 frames in the PNG - you can leave this value blank if the frames fill up the entire PNG, but in this case there are some
    //  blank frames at the end, so we tell the loader how many to load

    game.load.spritesheet('hobo', 'assets/hobo2.png', 66, 96, 4);
    game.load.spritesheet('hoboright', 'assets/hoboright.png', 66, 96, 4);
    game.load.spritesheet('hoboleft', 'assets/hoboleft.png', 66, 96, 4);
    game.load.spritesheet('trash', 'assets/trash.png', 64, 80, 6);

    game.load.image('ground', 'assets/ground.jpg');
    game.load.image('texture', 'assets/landscape.png');

}

/////////////////// GAME CREATION ///////////////////////
function create() {
    background = game.add.tileSprite(0, 0, 200, 100, 'texture');
    background.width = game.width;
    background.height = game.height;

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.gravity.y = 100;

    var hobo = game.hobo = new Hobo('Hobo');
    game.physics.enable(hobo.sprite, Phaser.Physics.ARCADE);
    hobo.sprite.body.allowGravity = true;

    addBins(hobo);

}

function addBins(hobo) {
    var space = 94;
    var binsMax = Math.floor(game.width / space);
    game.bins = binsMax;
    game.opened = 0;

    for (var i = 0; i < binsMax; i++) {
        var trash = new Trash(hobo, {
            x: space * i,
            y: game.height - 64
        });
        trash.no = i;
    };
}

function moveBins(hobo){

}


/////////////////// GAME LOOP ///////////////////////
function update() {

}