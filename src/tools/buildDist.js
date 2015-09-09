#!/usr/bin/env node

var fs = require('fs-extra');
var zlib = require('zlib');
var archiver = require('archiver');
var archive = archiver.create('zip', {level: zlib.Z_BEST_COMPRESSION});
var path = './dist';

fs.removeSync(path);

var stat = fs.stat(path, function(err) {
	if (err) {
		fs.mkdir(path, function(err) {
			if (err) throw err;
			copyFiles(path);
		});
	} else {
		copyFiles(path);
	}
});

var copyFiles = function(toPath) {
	var html = fs.readFileSync('./index.html', 'utf-8');
	var js = fs.readFileSync('./game.js', 'utf-8');
	
	html = html.replace('ox.js', 'game.js');

    fs.writeFile(path + "/index.html", html, function (err) {
        if (err) {
            return console.log(err);
        }
    });

    fs.writeFile(path + "/game.js", js, function (err) {
        if (err) {
            return console.log(err);
        }
    });
	
	// Copy images.	
	fs.copy('./images', path + '/images', function (err) {
		if (err) {
			console.error(err);
		} else {
			var output = fs.createWriteStream('game.zip');
			archive.pipe(output);
			archive.directory(path, 'game');
			archive.finalize();
			console.log("success!");
		}
	});
}
