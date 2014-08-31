var util = require('util');
var path = require('path');
var gulp = require('gulp');
var runSequence = require('run-sequence');
var rimraf = require('rimraf');
var gzip = require('gulp-gzip');
var notify = require('gulp-notify');
var gutil = require('gulp-util');
var webpack = require('webpack');
var webpackConfig = require('./client/webpack.config');
var through2 = require('through2');

gulp.task("webpack", function (cb) {
	webpack(webpackConfig, function (err, stats) {
		if (err) throw new gutil.PluginError("webpack", err);

		var jsFilename = stats.toJson().assetsByChunkName['app'];
		if (util.isArray(jsFilename)) {
			jsFilename = jsFilename.filter(function (filename) {
				return path.extname(filename).toLowerCase() === '.js'
			}).shift();
		}

		// write the hashed main.js to /dist/index.html
		gulp.src('./client/index.html')
			.on('error', handleErrors)
			.pipe(through2.obj(function (vinylFile, enc, tCb) {
				vinylFile.contents = new Buffer(String(vinylFile.contents).replace('main.js', jsFilename));
				this.push(vinylFile);
				tCb();
			}))
			.pipe(gulp.dest('./dist/'));

		cb();
	});
});

function handleErrors() {
	var args = Array.prototype.slice.call(arguments);
	notify.onError({ title: 'Error', message: '<%= error.message %>'}).apply(this, args);
	this.emit('end');
}

gulp.task('gzip-deploy', function () {
	return gulp.src('./dist/**/*')
		.on('error', handleErrors)
		.pipe(gzip())
		.pipe(gulp.dest('./dist/'));
});

gulp.task('clean', function (cb) {
	return rimraf('./dist', cb);
});

gulp.task('default', function (cb) {
	runSequence('clean', 'webpack', cb);
});

gulp.task('deploy', function (cb) {
	webpackConfig.plugins = webpackConfig.plugins = [
		new webpack.optimize.UglifyJsPlugin(),
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: JSON.stringify("production")
			}
		})
	];
	webpackConfig.watch = false;
	webpackConfig.devtool = null;
	webpackConfig.output.filename = "main-[hash].js";

	runSequence('clean', 'webpack', 'gzip-deploy', cb);
});