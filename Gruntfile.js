'use strict';
var path = require('path');
var fs = require('fs');
var gettextParser = require('gettext-parser');
var pseudoLoc = require('node-pseudo-l10n');

module.exports = function (grunt) {
	grunt.initConfig({
		jsxgettext: {
			generate: {
				files: [
					{
						src: [
							'./index.js',
							'./views/**/*.hbs'
						],
						dest: './locales/messages.pot'
					}
				],
				options: {
					keyword: 'gettext'
				}
			}
		},
		generate_test_files: {
			pot: './locales/messages.pot',
			languagesDir: './locales',
			generate: ['en', 'test']
		}
	});

	['grunt-jsxgettext'].forEach(grunt.loadNpmTasks);

	grunt.registerTask('generate_test_files', '', function () {
		var done = this.async();

		var localConf = grunt.config("generate_test_files");
		localConf.potFile = fs.readFileSync(path.resolve(localConf.pot));
		localConf.languagesDir = path.resolve(localConf.languagesDir);

		grunt.util.async.forEachSeries(localConf.generate, function (languageName, cb) {
			var translator = {
				en: function(str) { return str; },
				test: pseudoLoc.transformString
			}[languageName];

			var parsedPot = gettextParser.po.parse(localConf.potFile);
			parsedPot.headers['language'] = languageName;

			var translations = parsedPot.translations;

			Object.keys(translations).forEach(function (catalog) {
				Object.keys(translations[catalog]).forEach(function (key) {
					if (key.length === 0) return;

					var strObj = translations[catalog][key];

					strObj.msgstr[0] = translator(strObj.msgid);
					if (strObj.msgid_plural)
						strObj.msgstr[1] = translator(strObj.msgid_plural);
				});
			});

			fs.writeFileSync(
				path.resolve(localConf.languagesDir, (languageName + '.po')),
				gettextParser.po.compile(parsedPot)
			);

			cb();
		}, function (err) {
			if (err)
				grunt.fail.fatal("generate_test_files error: " + util.inspect(err));
			done();
		});
	});

	grunt.registerTask('default', ['jsxgettext:generate', 'generate_test_files']);
};
