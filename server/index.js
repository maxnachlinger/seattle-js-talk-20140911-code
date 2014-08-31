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
	method: 'GET',
	path: '/',
	handler: function (request, reply) {
		reply.view('index', {title: "Test App: " + request.plugins.l8n.gettext("Log in")});
	}
});

server.route({
	method: 'GET',
	path: '/css/{path*}',
	handler: {
		directory: {
			path: path.join(__dirname, '/public/css'),
			lookupCompressed: true,
			listing: false,
			index: true
		}
	},
	config: {
		cache: {
			expiresIn: 30 * 86400000 // 30 days
		}
	}
});

server.pack.register([{
	plugin: require('good')
}, {
	plugin: require('l8n-gettext').hapiJsPlugin,
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
