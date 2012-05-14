var globalTabId = null;

function showInactive() {
  chrome.browserAction.setIcon({path: 'img/chat-grey.png'});
  chrome.browserAction.setBadgeText({text: '?'});
  chrome.browserAction.setBadgeBackgroundColor({color: [224,224,224,255]});
}

function showActive() {
  chrome.browserAction.setIcon({path: 'img/chat.png'});
  chrome.browserAction.setBadgeText({text: ''});
  chrome.browserAction.setBadgeBackgroundColor({color: [255,0,0,255]});
}

function getTab(tabUrl, foundCallback, notFoundCallback) {
  chrome.tabs.query({'url': tabUrl}, function(tabs) {
    if (tabs.length === 0) {
      notFoundCallback();
    }
    if (tabs.length === 1) {
      foundCallback(tabs[0]);
    }
    if (tabs.length > 1) {
      console.log('Found multiple open tabs with url: "' + tabUrl + '"');
    }
  });
}

function injectContent (tabId) {
  chrome.tabs.executeScript(tabId, {file:'js/inject.js'});
}

function login (tabId) {
  // Supports nickname for now
  chrome.tabs.executeScript(tabId, {code:"document.getElementById('username').value = '" + get_options().chat_name + "'; document.getElementsByTagName('input')[2].click();"});
}

function openChat () {
  showActive();
  chrome.tabs.create({url: get_options().chat_url}, function (tab) {
    globalTabId = tab.id;
    login(tab.id);
    injectContent(tab.id);
  });
}

function focusChat (tab) {
  if (tab) {
    chrome.tabs.update(tab.id, {selected: true});
  }
}

chrome.browserAction.onClicked.addListener(function(tab) {
   getTab(get_options().chat_url, focusChat, openChat);
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  if (tabId === globalTabId) {
    globalTabId = null;
    showInactive();
  }
});

var update = {};

chrome.extension.onRequest.addListener(function(request, sender) {
  if (request.message == 'ReLogin') {
    login(globalTabId);
  }
  if (request.message == 'TotalUnreadChanged') {
    if (request.values.total > 0) {
      chrome.browserAction.setBadgeText({text: '' + request.values.total});
    } else {
      chrome.browserAction.setBadgeText({text: ''});
    }
  }
  if (request.message == 'UnreadMessages') {
    update = request.values.changed;
    if (get_options().show_notifications) {
      var notification = webkitNotifications.createHTMLNotification('notification.html');
      notification.onclick = function() { window.focus(); this.cancel(); };
      notification.show();
    }
  }
});

function getUpdate() {
  return update;
}

function clearUpdate() {
  update = {};
}

getTab(get_options().chat_url, function(tab){ globalTabId = tab.id; injectContent(tab.id); showActive(); }, function(){ showInactive(); globalTabId = null; });

