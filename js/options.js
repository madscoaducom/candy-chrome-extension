// Saves options to localStorage.
function save_options() {
  var chat_name = $("#chat_name").val();
  var chat_url = $("#chat_url").val();
  localStorage["chat_name"] = chat_name;
  localStorage["chat_url"] = chat_url;

  // Update status to let user know options were saved.
  var status = $("#status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var chat_name = localStorage["chat_name"];
  var chat_url = localStorage["chat_url"];
  if (!chat_url) { chat_url = "http://projects.koeniglich.ch/candy/"}

  if (chat_name) {
    $("#chat_name").val(chat_name);
  }
  if (chat_url) {
    $("#chat_url").val(chat_url);
  }
}
