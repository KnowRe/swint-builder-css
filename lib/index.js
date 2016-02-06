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
		png: {
			enable: false,
			metaDir: path.join(path.dirname(require.main.filename), '../pngMeta'),
			varName: 'png'
		},
		svg: {
			enable: false,
			dir: path.join(path.dirname(require.main.filename), '../svg'),
			varName: 'svg'
		},
		minify: true,
		variables: {},
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

	if (options.png.enable && !fs.existsSync(options.png.metaDir)) {
		callback('swint-builder-css: PNG directory doesn\'t exist', false);
		return;
	}

	if (options.svg.enable && !fs.existsSync(options.svg.dir)) {
		callback('swint-builder-css: SVG directory doesn\'t exist', false);
		return;
	}

	if (!fs.existsSync(options.outDir)) {
		fs.mkdirSync(options.outDir);
	}

	if (options.png.enable) {
		var imgMetaDir = walk({
				dir: options.png.metaDir,
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

		options.variables[options.png.varName] = imgMetaVar;
	}

	if (options.svg.enable) {
		var svgList = walk({
				dir: options.svg.dir,
				ext: 'svg'
			}),
			svgData = {};

		svgList.forEach(function(s) {
			var thePath = (s.replace(options.svg.dir, '')).split(path.sep).splice(1),
				objNow = svgData;

			for (var i = 0; i < thePath.length - 1; i++) {
				if (!objNow.hasOwnProperty(thePath[i])) {
					objNow[thePath[i]] = {};
				}
				objNow = objNow[thePath[i]];
			}
			objNow[thePath[thePath.length - 1].replace('.svg', '')] = 'background-image: url(\'data:image/svg+xml;base64,' + fs.readFileSync(s).toString('base64') + '\');';
		});

		options.variables[options.svg.varName] = svgData;
	}

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
		fs.writeFileSync(outMin, minimized.styles);
	}

	fs.writeFileSync(outFile, outputRaw);

	if (callback !== undefined) {
		callback(null, true);
	}
};

