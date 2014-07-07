
var cli = require('./cli')
var extend = require('util')._extend;
var _s = require('underscore.string');
//
// wraps the specified index or alias
//
//


var _err = function(err) {
    if(err)
        cli.context._print(err.message)
    console.log('\n')
}

var _print = function(msg) {
      cli.log(msg)
}


function isEmpty(obj) {

    cnt = 0;
    for (var key in obj) {
        cnt++
        if (hasOwnProperty.call(obj, key))
            return false;
    }
    if(cnt == 0) {
        return true
    }
    return false;
}

var indexes = function() {

    return {

        functions : {

            searchAll: function(q,collector) {
                cli.context.indice._all.search(q,collector)
            },

            list: function(err,resp) {
                if(err)
                    cli.log(err)
                resp.forEach( function(index) {
                    cli.log(index.name)
                })
            },
            count: function(err,resp) {
                if(err)
                    cli.log(err)
                else
                    cli.log('count =  '+ resp.length)
            }
        },


        count: function() {
            this.list(function(err,indices) {
                if(err)
                    out.print(err)
                else
                    out.print('Count ' + indices.length)
            })
        },

        list: function(callback) {
            if(!callback)
                callback = this.functions.list

            cli.client.indices.getAliases(function(err,resp) {
                if(err)
                    return callback(err,null)
                indexes = []
                for(var indice in resp){
                    var i = new index(indice)
                    indexes.push(i)
                    for(var alias in resp[indice].aliases)
                        i.aliases.push(alias)
                }
                callback(null,indexes)
            })
        },


        alias: function() {
            if (arguments.length < 2)
                return cli.out.print("Must have at least alias and index")
            var params = {
                name:arguments[0],
                index:arguments[1]
            }
            cli.client.indices.putAlias(params).then(_print,_err)
        },

        delete: function(indexName) {
            cli.client.indices.delete({index:indexName}).then(function(body){
                cli.log(body)
                delete cli.context.indice[_s.camelize(indexName).replace(/\./g, '_')]
            },function(err) {
                cli.log(err)
            })
        },

        create: function(indexName) {
            cli.client.indices.create({index:indexName}).then(function(body){
                cli.log(body)
                cli.context.indice[_s.camelize(indexName).replace(/\./g, '_')] = new index(indexName)
            },function(err) {
                cli.log(err)
            })
        },

        loadIndices: function () {
            this.list(function(err,indices) {
                indices.forEach(function (indice) {
                    cli.context.indice[_s.camelize(indice.name).replace(/\./g, '_')] = indice
                    indice.aliases.forEach(function(alias) {
                        cli.context.alias[alias] = new index(alias)
                    })
                })
                cli.context.indice._all = new index('_all')
                cli.context._search = function(q,collector) {
                    return cli.context.indice._all.search(q,collector)
                }
                cli.context._next = function(q,collector) {
                    return cli.context.indice._all.next(q,collector)
                }
            })
        }
    }

}


var query = function(query) {
    return {
      }

}


var index = function(index) {




    return {

        _context : {

            params : {
                index:index,
                from:0,
                size:10,
                q:'*:*'
            },


            inc : function() {
                this.params.from = this.params.from + this.params.size
            },

            doSearch : function(params,callback) {
                cli.client.search(params,function(err,body) {

                    if(callback)
                        callback(err,body)
                    else if (err)
                        cli.out.print(err)
                    else
                        cli.out.print(body)

                })
            }
        },

        aliases:[],

        name:index,

        matchAll:function() {

           return this.search('*:*')
        },


        get:function(id) {
            cli.client.get({id:id,index:this.name,type:'_all'}).then(cli.log,_err)
        },

        search:function(p1,p2) {

            var q
            var collector

            if(p1) {
                if(typeof p1 == 'string')
                    this._context.params.q = p1;
                else
                    collector = p1
            }
            if(p2)
                collector = p2


            if(collector)
                this._context.collector = collector
            else
                this._context.collector = undefined

            var params = extend({}, this._context.params);
            //params.q = q
            cli.logger.info(params)



            var promise = cli.client.search(params)

            if(this._context.collector) {
                return promise.then(this._context.collector,_err)
            }

            var obj =  {

                collect:function(funcOk,funcErr) {
                    if(!funcErr)
                        funcErr = _err

                    return promise.then(funcOk,funcErr)
                }
            }
            obj.inspect = function() {
                return "I am a filter, please invoke .filter(_aFilter)\n" + this.collect(cli.context._total)
            }
            return obj
        },


        next: function() {
            this._context.inc()
            //var params = extend({}, this._context.params);
            return this.search(this._context.collector)
        },

        delete: function() {
            cli.client.indices.delete({index:this.name}).then(function(body){
               cli.log(body)
                delete cli.context.indice[_s.camelize(this.name).replace(/\./g, '_')]
            },function(err) {
                cli.log(err)
            })
        }
    }

}


module.exports.index = index
module.exports.indexes = indexes;
