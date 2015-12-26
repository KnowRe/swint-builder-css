'use strict';

var path = require('path'),
	fs = require('fs'),
	ejs = require('ejs'),
	sprintf = require('sprintf').sprintf,
	CleanCSS = require('clean-css'),
	swintHelper = require('swint-helper'),
	defaultize = swintHelper.defaultize,
	walk = swintHelper.walk,
	concat = swintHelper.concat;

module.exports = function(options, callback) {
	defaultize({
		name: 'Project',
		inDir: path.dirname(require.main.filename),
		outDir: path.join(path.dirname(require.main.filename), '../out'),
		imgMetaDir: path.join(path.dirname(require.main.filename), '../imgMeta'),
		minify: true,
		variables: {},
		imgVarName: 'img',
		walkOption: {
			ext: 'css'
		}
	}, options);

	return proceed(options, callback);
};

var proceed = function(options, callback) {
	if (callback === undefined) {
		var msg = 'swint-builder-css function needs callback';
		print(4, msg);
		throw new Error(msg);
	}

	if (!fs.existsSync(options.inDir)) {
		callback('swint-builder-css: inDir doesn\'t exist', false);
		return;
	}

	if (!fs.existsSync(options.imgMetaDir)) {
		callback('swint-builder-css: imgMetaDir doesn\'t exist', false);
		return;
	}

	if (!fs.existsSync(options.outDir)) {
		fs.mkdirSync(options.outDir);
	}

	var imgMetaDir = walk({
			dir: options.imgMetaDir,
			ext: 'json'
		}),
		imgMeta = imgMetaDir.map(function(v) {
			return JSON.parse(fs.readFileSync(v, 'utf8'));
		}),
		imgMetaVar = {};

	imgMetaDir.forEach(function(v, idx) {
		var bn = path.basename(v).replace('.meta.json', '');

		imgMetaVar[bn] = {};
		imgMeta[idx].forEach(function(vv) {
			var fn = vv.name.replace('.png', '');

			imgMetaVar[bn][fn] = sprintf(
				'background-image: url(\'img/%s.png\');\n' +
				'\tbackground-position: -%dpx 0;\n' +
				'\twidth: %dpx;\n' +
				'\theight: %dpx;',
				bn,
				vv.offset,
				vv.width,
				vv.height
			);
		});
	});

	options.variables[options.imgVarName] = imgMetaVar;

	var walkOption = options.walkOption;
	walkOption.dir = options.inDir;

	var walkList = walk(walkOption),
		concated = concat(walkList),
		outputRaw = ejs.render(
			concated,
			options.variables
		),
		outFile = path.join(options.outDir, sprintf('%s.css', options.name));

	if (options.minify) {
		var outMin = path.join(options.outDir, sprintf('%s.min.css', options.name));
		var minimized = (new CleanCSS()).minify(outputRaw);
		fs.writeFileSync(outMin, minimized);
	}

	fs.writeFileSync(outFile, outputRaw);

	if (callback !== undefined) {
		callback(null, true);
	}
};

