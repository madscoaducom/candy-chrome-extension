var ce = {};

(function() {
    var status = {};

    var update = function() {
        var updated = {};
        $('li[class^=roomtype-]').each(function(i) {
            var room = $(this).children('.label').text();
            var unread = parseInt($(this).children('.unread').text());
            unread = isNaN(unread) ? 0 : unread;
            if (status[room] && status[room] !== unread ) {
                status[room] = unread;
                updated[room] = unread;
            } else {
                status[room] = unread;
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
      var updated = ce.update();
      if (! $.isEmptyObject(updated)) {
        console.log('Updated: ' + JSON.stringify(updated));
        chrome.extension.sendRequest({message: 'UnreadChatUpdate', values: ce.totalUnread()});
      }
      setTimeout('ce.checkForUnreads()',2000);
    }
    // "export" the defintion from the closure scope
    this.status = status;
    this.update = update;
    this.totalUnread = totalUnread;
    this.checkForUnreads = checkForUnreads;
}).apply(ce);

setTimeout('ce.checkForUnreads()',2000);
