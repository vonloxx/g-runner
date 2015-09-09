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
        audio: require('./loader').audio,
        data: require('./loader').data,
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2Fzc2V0cy5qcyIsInNyYy9lbmdpbmUvY2FudmFzLmpzIiwic3JjL2VuZ2luZS9jb3JlLmpzIiwic3JjL2VuZ2luZS9lbnRpdGllc01hbmFnZXIuanMiLCJzcmMvZW5naW5lL2dhbWVMb29wLmpzIiwic3JjL2VuZ2luZS9rZXlib2FyZC5qcyIsInNyYy9lbmdpbmUvbG9hZGVyLmpzIiwic3JjL2VuZ2luZS9sb2NhbFN0b3JhZ2UuanMiLCJzcmMvZW5naW5lL21vdXNlLmpzIiwic3JjL2VuZ2luZS9zY2VuZXNNYW5hZ2VyLmpzIiwic3JjL2VudGl0aWVzLmpzIiwic3JjL2VudGl0aWVzL3Nwcml0ZS5qcyIsInNyYy9lbnRpdGllcy9zcHJpdGUvYW5pbWF0ZWQuanMiLCJzcmMvZW50aXRpZXMvc3ByaXRlL2NhbGN1bGF0ZUZyYW1lcy5qcyIsInNyYy9lbnRpdGllcy9zcHJpdGUvZHJhd1Nwcml0ZS5qcyIsInNyYy9lbnRpdGllcy90aW1lci5qcyIsInNyYy9zY2VuZXMuanMiLCJzcmMvc2NlbmVzL2xvYWRpbmcuanMiLCJzcmMvc2NlbmVzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IFtcbiAgJy4vaW1hZ2VzL3BsYXllci5wbmcnXG5dOyIsInZhciBrZXlib2FyZCA9IHJlcXVpcmUoJy4va2V5Ym9hcmQnKSxcbiAgICBtb3VzZSA9IHJlcXVpcmUoJy4vbW91c2UnKSxcbiAgICBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyksXG4gICAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5jYW52YXMudGFiSW5kZXggPSAxMDAwO1xuY2FudmFzLnN0eWxlLm91dGxpbmUgPSBcIm5vbmVcIjtcbmNhbnZhcy5vbmtleWRvd24gPSBrZXlib2FyZC5rZXlEb3duLmJpbmQoa2V5Ym9hcmQpO1xuY2FudmFzLm9ua2V5dXAgPSBrZXlib2FyZC5rZXlVcC5iaW5kKGtleWJvYXJkKTtcbmNhbnZhcy5vbm1vdXNlbW92ZSA9IG1vdXNlLm9uTW92ZS5iaW5kKG1vdXNlKTtcbmNhbnZhcy5vbm1vdXNlZG93biA9IG1vdXNlLm9uRG93bi5iaW5kKG1vdXNlKTtcbmNhbnZhcy5vbm1vdXNldXAgPSBtb3VzZS5vblVwLmJpbmQobW91c2UpO1xuY2FudmFzLnN0eWxlLmN1cnNvciA9IFwibm9uZVwiO1xuY2FudmFzLm9uY29udGV4dG1lbnUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb250ZXh0O1xuIiwid2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm94ID0ge1xuICAgICAgICBjYW52YXM6IHJlcXVpcmUoJy4vY2FudmFzJykuY2FudmFzLFxuICAgICAgICBjb250ZXh0OiByZXF1aXJlKCcuL2NhbnZhcycpLFxuICAgICAgICBpbWFnZXM6IHJlcXVpcmUoJy4vbG9hZGVyJykuaW1hZ2VzLFxuICAgICAgICBhdWRpbzogcmVxdWlyZSgnLi9sb2FkZXInKS5hdWRpbyxcbiAgICAgICAgZGF0YTogcmVxdWlyZSgnLi9sb2FkZXInKS5kYXRhLFxuICAgICAgICBrZXlib2FyZDogcmVxdWlyZSgnLi9rZXlib2FyZCcpLFxuICAgICAgICBtb3VzZTogcmVxdWlyZSgnLi9tb3VzZScpLFxuICAgICAgICBzY2VuZXM6IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpLFxuICAgICAgICBlbnRpdGllczogcmVxdWlyZSgnLi9lbnRpdGllc01hbmFnZXInKSxcbiAgICAgICAgc2F2ZTogcmVxdWlyZSgnLi9sb2NhbFN0b3JhZ2UnKSxcbiAgICAgICAgbG9vcDogcmVxdWlyZSgnLi9nYW1lTG9vcCcpLFxuICAgICAgICBwcmVsb2FkZXI6IHJlcXVpcmUoJy4vbG9hZGVyJyksXG4gICAgICAgIHNwYXduOiByZXF1aXJlKCcuL2VudGl0aWVzTWFuYWdlcicpLnNwYXduXG4gICAgfTtcbiAgICBveC5zY2VuZXMuc2V0KCdsb2FkaW5nJyk7XG4gICAgb3gubG9vcC5pbml0KCk7XG59O1xuIiwidmFyIGxpc3QgPSByZXF1aXJlKCcuLi9lbnRpdGllcycpLFxuICAgIGN1cnJlbnQgPSBbXSxcbiAgICB0b1VwZGF0ZSA9IFtdLFxuICAgIHRvRHJhdyA9IFtdLFxuICAgIHNwYXduID0gZnVuY3Rpb24gKHR5cGUsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKCFsaXN0W3R5cGVdKSB0aHJvdyBuZXcgRXJyb3IoXCJFbnRpdHkgW1wiICsgdHlwZSArIFwiXSBkb2VzIG5vdCBleGlzdCBhbmQgY2Fubm90IGJlIHNwYXduZWQuXCIpO1xuICAgICAgICB2YXIgb2JqID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGxpc3RbdHlwZV0pIHtcbiAgICAgICAgICAgIG9ialtrZXldID0gbGlzdFt0eXBlXVtrZXldO1xuICAgICAgICB9XG4gICAgICAgIG9iai5kaXNhYmxlID0gZGlzYWJsZS5iaW5kKG9iaik7XG4gICAgICAgIG9iai5lbmFibGUgPSBlbmFibGUuYmluZChvYmopO1xuICAgICAgICBvYmouaWQgPSBjdXJyZW50Lmxlbmd0aDtcbiAgICAgICAgb2JqLnR5cGUgPSB0eXBlO1xuICAgICAgICBjdXJyZW50LnB1c2gob2JqKTtcbiAgICAgICAgaWYgKG9iai5pbml0KSBvYmouaW5pdCgpO1xuICAgICAgICBvYmouZW5hYmxlKCk7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcbiAgICBkaXNhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodG9EcmF3LmluZGV4T2YodGhpcy5pZCkgPiAwKSB0b0RyYXcuc3BsaWNlKHRvRHJhdy5pbmRleE9mKHRoaXMuaWQpLCAxKTtcbiAgICAgICAgaWYgKHRvVXBkYXRlLmluZGV4T2YodGhpcy5pZCkgPiAwKSB0b1VwZGF0ZS5zcGxpY2UodG9VcGRhdGUuaW5kZXhPZih0aGlzLmlkKSwgMSk7XG4gICAgfSxcbiAgICBlbmFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZSkgdG9VcGRhdGUucHVzaCh0aGlzLmlkKTtcbiAgICAgICAgaWYgKHRoaXMuZHJhdykgdG9EcmF3LnB1c2godGhpcy5pZCk7XG4gICAgfSxcbiAgICBjbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY3VycmVudC5zcGxpY2UoMCwgY3VycmVudC5sZW5ndGgpO1xuICAgICAgICB0b1VwZGF0ZS5zcGxpY2UoMCwgdG9VcGRhdGUubGVuZ3RoKTtcbiAgICAgICAgdG9EcmF3LnNwbGljZSgwLCB0b0RyYXcubGVuZ3RoKTtcbiAgICB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjdXJyZW50OiBjdXJyZW50LFxuICAgIGxpc3Q6IGxpc3QsXG4gICAgdG9EcmF3OiB0b0RyYXcsXG4gICAgdG9VcGRhdGU6IHRvVXBkYXRlLFxuICAgIHNwYXduOiBzcGF3bixcbiAgICBjbGVhcjogY2xlYXJcbn07XG4iLCJ2YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuL2VudGl0aWVzTWFuYWdlcicpLFxuICAgIHRvRHJhdyA9IGVudGl0aWVzLnRvRHJhdyxcbiAgICB0b1VwZGF0ZSA9IGVudGl0aWVzLnRvVXBkYXRlLFxuICAgIHNjZW5lcyA9IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpLFxuICAgIGNvbnRleHQgPSByZXF1aXJlKCcuL2NhbnZhcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzcGVlZDogMSxcbiAgICBkdDogMCxcbiAgICBzdGVwOiAxIC8gNjAsXG4gICAgbGFzdERlbHRhOiBuZXcgRGF0ZSgpLFxuICAgIG5vdzogbmV3IERhdGUoKSxcbiAgICBjYWxjdWxhdGVEZWx0YTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxhc3REZWx0YSA9IHRoaXMubm93O1xuICAgICAgICB0aGlzLm5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHRoaXMuZHQgKz0gTWF0aC5taW4oMSwgKHRoaXMubm93IC0gdGhpcy5sYXN0RGVsdGEpIC8gMTAwMCkgKiB0aGlzLnNwZWVkO1xuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoc2NlbmVzLmlzQ2hhbmdpbmcpIHRoaXMuZHQgPSAwO1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZURlbHRhKCk7XG4gICAgICAgIHdoaWxlICh0aGlzLmR0ID4gdGhpcy5zdGVwKSB7XG4gICAgICAgICAgICB0aGlzLmR0IC09IHRoaXMuc3RlcDtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKHRoaXMuc3RlcCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kcmF3KHRoaXMuZHQpO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5pbml0LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIGNvbnRleHQuY2FudmFzLndpZHRoLCBjb250ZXh0LmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICBpZiAoc2NlbmVzLmN1cnJlbnQuZHJhdykgc2NlbmVzLmN1cnJlbnQuZHJhdygpO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdG9EcmF3Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZW50aXRpZXMuY3VycmVudFt0b0RyYXdbaV1dICE9PSB1bmRlZmluZWQgJiYgZW50aXRpZXMuY3VycmVudFt0b0RyYXdbaV1dLmRyYXcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGVudGl0aWVzLmN1cnJlbnRbdG9EcmF3W2ldXS5kcmF3KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gICAgICAgIFxuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuICAgICAgICBpZiAoc2NlbmVzLmN1cnJlbnQudXBkYXRlKSBzY2VuZXMuY3VycmVudC51cGRhdGUoZHQpO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdG9VcGRhdGUubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChlbnRpdGllcy5jdXJyZW50W3RvVXBkYXRlW2ldXSAhPT0gdW5kZWZpbmVkICYmIGVudGl0aWVzLmN1cnJlbnRbdG9VcGRhdGVbaV1dLnVwZGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZW50aXRpZXMuY3VycmVudFt0b1VwZGF0ZVtpXV0udXBkYXRlKGR0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG59O1xuIiwidmFyIHNjZW5lID0gcmVxdWlyZSgnLi9zY2VuZXNNYW5hZ2VyJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpc1ByZXNzZWQ6IHt9LFxuXG4gICAga2V5RG93bjogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzIgfHwgKGUua2V5Q29kZSA+PSAzNyAmJiBlLmtleUNvZGUgPD0gNDApKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChzY2VuZS5jdXJyZW50LmtleURvd24pIHNjZW5lLmN1cnJlbnQua2V5RG93bih0aGlzLmtleXNbZS5rZXlDb2RlXSk7XG4gICAgICAgIHRoaXMua2V5UHJlc3MoZSk7XG4gICAgfSxcblxuICAgIGtleVByZXNzOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAodGhpcy5pc1ByZXNzZWRbZS5rZXlDb2RlXSkgcmV0dXJuO1xuICAgICAgICBpZiAoc2NlbmUuY3VycmVudC5rZXlQcmVzcykgc2NlbmUuY3VycmVudC5rZXlQcmVzcyh0aGlzLmtleXNbZS5rZXlDb2RlXSk7XG4gICAgICAgIHRoaXMuaXNQcmVzc2VkW2Uua2V5Q29kZV0gPSB0cnVlO1xuICAgIH0sXG5cbiAgICBrZXlVcDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHNjZW5lLmN1cnJlbnQua2V5VXApIHNjZW5lLmN1cnJlbnQua2V5VXAodGhpcy5rZXlzW2Uua2V5Q29kZV0pO1xuICAgICAgICB0aGlzLmlzUHJlc3NlZFtlLmtleUNvZGVdID0gZmFsc2U7XG4gICAgfSxcblxuICAgIGtleXM6IHtcbiAgICAgICAgODogJ2JhY2tzcGFjZScsXG4gICAgICAgIDk6ICd0YWInLFxuICAgICAgICAxMzogJ2VudGVyJyxcbiAgICAgICAgMTY6ICdzaGlmdCcsXG4gICAgICAgIDE3OiAnY3RybCcsXG4gICAgICAgIDE4OiAnYWx0JyxcbiAgICAgICAgMTk6ICdwYXVzZScsXG4gICAgICAgIDIwOiAnY2Fwc19sb2NrJyxcbiAgICAgICAgMjc6ICdlc2MnLFxuICAgICAgICAzMjogJ3NwYWNlYmFyJyxcbiAgICAgICAgMzM6ICdwYWdlX3VwJyxcbiAgICAgICAgMzQ6ICdwYWdlX2Rvd24nLFxuICAgICAgICAzNTogJ2VuZCcsXG4gICAgICAgIDM2OiAnaG9tZScsXG4gICAgICAgIDM3OiAnbGVmdCcsXG4gICAgICAgIDM4OiAndXAnLFxuICAgICAgICAzOTogJ3JpZ2h0JyxcbiAgICAgICAgNDA6ICdkb3duJyxcbiAgICAgICAgNDQ6ICdwcmludF9zY3JlZW4nLFxuICAgICAgICA0NTogJ2luc2VydCcsXG4gICAgICAgIDQ2OiAnZGVsZXRlJyxcbiAgICAgICAgNDg6ICcwJyxcbiAgICAgICAgNDk6ICcxJyxcbiAgICAgICAgNTA6ICcyJyxcbiAgICAgICAgNTE6ICczJyxcbiAgICAgICAgNTI6ICc0JyxcbiAgICAgICAgNTM6ICc1JyxcbiAgICAgICAgNTQ6ICc2JyxcbiAgICAgICAgNTU6ICc3JyxcbiAgICAgICAgNTY6ICc4JyxcbiAgICAgICAgNTc6ICc5JyxcbiAgICAgICAgNjU6ICdhJyxcbiAgICAgICAgNjY6ICdiJyxcbiAgICAgICAgNjc6ICdjJyxcbiAgICAgICAgNjg6ICdkJyxcbiAgICAgICAgNjk6ICdlJyxcbiAgICAgICAgNzA6ICdmJyxcbiAgICAgICAgNzE6ICdnJyxcbiAgICAgICAgNzI6ICdoJyxcbiAgICAgICAgNzM6ICdpJyxcbiAgICAgICAgNzQ6ICdqJyxcbiAgICAgICAgNzU6ICdrJyxcbiAgICAgICAgNzY6ICdsJyxcbiAgICAgICAgNzc6ICdtJyxcbiAgICAgICAgNzg6ICduJyxcbiAgICAgICAgNzk6ICdvJyxcbiAgICAgICAgODA6ICdwJyxcbiAgICAgICAgODE6ICdxJyxcbiAgICAgICAgODI6ICdyJyxcbiAgICAgICAgODM6ICdzJyxcbiAgICAgICAgODQ6ICd0JyxcbiAgICAgICAgODU6ICd1JyxcbiAgICAgICAgODY6ICd2JyxcbiAgICAgICAgODc6ICd3JyxcbiAgICAgICAgODg6ICd4JyxcbiAgICAgICAgODk6ICd5JyxcbiAgICAgICAgOTA6ICd6JyxcbiAgICAgICAgOTY6ICdudW1femVybycsXG4gICAgICAgIDk3OiAnbnVtX29uZScsXG4gICAgICAgIDk4OiAnbnVtX3R3bycsXG4gICAgICAgIDk5OiAnbnVtX3RocmVlJyxcbiAgICAgICAgMTAwOiAnbnVtX2ZvdXInLFxuICAgICAgICAxMDE6ICdudW1fZml2ZScsXG4gICAgICAgIDEwMjogJ251bV9zaXgnLFxuICAgICAgICAxMDM6ICdudW1fc2V2ZW4nLFxuICAgICAgICAxMDQ6ICdudW1fZWlnaHQnLFxuICAgICAgICAxMDU6ICdudW1fbmluZScsXG4gICAgICAgIDEwNjogJ251bV9tdWx0aXBseScsXG4gICAgICAgIDEwNzogJ251bV9wbHVzJyxcbiAgICAgICAgMTA5OiAnbnVtX21pbnVzJyxcbiAgICAgICAgMTEwOiAnbnVtX3BlcmlvZCcsXG4gICAgICAgIDExMTogJ251bV9kaXZpc2lvbicsXG4gICAgICAgIDExMjogJ2YxJyxcbiAgICAgICAgMTEzOiAnZjInLFxuICAgICAgICAxMTQ6ICdmMycsXG4gICAgICAgIDExNTogJ2Y0JyxcbiAgICAgICAgMTE2OiAnZjUnLFxuICAgICAgICAxMTc6ICdmNicsXG4gICAgICAgIDExODogJ2Y3JyxcbiAgICAgICAgMTE5OiAnZjgnLFxuICAgICAgICAxMjA6ICdmOScsXG4gICAgICAgIDEyMTogJ2YxMCcsXG4gICAgICAgIDEyMjogJ2YxMScsXG4gICAgICAgIDEyMzogJ2YxMicsXG4gICAgICAgIDE4NjogJ3NlbWljb2xvbicsXG4gICAgICAgIDE4NzogJ3BsdXMnLFxuICAgICAgICAxODk6ICdtaW51cycsXG4gICAgICAgIDE5MjogJ2dyYXZlX2FjY2VudCcsXG4gICAgICAgIDIyMjogJ3NpbmdsZV9xdW90ZSdcbiAgICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW1hZ2VzOiB7fSxcbiAgICBkYXRhOiB7fSxcbiAgICBhdWRpbzoge30sXG5cbiAgICBsb2FkSW1hZ2U6IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgICAgIHZhciBuYW1lID0gcGF0aC5zbGljZSg5LCBwYXRoLmxlbmd0aCksXG4gICAgICAgICAgICBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5pbWFnZXNbbmFtZV0gPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgdGhpcy5pbWFnZXNbbmFtZV0ub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLmFzc2V0c1RvTG9hZC0tO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmltYWdlc1tuYW1lXS5zcmMgPSBwYXRoO1xuICAgIH0sXG5cbiAgICBsb2FkRGF0YTogZnVuY3Rpb24gKHBhdGgpIHtcbiAgICAgICAgdmFyIGZpbGUgPSBwYXRoLnNsaWNlKDcsIHBhdGgubGVuZ3RoIC0gNSksXG4gICAgICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQgJiYgeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhW2ZpbGVdID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICBzZWxmLmFzc2V0c1RvTG9hZC0tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB4aHIub3BlbihcIkdFVFwiLCBwYXRoKTtcbiAgICAgICAgeGhyLnNlbmQoKTtcbiAgICB9LFxuXG4gICAgbG9hZEF1ZGlvOiBmdW5jdGlvbiAocGF0aCkge1xuICAgICAgICB2YXIgbmFtZSA9IHBhdGguc2xpY2UoOCwgcGF0aC5sZW5ndGgpLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMuYXVkaW9bbmFtZV0gPSBuZXcgQXVkaW8ocGF0aCk7XG4gICAgICAgIHRoaXMuYXVkaW9bbmFtZV0ub25jYW5wbGF5dGhyb3VnaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5hc3NldHNUb0xvYWQtLTtcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgbG9hZDogZnVuY3Rpb24gKGxpc3QpIHtcbiAgICAgICAgdGhpcy5hc3NldHNUb0xvYWQgPSBsaXN0Lmxlbmd0aDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChsaXN0W2ldLmluZGV4T2YoJy4vaW1hZ2VzJykgPiAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZEltYWdlKGxpc3RbaV0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsaXN0W2ldLmluZGV4T2YoJy4vZGF0YScpID4gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWREYXRhKGxpc3RbaV0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsaXN0W2ldLmluZGV4T2YoJy4vYXVkaW8nKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkQXVkaW8obGlzdFtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzdG9yZTogZnVuY3Rpb24gKG51bSwgb2JqKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKG51bSwgSlNPTi5zdHJpbmdpZnkob2JqKSk7XG4gICAgfSxcbiAgICBsb2FkOiBmdW5jdGlvbiAobnVtKSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKG51bSkpO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAobnVtKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKG51bSk7XG4gICAgfVxufTtcbiIsInZhciBzY2VuZSA9IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB4OiAwLFxuICAgIHk6IDAsXG4gICAgaXNEb3duOiBmYWxzZSxcbiAgICBvbk1vdmU6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHRoaXMub2Zmc2V0ID0gb3guY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBveC5tb3VzZS54ID0gZS5jbGllbnRYIC0gdGhpcy5vZmZzZXQubGVmdDtcbiAgICAgICAgb3gubW91c2UueSA9IGUuY2xpZW50WSAtIHRoaXMub2Zmc2V0LnRvcDtcbiAgICB9LFxuXG4gICAgb25VcDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHNjZW5lLmN1cnJlbnQubW91c2VVcCkgc2NlbmUuY3VycmVudC5tb3VzZVVwKHRoaXMuYnV0dG9uc1tlLmJ1dHRvbl0pO1xuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICBvbkRvd246IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChzY2VuZS5jdXJyZW50Lm1vdXNlRG93bikgc2NlbmUuY3VycmVudC5tb3VzZURvd24odGhpcy5idXR0b25zW2UuYnV0dG9uXSk7XG4gICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgYnV0dG9uczoge1xuICAgICAgICAwOiBcImxlZnRcIixcbiAgICAgICAgMTogXCJtaWRkbGVcIixcbiAgICAgICAgMjogXCJyaWdodFwiXG4gICAgfVxufTtcbiIsInZhciBjbGVhckVudGl0aWVzID0gcmVxdWlyZSgnLi9lbnRpdGllc01hbmFnZXInKS5jbGVhcixcbiAgICBsaXN0ID0gcmVxdWlyZSgnLi4vc2NlbmVzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGN1cnJlbnQ6IG51bGwsXG4gICAgc2V0OiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICBpZiAoIWxpc3RbbmFtZV0pIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIFtcIiArIG5hbWUgKyBcIl0gZG9lcyBub3QgZXhpc3QhXCIpO1xuICAgICAgICBjbGVhckVudGl0aWVzKCk7XG4gICAgICAgIHRoaXMuY3VycmVudCA9IGxpc3RbbmFtZV07XG4gICAgICAgIHRoaXMuY3VycmVudC5pbml0KCk7XG4gICAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAnc3ByaXRlL2FuaW1hdGVkJzogcmVxdWlyZSgnLi9lbnRpdGllcy9zcHJpdGUvYW5pbWF0ZWQuanMnKSxcbiAgJ3Nwcml0ZS9jYWxjdWxhdGVGcmFtZXMnOiByZXF1aXJlKCcuL2VudGl0aWVzL3Nwcml0ZS9jYWxjdWxhdGVGcmFtZXMuanMnKSxcbiAgJ3Nwcml0ZS9kcmF3U3ByaXRlJzogcmVxdWlyZSgnLi9lbnRpdGllcy9zcHJpdGUvZHJhd1Nwcml0ZS5qcycpLFxuICAnc3ByaXRlJzogcmVxdWlyZSgnLi9lbnRpdGllcy9zcHJpdGUuanMnKSxcbiAgJ3RpbWVyJzogcmVxdWlyZSgnLi9lbnRpdGllcy90aW1lci5qcycpXG59OyIsInZhciBkcmF3U3ByaXRlID0gcmVxdWlyZSgnLi9zcHJpdGUvZHJhd1Nwcml0ZScpLFxuICAgIGFuaW1hdGVkID0gcmVxdWlyZSgnLi9zcHJpdGUvYW5pbWF0ZWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNvdXJjZVdpZHRoID0gb3guaW1hZ2VzW3RoaXMuc291cmNlXS53aWR0aCB8fCAxO1xuICAgICAgICB0aGlzLnNvdXJjZUhlaWdodCA9IG94LmltYWdlc1t0aGlzLnNvdXJjZV0uaGVpZ2h0IHx8IDE7XG4gICAgICAgIHRoaXMud2lkdGggPSB0aGlzLndpZHRoIHx8IHRoaXMuc291cmNlV2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQgfHwgdGhpcy5zb3VyY2VIZWlnaHQ7XG4gICAgICAgIHRoaXMueCA9IHRoaXMueCB8fCAwO1xuICAgICAgICB0aGlzLnkgPSB0aGlzLnkgfHwgMDtcbiAgICAgICAgdGhpcy5pbnZlcnRlZCA9IGZhbHNlO1xuXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbikgYW5pbWF0ZWQuY2FsbCh0aGlzKTtcbiAgICB9LFxuXG4gICAgZHJhdzogZnVuY3Rpb24gKCkge1xuICAgICAgICBkcmF3U3ByaXRlKHRoaXMuc291cmNlLCB0aGlzLngsIHRoaXMueSk7XG4gICAgfVxufTtcbiIsInZhciBkcmF3U3ByaXRlID0gcmVxdWlyZSgnLi9kcmF3U3ByaXRlJyksXG4gICAgY2FsY3VsYXRlRnJhbWVzID0gcmVxdWlyZShcIi4vY2FsY3VsYXRlRnJhbWVzXCIpLFxuXG4gICAgaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5pc1BsYXlpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzRmluaXNoZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmxvb3AgIT09ICdib29sZWFuJykgdGhpcy5sb29wID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy5mcmFtZVJhdGUgPSB0aGlzLmZyYW1lUmF0ZSB8fCAzMDtcbiAgICAgICAgdGhpcy5wYXVzZSA9IHBhdXNlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMucGxheSA9IHBsYXkuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5maW5pc2hlZCA9IGZpbmlzaGVkLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMudXBkYXRlID0gdXBkYXRlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuZHJhdyA9IGRyYXcuYmluZCh0aGlzKTtcbiAgICAgICAgY2FsY3VsYXRlRnJhbWVzLmNhbGwodGhpcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW9ucykge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRpb25BcnJheSA9IHRoaXMuYW5pbWF0aW9uc1t0aGlzLmFuaW1hdGlvbl07XG4gICAgICAgICAgICB0aGlzLmFycmF5Q291bnRlciA9IDA7XG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gdGhpcy5hbmltYXRpb25BcnJheVt0aGlzLmFycmF5Q291bnRlcl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgICAgfVxuICAgIH0sXG5cblxuICAgIGRyYXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRyYXdTcHJpdGUodGhpcy5zb3VyY2UsIHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5mcmFtZXNbdGhpcy5mcmFtZV0sIHRoaXMuaW52ZXJ0ZWQpO1xuICAgIH0sXG5cbiAgICB1cGRhdGUgPSBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzUGxheWluZykgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5pc0ZpbmlzaGVkKSByZXR1cm4gdGhpcy5maW5pc2hlZCgpO1xuXG4gICAgICAgIHRoaXMuY291bnRlciArPSBkdCAqIDEwMDA7XG4gICAgICAgIGlmICh0aGlzLmNvdW50ZXIgPiAxMDAwIC8gdGhpcy5mcmFtZVJhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgICAgICAgICBpZiAodGhpcy5hbmltYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgbXVsdGlwbGVBbmltYXRpb25zLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNpbmdsZUFuaW1hdGlvbi5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIG11bHRpcGxlQW5pbWF0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuYXJyYXlDb3VudGVyID09PSB0aGlzLmFuaW1hdGlvbkFycmF5Lmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5sb29wKSB0aGlzLmlzRmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbMF07XG4gICAgICAgICAgICB0aGlzLmFycmF5Q291bnRlciA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFycmF5Q291bnRlcisrO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbdGhpcy5hcnJheUNvdW50ZXJdO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHNpbmdsZUFuaW1hdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuZnJhbWUgPT09ICh0aGlzLmZyYW1lcy5sZW5ndGggLSAxKSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmxvb3ApIHRoaXMuaXNGaW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUgKz0gMTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBmaW5pc2hlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5wYXVzZSgpO1xuICAgICAgICBpZiAodGhpcy5jYWxsYmFjaykgdGhpcy5jYWxsYmFjaygpO1xuICAgIH0sXG5cbiAgICBwbGF5ID0gZnVuY3Rpb24gKGFuaW1hdGlvbiwgb3B0aW9ucykge1xuICAgICAgICBpZiAob3B0aW9ucykge1xuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzW2tleV0gPSBvcHRpb25zW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25zKSB7XG4gICAgICAgICAgICBpZiAoYW5pbWF0aW9uKSB0aGlzLmFuaW1hdGlvbiA9IGFuaW1hdGlvbjtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uQXJyYXkgPSB0aGlzLmFuaW1hdGlvbnNbdGhpcy5hbmltYXRpb25dO1xuICAgICAgICAgICAgdGhpcy5hcnJheUNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbdGhpcy5hcnJheUNvdW50ZXJdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNGaW5pc2hlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzUGxheWluZyA9IHRydWU7XG4gICAgfSxcblxuICAgIHBhdXNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmlzUGxheWluZyA9IGZhbHNlO1xuICAgIH07XG5cbm1vZHVsZS5leHBvcnRzID0gaW5pdDtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB4ID0gMCxcbiAgICAgICAgeSA9IDA7XG4gICAgdGhpcy5mcmFtZXMgPSBbWzAsIDBdXTtcblxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgdGhpcy5zb3VyY2VIZWlnaHQgLyB0aGlzLmhlaWdodCAqIHRoaXMuc291cmNlV2lkdGggLyB0aGlzLndpZHRoOyBpKyspIHtcbiAgICAgICAgaWYgKHggPCB0aGlzLnNvdXJjZVdpZHRoIC8gdGhpcy53aWR0aCAtIDEpIHtcbiAgICAgICAgICAgIHgrKztcbiAgICAgICAgfSBlbHNlIGlmICh5IDwgdGhpcy5zb3VyY2VIZWlnaHQgLyB0aGlzLmhlaWdodCAtIDEpIHtcbiAgICAgICAgICAgIHkrKztcbiAgICAgICAgICAgIHggPSAwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZnJhbWVzLnB1c2goW3gsIHldKTtcbiAgICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3JjLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBmcmFtZSwgaW52ZXJ0ZWQpIHtcbiAgICBpZiAodHlwZW9mIHdpZHRoID09PSAnbnVtYmVyJykge1xuICAgICAgICBveC5jb250ZXh0LnNhdmUoKTtcbiAgICAgICAgaWYgKGludmVydGVkKSB7XG4gICAgICAgICAgICBveC5jb250ZXh0LnRyYW5zbGF0ZSgwLCB5ICogMiArIGhlaWdodCk7XG4gICAgICAgICAgICBveC5jb250ZXh0LnNjYWxlKDEsIC0xKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG94LmNvbnRleHQuZHJhd0ltYWdlKFxuICAgICAgICAgICAgb3guaW1hZ2VzW3NyY10sXG4gICAgICAgICAgICB3aWR0aCAqIGZyYW1lWzBdLFxuICAgICAgICAgICAgaGVpZ2h0ICogZnJhbWVbMV0sXG4gICAgICAgICAgICB3aWR0aCwgaGVpZ2h0LCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgICBveC5jb250ZXh0LnJlc3RvcmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBveC5jb250ZXh0LmRyYXdJbWFnZShveC5pbWFnZXNbc3JjXSwgeCwgeSk7XG4gICAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IDA7XG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy50YXJnZXQgfHwgMTAwMDtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IHRoaXMuY2FsbGJhY2sgfHwgZnVuY3Rpb24gKCkge307XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSBNYXRoLnJvdW5kKHRoaXMudmFsdWUgKyBkdCAqIDEwMDApO1xuICAgICAgICBpZiAodGhpcy52YWx1ZSA+PSB0aGlzLnRhcmdldCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY29udGV4dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2sodGhpcy5jb250ZXh0LCB0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFjayh0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMubG9vcCkge1xuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc2FibGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZXN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSAwO1xuICAgICAgICB0aGlzLmVuYWJsZSgpO1xuICAgIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgJ2xvYWRpbmcnOiByZXF1aXJlKCcuL3NjZW5lcy9sb2FkaW5nLmpzJyksXG4gICdtYWluJzogcmVxdWlyZSgnLi9zY2VuZXMvbWFpbi5qcycpXG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgb3gucHJlbG9hZGVyLmxvYWQocmVxdWlyZSgnLi4vYXNzZXRzJykpO1xuICAgICAgICB0aGlzLmJhckxlbmd0aCA9IG94LnByZWxvYWRlci5hc3NldHNUb0xvYWQ7XG4gICAgfSxcblxuICAgIGRyYXc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgb3guY29udGV4dC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XG4gICAgICAgIG94LmNvbnRleHQuZmlsbFJlY3QoMCwgMCwgb3guY2FudmFzLndpZHRoLCBveC5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgb3guY29udGV4dC5maWxsU3R5bGUgPSBcImdyZXlcIjtcbiAgICAgICAgb3guY29udGV4dC5maWxsUmVjdChveC5jYW52YXMud2lkdGggLyA0LCBveC5jYW52YXMuaGVpZ2h0IC8gMiwgb3guY2FudmFzLndpZHRoIC8gMiwgMSk7XG4gICAgICAgIG94LmNvbnRleHQuZmlsbFN0eWxlID0gXCJncmV5XCI7XG4gICAgICAgIG94LmNvbnRleHQuZmlsbFN0eWxlID0gXCJyZ2IoNDYsIDIzOCwgMjQ1KVwiO1xuICAgICAgICBveC5jb250ZXh0LmZpbGxSZWN0KG94LmNhbnZhcy53aWR0aCAvIDQsIG94LmNhbnZhcy5oZWlnaHQgLyAyLCBveC5jYW52YXMud2lkdGggLyAyIC0gb3guY2FudmFzLndpZHRoIC8gMiAqIG94LnByZWxvYWRlci5hc3NldHNUb0xvYWQgLyB0aGlzLmJhckxlbmd0aCwgMSk7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAob3gucHJlbG9hZGVyLmFzc2V0c1RvTG9hZCA9PT0gMCkgb3guc2NlbmVzLnNldCgnbWFpbicpO1xuICAgIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucGxheWVyID0gb3guc3Bhd24oJ3Nwcml0ZScsIHtcbiAgICAgICAgICAgIHNvdXJjZTogJ3BsYXllci5wbmcnLFxuICAgICAgICAgICAgeDogb3guY2FudmFzLndpZHRoIC8gMixcbiAgICAgICAgICAgIHk6IDI0NCxcbiAgICAgICAgICAgIHdpZHRoOiA3MixcbiAgICAgICAgICAgIGhlaWdodDo0NixcbiAgICAgICAgICAgIGFuaW1hdGlvbnM6ICB7cnVubmluZzogWzAsMSwyLDMsNF0sIGR5aW5nOiBbNSw2XX0sXG4gICAgICAgICAgICBhbmltYXRpb246ICdydW5uaW5nJyxcbiAgICAgICAgICAgIGZyYW1lUmF0ZTogNTBcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG4gICAgfSxcbiAgICBcbiAgICBkcmF3OiBmdW5jdGlvbigpIHtcbiAgICB9LFxuXG4gICAga2V5RG93bjogZnVuY3Rpb24gKGtleSkge1xuICAgIH0sXG5cbiAgICBrZXlQcmVzczogZnVuY3Rpb24gKGtleSkge1xuICAgIH0sXG5cbiAgICBrZXlVcDogZnVuY3Rpb24gKGtleSkge1xuICAgIH0sXG5cbiAgICBtb3VzZURvd246IGZ1bmN0aW9uIChidXR0b24pIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIuaW52ZXJ0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnBsYXllci5wbGF5KCdkeWluZycpO1xuICAgIH0sXG5cbiAgICBtb3VzZVVwOiBmdW5jdGlvbiAoYnV0dG9uKSB7XG4gICAgICAgIHRoaXMucGxheWVyLmludmVydGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMucGxheWVyLnBsYXkoJ3J1bm5pbmcnKTtcbiAgICB9XG59O1xuIl19
