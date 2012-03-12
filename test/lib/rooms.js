var util = require('./test-util');
var _ = require('underscore');

function rooms2HTML (rooms) {
  var t = _.template('<li class="roomtype-<%= type %>"><a class="label"><%= room %></a><small class="unread"><%= unread %></small></li>');
  return _.reduce(rooms, function (memo, r) {
    return memo + t({room: r.room, type: r.type, unread: (r.unread === 0 ? "" : r.unread)});
  }, "");
}
exports.rooms2HTML = rooms2HTML;

function emptyRooms () {
  var rooms = [
    {room: 'ROOMA', type: 'groupchat', unread: 0},
    {room: 'ROOMB', type: 'groupchat', unread: 0},
    {room: 'DIRECTA', type: 'chat', unread: 0}];
  return rooms;
}
exports.emptyRooms = emptyRooms;

function withUnread (n) {
  var rooms = emptyRooms();
  var i = util.random(rooms.length);
  rooms[i].unread += n;
  return {changed: i, rooms: rooms};
}
exports.withUnread = withUnread;

