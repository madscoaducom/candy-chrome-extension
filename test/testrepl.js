#!/home/mfu/work/projects/node.js/node-v0.6.9/local/bin/node
var myrepl = require("repl").start();
var modules = {jQuery: '$', underscore: '_'}; 
for (var mod in modules) { 
  myrepl.context[modules[mod]] = require(mod); 
}
