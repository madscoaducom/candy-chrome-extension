var _ = require('underscore');

function getStatus (jQ) {
  var st = _.reduce(jQ('li[class^=roomtype-]'),
      function (memo, x) { 
        var room = jQ(x).children('.label').text();
        var unread = parseInt(jQ(x).children('.unread').text());
        unread = isNaN(unread) ? 0 : unread;
        memo[room] = unread;
        return memo;
      }, 
      {});
  return st;
}
module.exports.getStatus = getStatus;

function getChanges (previousState, currentState) {
  var updated = _.clone(currentState);
  _.each(previousState, function (v, k) {
    if (k in updated) { 
      if (updated[k] === v) { 
        delete updated[k]; 
      } else {
        updated[k] -= v;
      }
    } else {
      updated[k] = v;
    }
  });
  return updated;
}
module.exports.getChanges = getChanges;

function _sum (a, b) {
  return a + b;
}

function totalUnread (state) {
  return  _.reduce(_.values(state), _sum, 0);
};
module.exports.totalUnread = totalUnread;
    
function notifyTotalIfChanged(previousTotal, currentTotal, notify) {
  if ( currentTotal !== previousTotal ) {
    notify({message: 'TotalUnreadChanged', values: {total: currentTotal}});
  }
  return currentTotal;
}
module.exports.notifyTotalIfChanged = notifyTotalIfChanged;
    
function notifyUnreadIfChanged(previousState, currentState, notify) {
  var changes = getChanges(previousState, currentState);
  _.each(changes, function (v, k) { v < 0 ? delete changes[k] : null; });
  if ( ! _.isEmpty(changes) ) {
    notify({message: 'UnreadMessages', values: { changed: changes}});
  }
  return currentState;
}
module.exports.notifyUnreadIfChanged = notifyUnreadIfChanged;

function setup () {
  var timer = null;
  var previousState = {};
  var previousTotal = 0;

  var monitor = function () {
    var currentState = getStatus($);
    var currentTotal = totalUnread(currentState);

    console.log('Total: ' + currentTotal);

    notifyTotalIfChanged(
        previousTotal, 
        currentTotal,
        chrome.extension.sendRequest);

    notifyUnreadIfChanged(
        previousState, 
        currentState,
        chrome.extension.sendRequest);

    previousTotal = currentTotal;
    previousState = currentState;
  }

  if (timer) {
    console.log('Clearing timer with id: ' + timer);
    clearInterval(timer);
    timer = null;
  }

  timer = setInterval(monitor, 2000);
}
module.exports.setup = setup;

