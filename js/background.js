function getTab(tabUrl, callback) {
  chrome.tabs.getAllInWindow(undefined, function(tabs) {
    for (var i = 0, tab; tab = tabs[i]; i++) {
      if (tab.url && tab.url == tabUrl) {
        callback(tab);
      }
    }
    callback(null);
  });
}

function openChat() {
  getTab(localStorage["chat_url"], function(tab) {
    if (tab != null) {
      chrome.tabs.update(tab.id, {selected: true});
      return;
    }
    chrome.browserAction.setIcon({path:"img/chat.png"});
    chrome.tabs.create({url: localStorage["chat_url"]}, function (tab) {
      // Login, setting nickname from options
      var chat_name = localStorage["chat_name"];
      chrome.tabs.executeScript(tab.id, {code:"document.getElementById('username').value = '" + chat_name + "'; document.getElementsByTagName('input')[2].click();"});
    });
  });
}

chrome.browserAction.onClicked.addListener(function(tab) {
  openChat();
});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  if (request.message == 'UnreadChatUpdate') {
    if (request.values > 0) {
      chrome.browserAction.setBadgeText({text: '' + request.values});
    } else {
      chrome.browserAction.setBadgeText({text: ''});
    }
  } else if (request.message == 'NewChatMessage') {
    var args = request.values;
    console.log('GOT EVENT:' + args.nick + '(' + args.roomJid + '): ' + args.message); 
  }
});

