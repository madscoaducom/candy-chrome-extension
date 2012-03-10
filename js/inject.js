var ce = {};

(function() {
    var status = {};
    var timer = null;

    var update = function() {
        var updated = {};
        $('li[class^=roomtype-]').each(function(i) {
            var room = $(this).children('.label').text();
            var unread = parseInt($(this).children('.unread').text());
            unread = isNaN(unread) ? 0 : unread;
            if (status[room] === undefined) { 
              status[room] = 0; 
            }
            if (status[room] !== unread ) {
                status[room] = unread;
                if (unread > 0) {
                    updated[room] = unread;
                }
            }
        });
        return updated;
    }; 
    
    var totalUnread = function() {
        var total = 0;
        $.each(status, function(i, val) {
            total += val;
        });
        return total;
    };
    
    function checkForUnreads() {
      var updated = update();
      if (! $.isEmptyObject(updated)) {
        chrome.extension.sendRequest({message: 'UnreadChatUpdate', values: {total: totalUnread(), updates: updated}}, function(result){});
      }
    }

    // "export" the defintion from the closure scope
    this.status = status;
    this.update = update;
    this.totalUnread = totalUnread;
    this.checkForUnreads = checkForUnreads;
}).apply(ce);

if (ce.timer) {
  console.log('Clearing timer with id: ' + ce.timer);
  clearInterval(ce.timer);
}
ce.timer = setInterval('ce.checkForUnreads()',2000);
