function random (max) {
  return Math.floor(Math.random() * max);
}
exports.random = random;

function logO (o) {
  console.log(JSON.stringify(o));
}
exports.logO = logO;

function stringO(o) {
  return JSON.stringify(o);
}
exports.stringO = stringO;

function key (O) {
  for (var k in O ) { return k; }
}
exports.key = key;

function val (O) {
  return O[key(O)];
}
exports.val = val;

