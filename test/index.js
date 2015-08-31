var os = require('os'),
	fs = require('fs'),
	path = require('path'),
	assert = require('assert'),
	swintHelper = require('swint-helper'),
	buildCSS = require('../lib');

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

	it('Error when imgMetaDir doesn\'t exist', function(done) {
		buildCSS({
			imgMetaDir: '/this-directory-does-not-exist'
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
			imgMetaDir: path.join(__dirname, '../test_case/imgMeta'),
			minify: true,
			variables: {
				tmplVar: 'A'
			}
		}, function(err, res) {
			assert.deepEqual(
				fs.readFileSync(path.join(os.tmpdir(), 'swint-builder-css-out/Test.css')),
				fs.readFileSync(path.join(__dirname, '../test_result/common.css'))
			);

			assert.deepEqual(
				fs.readFileSync(path.join(os.tmpdir(), 'swint-builder-css-out/Test.min.css')),
				fs.readFileSync(path.join(__dirname, '../test_result/common.min.css'))
			);
			done();
		});
	});

	after(function() {
		fs.unlinkSync(path.join(os.tmpdir(), 'swint-builder-css-out/Test.css'));
		fs.unlinkSync(path.join(os.tmpdir(), 'swint-builder-css-out/Test.min.css'));
	});
});
