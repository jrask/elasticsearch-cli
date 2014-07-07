var cli = require('./cli')
var prettyjson = require('prettyjson')
var table = require("./tableformatter").formatter

cli.context._total = function(resp) {
    cli.log({total:resp.hits.total})
}

cli.context._print = function(resp) {
    cli.log(resp);
}

cli.context._each = function(resp) {
    var cnt = 1
    resp.hits.hits.forEach(function(hit) {
        var str = '# ' + cnt + ' of ' + resp.hits.total
        console.log(str.blue)
        cli.logJson(hit);
        console.log('')
        cnt++
        setIds(hit)
    })
}


function setIds(hit) {
    cli.context._ids['_' + hit._id] = {
        inspect : function() {
            cli.client.get({id:hit._id,index:hit._index,type:'_all'}).then(cli.logJson,cli.log)
            return "Fetching entry..."
        }
    }

}

/*
 Creates a function that can operate over a variable number of properties
 in the hits[] array

 var filter = _eachProp('_source.message','_source.type')

 */
cli.context._eachProp = function() {

    var args = Array.prototype.splice.call(arguments, 0);

    return function(resp) {

        try {
            var headers = ['_id']
            args.forEach(function(arg) {
                headers.push(arg)
            })

            var output = new table(headers)

            resp.hits.hits.forEach(function(hit) {

                var id = {"_id": hit._id}

                var row = []
                row.push(hit._id)
                args.forEach(function (property) {
                    var value = getDescendantProp(hit,property)
                    if(!value)
                        value = '-'
                    if(typeof value == 'string')
                        row.push(value)
                    else
                        row.push(JSON.stringify(value))
                })
                output.addRow(row)
                setIds(hit)
            })
            output.print()

        } catch(err) {
            console.log(err)
        }
    }

}

function getDescendantProp(obj, desc) {
    var arr = desc.split(".");
    while(arr.length && (obj = obj[arr.shift()]));
    return obj;

}