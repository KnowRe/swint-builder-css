var os = require('os'),
	fs = require('fs'),
	path = require('path'),
	assert = require('assert'),
	swintHelper = require('swint-helper'),
	buildCSS = require('../lib');

global.swintVar.printLevel = 5;

describe('builder-css', function() {
	it('Error when no callback', function() {
		assert.throws(function() {
			buildCSS({});
		});
	});

	it('Error when inDir doesn\'t exist', function(done) {
		buildCSS({
			inDir: '/this-directory-does-not-exist'
		}, function(err, res) {
			assert.notEqual(err, null);
			done();
		});
	});

	it('Error when png.metaDir doesn\'t exist', function(done) {
		buildCSS({
			png: {
				enable: true,
				metaDir: '/this-directory-does-not-exist'
			}
		}, function(err, res) {
			assert.notEqual(err, null);
			done();
		});
	});

	it('Common case', function(done) {
		buildCSS({
			name: 'Test',
			inDir: path.join(__dirname, '../test_case/css'),
			outDir: path.join(os.tmpdir(), 'swint-builder-css-out'),
			png: {
				enable: true,
				metaDir: path.join(__dirname, '../test_case/pngMeta')
			},
			svg: {
				enable: true,
				dir: path.join(__dirname, '../test_case/svg')
			},
			minify: true,
			variables: {
				tmplVar: 'A'
			}
		}, function(err, res) {
			assert.deepEqual(
				fs.readFileSync(path.join(os.tmpdir(), 'swint-builder-css-out/Test.css')),
				fs.readFileSync(path.join(__dirname, '../test_result/Test.css'))
			);

			assert.deepEqual(
				fs.readFileSync(path.join(os.tmpdir(), 'swint-builder-css-out/Test.min.css')),
				fs.readFileSync(path.join(__dirname, '../test_result/Test.min.css'))
			);
			done();
		});
	});

	after(function() {
		fs.unlinkSync(path.join(os.tmpdir(), 'swint-builder-css-out/Test.css'));
		fs.unlinkSync(path.join(os.tmpdir(), 'swint-builder-css-out/Test.min.css'));
		fs.rmdirSync(path.join(os.tmpdir(), 'swint-builder-css-out'));
	});
});
