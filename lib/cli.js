var elasticsearch = require('elasticsearch');
var _s = require('underscore.string');
var index = require('./index')
var repl = require("repl");
var prettyjson = require('prettyjson');
var util = require('util')

var extend = require('util')._extend;






var client = new elasticsearch.Client({
    host: 'localhost' + ':' + 9200
});


var colors = {
    keysColor: 'green',
    dashColor: 'blue',
    stringColor: 'black'
}

var winston = require('winston');


process.on('uncaughtException', function (err) {
    console.log(err.stack || err.message);
});

//
// Configure CLI output on the default logger
//
winston.cli();

//
// Configure CLI on an instance of winston.Logger
//
var logger = new winston.Logger({
    transports: [
        new (winston.transports.Console)()
    ]
});

logger.cli();

module.exports.client = client
module.exports.logger = logger

var wait = '_wait_'


// Hack!
var out = {

    c : {},

    eval : function eval(cmd, context, filename, callback) {
        c = callback;
        if(cmd.indexOf('(>>') == 0)
            cmd = '(indice)'

        realEval(cmd,context,filename, function(v1,v2) {
            if(v2 != wait)
                callback(v1,v2)
        })

    },
    print: function resp(string) {
        c(null, string);
    }
}


var repl = repl.start({
    prompt: 'elasticsearch@localhost:9200> ',
    input: process.stdin,
    output: process.stdout,
    //writer:handler,
    useColors:true

});


var realEval = repl.eval;
repl.eval = out.eval;




repl.context.client = client
repl.context.alias = {}
repl.context.indice = new index.indexes()
repl.context.indice.loadIndices()

//repl.context.index = {}
//repl.context.indice.kibana = kibana


var log = function(json) {
    console.log(prettyjson.render(json));
}

var logJson = function(json) {

    console.log(util.inspect(json, false, 5, true))
}

module.exports.log = log
module.exports.logJson = logJson

module.exports.out = out
module.exports.context = repl.context
module.exports.context._ids = {}

var filters = require('./collectors')

