
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
    new config extensions : the key estension [extensions: ["multiDatastream", "lora", "numeric"]
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