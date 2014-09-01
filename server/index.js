var path = require('path');
var Hapi = require('hapi');
var Joi = require('joi');
var config = require('./config');

var server = new Hapi.Server('0.0.0.0', process.env.PORT || config.port, {
	views: {
		engines: {
			html: require('handlebars')
		},
		path: path.join(__dirname, 'views/templates'),
		partialsPath: path.join(__dirname, 'views/partials')
	}
});

server.route({
	path: '/public/{path*}',
	method: 'GET',
	handler: {
		directory: {
			path: './public',
			listing: false,
			index: false
		}
	}
});

server.route({
	method: 'GET',
	path: '/',
	handler: function (request, reply) {
		reply.view('index', {title: server.methods.gettext("Log in")});
	}
});

server.pack.register([{
	plugin: require('good')
}, {
	plugin: require('l10n-gettext').hapiJsPlugin,
	options: {
		cookieName: '_locale',
		poDirectory: path.join(__dirname, 'locales'),
		defaultLocale: 'en'
	}
}], function (err) {
	if (err) throw err;
	server.start(function () {
		server.log('info', 'Server running at: ' + server.info.uri);
	});
});
