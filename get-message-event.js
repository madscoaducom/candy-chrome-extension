Candy.View.Event.Message.onShow = function(args) { 
  console.log('GOT EVENT:' + args.nick + '(' + args.roomJid + '): ' + args.message); 
  chrome.extension.sendRequest({message: 'NewChatMessage', values: args});
  return true;
};
