
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