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

function injectContent(tabId){
  chrome.tabs.executeScript(tabId, {file:'lib/jquery.min.js'});
  chrome.tabs.executeScript(tabId, {file:'js/inject.js'});
}

function openChat() {
  showActive();
  chrome.tabs.create({url: get_options().chat_url}, function (tab) {
    // Login, setting nickname from options
    globalTabId = tab.id;
    var chat_name = get_options().chat_name;
    chrome.tabs.executeScript(tab.id, {code:"document.getElementById('username').value = '" + chat_name + "'; document.getElementsByTagName('input')[2].click();"});
    injectContent(tab.id);
  });
}

function focusChat(tab) {
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

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  if (request.message == 'UnreadChatUpdate') {
    if (request.values.total > 0) {
      update = request.values.updates;
      chrome.browserAction.setBadgeText({text: '' + request.values.total});
      var notification = webkitNotifications.createHTMLNotification('notification.html');
      notification.show();
    } else {
      chrome.browserAction.setBadgeText({text: ''});
    }
    sendResponse();
  }
});

function getUpdate() {
  return update;
}

function clearUpdate() {
  update = {};
}

getTab(get_options().chat_url, function(tab){ globalTabId = tab.id; injectContent(tab.id); showActive(); }, function(){ showInactive(); globalTabId = null; });
