var _ = require('lodash');
var accounts = require('../data/accounts');

module.exports = function (request, reply) {
	var account = accounts.get(request.params.accountId);
	account.ownerId = request.payload.ownerId;
	accounts.set(account);
	reply();
};
