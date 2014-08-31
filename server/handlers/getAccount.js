var _ = require('lodash');
var accounts = require('../data/accounts');

module.exports = function (request, reply) {
	reply(accounts.get(request.params.accountId));
};
