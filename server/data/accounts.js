var _ = require('lodash');
var util = require('util');
var stream = require('stream');

var adjectives = require('./adjectives.json');
var firstNames = require('./usFirstNames.json');
var lastNames = require('./uslastNames.json');

var adjectivesLength = adjectives.length - 1;
var firstNamesLength = firstNames.length - 1;
var lastNamesLength = lastNames.length - 1;

var accountId = 1;
var userId = 1;

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomValue(arr, len) {
	return arr[getRandomInt(0, len)];
}

var accounts = _.map(_.range(0, 100), function () {
	var adjective = getRandomValue(adjectives, adjectivesLength) + ' and ' + getRandomValue(adjectives, adjectivesLength);
	var domainName = adjective.toLowerCase().replace(/\s+/g, '-') + '.com';

	var amtUsers = getRandomInt(1, 15);
	var users = _.map(_.range(0, amtUsers), makeAdmin(domainName));
	var owner = users[getRandomInt(0, amtUsers - 1)];
	var name = adjective + ' Inc.';
	var id = ++accountId;

	return {
		id: id,
		name: name,
		domainName: domainName,
		owner: owner.name + ' <' + owner.email + '>',
		ownerId: owner.id,
		users: users,
		$search: (name + ' ' + domainName + ' ' + id.toString()).toLowerCase()
	};
});

function makeAdmin(domainName) {
	return function () {
		var name = getRandomValue(firstNames, firstNamesLength) + ' ' + getRandomValue(lastNames, lastNamesLength);
		return {
			id: ++userId,
			email: name.replace(' ', '.').toLowerCase() + "@" + domainName,
			name: name
		};
	};
}

function ArrayObjectReadStream(data) {
	var self = this;
	stream.Readable.call(self, { objectMode: true });

	self._read = function () {
		data.forEach(function(e) { self.push(e); });
		self.push(null);
	};
}
util.inherits(ArrayObjectReadStream, stream.Readable);


module.exports = {
	get: function (id) {
		if (!id) return accounts;
		return _.find(accounts, {id: id});
	},
	set: function (account) {
		var idx = _.findIndex(accounts, {id: account.id});
		var newOwner = _.find(accounts[idx].users, {id: account.ownerId});

		accounts[idx] = account;
		accounts[idx].owner = newOwner.name + ' <' + newOwner.email + '>';
	},
	search: function (search) {
		if (!search) return new ArrayObjectReadStream(accounts);

		return new ArrayObjectReadStream(
			_.filter(accounts, function (account) {
				return ~account.$search.indexOf(search.toLowerCase());
			})
		);
	}
};
