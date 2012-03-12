var assert = require('assert');
var rooms = require('./lib/rooms');
var scrape = require('../src/scrape');
var sinon = require('sinon');
var util = require('./lib/test-util');

var jsdom = require('jsdom').jsdom;
var testWindow = jsdom().createWindow();
var $ = require('jQuery').create(testWindow);
var _ = require('underscore');

function assertEmpty(o1) {
  assert.deepEqual(o1, {});
}

function assertNotEmpty(o1) {
  assert.notDeepEqual(o1, {});
}


suite('Scrape', function ScrapeSuite () {

  suite('baseline', function getStatusSuite () {

    test('test suite compiles', function(){
      assert.ok(true);
    });

    test('jQuery load', function () {
      $('body').html('<p>Hello world</p>');
    });

    test('rooms load', function () {
      assert.equal(typeof(rooms.rooms2HTML), "function");
      assert.equal(typeof(rooms.emptyRooms), "function");
    });

  });

  suite('getStatus()', function getStatusSuite () {

    test('is a function', function () {
      assert.ok(scrape);
      assert.equal(typeof(scrape.getStatus), "function");
    });

    test('returns {} for all empty rooms', function () {
      $('body').html(rooms.rooms2HTML(rooms.emptyRooms));
      assertEmpty(scrape.getStatus($));
    });

    test('returns something when unread in room(s)', function () {
      $('body').html(rooms.rooms2HTML(rooms.withUnread(5).rooms));
      assertNotEmpty(scrape.getStatus($));
    });

    test('returns correct number of unreads', function () {
      $('body').html(rooms.rooms2HTML(rooms.withUnread(8).rooms));
      var unread = _.reduce(scrape.getStatus($),
        function (memo, x) { return memo + x; },
        0);
      assert.strictEqual(unread, 8);
    });

  });

  suite('getChanges()', function getChangesSuite () {

    test('returns {} when given empty states', function () {
      assertEmpty(scrape.getChanges({},{}));
    });

    test('returns {} when given identical states', function () {
      assertEmpty(scrape.getChanges({'1':1},{'1':1}));
      assertEmpty(scrape.getChanges(
            {'1':1,'2':1, '3':5},
            {'1':1,'2':1, '3':5}));
    });

    test('returns non-empty when given combinations of {} and {non-empty}', function () {
      assertNotEmpty(scrape.getChanges({},{'1':1}));
      assertNotEmpty(scrape.getChanges({'1':1},{}));
      assertNotEmpty(scrape.getChanges({'1':1},{'2':1}));
      assertNotEmpty(scrape.getChanges({'1':1},{'1':1,'2':1}));
      assertNotEmpty(scrape.getChanges({'1':1},{'1':0}));
    });

    test('returns correct change', function () {
      assert.deepEqual(scrape.getChanges({},{'1':1}), {'1': 1});
      assert.deepEqual(scrape.getChanges({'2':0,'1':1},{'1':1,'2':3}), {'2':3});
      assert.deepEqual(scrape.getChanges({'2':3,'1':1},{'1':1,'2':0}), {'2':-3});
      assert.deepEqual(scrape.getChanges({'2':3,'1':1},{'1':2,'2':0}), {'1':1,'2':-3});
    });

  });

  suite('totalUnread()', function totalUnreadSuite () {

    test('is a function', function () {
      assert.equal(typeof(scrape.totalUnread), "function");
    });

    test('return 0 when given {}', function () {
      assert.equal(scrape.totalUnread({}), 0);
    });

    test('return correct sum for given {non-empty}', function () {
      assert.equal(scrape.totalUnread({'1': 0, '2': 0, '3': 0}), 0);
      assert.equal(scrape.totalUnread({'1': 0, '2': 1, '3': 0}), 1);
      assert.equal(scrape.totalUnread({'1': 4, '2': 2, '3': 0}), 6);
    });

  });

  suite('notifyTotalIfChanged()', function totalUnreadSuite () {

    var notifier = null;

    setup(function () {
      notifier = sinon.stub();
    });

    test('is a function', function () {
      assert.equal(typeof(scrape.notifyTotalIfChanged), "function");
    });

    test('no change => no message sent', function () {
      scrape.notifyTotalIfChanged(0, 0, notifier);
      assert.equal(notifier.callCount, 0);
      scrape.notifyTotalIfChanged(4, 4, notifier);
      assert.equal(notifier.callCount, 0);
    });

    test('1 change => 1 message sent', function () {
      scrape.notifyTotalIfChanged(0, 1, notifier);
      assert.equal(notifier.callCount, 1);
    });

    test('>1 change => 1 message sent', function () {
      scrape.notifyTotalIfChanged(0, 6, notifier);
      assert.equal(notifier.callCount, 1);
      assert.equal(notifier.getCall(0).args[0].message, 'TotalUnreadChanged');
      assert.equal(notifier.getCall(0).args[0].values.total, 6);
    });

  });

  suite('notifyUnreadIfChanged()', function totalUnreadSuite () {

    var notifier = null;

    setup(function () {
      notifier = sinon.stub();
    });

    test('is a function', function () {
      assert.equal(typeof(scrape.notifyUnreadIfChanged), "function");
    });

    test('no change => no message sent', function () {
      scrape.notifyUnreadIfChanged({}, {}, notifier);
      assert.equal(notifier.callCount, 0);
    });

    test('1 change => 1 message sent', function () {
      scrape.notifyUnreadIfChanged({}, {'1': 1}, notifier);
      assert.equal(notifier.callCount, 1);
    });

    test('>1 change => 1 message sent', function () {
      scrape.notifyUnreadIfChanged({}, {'1': 1, '2': 4, '5': 1}, notifier);
      assert.equal(notifier.callCount, 1);
    });

    test('given new unreads message contains correct content', function () {
      scrape.notifyUnreadIfChanged({}, {'1': 1, '2': 4, '5': 1}, notifier);
      assert.equal(notifier.getCall(0).args[0].message, 'UnreadMessages');
      assert.deepEqual(notifier.getCall(0).args[0].values.changed, {'1': 1, '2': 4, '5': 1});
    });

    test('given new unreads message contains correct content', function () {
      scrape.notifyUnreadIfChanged({'1': 1, '2': 4, '5': 1},{'1': 2, '2': 4, '5': 3}, notifier);
      assert.equal(notifier.getCall(0).args[0].message, 'UnreadMessages');
      assert.deepEqual(notifier.getCall(0).args[0].values.changed, {'1': 1, '5': 2});
    });

    test('given less unreads no messages is sent', function () {
      scrape.notifyUnreadIfChanged({'1': 1, '2': 4, '5': 1},{'1': 0, '2': 4, '5': 1}, notifier);
      assert.equal(notifier.callCount, 0);
    });

  });

});
