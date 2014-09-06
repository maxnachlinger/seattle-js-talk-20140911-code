var test = require('tape');

test('Returns best supported language based on user preferences', function(t) {
	var supportedLanguages = [ 'de', 'es', 'fr', 'it', 'ja', 'pt-br', 'zh-cn', 'zh-tw', 'en' ];

	var headerValue = "zh-TW,zh-CN;q=0.2,zh;q=0.8,en-US;q=0.6,en;q=0.4";
	var expected = 'zh-tw';
	var selectedLanguage = getHeaderLocale(headerValue, supportedLanguages);
	t.equal(selectedLanguage, expected, "If the user's first choice is supported, it will be returned.");

	headerValue = "test0,test1;q=0.8,zh-CN;q=0.2,en-US;q=0.6,en;q=0.4";
	expected = 'zh-cn';
	selectedLanguage = getHeaderLocale(headerValue, supportedLanguages);
	t.equal(selectedLanguage, expected, "If the user's third first choice is supported, it will be returned.");

	headerValue = "test0,test1;q=0.8,test2;q=0.6,test3;q=0.4,zh-TW;q=0.2";
	expected = 'zh-tw';
	selectedLanguage = getHeaderLocale(headerValue, supportedLanguages);
	t.equal(selectedLanguage, expected, "If only the user's last choice is supported, it will be returned.");
	
	t.end();
});

function getHeaderLocale(headerValue, supportedLocales) {
	var preferredLanguage = headerValue.split(',').map(function (localePref) {
		var a = localePref.split(';');
		return {
			locale: a[0].toLowerCase(),
			weight: (a[1] || 'q=1.0').split('=').pop()
		};
	// sort by q rank
	}).sort(function (pref1, pref2) {
		if (pref1.q > pref2.q) return 1;
		if (pref1.q < pref2.q) return -1;
		return 0;
	// limit to supported languages
	}).filter(function (pref) {
		return ~supportedLocales.indexOf(pref.locale);
	}).shift(); // chose the best available

	return preferredLanguage ? preferredLanguage.locale : null;
}
