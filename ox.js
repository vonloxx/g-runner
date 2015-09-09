(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = [
  './images/player.png'
];
},{}],2:[function(require,module,exports){
var keyboard = require('./keyboard'),
    mouse = require('./mouse'),
    canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d');

canvas.tabIndex = 1000;
canvas.style.outline = "none";
canvas.onkeydown = keyboard.keyDown.bind(keyboard);
canvas.onkeyup = keyboard.keyUp.bind(keyboard);
canvas.onmousemove = mouse.onMove.bind(mouse);
canvas.onmousedown = mouse.onDown.bind(mouse);
canvas.onmouseup = mouse.onUp.bind(mouse);
canvas.style.cursor = "none";
canvas.oncontextmenu = function () {
    return false;
};

module.exports = context;

},{"./keyboard":6,"./mouse":9}],3:[function(require,module,exports){
window.onload = function () {
    this.ox = {
        canvas: require('./canvas').canvas,
        context: require('./canvas'),
        images: require('./loader').images,
        keyboard: require('./keyboard'),
        mouse: require('./mouse'),
        scenes: require('./scenesManager'),
        entities: require('./entitiesManager'),
        save: require('./localStorage'),
        loop: require('./gameLoop'),
        preloader: require('./loader'),
        spawn: require('./entitiesManager').spawn
    };
    ox.scenes.set('loading');
    ox.loop.init();
};

},{"./canvas":2,"./entitiesManager":4,"./gameLoop":5,"./keyboard":6,"./loader":7,"./localStorage":8,"./mouse":9,"./scenesManager":10}],4:[function(require,module,exports){
var list = require('../entities'),
    current = [],
    toUpdate = [],
    toDraw = [],
    spawn = function (type, options) {
        if (!list[type]) throw new Error("Entity [" + type + "] does not exist and cannot be spawned.");
        var obj = options || {};
        for (var key in list[type]) {
            obj[key] = list[type][key];
        }
        obj.disable = disable.bind(obj);
        obj.enable = enable.bind(obj);
        obj.id = current.length;
        obj.type = type;
        current.push(obj);
        if (obj.init) obj.init();
        obj.enable();
        return obj;
    },
    disable = function () {
        if (toDraw.indexOf(this.id) > 0) toDraw.splice(toDraw.indexOf(this.id), 1);
        if (toUpdate.indexOf(this.id) > 0) toUpdate.splice(toUpdate.indexOf(this.id), 1);
    },
    enable = function () {
        if (this.update) toUpdate.push(this.id);
        if (this.draw) toDraw.push(this.id);
    },
    clear = function () {
        current.splice(0, current.length);
        toUpdate.splice(0, toUpdate.length);
        toDraw.splice(0, toDraw.length);
    };

module.exports = {
    current: current,
    list: list,
    toDraw: toDraw,
    toUpdate: toUpdate,
    spawn: spawn,
    clear: clear
};

},{"../entities":11}],5:[function(require,module,exports){
var entities = require('./entitiesManager'),
    toDraw = entities.toDraw,
    toUpdate = entities.toUpdate,
    scenes = require('./scenesManager'),
    context = require('./canvas');

module.exports = {
    speed: 1,
    dt: 0,
    step: 1 / 60,
    lastDelta: new Date(),
    now: new Date(),
    calculateDelta: function () {
        this.lastDelta = this.now;
        this.now = new Date();
        this.dt += Math.min(1, (this.now - this.lastDelta) / 1000) * this.speed;
    },
    init: function () {
        if (scenes.isChanging) this.dt = 0;
        this.calculateDelta();
        while (this.dt > this.step) {
            this.dt -= this.step;
            this.update(this.step);
        }
        this.draw(this.dt);
        requestAnimationFrame(this.init.bind(this));
    },

    draw: function () {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        if (scenes.current.draw) scenes.current.draw();
        for (var i = 0, len = toDraw.length; i < len; i++) {
            if (entities.current[toDraw[i]] !== undefined && entities.current[toDraw[i]].draw !== undefined) {
                entities.current[toDraw[i]].draw();
            }
        }        
    },

    update: function (dt) {
        if (scenes.current.update) scenes.current.update(dt);
        for (var i = 0, len = toUpdate.length; i < len; i++) {
            if (entities.current[toUpdate[i]] !== undefined && entities.current[toUpdate[i]].update !== undefined) {
                entities.current[toUpdate[i]].update(dt);
            }
        }
    },
};

},{"./canvas":2,"./entitiesManager":4,"./scenesManager":10}],6:[function(require,module,exports){
var scene = require('./scenesManager');
module.exports = {
    isPressed: {},

    keyDown: function (e) {
        if (e.keyCode === 32 || (e.keyCode >= 37 && e.keyCode <= 40)) e.preventDefault();
        if (scene.current.keyDown) scene.current.keyDown(this.keys[e.keyCode]);
        this.keyPress(e);
    },

    keyPress: function (e) {
        if (this.isPressed[e.keyCode]) return;
        if (scene.current.keyPress) scene.current.keyPress(this.keys[e.keyCode]);
        this.isPressed[e.keyCode] = true;
    },

    keyUp: function (e) {
        if (scene.current.keyUp) scene.current.keyUp(this.keys[e.keyCode]);
        this.isPressed[e.keyCode] = false;
    },

    keys: {
        8: 'backspace',
        9: 'tab',
        13: 'enter',
        16: 'shift',
        17: 'ctrl',
        18: 'alt',
        19: 'pause',
        20: 'caps_lock',
        27: 'esc',
        32: 'spacebar',
        33: 'page_up',
        34: 'page_down',
        35: 'end',
        36: 'home',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        44: 'print_screen',
        45: 'insert',
        46: 'delete',
        48: '0',
        49: '1',
        50: '2',
        51: '3',
        52: '4',
        53: '5',
        54: '6',
        55: '7',
        56: '8',
        57: '9',
        65: 'a',
        66: 'b',
        67: 'c',
        68: 'd',
        69: 'e',
        70: 'f',
        71: 'g',
        72: 'h',
        73: 'i',
        74: 'j',
        75: 'k',
        76: 'l',
        77: 'm',
        78: 'n',
        79: 'o',
        80: 'p',
        81: 'q',
        82: 'r',
        83: 's',
        84: 't',
        85: 'u',
        86: 'v',
        87: 'w',
        88: 'x',
        89: 'y',
        90: 'z',
        96: 'num_zero',
        97: 'num_one',
        98: 'num_two',
        99: 'num_three',
        100: 'num_four',
        101: 'num_five',
        102: 'num_six',
        103: 'num_seven',
        104: 'num_eight',
        105: 'num_nine',
        106: 'num_multiply',
        107: 'num_plus',
        109: 'num_minus',
        110: 'num_period',
        111: 'num_division',
        112: 'f1',
        113: 'f2',
        114: 'f3',
        115: 'f4',
        116: 'f5',
        117: 'f6',
        118: 'f7',
        119: 'f8',
        120: 'f9',
        121: 'f10',
        122: 'f11',
        123: 'f12',
        186: 'semicolon',
        187: 'plus',
        189: 'minus',
        192: 'grave_accent',
        222: 'single_quote'
    }
};

},{"./scenesManager":10}],7:[function(require,module,exports){
module.exports = {
    images: {},
    data: {},
    audio: {},

    loadImage: function (path) {
        var name = path.slice(9, path.length),
            self = this;
        this.images[name] = new Image();
        this.images[name].onload = function() {
            self.assetsToLoad--;
        };
        this.images[name].src = path;
    },

    loadData: function (path) {
        var file = path.slice(7, path.length - 5),
            self = this,
            xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                self.data[file] = JSON.parse(xhr.responseText);
                self.assetsToLoad--;
            }
        };
        xhr.open("GET", path);
        xhr.send();
    },

    loadAudio: function (path) {
        var name = path.slice(8, path.length),
            self = this;
        this.audio[name] = new Audio(path);
        this.audio[name].oncanplaythrough = function() {
            self.assetsToLoad--;
        };
    },

    load: function (list) {
        this.assetsToLoad = list.length;

        for (var i = 0; i < list.length; i++) {
            if (list[i].indexOf('./images') > -1) {
                this.loadImage(list[i]);
            } else if (list[i].indexOf('./data') > -1) {
                this.loadData(list[i]);
            } else if (list[i].indexOf('./audio') > -1) {
                this.loadAudio(list[i]);
            }
        }

    }
};

},{}],8:[function(require,module,exports){
module.exports = {
    store: function (num, obj) {
        localStorage.setItem(num, JSON.stringify(obj));
    },
    load: function (num) {
        return JSON.parse(localStorage.getItem(num));
    },
    remove: function (num) {
        localStorage.removeItem(num);
    }
};

},{}],9:[function(require,module,exports){
var scene = require('./scenesManager');

module.exports = {
    x: 0,
    y: 0,
    isDown: false,
    onMove: function (e) {
        this.offset = ox.canvas.getBoundingClientRect();
        ox.mouse.x = e.clientX - this.offset.left;
        ox.mouse.y = e.clientY - this.offset.top;
    },

    onUp: function (e) {
        if (scene.current.mouseUp) scene.current.mouseUp(this.buttons[e.button]);
        this.isDown = false;
    },

    onDown: function (e) {
        if (scene.current.mouseDown) scene.current.mouseDown(this.buttons[e.button]);
        this.isDown = true;
    },

    buttons: {
        0: "left",
        1: "middle",
        2: "right"
    }
};

},{"./scenesManager":10}],10:[function(require,module,exports){
var clearEntities = require('./entitiesManager').clear,
    list = require('../scenes.js');

module.exports = {
    current: null,
    set: function (name) {
        if (!list[name]) throw new Error("Scene [" + name + "] does not exist!");
        clearEntities();
        this.current = list[name];
        this.current.init();
    }
};

},{"../scenes.js":17,"./entitiesManager":4}],11:[function(require,module,exports){
module.exports = {
  'sprite/animated': require('./entities/sprite/animated.js'),
  'sprite/calculateFrames': require('./entities/sprite/calculateFrames.js'),
  'sprite/drawSprite': require('./entities/sprite/drawSprite.js'),
  'sprite': require('./entities/sprite.js'),
  'timer': require('./entities/timer.js')
};
},{"./entities/sprite.js":12,"./entities/sprite/animated.js":13,"./entities/sprite/calculateFrames.js":14,"./entities/sprite/drawSprite.js":15,"./entities/timer.js":16}],12:[function(require,module,exports){
var drawSprite = require('./sprite/drawSprite'),
    animated = require('./sprite/animated');

module.exports = {
    init: function () {
        this.sourceWidth = ox.images[this.source].width || 1;
        this.sourceHeight = ox.images[this.source].height || 1;
        this.width = this.width || this.sourceWidth;
        this.height = this.height || this.sourceHeight;
        this.x = this.x || 0;
        this.y = this.y || 0;
        this.inverted = false;

        if (this.animation) animated.call(this);
    },

    draw: function () {
        drawSprite(this.source, this.x, this.y);
    }
};

},{"./sprite/animated":13,"./sprite/drawSprite":15}],13:[function(require,module,exports){
var drawSprite = require('./drawSprite'),
    calculateFrames = require("./calculateFrames"),

    init = function () {
        this.isPlaying = true;
        this.isFinished = false;
        if (typeof this.loop !== 'boolean') this.loop = true;
        this.counter = 0;
        this.frameRate = this.frameRate || 30;
        this.pause = pause.bind(this);
        this.play = play.bind(this);
        this.finished = finished.bind(this);
        this.update = update.bind(this);
        this.draw = draw.bind(this);
        calculateFrames.call(this);

        if (this.animations) {
            this.animationArray = this.animations[this.animation];
            this.arrayCounter = 0;
            this.frame = this.animationArray[this.arrayCounter];
        } else {
            this.frame = 0;
        }
    },


    draw = function () {
        drawSprite(this.source, this.x, this.y, this.width, this.height, this.frames[this.frame], this.inverted);
    },

    update = function (dt) {
        if (!this.isPlaying) return;
        if (this.isFinished) return this.finished();

        this.counter += dt * 1000;
        if (this.counter > 1000 / this.frameRate) {
            this.counter = 0;
            if (this.animations) {
                multipleAnimations.call(this);
            } else {
                singleAnimation.call(this);
            }
        }
    },

    multipleAnimations = function () {
        if (this.arrayCounter === this.animationArray.length - 1) {
            if (!this.loop) this.isFinished = true;
            this.frame = this.animationArray[0];
            this.arrayCounter = 0;
        } else {
            this.arrayCounter++;
            this.frame = this.animationArray[this.arrayCounter];
        }
    },

    singleAnimation = function () {
        if (this.frame === (this.frames.length - 1)) {
            if (!this.loop) this.isFinished = true;
            this.frame = 0;
        } else {
            this.frame += 1;
        }
    },

    finished = function () {
        this.pause();
        if (this.callback) this.callback();
    },

    play = function (animation, options) {
        if (options) {
            for (var key in options) {
                this[key] = options[key];
            }
        }

        if (this.animations) {
            if (animation) this.animation = animation;
            this.animationArray = this.animations[this.animation];
            this.arrayCounter = 0;
            this.frame = this.animationArray[this.arrayCounter];
        }
        this.isFinished = false;
        this.isPlaying = true;
    },

    pause = function () {
        this.isPlaying = false;
    };

module.exports = init;

},{"./calculateFrames":14,"./drawSprite":15}],14:[function(require,module,exports){
module.exports = function () {
    var x = 0,
        y = 0;
    this.frames = [[0, 0]];

    for (var i = 1; i < this.sourceHeight / this.height * this.sourceWidth / this.width; i++) {
        if (x < this.sourceWidth / this.width - 1) {
            x++;
        } else if (y < this.sourceHeight / this.height - 1) {
            y++;
            x = 0;
        }
        this.frames.push([x, y]);
    }
};

},{}],15:[function(require,module,exports){
module.exports = function (src, x, y, width, height, frame, inverted) {
    if (typeof width === 'number') {
        ox.context.save();
        if (inverted) {
            ox.context.translate(0, y * 2 + height);
            ox.context.scale(1, -1);
        }

        ox.context.drawImage(
            ox.images[src],
            width * frame[0],
            height * frame[1],
            width, height, x, y, width, height);

        ox.context.restore();
    } else {
        ox.context.drawImage(ox.images[src], x, y);
    }
};

},{}],16:[function(require,module,exports){
module.exports = {
    init: function () {
        this.value = 0;
        this.target = this.target || 1000;
        this.callback = this.callback || function () {};
    },

    update: function (dt) {
        this.value = Math.round(this.value + dt * 1000);
        if (this.value >= this.target) {
            if (this.context) {
                this.callback(this.context, this.value);
            } else {
                this.callback(this.value);
            }

            if (this.loop) {
                this.value = 0;
            } else {
                this.disable();
            }
        }
    },

    restart: function () {
        this.value = 0;
        this.enable();
    }
};

},{}],17:[function(require,module,exports){
module.exports = {
  'loading': require('./scenes/loading.js'),
  'main': require('./scenes/main.js')
};
},{"./scenes/loading.js":18,"./scenes/main.js":19}],18:[function(require,module,exports){
module.exports = {
    init: function () {
        ox.preloader.load(require('../assets'));
        this.barLength = ox.preloader.assetsToLoad;
    },

    draw: function () {
        ox.context.fillStyle = "black";
        ox.context.fillRect(0, 0, ox.canvas.width, ox.canvas.height);
        ox.context.fillStyle = "grey";
        ox.context.fillRect(ox.canvas.width / 4, ox.canvas.height / 2, ox.canvas.width / 2, 1);
        ox.context.fillStyle = "grey";
        ox.context.fillStyle = "rgb(46, 238, 245)";
        ox.context.fillRect(ox.canvas.width / 4, ox.canvas.height / 2, ox.canvas.width / 2 - ox.canvas.width / 2 * ox.preloader.assetsToLoad / this.barLength, 1);
    },

    update: function () {
        if (ox.preloader.assetsToLoad === 0) ox.scenes.set('main');
    }
};

},{"../assets":1}],19:[function(require,module,exports){
module.exports = {
    init: function () {
        this.player = ox.spawn('sprite', {
            source: 'player.png',
            x: ox.canvas.width / 2,
            y: 244,
            width: 72,
            height:46,
            animations:  {running: [0,1,2,3,4], dying: [5,6]},
            animation: 'running',
            frameRate: 50
        });
    },

    update: function (dt) {
    },
    
    draw: function() {
    },

    keyDown: function (key) {
    },

    keyPress: function (key) {
    },

    keyUp: function (key) {
    },

    mouseDown: function (button) {
        this.player.inverted = true;
        this.player.play('dying');
    },

    mouseUp: function (button) {
        this.player.inverted = false;
        this.player.play('running');
    }
};

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2Fzc2V0cy5qcyIsInNyYy9lbmdpbmUvY2FudmFzLmpzIiwic3JjL2VuZ2luZS9jb3JlLmpzIiwic3JjL2VuZ2luZS9lbnRpdGllc01hbmFnZXIuanMiLCJzcmMvZW5naW5lL2dhbWVMb29wLmpzIiwic3JjL2VuZ2luZS9rZXlib2FyZC5qcyIsInNyYy9lbmdpbmUvbG9hZGVyLmpzIiwic3JjL2VuZ2luZS9sb2NhbFN0b3JhZ2UuanMiLCJzcmMvZW5naW5lL21vdXNlLmpzIiwic3JjL2VuZ2luZS9zY2VuZXNNYW5hZ2VyLmpzIiwic3JjL2VudGl0aWVzLmpzIiwic3JjL2VudGl0aWVzL3Nwcml0ZS5qcyIsInNyYy9lbnRpdGllcy9zcHJpdGUvYW5pbWF0ZWQuanMiLCJzcmMvZW50aXRpZXMvc3ByaXRlL2NhbGN1bGF0ZUZyYW1lcy5qcyIsInNyYy9lbnRpdGllcy9zcHJpdGUvZHJhd1Nwcml0ZS5qcyIsInNyYy9lbnRpdGllcy90aW1lci5qcyIsInNyYy9zY2VuZXMuanMiLCJzcmMvc2NlbmVzL2xvYWRpbmcuanMiLCJzcmMvc2NlbmVzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gW1xuICAnLi9pbWFnZXMvcGxheWVyLnBuZydcbl07IiwidmFyIGtleWJvYXJkID0gcmVxdWlyZSgnLi9rZXlib2FyZCcpLFxuICAgIG1vdXNlID0gcmVxdWlyZSgnLi9tb3VzZScpLFxuICAgIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKSxcbiAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbmNhbnZhcy50YWJJbmRleCA9IDEwMDA7XG5jYW52YXMuc3R5bGUub3V0bGluZSA9IFwibm9uZVwiO1xuY2FudmFzLm9ua2V5ZG93biA9IGtleWJvYXJkLmtleURvd24uYmluZChrZXlib2FyZCk7XG5jYW52YXMub25rZXl1cCA9IGtleWJvYXJkLmtleVVwLmJpbmQoa2V5Ym9hcmQpO1xuY2FudmFzLm9ubW91c2Vtb3ZlID0gbW91c2Uub25Nb3ZlLmJpbmQobW91c2UpO1xuY2FudmFzLm9ubW91c2Vkb3duID0gbW91c2Uub25Eb3duLmJpbmQobW91c2UpO1xuY2FudmFzLm9ubW91c2V1cCA9IG1vdXNlLm9uVXAuYmluZChtb3VzZSk7XG5jYW52YXMuc3R5bGUuY3Vyc29yID0gXCJub25lXCI7XG5jYW52YXMub25jb250ZXh0bWVudSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnRleHQ7XG4iLCJ3aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub3ggPSB7XG4gICAgICAgIGNhbnZhczogcmVxdWlyZSgnLi9jYW52YXMnKS5jYW52YXMsXG4gICAgICAgIGNvbnRleHQ6IHJlcXVpcmUoJy4vY2FudmFzJyksXG4gICAgICAgIGltYWdlczogcmVxdWlyZSgnLi9sb2FkZXInKS5pbWFnZXMsXG4gICAgICAgIGtleWJvYXJkOiByZXF1aXJlKCcuL2tleWJvYXJkJyksXG4gICAgICAgIG1vdXNlOiByZXF1aXJlKCcuL21vdXNlJyksXG4gICAgICAgIHNjZW5lczogcmVxdWlyZSgnLi9zY2VuZXNNYW5hZ2VyJyksXG4gICAgICAgIGVudGl0aWVzOiByZXF1aXJlKCcuL2VudGl0aWVzTWFuYWdlcicpLFxuICAgICAgICBzYXZlOiByZXF1aXJlKCcuL2xvY2FsU3RvcmFnZScpLFxuICAgICAgICBsb29wOiByZXF1aXJlKCcuL2dhbWVMb29wJyksXG4gICAgICAgIHByZWxvYWRlcjogcmVxdWlyZSgnLi9sb2FkZXInKSxcbiAgICAgICAgc3Bhd246IHJlcXVpcmUoJy4vZW50aXRpZXNNYW5hZ2VyJykuc3Bhd25cbiAgICB9O1xuICAgIG94LnNjZW5lcy5zZXQoJ2xvYWRpbmcnKTtcbiAgICBveC5sb29wLmluaXQoKTtcbn07XG4iLCJ2YXIgbGlzdCA9IHJlcXVpcmUoJy4uL2VudGl0aWVzJyksXG4gICAgY3VycmVudCA9IFtdLFxuICAgIHRvVXBkYXRlID0gW10sXG4gICAgdG9EcmF3ID0gW10sXG4gICAgc3Bhd24gPSBmdW5jdGlvbiAodHlwZSwgb3B0aW9ucykge1xuICAgICAgICBpZiAoIWxpc3RbdHlwZV0pIHRocm93IG5ldyBFcnJvcihcIkVudGl0eSBbXCIgKyB0eXBlICsgXCJdIGRvZXMgbm90IGV4aXN0IGFuZCBjYW5ub3QgYmUgc3Bhd25lZC5cIik7XG4gICAgICAgIHZhciBvYmogPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gbGlzdFt0eXBlXSkge1xuICAgICAgICAgICAgb2JqW2tleV0gPSBsaXN0W3R5cGVdW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgb2JqLmRpc2FibGUgPSBkaXNhYmxlLmJpbmQob2JqKTtcbiAgICAgICAgb2JqLmVuYWJsZSA9IGVuYWJsZS5iaW5kKG9iaik7XG4gICAgICAgIG9iai5pZCA9IGN1cnJlbnQubGVuZ3RoO1xuICAgICAgICBvYmoudHlwZSA9IHR5cGU7XG4gICAgICAgIGN1cnJlbnQucHVzaChvYmopO1xuICAgICAgICBpZiAob2JqLmluaXQpIG9iai5pbml0KCk7XG4gICAgICAgIG9iai5lbmFibGUoKTtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9LFxuICAgIGRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0b0RyYXcuaW5kZXhPZih0aGlzLmlkKSA+IDApIHRvRHJhdy5zcGxpY2UodG9EcmF3LmluZGV4T2YodGhpcy5pZCksIDEpO1xuICAgICAgICBpZiAodG9VcGRhdGUuaW5kZXhPZih0aGlzLmlkKSA+IDApIHRvVXBkYXRlLnNwbGljZSh0b1VwZGF0ZS5pbmRleE9mKHRoaXMuaWQpLCAxKTtcbiAgICB9LFxuICAgIGVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMudXBkYXRlKSB0b1VwZGF0ZS5wdXNoKHRoaXMuaWQpO1xuICAgICAgICBpZiAodGhpcy5kcmF3KSB0b0RyYXcucHVzaCh0aGlzLmlkKTtcbiAgICB9LFxuICAgIGNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjdXJyZW50LnNwbGljZSgwLCBjdXJyZW50Lmxlbmd0aCk7XG4gICAgICAgIHRvVXBkYXRlLnNwbGljZSgwLCB0b1VwZGF0ZS5sZW5ndGgpO1xuICAgICAgICB0b0RyYXcuc3BsaWNlKDAsIHRvRHJhdy5sZW5ndGgpO1xuICAgIH07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGN1cnJlbnQ6IGN1cnJlbnQsXG4gICAgbGlzdDogbGlzdCxcbiAgICB0b0RyYXc6IHRvRHJhdyxcbiAgICB0b1VwZGF0ZTogdG9VcGRhdGUsXG4gICAgc3Bhd246IHNwYXduLFxuICAgIGNsZWFyOiBjbGVhclxufTtcbiIsInZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4vZW50aXRpZXNNYW5hZ2VyJyksXG4gICAgdG9EcmF3ID0gZW50aXRpZXMudG9EcmF3LFxuICAgIHRvVXBkYXRlID0gZW50aXRpZXMudG9VcGRhdGUsXG4gICAgc2NlbmVzID0gcmVxdWlyZSgnLi9zY2VuZXNNYW5hZ2VyJyksXG4gICAgY29udGV4dCA9IHJlcXVpcmUoJy4vY2FudmFzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHNwZWVkOiAxLFxuICAgIGR0OiAwLFxuICAgIHN0ZXA6IDEgLyA2MCxcbiAgICBsYXN0RGVsdGE6IG5ldyBEYXRlKCksXG4gICAgbm93OiBuZXcgRGF0ZSgpLFxuICAgIGNhbGN1bGF0ZURlbHRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubGFzdERlbHRhID0gdGhpcy5ub3c7XG4gICAgICAgIHRoaXMubm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgdGhpcy5kdCArPSBNYXRoLm1pbigxLCAodGhpcy5ub3cgLSB0aGlzLmxhc3REZWx0YSkgLyAxMDAwKSAqIHRoaXMuc3BlZWQ7XG4gICAgfSxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChzY2VuZXMuaXNDaGFuZ2luZykgdGhpcy5kdCA9IDA7XG4gICAgICAgIHRoaXMuY2FsY3VsYXRlRGVsdGEoKTtcbiAgICAgICAgd2hpbGUgKHRoaXMuZHQgPiB0aGlzLnN0ZXApIHtcbiAgICAgICAgICAgIHRoaXMuZHQgLT0gdGhpcy5zdGVwO1xuICAgICAgICAgICAgdGhpcy51cGRhdGUodGhpcy5zdGVwKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRyYXcodGhpcy5kdCk7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmluaXQuYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIGRyYXc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgY29udGV4dC5jYW52YXMud2lkdGgsIGNvbnRleHQuY2FudmFzLmhlaWdodCk7XG4gICAgICAgIGlmIChzY2VuZXMuY3VycmVudC5kcmF3KSBzY2VuZXMuY3VycmVudC5kcmF3KCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0b0RyYXcubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChlbnRpdGllcy5jdXJyZW50W3RvRHJhd1tpXV0gIT09IHVuZGVmaW5lZCAmJiBlbnRpdGllcy5jdXJyZW50W3RvRHJhd1tpXV0uZHJhdyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZW50aXRpZXMuY3VycmVudFt0b0RyYXdbaV1dLmRyYXcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSAgICAgICAgXG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG4gICAgICAgIGlmIChzY2VuZXMuY3VycmVudC51cGRhdGUpIHNjZW5lcy5jdXJyZW50LnVwZGF0ZShkdCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0b1VwZGF0ZS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgaWYgKGVudGl0aWVzLmN1cnJlbnRbdG9VcGRhdGVbaV1dICE9PSB1bmRlZmluZWQgJiYgZW50aXRpZXMuY3VycmVudFt0b1VwZGF0ZVtpXV0udXBkYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBlbnRpdGllcy5jdXJyZW50W3RvVXBkYXRlW2ldXS51cGRhdGUoZHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbn07XG4iLCJ2YXIgc2NlbmUgPSByZXF1aXJlKCcuL3NjZW5lc01hbmFnZXInKTtcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGlzUHJlc3NlZDoge30sXG5cbiAgICBrZXlEb3duOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAzMiB8fCAoZS5rZXlDb2RlID49IDM3ICYmIGUua2V5Q29kZSA8PSA0MCkpIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKHNjZW5lLmN1cnJlbnQua2V5RG93bikgc2NlbmUuY3VycmVudC5rZXlEb3duKHRoaXMua2V5c1tlLmtleUNvZGVdKTtcbiAgICAgICAgdGhpcy5rZXlQcmVzcyhlKTtcbiAgICB9LFxuXG4gICAga2V5UHJlc3M6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICh0aGlzLmlzUHJlc3NlZFtlLmtleUNvZGVdKSByZXR1cm47XG4gICAgICAgIGlmIChzY2VuZS5jdXJyZW50LmtleVByZXNzKSBzY2VuZS5jdXJyZW50LmtleVByZXNzKHRoaXMua2V5c1tlLmtleUNvZGVdKTtcbiAgICAgICAgdGhpcy5pc1ByZXNzZWRbZS5rZXlDb2RlXSA9IHRydWU7XG4gICAgfSxcblxuICAgIGtleVVwOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoc2NlbmUuY3VycmVudC5rZXlVcCkgc2NlbmUuY3VycmVudC5rZXlVcCh0aGlzLmtleXNbZS5rZXlDb2RlXSk7XG4gICAgICAgIHRoaXMuaXNQcmVzc2VkW2Uua2V5Q29kZV0gPSBmYWxzZTtcbiAgICB9LFxuXG4gICAga2V5czoge1xuICAgICAgICA4OiAnYmFja3NwYWNlJyxcbiAgICAgICAgOTogJ3RhYicsXG4gICAgICAgIDEzOiAnZW50ZXInLFxuICAgICAgICAxNjogJ3NoaWZ0JyxcbiAgICAgICAgMTc6ICdjdHJsJyxcbiAgICAgICAgMTg6ICdhbHQnLFxuICAgICAgICAxOTogJ3BhdXNlJyxcbiAgICAgICAgMjA6ICdjYXBzX2xvY2snLFxuICAgICAgICAyNzogJ2VzYycsXG4gICAgICAgIDMyOiAnc3BhY2ViYXInLFxuICAgICAgICAzMzogJ3BhZ2VfdXAnLFxuICAgICAgICAzNDogJ3BhZ2VfZG93bicsXG4gICAgICAgIDM1OiAnZW5kJyxcbiAgICAgICAgMzY6ICdob21lJyxcbiAgICAgICAgMzc6ICdsZWZ0JyxcbiAgICAgICAgMzg6ICd1cCcsXG4gICAgICAgIDM5OiAncmlnaHQnLFxuICAgICAgICA0MDogJ2Rvd24nLFxuICAgICAgICA0NDogJ3ByaW50X3NjcmVlbicsXG4gICAgICAgIDQ1OiAnaW5zZXJ0JyxcbiAgICAgICAgNDY6ICdkZWxldGUnLFxuICAgICAgICA0ODogJzAnLFxuICAgICAgICA0OTogJzEnLFxuICAgICAgICA1MDogJzInLFxuICAgICAgICA1MTogJzMnLFxuICAgICAgICA1MjogJzQnLFxuICAgICAgICA1MzogJzUnLFxuICAgICAgICA1NDogJzYnLFxuICAgICAgICA1NTogJzcnLFxuICAgICAgICA1NjogJzgnLFxuICAgICAgICA1NzogJzknLFxuICAgICAgICA2NTogJ2EnLFxuICAgICAgICA2NjogJ2InLFxuICAgICAgICA2NzogJ2MnLFxuICAgICAgICA2ODogJ2QnLFxuICAgICAgICA2OTogJ2UnLFxuICAgICAgICA3MDogJ2YnLFxuICAgICAgICA3MTogJ2cnLFxuICAgICAgICA3MjogJ2gnLFxuICAgICAgICA3MzogJ2knLFxuICAgICAgICA3NDogJ2onLFxuICAgICAgICA3NTogJ2snLFxuICAgICAgICA3NjogJ2wnLFxuICAgICAgICA3NzogJ20nLFxuICAgICAgICA3ODogJ24nLFxuICAgICAgICA3OTogJ28nLFxuICAgICAgICA4MDogJ3AnLFxuICAgICAgICA4MTogJ3EnLFxuICAgICAgICA4MjogJ3InLFxuICAgICAgICA4MzogJ3MnLFxuICAgICAgICA4NDogJ3QnLFxuICAgICAgICA4NTogJ3UnLFxuICAgICAgICA4NjogJ3YnLFxuICAgICAgICA4NzogJ3cnLFxuICAgICAgICA4ODogJ3gnLFxuICAgICAgICA4OTogJ3knLFxuICAgICAgICA5MDogJ3onLFxuICAgICAgICA5NjogJ251bV96ZXJvJyxcbiAgICAgICAgOTc6ICdudW1fb25lJyxcbiAgICAgICAgOTg6ICdudW1fdHdvJyxcbiAgICAgICAgOTk6ICdudW1fdGhyZWUnLFxuICAgICAgICAxMDA6ICdudW1fZm91cicsXG4gICAgICAgIDEwMTogJ251bV9maXZlJyxcbiAgICAgICAgMTAyOiAnbnVtX3NpeCcsXG4gICAgICAgIDEwMzogJ251bV9zZXZlbicsXG4gICAgICAgIDEwNDogJ251bV9laWdodCcsXG4gICAgICAgIDEwNTogJ251bV9uaW5lJyxcbiAgICAgICAgMTA2OiAnbnVtX211bHRpcGx5JyxcbiAgICAgICAgMTA3OiAnbnVtX3BsdXMnLFxuICAgICAgICAxMDk6ICdudW1fbWludXMnLFxuICAgICAgICAxMTA6ICdudW1fcGVyaW9kJyxcbiAgICAgICAgMTExOiAnbnVtX2RpdmlzaW9uJyxcbiAgICAgICAgMTEyOiAnZjEnLFxuICAgICAgICAxMTM6ICdmMicsXG4gICAgICAgIDExNDogJ2YzJyxcbiAgICAgICAgMTE1OiAnZjQnLFxuICAgICAgICAxMTY6ICdmNScsXG4gICAgICAgIDExNzogJ2Y2JyxcbiAgICAgICAgMTE4OiAnZjcnLFxuICAgICAgICAxMTk6ICdmOCcsXG4gICAgICAgIDEyMDogJ2Y5JyxcbiAgICAgICAgMTIxOiAnZjEwJyxcbiAgICAgICAgMTIyOiAnZjExJyxcbiAgICAgICAgMTIzOiAnZjEyJyxcbiAgICAgICAgMTg2OiAnc2VtaWNvbG9uJyxcbiAgICAgICAgMTg3OiAncGx1cycsXG4gICAgICAgIDE4OTogJ21pbnVzJyxcbiAgICAgICAgMTkyOiAnZ3JhdmVfYWNjZW50JyxcbiAgICAgICAgMjIyOiAnc2luZ2xlX3F1b3RlJ1xuICAgIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbWFnZXM6IHt9LFxuICAgIGRhdGE6IHt9LFxuICAgIGF1ZGlvOiB7fSxcblxuICAgIGxvYWRJbWFnZTogZnVuY3Rpb24gKHBhdGgpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBwYXRoLnNsaWNlKDksIHBhdGgubGVuZ3RoKSxcbiAgICAgICAgICAgIHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLmltYWdlc1tuYW1lXSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICB0aGlzLmltYWdlc1tuYW1lXS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuYXNzZXRzVG9Mb2FkLS07XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaW1hZ2VzW25hbWVdLnNyYyA9IHBhdGg7XG4gICAgfSxcblxuICAgIGxvYWREYXRhOiBmdW5jdGlvbiAocGF0aCkge1xuICAgICAgICB2YXIgZmlsZSA9IHBhdGguc2xpY2UoNywgcGF0aC5sZW5ndGggLSA1KSxcbiAgICAgICAgICAgIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCAmJiB4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFbZmlsZV0gPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgIHNlbGYuYXNzZXRzVG9Mb2FkLS07XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHhoci5vcGVuKFwiR0VUXCIsIHBhdGgpO1xuICAgICAgICB4aHIuc2VuZCgpO1xuICAgIH0sXG5cbiAgICBsb2FkQXVkaW86IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgICAgIHZhciBuYW1lID0gcGF0aC5zbGljZSg4LCBwYXRoLmxlbmd0aCksXG4gICAgICAgICAgICBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5hdWRpb1tuYW1lXSA9IG5ldyBBdWRpbyhwYXRoKTtcbiAgICAgICAgdGhpcy5hdWRpb1tuYW1lXS5vbmNhbnBsYXl0aHJvdWdoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLmFzc2V0c1RvTG9hZC0tO1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBsb2FkOiBmdW5jdGlvbiAobGlzdCkge1xuICAgICAgICB0aGlzLmFzc2V0c1RvTG9hZCA9IGxpc3QubGVuZ3RoO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGxpc3RbaV0uaW5kZXhPZignLi9pbWFnZXMnKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkSW1hZ2UobGlzdFtpXSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxpc3RbaV0uaW5kZXhPZignLi9kYXRhJykgPiAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZERhdGEobGlzdFtpXSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxpc3RbaV0uaW5kZXhPZignLi9hdWRpbycpID4gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRBdWRpbyhsaXN0W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHN0b3JlOiBmdW5jdGlvbiAobnVtLCBvYmopIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0obnVtLCBKU09OLnN0cmluZ2lmeShvYmopKTtcbiAgICB9LFxuICAgIGxvYWQ6IGZ1bmN0aW9uIChudW0pIHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0obnVtKSk7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIChudW0pIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0obnVtKTtcbiAgICB9XG59O1xuIiwidmFyIHNjZW5lID0gcmVxdWlyZSgnLi9zY2VuZXNNYW5hZ2VyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHg6IDAsXG4gICAgeTogMCxcbiAgICBpc0Rvd246IGZhbHNlLFxuICAgIG9uTW92ZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdGhpcy5vZmZzZXQgPSBveC5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIG94Lm1vdXNlLnggPSBlLmNsaWVudFggLSB0aGlzLm9mZnNldC5sZWZ0O1xuICAgICAgICBveC5tb3VzZS55ID0gZS5jbGllbnRZIC0gdGhpcy5vZmZzZXQudG9wO1xuICAgIH0sXG5cbiAgICBvblVwOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoc2NlbmUuY3VycmVudC5tb3VzZVVwKSBzY2VuZS5jdXJyZW50Lm1vdXNlVXAodGhpcy5idXR0b25zW2UuYnV0dG9uXSk7XG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XG4gICAgfSxcblxuICAgIG9uRG93bjogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHNjZW5lLmN1cnJlbnQubW91c2VEb3duKSBzY2VuZS5jdXJyZW50Lm1vdXNlRG93bih0aGlzLmJ1dHRvbnNbZS5idXR0b25dKTtcbiAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xuICAgIH0sXG5cbiAgICBidXR0b25zOiB7XG4gICAgICAgIDA6IFwibGVmdFwiLFxuICAgICAgICAxOiBcIm1pZGRsZVwiLFxuICAgICAgICAyOiBcInJpZ2h0XCJcbiAgICB9XG59O1xuIiwidmFyIGNsZWFyRW50aXRpZXMgPSByZXF1aXJlKCcuL2VudGl0aWVzTWFuYWdlcicpLmNsZWFyLFxuICAgIGxpc3QgPSByZXF1aXJlKCcuLi9zY2VuZXMuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY3VycmVudDogbnVsbCxcbiAgICBzZXQ6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIGlmICghbGlzdFtuYW1lXSkgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgW1wiICsgbmFtZSArIFwiXSBkb2VzIG5vdCBleGlzdCFcIik7XG4gICAgICAgIGNsZWFyRW50aXRpZXMoKTtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbGlzdFtuYW1lXTtcbiAgICAgICAgdGhpcy5jdXJyZW50LmluaXQoKTtcbiAgICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICdzcHJpdGUvYW5pbWF0ZWQnOiByZXF1aXJlKCcuL2VudGl0aWVzL3Nwcml0ZS9hbmltYXRlZC5qcycpLFxuICAnc3ByaXRlL2NhbGN1bGF0ZUZyYW1lcyc6IHJlcXVpcmUoJy4vZW50aXRpZXMvc3ByaXRlL2NhbGN1bGF0ZUZyYW1lcy5qcycpLFxuICAnc3ByaXRlL2RyYXdTcHJpdGUnOiByZXF1aXJlKCcuL2VudGl0aWVzL3Nwcml0ZS9kcmF3U3ByaXRlLmpzJyksXG4gICdzcHJpdGUnOiByZXF1aXJlKCcuL2VudGl0aWVzL3Nwcml0ZS5qcycpLFxuICAndGltZXInOiByZXF1aXJlKCcuL2VudGl0aWVzL3RpbWVyLmpzJylcbn07IiwidmFyIGRyYXdTcHJpdGUgPSByZXF1aXJlKCcuL3Nwcml0ZS9kcmF3U3ByaXRlJyksXG4gICAgYW5pbWF0ZWQgPSByZXF1aXJlKCcuL3Nwcml0ZS9hbmltYXRlZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc291cmNlV2lkdGggPSBveC5pbWFnZXNbdGhpcy5zb3VyY2VdLndpZHRoIHx8IDE7XG4gICAgICAgIHRoaXMuc291cmNlSGVpZ2h0ID0gb3guaW1hZ2VzW3RoaXMuc291cmNlXS5oZWlnaHQgfHwgMTtcbiAgICAgICAgdGhpcy53aWR0aCA9IHRoaXMud2lkdGggfHwgdGhpcy5zb3VyY2VXaWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLmhlaWdodCB8fCB0aGlzLnNvdXJjZUhlaWdodDtcbiAgICAgICAgdGhpcy54ID0gdGhpcy54IHx8IDA7XG4gICAgICAgIHRoaXMueSA9IHRoaXMueSB8fCAwO1xuICAgICAgICB0aGlzLmludmVydGVkID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uKSBhbmltYXRlZC5jYWxsKHRoaXMpO1xuICAgIH0sXG5cbiAgICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRyYXdTcHJpdGUodGhpcy5zb3VyY2UsIHRoaXMueCwgdGhpcy55KTtcbiAgICB9XG59O1xuIiwidmFyIGRyYXdTcHJpdGUgPSByZXF1aXJlKCcuL2RyYXdTcHJpdGUnKSxcbiAgICBjYWxjdWxhdGVGcmFtZXMgPSByZXF1aXJlKFwiLi9jYWxjdWxhdGVGcmFtZXNcIiksXG5cbiAgICBpbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmlzUGxheWluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNGaW5pc2hlZCA9IGZhbHNlO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMubG9vcCAhPT0gJ2Jvb2xlYW4nKSB0aGlzLmxvb3AgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvdW50ZXIgPSAwO1xuICAgICAgICB0aGlzLmZyYW1lUmF0ZSA9IHRoaXMuZnJhbWVSYXRlIHx8IDMwO1xuICAgICAgICB0aGlzLnBhdXNlID0gcGF1c2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5wbGF5ID0gcGxheS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmZpbmlzaGVkID0gZmluaXNoZWQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy51cGRhdGUgPSB1cGRhdGUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5kcmF3ID0gZHJhdy5iaW5kKHRoaXMpO1xuICAgICAgICBjYWxjdWxhdGVGcmFtZXMuY2FsbCh0aGlzKTtcblxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25zKSB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbkFycmF5ID0gdGhpcy5hbmltYXRpb25zW3RoaXMuYW5pbWF0aW9uXTtcbiAgICAgICAgICAgIHRoaXMuYXJyYXlDb3VudGVyID0gMDtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUgPSB0aGlzLmFuaW1hdGlvbkFycmF5W3RoaXMuYXJyYXlDb3VudGVyXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgICAgICB9XG4gICAgfSxcblxuXG4gICAgZHJhdyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZHJhd1Nwcml0ZSh0aGlzLnNvdXJjZSwgdGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0aGlzLmZyYW1lc1t0aGlzLmZyYW1lXSwgdGhpcy5pbnZlcnRlZCk7XG4gICAgfSxcblxuICAgIHVwZGF0ZSA9IGZ1bmN0aW9uIChkdCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNQbGF5aW5nKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLmlzRmluaXNoZWQpIHJldHVybiB0aGlzLmZpbmlzaGVkKCk7XG5cbiAgICAgICAgdGhpcy5jb3VudGVyICs9IGR0ICogMTAwMDtcbiAgICAgICAgaWYgKHRoaXMuY291bnRlciA+IDEwMDAgLyB0aGlzLmZyYW1lUmF0ZSkge1xuICAgICAgICAgICAgdGhpcy5jb3VudGVyID0gMDtcbiAgICAgICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBtdWx0aXBsZUFuaW1hdGlvbnMuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2luZ2xlQW5pbWF0aW9uLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgbXVsdGlwbGVBbmltYXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5hcnJheUNvdW50ZXIgPT09IHRoaXMuYW5pbWF0aW9uQXJyYXkubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmxvb3ApIHRoaXMuaXNGaW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gdGhpcy5hbmltYXRpb25BcnJheVswXTtcbiAgICAgICAgICAgIHRoaXMuYXJyYXlDb3VudGVyID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXJyYXlDb3VudGVyKys7XG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gdGhpcy5hbmltYXRpb25BcnJheVt0aGlzLmFycmF5Q291bnRlcl07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc2luZ2xlQW5pbWF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5mcmFtZSA9PT0gKHRoaXMuZnJhbWVzLmxlbmd0aCAtIDEpKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubG9vcCkgdGhpcy5pc0ZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5mcmFtZSArPSAxO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGZpbmlzaGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnBhdXNlKCk7XG4gICAgICAgIGlmICh0aGlzLmNhbGxiYWNrKSB0aGlzLmNhbGxiYWNrKCk7XG4gICAgfSxcblxuICAgIHBsYXkgPSBmdW5jdGlvbiAoYW5pbWF0aW9uLCBvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgICAgIHRoaXNba2V5XSA9IG9wdGlvbnNba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbnMpIHtcbiAgICAgICAgICAgIGlmIChhbmltYXRpb24pIHRoaXMuYW5pbWF0aW9uID0gYW5pbWF0aW9uO1xuICAgICAgICAgICAgdGhpcy5hbmltYXRpb25BcnJheSA9IHRoaXMuYW5pbWF0aW9uc1t0aGlzLmFuaW1hdGlvbl07XG4gICAgICAgICAgICB0aGlzLmFycmF5Q291bnRlciA9IDA7XG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gdGhpcy5hbmltYXRpb25BcnJheVt0aGlzLmFycmF5Q291bnRlcl07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc0ZpbmlzaGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgcGF1c2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gZmFsc2U7XG4gICAgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbml0O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHggPSAwLFxuICAgICAgICB5ID0gMDtcbiAgICB0aGlzLmZyYW1lcyA9IFtbMCwgMF1dO1xuXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCB0aGlzLnNvdXJjZUhlaWdodCAvIHRoaXMuaGVpZ2h0ICogdGhpcy5zb3VyY2VXaWR0aCAvIHRoaXMud2lkdGg7IGkrKykge1xuICAgICAgICBpZiAoeCA8IHRoaXMuc291cmNlV2lkdGggLyB0aGlzLndpZHRoIC0gMSkge1xuICAgICAgICAgICAgeCsrO1xuICAgICAgICB9IGVsc2UgaWYgKHkgPCB0aGlzLnNvdXJjZUhlaWdodCAvIHRoaXMuaGVpZ2h0IC0gMSkge1xuICAgICAgICAgICAgeSsrO1xuICAgICAgICAgICAgeCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5mcmFtZXMucHVzaChbeCwgeV0pO1xuICAgIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzcmMsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGZyYW1lLCBpbnZlcnRlZCkge1xuICAgIGlmICh0eXBlb2Ygd2lkdGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIG94LmNvbnRleHQuc2F2ZSgpO1xuICAgICAgICBpZiAoaW52ZXJ0ZWQpIHtcbiAgICAgICAgICAgIG94LmNvbnRleHQudHJhbnNsYXRlKDAsIHkgKiAyICsgaGVpZ2h0KTtcbiAgICAgICAgICAgIG94LmNvbnRleHQuc2NhbGUoMSwgLTEpO1xuICAgICAgICB9XG5cbiAgICAgICAgb3guY29udGV4dC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICBveC5pbWFnZXNbc3JjXSxcbiAgICAgICAgICAgIHdpZHRoICogZnJhbWVbMF0sXG4gICAgICAgICAgICBoZWlnaHQgKiBmcmFtZVsxXSxcbiAgICAgICAgICAgIHdpZHRoLCBoZWlnaHQsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgICAgIG94LmNvbnRleHQucmVzdG9yZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG94LmNvbnRleHQuZHJhd0ltYWdlKG94LmltYWdlc1tzcmNdLCB4LCB5KTtcbiAgICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnZhbHVlID0gMDtcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLnRhcmdldCB8fCAxMDAwO1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gdGhpcy5jYWxsYmFjayB8fCBmdW5jdGlvbiAoKSB7fTtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IE1hdGgucm91bmQodGhpcy52YWx1ZSArIGR0ICogMTAwMCk7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlID49IHRoaXMudGFyZ2V0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFjayh0aGlzLmNvbnRleHQsIHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrKHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5sb29wKSB7XG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzYWJsZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIHJlc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IDA7XG4gICAgICAgIHRoaXMuZW5hYmxlKCk7XG4gICAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAnbG9hZGluZyc6IHJlcXVpcmUoJy4vc2NlbmVzL2xvYWRpbmcuanMnKSxcbiAgJ21haW4nOiByZXF1aXJlKCcuL3NjZW5lcy9tYWluLmpzJylcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICBveC5wcmVsb2FkZXIubG9hZChyZXF1aXJlKCcuLi9hc3NldHMnKSk7XG4gICAgICAgIHRoaXMuYmFyTGVuZ3RoID0gb3gucHJlbG9hZGVyLmFzc2V0c1RvTG9hZDtcbiAgICB9LFxuXG4gICAgZHJhdzogZnVuY3Rpb24gKCkge1xuICAgICAgICBveC5jb250ZXh0LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcbiAgICAgICAgb3guY29udGV4dC5maWxsUmVjdCgwLCAwLCBveC5jYW52YXMud2lkdGgsIG94LmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICBveC5jb250ZXh0LmZpbGxTdHlsZSA9IFwiZ3JleVwiO1xuICAgICAgICBveC5jb250ZXh0LmZpbGxSZWN0KG94LmNhbnZhcy53aWR0aCAvIDQsIG94LmNhbnZhcy5oZWlnaHQgLyAyLCBveC5jYW52YXMud2lkdGggLyAyLCAxKTtcbiAgICAgICAgb3guY29udGV4dC5maWxsU3R5bGUgPSBcImdyZXlcIjtcbiAgICAgICAgb3guY29udGV4dC5maWxsU3R5bGUgPSBcInJnYig0NiwgMjM4LCAyNDUpXCI7XG4gICAgICAgIG94LmNvbnRleHQuZmlsbFJlY3Qob3guY2FudmFzLndpZHRoIC8gNCwgb3guY2FudmFzLmhlaWdodCAvIDIsIG94LmNhbnZhcy53aWR0aCAvIDIgLSBveC5jYW52YXMud2lkdGggLyAyICogb3gucHJlbG9hZGVyLmFzc2V0c1RvTG9hZCAvIHRoaXMuYmFyTGVuZ3RoLCAxKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChveC5wcmVsb2FkZXIuYXNzZXRzVG9Mb2FkID09PSAwKSBveC5zY2VuZXMuc2V0KCdtYWluJyk7XG4gICAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIgPSBveC5zcGF3bignc3ByaXRlJywge1xuICAgICAgICAgICAgc291cmNlOiAncGxheWVyLnBuZycsXG4gICAgICAgICAgICB4OiBveC5jYW52YXMud2lkdGggLyAyLFxuICAgICAgICAgICAgeTogMjQ0LFxuICAgICAgICAgICAgd2lkdGg6IDcyLFxuICAgICAgICAgICAgaGVpZ2h0OjQ2LFxuICAgICAgICAgICAgYW5pbWF0aW9uczogIHtydW5uaW5nOiBbMCwxLDIsMyw0XSwgZHlpbmc6IFs1LDZdfSxcbiAgICAgICAgICAgIGFuaW1hdGlvbjogJ3J1bm5pbmcnLFxuICAgICAgICAgICAgZnJhbWVSYXRlOiA1MFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICB9LFxuICAgIFxuICAgIGRyYXc6IGZ1bmN0aW9uKCkge1xuICAgIH0sXG5cbiAgICBrZXlEb3duOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgfSxcblxuICAgIGtleVByZXNzOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgfSxcblxuICAgIGtleVVwOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgfSxcblxuICAgIG1vdXNlRG93bjogZnVuY3Rpb24gKGJ1dHRvbikge1xuICAgICAgICB0aGlzLnBsYXllci5pbnZlcnRlZCA9IHRydWU7XG4gICAgICAgIHRoaXMucGxheWVyLnBsYXkoJ2R5aW5nJyk7XG4gICAgfSxcblxuICAgIG1vdXNlVXA6IGZ1bmN0aW9uIChidXR0b24pIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIuaW52ZXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wbGF5ZXIucGxheSgncnVubmluZycpO1xuICAgIH1cbn07XG4iXX0=
