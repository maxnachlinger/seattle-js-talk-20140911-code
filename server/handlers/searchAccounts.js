var _ = require('lodash');
var Boom = require('boom');
var accounts = require('../data/accounts');
var JSONStream = require('JSONStream');
var stream = require('stream');

module.exports = function (request, reply) {
	reply(
		accounts.search(request.query.search)
			.on('error', Boom.badImplementation)
			.pipe(JSONStream.stringify())
			.pipe(new stream.PassThrough())
	).header('Content-Type', 'application/json');
};
