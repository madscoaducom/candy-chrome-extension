var assert = require('assert');
var fs = require('fs');

var jsdom = require('jsdom').jsdom;
var window = jsdom().createWindow();

fs.readFile('./js/inject.js', 'utf8', function testInject(err, code) {
  if (err) throw err;

  eval(code);

});
