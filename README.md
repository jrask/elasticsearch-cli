elasticsearch-repl-cli
==========================

## Status

Under development, will never be finished, mainly for personal use

## Goal
Inspired by the Mongo shell, I usually use this to checkout elasticsearch contents. 


###Features

* Autocomplete for indice names, _id´s, functions and filters
* Results printed in JSON or tabular format
* Full repl functionality
* Extensible with custom functions

## Getting started


#####Search all indices with default 'count' filter 

    $elasticsearch@localhost:9200> _search()                     
    info : total: 34     
    
    $elasticsearch@localhost:9200> _search('*:*')  # With query                     
    info : total: 34     
    
    
##### Search and see results with all fields as "raw" JSON output    
    
    elasticsearch@localhost:9200> _search('*:*',_each)                 
    info:     q=*:*, size=10, from=0, index=<index>
    
    # 1 of 34
     { _index: 'logstash-refocus-2013.11.14',
     _type: 'refocus',
     _id: 'd8dc200fbbf7da1c1084e3899f8f4c3f_3709',
     _score: 1,
     _source: 
        { message: 'Hello world'
          ...
        }
      }      
       
     
     # 2 of 34
      ....
    
    elasticsearch@localhost:9200> _search('*:*',_each)          # Same 
    elasticsearch@localhost:9200> _search().collect(_each)     # Same
    
    
    
##### Get next page with same collector that was used in search

    elasticsearch@localhost:9200> _next()


##### Search and see results with all fields as tabular output    		
    elasticsearch@localhost:9200> search(_eachProp('time','message'))
  
    elasticsearch@localhost:9200> search().collect(_eachProp('time','message'))

	┌─────┬──────────────────────────────────┬──────────────────────────────────┬
	│ _id │ time                             │ message                          │
	├─────┼──────────────────────────────────┼──────────────────────────────────┼
	│ 1   │ 2014-01-29T12:23:29.000+01:00    │ Hello World                      │
	│     │                                  │                                  │
	├─────┼──────────────────────────────────┼──────────────────────────────────┼
	│ 2   │ 2014-01-29T12:23:29.000+01:00    │ Hello ElasticSearch              │
	│     │                                  │                                  │
	├─────┼──────────────────────────────────┼──────────────────────────────────┤
	│ 3   │ 2014-01-29T12:23:29.000+01:00    │ Bye bye                          │
	│     │                                  │                                  │
	├─────┼──────────────────────────────────┼──────────────────────────────────┤


Get a specific result based on id. Supports autocompletions using \_ids namespace and the id is always prefixed with _ to support numbers and other chars as first char. __Chars like dashes and .(dots) will be replaced so they can be support property autocompletion so we do not have do this ids[property]__    
    
    elasticsearch@localhost:9200> _ids.<TAB>
    _ids._1     _ids._2    _ids._3    _ids._4
    
    
    elasticsearch@localhost:9200> _ids._1
    { _index: '<index>',
      _type: '<type>',
      _id: '1',
      _version: 2,
      exists: true,
      _source: 
         { message: 'Hello World'
           ...
         }
    }
    
    

##### Search a specific indice

    elasticsearch@localhost:9200> indice.<TAB>
    
