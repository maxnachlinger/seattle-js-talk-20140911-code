var test = require('tape');

function getHeaderLocale(headerValue, supportedLocales) {
	if (!headerValue) return;

	var preferredLanguage = headerValue.split(',').map(function (localePref) {
		var a = localePref.split(';');
		return {
			locale: a[0].toLowerCase(),
			q: parseFloat((a[1] || 'q=1.0').split('=').pop())
		};
	}).sort(function (pref1, pref2) { // sort by q rank desc
		if (pref1.q < pref2.q) return 1;
		if (pref1.q > pref2.q) return -1;
		return 0;
	}).filter(function (pref) { // limit to supported languages
		return ~supportedLocales.indexOf(pref.locale);
	}).shift(); // chose the best available

	return preferredLanguage ? preferredLanguage.locale : null;
}

test('Returns best supported language based on user preferences', function(t) {
	var supportedLanguages = [ 'de', 'es', 'fr', 'it', 'ja', 'pt-br', 'zh-cn', 'zh-tw', 'en' ];
	var headerValue, expected, selectedLanguage;

	t.test("If the user's first choice is supported, it will be returned.", function(t) {
		headerValue = "zh-TW,zh-CN;q=0.2,zh;q=0.8,en-US;q=0.6,en;q=0.4";
		expected = 'zh-tw';
		selectedLanguage = getHeaderLocale(headerValue, supportedLanguages);
		t.equal(selectedLanguage, expected);
		t.end();
	});

	t.test("If the user's third choice is supported, it will be returned.", function(t) {
		headerValue = "test0,test1;q=0.8,en-US;q=0.6,en;q=0.4,zh-tw;q=0.2";
		expected = 'en';
		selectedLanguage = getHeaderLocale(headerValue, supportedLanguages);
		t.equal(selectedLanguage, expected, "If the user's third first choice is supported, it will be returned.");
		t.end();
	});

	t.test("If only the user's last choice is supported, it will be returned.", function(t) {
		headerValue = "test0,test1;q=0.8,test2;q=0.6,test3;q=0.4,zh-TW;q=0.2";
		expected = 'zh-tw';
		selectedLanguage = getHeaderLocale(headerValue, supportedLanguages);
		t.equal(selectedLanguage, expected);
		t.end();
	});
});
