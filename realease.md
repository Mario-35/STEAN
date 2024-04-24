
# version 3.5
    write a pseudo object builder for more readable query builder
    re-write exponds to be more efficient with builder
    add models automatic table name for more readability of database
    add tests list in documentation
# version 3.4
    odata filter with multiDatastream are now full for 5 first element (automatic number will come)
    count with filter
    correct extension filter
    dataArray can have expand in search
# version 3.3
    relations extension filter
    correction and rewrite odata geo fuctions
    add trim on name or despription post to remove unnecessary space
# version 3.2
    Graph correction for using with space in json keys
    Perform csv import for huge file
    perform models return
    add tests.md generator
# version 3
    Export done
    Add limit key to export
    import from create OK
    perform multilines post
    perform logs DB for body information
    different speed optimisation
    code review with add some help comments
    in post observation "resultTime" = "phenomenonTime" or "resultTime" = "phenomenonTime" if is the same dateTime
# version 2.9.3
    liitle patch for api version
# version 2.9.2
    liitle patch for graph
# version 2.9.1
    Add draw.io models and models ropresontation via draw route
    clean code
# version 2.9
    add payload and deveui alias in observations to be used to export payload 
    /Observations?$select=phenomenonTime,payload,deveui&$resultFormat=csv
    add urlForced version for vers/Loras to post loras with api different version
    add new error if Wrong version
    export in json & xlsx
# version 2.8
    add model class that can use different models in the api use with apiVersion in config file.
    rewrite logs to be remove on build to have faster production version
# version 2.8
    create new service creation possibilities
    add canDrop to config
    replace accents instead of delete (bug)

# version 2.7
    more filter possibiliies
    we can add an array of JSON usefull for script creation

# version 2.6

    Inner filter done
    correction  intersects with geography precision
    add filter of phenomenonTime in datastream (add periodType in odata)

# version 2.5.2

    Relations are shown ONLY if the extension is activate
    encrypt configuration is back
    export is done
    import is work (add import observations WIP)

# version 2.5.1
    
    Triggers : Add some triggers to optimize date start and end in Datastream and MultiDatastream

# version 2.5

    BIG change : remove pg, knex and pg-copy-streams to postgres.js FOR 50% speed

# version 2.1
    Add Root to query
    Add new modular date search more flexible than standard ST
    add export service : export as excel vi JSExcel
    change graph representation by dygraph
    Logs are now in the instance of each database and work with logs extension : extensions: ["logs"]
    apidoc is now serve on the root of the api and updated with the install
    new routine for lora payload decoder (to the same template)
    add update : before and after to have service start before some update launch after.
    add update : decoders to update decoders with hash test before

# version 2
    valueskeys property to get keys form multidatstream values
    true result any (like the sensortings norm tue result is a true "any" value)
    for lora in result the payload is saved and attached on observation :
    ```javascript
    {
        "value": 
            {
                "soil moisture": 18.75, 
                "battery voltage": null, 
                "soil temperature": 16.946
            }, 
        "payload": "010610324200000107103E4900009808"
    }
    ```
    new config extensions : the key extensions extensions: ["multiDatastream", "lora", "numeric"]
    correction bug when multiple @iot.id in odata
    all start in one pass from scratch 

# version 1.9.1
    change timestampTZ for posgreSQL 16
    create config and start it without restart server
    add metrics in Query
    correction bug when multiple @iot.id in odata
    all start in one pass from scratch 

# version 1.9.0
    query builder finished
    add specific logs result in Query
    add Not Null in Query Builder
    add Null in Query Builder
    json show date formated as parameter in configuration file


# version 1.8.0
    add patrom component
    add urls interaction in query
    query builder in progress


# version 1.7.0
    add /status route to indicate if server is ready
    remove id default sorted for speed result
    perform configuration connection db
    add /ready route to show status of the server status

# version 1.6.0
    Add key lora in configuration to show or not entities
    Add key highPrecision in configuration to have float8 instead of float4
    CreateObservations for multiDatastream
    move _default_foi to datastream and multidatastream instead of things
    correction bug serialize json input in query 
    hide createObservation an createFile when user can't post
    Add filename and date in resultQuality observations when import csv file
    admin for config and user WIP
    Optimize when import huge csv file
    Add foi default at datastream or multiDatastream create

# version 1.5.0
    Add standard in configuration
    modif isNotNull
    rewrite queryBuilder 
    add types for messages and verify in data constants
    finallisation import file in thing and update doc
    result search correct
    new logs
    rewrite createConfig for duplicates

# version 1.4.0
    correction for transaction import1
    modif isNotNull
    rewrite queryBuilder wip
    add types for messages and verify in data constants
    finallisation import file in thing and update doc wip
    result search correct

# version 1.3.0
    new version rewrite rusult format timeserie broke and had te be rewrite
    Lots fo modifications in Query and lora for datastream
    new query and lots of little corrections
    diagram
    correction for decodeURIComponent
    some nome for better read
    update build for delete zip befare start
    update build
    transform all configuration code in class
    restart server after add config


# version 1.2.0
    update docs for docker
    version with pgwait for docker release ok
    encrypt configuration
    remove IKeyvalue to Object
    formatResult rewrite with new interface
    Remove visible test password
    log request correction
    add exemple configuration