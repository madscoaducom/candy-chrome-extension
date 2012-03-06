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
      console.log('Found multiple open tabs');
    }
  });
}

function injectContent(tabId){
  chrome.tabs.executeScript(tabId, {file:'lib/jquery.min.js'});
  chrome.tabs.executeScript(tabId, {file:'js/inject.js'});
}

function openChat() {
  showActive();
  chrome.tabs.create({url: localStorage["chat_url"]}, function (tab) {
    // Login, setting nickname from options
    globalTabId = tab.id;
    var chat_name = localStorage["chat_name"];
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
   getTab(localStorage['chat_url'], focusChat, openChat);
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  if (tabId === globalTabId) {
    globalTabId = null;
    showInactive();
  }
});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  if (request.message == 'UnreadChatUpdate') {
    if (request.values > 0) {
      chrome.browserAction.setBadgeText({text: '' + request.values});
    } else {
      chrome.browserAction.setBadgeText({text: ''});
    }
  }
});

getTab(localStorage['chat_url'], function(tab){ globalTabId = tab.id; injectContent(tab.id); showActive(); }, function(){ showInactive(); globalTabId = null; });
