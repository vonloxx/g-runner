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
