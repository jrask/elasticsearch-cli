/**
 * Created with IntelliJ IDEA.
 * User: jrask
 * Date: 28/01/14
 * Time: 21:08
 * To change this template use File | Settings | File Templates.
 */

var Table = require('cli-table');




var table = function(headers) {
    return {

        rows:[],



        addRow : function (row) {
            this.rows.push(row)

        },

        print : function() {

           //var bla = [this.rows.length]
           var max = [this.rows[0].length]
           for(var i = 0; i < this.rows.length;i++){

               var row = this.rows[i]
               for(var ii = 0; ii < row.length;ii++) {
                    max[ii] = Math.max(max[ii] || 0,row[ii].length)
               }
           }
            max = max.map(function(value) {
                value =  (value + 5)
                return Math.min(100,value)
            });

            var t = new Table({
                head: headers
                , colWidths: max
            })

            this.rows.forEach(function(row){
                t.push(row)
            })

            console.log('\n' + t.toString() + "\n")
        }
    }
}

width = function(headers) {

    var array = []
    headers.forEach(function(h){
        array.push(30)
    })
    return array;
}

module.exports.formatter = table
