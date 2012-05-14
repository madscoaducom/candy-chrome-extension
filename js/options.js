function get_options() {

  var options = JSON.parse(localStorage['options'] === undefined ? '{}' : localStorage['options']);

  if (options.chat_url === undefined) { 
    options.chat_url = "http://dev.openflex.net/candy/";
  }

  if (options.show_notifications === undefined) { 
    options.show_notifications = true;
  }

  return options;
}

function save_options() {
  var options = _.reduce($('.option'), 
      function (memo, x) { 
        if (x.type === "checkbox") {
          memo[x.id] = x.checked; 
        } else {
          memo[x.id] = x.value; 
        }
        return memo; 
      }, {});

  localStorage['options'] = JSON.stringify(options);
  chrome.extension.getBackgroundPage().options = options;

  $('#status').show().fadeOut(1500);

  return false; // stop further propogating of submit event
}

function restore_options() {

  var options = get_options();

  _.each(options, function (val, key) {
    $('#' + key).val(val);
    if (val === true) {
      $('#' + key).prop('checked', true);
    }
  });
}
