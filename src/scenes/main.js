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
