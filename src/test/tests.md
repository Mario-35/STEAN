# <a id="start">TEST : 24/03/2024 : 22:47:40</a> version[3.4][Things](#Things),[Locations](#Locations),[HistoricalLocations](#HistoricalLocations),[Datastreams](#Datastreams),[MultiDatastreams](#MultiDatastreams),[Sensors](#Sensors),[ObservedProperties](#ObservedProperties),[Observations](#Observations),[CreateObservations](#CreateObservations),[Loras](#Loras),[Various](#Various)## <a id="Root">Root</a>           [🚧](#start)   1. {get} resource result [GET /v1.1/](https://sensorthings.geosas.fr/test/v1.1/) ✔️## <a id="Token">Token</a>           [🚧](#start)   2. {post} login get a new token [GET /v1.1/login](https://sensorthings.geosas.fr/test/v1.1/login) ✔️   3. {post} login Post basic [GET /v1.1/login](https://sensorthings.geosas.fr/test/v1.1/login) ✔️   4. {get} logout logout actual connection. [GET /v1.1/logout](https://sensorthings.geosas.fr/test/v1.1/logout) ✔️## <a id="Things">Things</a>           [🚧](#start)   5. {get} Things Get all [GET /v1.1/Things](https://sensorthings.geosas.fr/test/v1.1/Things) ✔️   6. {get} Things(:id) Get one [GET /v1.1/Things(1)](https://sensorthings.geosas.fr/test/v1.1/Things(1)) ✔️   7. Return error if Things not exist [GET /v1.1/Things(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/Things(9007199254740991)) ✔️   8. {get} Things(:id) Get only a property [GET /v1.1/Things(1)/name](https://sensorthings.geosas.fr/test/v1.1/Things(1)/name) ✔️   9. Return error if the column does not exist [GET /v1.1/Things(1)/nameNot](https://sensorthings.geosas.fr/test/v1.1/Things(1)/nameNot) ✔️   10. {get} Things(:id) Get only the value of a property [GET /v1.1/Things(1)/name/$value](https://sensorthings.geosas.fr/test/v1.1/Things(1)/name/$value) ✔️   11. {get} Things(:id) Get Select with @iot.id [GET /v1.1/Things?$select=name,description,@iot.id](https://sensorthings.geosas.fr/test/v1.1/Things?$select=name,description,@iot.id) ✔️   12. {get} Return Things Select id [GET /v1.1/Things?$select=name,description,id](https://sensorthings.geosas.fr/test/v1.1/Things?$select=name,description,id) ✔️   13. {get} Things(:id) Get Select with navigation link [GET /v1.1/Things?$select=name,description,Datastreams](https://sensorthings.geosas.fr/test/v1.1/Things?$select=name,description,Datastreams) ✔️   14. {get} Things(:id) Get Subentity Locations [GET /v1.1/Things(6)/Locations](https://sensorthings.geosas.fr/test/v1.1/Things(6)/Locations) ✔️   15. {get} Things(:id) Get Subentity HistoricalLocations [GET /v1.1/Things(6)/HistoricalLocations](https://sensorthings.geosas.fr/test/v1.1/Things(6)/HistoricalLocations) ✔️   16. {get} Things(:id) Get Subentity Datastreams [GET /v1.1/Things(6)/Datastreams](https://sensorthings.geosas.fr/test/v1.1/Things(6)/Datastreams) ✔️   17. {get} Things(:id) Get Subentity MultiDatastreams [GET /v1.1/Things(11)/MultiDatastreams](https://sensorthings.geosas.fr/test/v1.1/Things(11)/MultiDatastreams) ✔️   18. {get} Things(:id) Get Expand Locations [GET /v1.1/Things(6)?$expand=Locations](https://sensorthings.geosas.fr/test/v1.1/Things(6)?$expand=Locations) ✔️   19. {get} Things(:id) Get Expand with Select [GET /v1.1/Things(6)?$expand=Locations($select=location)](https://sensorthings.geosas.fr/test/v1.1/Things(6)?$expand=Locations($select=location)) ✔️   20. {get} Things(:id) Get Expand coma separation [GET /v1.1/Things(6)?$expand=Locations,HistoricalLocations](https://sensorthings.geosas.fr/test/v1.1/Things(6)?$expand=Locations,HistoricalLocations) ✔️   21. {get} Things(:id) Get Expand  slash separation [GET /v1.1/Things(6)?$expand=Locations/HistoricalLocations](https://sensorthings.geosas.fr/test/v1.1/Things(6)?$expand=Locations/HistoricalLocations) ✔️   22. {get} return Things Expand HistoricalLocations [GET /v1.1/Things(6)?$expand=HistoricalLocations](https://sensorthings.geosas.fr/test/v1.1/Things(6)?$expand=HistoricalLocations) ✔️   23. {get} return Things Expand Datastreams [GET /v1.1/Things(6)?$expand=Datastreams](https://sensorthings.geosas.fr/test/v1.1/Things(6)?$expand=Datastreams) ✔️   24. {get} return Things Select with Expand Datastreams [GET /v1.1/Things?$select=name,description&$expand=Datastreams](https://sensorthings.geosas.fr/test/v1.1/Things?$select=name,description&$expand=Datastreams) ✔️   25. {get} return Things Expand MultiDatastreams [GET /v1.1/Things(11)?$expand=MultiDatastreams](https://sensorthings.geosas.fr/test/v1.1/Things(11)?$expand=MultiDatastreams) ✔️   26. {get} Things(:id) Get only references [GET /v1.1/Things/$ref](https://sensorthings.geosas.fr/test/v1.1/Things/$ref) ✔️   27. {get} Things(:id)/entity(:id) Get nested resource path [GET /v1.1/Things(2)/Datastreams(2)](https://sensorthings.geosas.fr/test/v1.1/Things(2)/Datastreams(2)) ✔️   28. {get} Things(:id)/entity(:id) Get filter nested resource path [GET /v1.1/Things?$filter=Datastreams/description eq 'Pressure sensor'](https://sensorthings.geosas.fr/test/v1.1/Things?$filter=Datastreams/description%20eq%20'Pressure%20sensor') ✔️   29. {get} Things(:id)/entity(:id) Get complex filter nested resource path [GET /v1.1/Things?$filter=Datastreams/ObservedProperty/description eq 'Mesure de la profondeur de la nappe'](https://sensorthings.geosas.fr/test/v1.1/Things?$filter=Datastreams/ObservedProperty/description%20eq%20'Mesure%20de%20la%20profondeur%20de%20la%20nappe') ✔️  30. {post} Things Post basic [POST /v1.1/Things](https://sensorthings.geosas.fr/test/v1.1/Things) ✔️
```js
{ name: 'Thing test', description: 'Create Thing inside tests', properties: { organization: 'Mozilla', owner: 'Mozilla' } } 
```

  31. {post} return Error if the payload is malformed [POST /v1.1/Things](https://sensorthings.geosas.fr/test/v1.1/Things) ✔️
```js
{} 
```

  32. {post} Things Post with new Location [POST /v1.1/Things](https://sensorthings.geosas.fr/test/v1.1/Things) ✔️
```js
{
  name: 'Thing with new Location test',
  description: 'Create Thing with new location inside tests',
  properties: { 'Deployment Condition': 'Deployed in a third floor balcony', 'Case Used': 'Radiation shield' },
  Locations: { name: 'Au Comptoir Vénitie', description: 'Restaurant next to office', encodingType: 'application/geo+json', location: { type: 'Point', coordinates: [ 48.11829243294942, -1.717928984533772, [length]: 2 ] } }
} 
```

  33. {post} Things Post with existing Location [POST /v1.1/Things](https://sensorthings.geosas.fr/test/v1.1/Things) ✔️
```js
{ name: 'Thing with existing Location test', description: 'Create Thing with existing location inside tests', properties: { 'Deployment Condition': 'Deployed in a third floor balcony', 'Case Used': 'Radiation shield' }, Locations: [ { '@iot.id': '1' }, [length]: 1 ] } 
```

  34. {post} Things Post with existing Location that don't exist [POST /v1.1/Things](https://sensorthings.geosas.fr/test/v1.1/Things) ✔️
```js
{ name: 'Thing with existing Location not exist test', description: 'Create Thing with existing location Location not exist tests', properties: { 'Deployment Condition': 'Deployed in a third floor balcony', 'Case Used': 'Radiation shield' }, Locations: [ { '@iot.id': 1908 }, [length]: 1 ] } 
```

  35. {post} Things Post with Location and Datastream [POST /v1.1/Things](https://sensorthings.geosas.fr/test/v1.1/Things) ✔️
```js
{
  name: 'Thing with new Location & Datastream test',
  description: 'Create Thing with new location & Datastream inside tests',
  properties: { 'Deployment Condition': 'Deployed in a third floor balcony', 'Case Used': 'Radiation shield' },
  Locations: [
    { name: 'Glaz Arena', description: 'Glaz Arena sport complex', encodingType: 'application/geo+json', location: { type: 'Point', coordinates: [ 48.11472599868096, -1.594679622929148, [length]: 2 ] } },
    [length]: 1
  ],
  Datastreams: [ { name: 'Air Temperature DS', description: 'Datastream for recording temperature', observationType: 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement', unitOfMeasurement: { name: 'Degree Celsius for test', symbol: 'degC', definition: 'http://www.qudt.org/qudt/owl/1.0.0/unit/Instances.html#DegreeCelsius' }, ObservedProperty: { name: 'Area Temperature for test', description: 'The degree or intensity of heat present in the area', definition: 'http://www.qudt.org/qudt/owl/1.0.0/quantity/Instances.html#AreaTemperature' }, Sensor: { name: '`DHT22 for test', description: 'DHT22 temperature sensor', encodingType: 'application/pdf', metadata: 'https://cdn-shop.adafruit.com/datasheets/DHT22.pdf' } }, [length]: 1 ]
} 
```

  36. {post} Things Post with Inner Posts [POST /v1.1/Things](https://sensorthings.geosas.fr/test/v1.1/Things) ✔️
```js
{
  description: 'Thing test For inner Post',
  name: 'Thing test For inner Post',
  properties: { reference: 'first' },
  Locations: [
    { name: 'location for Thing test', description: 'location for Thing test For inner Post', location: { type: 'Point', coordinates: [ -117.05, 51.05, [length]: 2 ] }, encodingType: 'application/geo+json' },
    [length]: 1
  ],
  Datastreams: [
    { unitOfMeasurement: { name: 'Lumen', symbol: 'lm', definition: 'http://www.qudt.org/qudt/owl/1.0.0/unit/Instances.html/Lumen' }, name: 'first datastream name', description: 'first datastream for Thing inner test', observationType: 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement', ObservedProperty: { name: 'Luminous Flux', definition: 'http://www.qudt.org/qudt/owl/1.0.0/quantity/Instances.html/LuminousFlux', description: 'observedProperty flux' }, Sensor: { name: 'first sensor name', description: 'first sensor for Thing inner test', encodingType: 'application/pdf', metadata: 'Light flux sensor' }, Observations: [ { phenomenonTime: '2015-03-03T00:00:00Z', result: 3 }, { phenomenonTime: '2015-03-04T00:00:00Z', result: 4 }, [length]: 2 ] },
    { unitOfMeasurement: { name: 'Centigrade', symbol: 'C', definition: 'http://www.qudt.org/qudt/owl/1.0.0/unit/Instances.html/Lumen' }, name: 'second datastream name', description: 'second datastream for Thing inner test', observationType: 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement', ObservedProperty: { name: 'Tempretaure', definition: 'http://www.qudt.org/qudt/owl/1.0.0/quantity/Instances.html/Tempreture', description: 'observedProperty second' }, Sensor: { name: 'second sensor name', description: 'second sensor for Thing inner test', encodingType: 'application/pdf', metadata: 'Tempreture sensor' }, Observations: [ { phenomenonTime: '2015-03-05T00:00:00Z', result: 5 }, { phenomenonTime: '2015-03-06T00:00:00Z', result: 6 }, [length]: 2 ] },
    [length]: 2
  ]
} 
```

  37. {patch} Things Patch a Thing [PATCH /v1.1/Things(17)](https://sensorthings.geosas.fr/test/v1.1/Things(17)) ✔️
```js
{ name: 'New SensorWebThing Patch', properties: { organization: 'Mozilla', owner: 'Mozilla' } } 
```

  38. {patch} return Error if the Things not exist [PATCH /v1.1/Things(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/Things(9007199254740991)) ✔️
```js
{ name: 'New SensorWebThing Patch', properties: { organization: 'Mozilla', owner: 'Mozilla' } } 
```

  39. {patch} Things Patch with New location [PATCH /v1.1/Things(17)](https://sensorthings.geosas.fr/test/v1.1/Things(17)) ✔️
```js
{ name: 'New SensorWebThing back', properties: { organization: 'Mozilla', owner: 'Mozilla' }, Locations: [ { '@iot.id': 10 }, [length]: 1 ] } 
```

  40. {patch} Things Patch with existing Location [PATCH /v1.1/Things(17)](https://sensorthings.geosas.fr/test/v1.1/Things(17)) ✔️
```js
{ Locations: [ { '@iot.id': 2 }, [length]: 1 ] } 
```

  41. {delete} Things Delete one [DELETE /v1.1/Things(17)](https://sensorthings.geosas.fr/test/v1.1/Things(17)) ✔️  42. {delete} return Error if the Things not exist [DELETE /v1.1/Things(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/Things(9007199254740991)) ✔️## <a id="Locations">Locations</a>           [🚧](#start)   43. {get} Locations Get all [GET /v1.1/Locations](https://sensorthings.geosas.fr/test/v1.1/Locations) ✔️   44. {get} Locations(:id) Get one [GET /v1.1/Locations(1)](https://sensorthings.geosas.fr/test/v1.1/Locations(1)) ✔️   45. {get} return error if Locations not exist [GET /v1.1/Locations(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/Locations(9007199254740991)) ✔️   46. {get} Things(:id)/Locations Get from specific Thing [GET /v1.1/Things(6)/Locations](https://sensorthings.geosas.fr/test/v1.1/Things(6)/Locations) ✔️   47. {get} Locations(:id) Get Subentity Things [GET /v1.1/Locations(6)/Things](https://sensorthings.geosas.fr/test/v1.1/Locations(6)/Things) ✔️   48. {get} Locations(:id) Get Subentity HistoricalLocations [GET /v1.1/Locations(6)/HistoricalLocations](https://sensorthings.geosas.fr/test/v1.1/Locations(6)/HistoricalLocations) ✔️   49. {get} return Locations Expand Things [GET /v1.1/Locations(1)?$expand=Things](https://sensorthings.geosas.fr/test/v1.1/Locations(1)?$expand=Things) ✔️   50. {get} return Locations Expand HistoricalLocations [GET /v1.1/Locations(1)?$expand=HistoricalLocations](https://sensorthings.geosas.fr/test/v1.1/Locations(1)?$expand=HistoricalLocations) ✔️  51. {post} Locations Post basic [POST /v1.1/Locations](https://sensorthings.geosas.fr/test/v1.1/Locations) ✔️
```js
{ name: 'Inrae - Saint-Gilles', description: 'New location test Inrae - Saint-Gilles', encodingType: 'application/geo+json', location: { type: 'Point', coordinates: [ 48.14523718972358, -1.8305352019940178, [length]: 2 ] } } 
```

  52. {post} return Error if the payload is malformed [POST /v1.1/Locations](https://sensorthings.geosas.fr/test/v1.1/Locations) ✔️
```js
{} 
```

  53. {post} Locations Post with existing Thing [POST /v1.1/Things(1)/Locations](https://sensorthings.geosas.fr/test/v1.1/Things(1)/Locations) ✔️
```js
{ name: 'Au Comptoir Vénitien Locations 1', description: 'Au Comptoir Vénitien', encodingType: 'application/geo+json', location: { type: 'Point', coordinates: [ 48.11829243294942, -1.717928984533772, [length]: 2 ] } } 
```

  54. {patch} Locations Patch one [PATCH /v1.1/Locations(17)](https://sensorthings.geosas.fr/test/v1.1/Locations(17)) ✔️
```js
{ name: 'My Location has changed', description: 'Inrae - Site De Saint-Gilles', encodingType: 'application/geo+json', location: { type: 'Point', coordinates: [ 48.14523718972358, -1.8305352019940178, [length]: 2 ] } } 
```

  55. {patch} return Error if the Locations not exist [PATCH /v1.1/Locations(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/Locations(9007199254740991)) ✔️
```js
{ name: 'My Location has changed', description: 'Inrae - Site De Saint-Gilles', encodingType: 'application/geo+json', location: { type: 'Point', coordinates: [ 48.14523718972358, -1.8305352019940178, [length]: 2 ] } } 
```

  56. {delete} Locations Delete one [DELETE /v1.1/Locations(17)](https://sensorthings.geosas.fr/test/v1.1/Locations(17)) ✔️  57. {delete} return Error if the Locations not exist [DELETE /v1.1/Locations(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/Locations(9007199254740991)) ✔️## <a id="HistoricalLocations">HistoricalLocations</a>           [🚧](#start)   58. {get} HistoricalLocations Get all [GET /v1.1/HistoricalLocations](https://sensorthings.geosas.fr/test/v1.1/HistoricalLocations) ✔️   59. {get} HistoricalLocations(:id) Get one [GET /v1.1/HistoricalLocations(1)](https://sensorthings.geosas.fr/test/v1.1/HistoricalLocations(1)) ✔️   60. Return error if HistoricalLocations not exist [GET /v1.1/HistoricalLocations(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/HistoricalLocations(9007199254740991)) ✔️   61. {get} HistoricalLocations(:id) Get Expand Locations [GET /v1.1/HistoricalLocations(6)?$expand=Locations](https://sensorthings.geosas.fr/test/v1.1/HistoricalLocations(6)?$expand=Locations) ✔️   62. {get} HistoricalLocations(:id) Get Select [GET /v1.1/HistoricalLocations(6)?$select=time](https://sensorthings.geosas.fr/test/v1.1/HistoricalLocations(6)?$select=time) ✔️   63. {get} HistoricalLocations(:id) Get Subentity Things [GET /v1.1/HistoricalLocations(6)/Things](https://sensorthings.geosas.fr/test/v1.1/HistoricalLocations(6)/Things) ✔️   64. {get} HistoricalLocations(:id) Get Subentity Locations [GET /v1.1/HistoricalLocations(6)/Locations](https://sensorthings.geosas.fr/test/v1.1/HistoricalLocations(6)/Locations) ✔️   65. {get} return HistoricalLocations Expand Things [GET /v1.1/HistoricalLocations(1)?$expand=Things](https://sensorthings.geosas.fr/test/v1.1/HistoricalLocations(1)?$expand=Things) ✔️   66. {get} return HistoricalLocations Expand Locations [GET /v1.1/HistoricalLocations(1)?$expand=Locations](https://sensorthings.geosas.fr/test/v1.1/HistoricalLocations(1)?$expand=Locations) ✔️  67. {patch} HistoricalLocations Patch one [PATCH /v1.1/HistoricalLocations(19)](https://sensorthings.geosas.fr/test/v1.1/HistoricalLocations(19)) ✔️
```js
{ time: '2015-02-07T19:22:11.297Z' } 
```

  68. {patch} return Error if the HistoricalLocations not exist [PATCH /v1.1/HistoricalLocations(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/HistoricalLocations(9007199254740991)) ✔️
```js
{ time: '2015-02-07T19:22:11.297Z' } 
```

  69. {delete} HistoricalLocations Delete one [DELETE /v1.1/HistoricalLocations(19)](https://sensorthings.geosas.fr/test/v1.1/HistoricalLocations(19)) ✔️  70. {delete} return Error if the HistoricalLocations not exist [DELETE /v1.1/HistoricalLocations(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/HistoricalLocations(9007199254740991)) ✔️## <a id="Datastreams">Datastreams</a>           [🚧](#start)   71. {get} Datastreams Get all [GET /v1.1/Datastreams](https://sensorthings.geosas.fr/test/v1.1/Datastreams) ✔️   72. {get} Datastreams(:id) Get one [GET /v1.1/Datastreams(1)](https://sensorthings.geosas.fr/test/v1.1/Datastreams(1)) ✔️   73. {get} return error if Datastreams not exist [GET /v1.1/Datastreams(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/Datastreams(9007199254740991)) ✔️   74. {get} Things(6)/Datastreams Get from a specific Thing [GET /v1.1/Things(6)/Datastreams](https://sensorthings.geosas.fr/test/v1.1/Things(6)/Datastreams) ✔️   75. {get} Datastreams(:id) Get Expands [GET /v1.1/Datastreams(9)?$expand=Observations,ObservedProperty](https://sensorthings.geosas.fr/test/v1.1/Datastreams(9)?$expand=Observations,ObservedProperty) ✔️   76. {get} Datastreams(:id) Get All infos [GET /v1.1/Datastreams(9)?$expand=Thing/Locations,Sensor,ObservedProperty](https://sensorthings.geosas.fr/test/v1.1/Datastreams(9)?$expand=Thing/Locations,Sensor,ObservedProperty) ✔️   77. {get} return error if Datastreams Path is invalid [GET /v1.1/Datastreams(2)?$expand=Things/Locations,Sensor,ObservedProperty](https://sensorthings.geosas.fr/test/v1.1/Datastreams(2)?$expand=Things/Locations,Sensor,ObservedProperty) ✔️   78. {get} Datastreams Get From phenomenonTime search [GET /v1.1/Datastreams?$filter=resultTime eq 2023-02-08T16:37:11Z/2023-02-11T09:49:32Z](https://sensorthings.geosas.fr/test/v1.1/Datastreams?$filter=resultTime%20eq%202023-02-08T16:37:11Z/2023-02-11T09:49:32Z) ✔️   79. {get} Datastreams Get From observations filter [GET /v1.1/Datastreams?$filter=Observations/result eq 63.15](https://sensorthings.geosas.fr/test/v1.1/Datastreams?$filter=Observations/result%20eq%2063.15) ✔️   80. {get} Datastreams(:id) Get Subentity Thing [GET /v1.1/Datastreams(2)/Thing](https://sensorthings.geosas.fr/test/v1.1/Datastreams(2)/Thing) ✔️   81. {get} Datastreams(:id) Get Subentity Sensor [GET /v1.1/Datastreams(2)/Sensor](https://sensorthings.geosas.fr/test/v1.1/Datastreams(2)/Sensor) ✔️   82. {get} Datastreams(:id) Get Subentity ObservedProperty [GET /v1.1/Datastreams(2)/ObservedProperty](https://sensorthings.geosas.fr/test/v1.1/Datastreams(2)/ObservedProperty) ✔️   83. {get} Datastreams(:id) Get Subentity Observations [GET /v1.1/Datastreams(1)/Observations](https://sensorthings.geosas.fr/test/v1.1/Datastreams(1)/Observations) ✔️   84. {get} return Datastreams Expand Thing [GET /v1.1/Datastreams(1)?$expand=Thing](https://sensorthings.geosas.fr/test/v1.1/Datastreams(1)?$expand=Thing) ✔️   85. {get} return Datastreams Expand Sensor [GET /v1.1/Datastreams(1)?$expand=Sensor](https://sensorthings.geosas.fr/test/v1.1/Datastreams(1)?$expand=Sensor) ✔️   86. {get} return Datastreams Expand Observations [GET /v1.1/Datastreams(1)?$expand=Observations](https://sensorthings.geosas.fr/test/v1.1/Datastreams(1)?$expand=Observations) ✔️   87. {get} return Datastreams Expand ObservedProperty [GET /v1.1/Datastreams(1)?$expand=ObservedProperty](https://sensorthings.geosas.fr/test/v1.1/Datastreams(1)?$expand=ObservedProperty) ✔️  88. {post} Datastreams Post with existing Thing [POST /v1.1/Datastreams](https://sensorthings.geosas.fr/test/v1.1/Datastreams) ✔️
```js
{ unitOfMeasurement: { symbol: 'μg/m³', name: 'PM 2.5 Particulates (ug/m3)', definition: 'http://unitsofmeasure.org/ucum.html' }, name: 'Datastream Air quality readings', description: 'New Datastream Air quality readings for test', Thing: { '@iot.id': 1 }, ObservedProperty: { '@iot.id': 1 }, Sensor: { '@iot.id': 1 } } 
```

  89. {post} Datastreams Post with default FOI [POST /v1.1/Datastreams](https://sensorthings.geosas.fr/test/v1.1/Datastreams) ✔️
```js
{ unitOfMeasurement: { symbol: 'μg/m³', name: 'PM 2.5 Particulates (ug/m3)', definition: 'http://unitsofmeasure.org/ucum.html' }, name: 'Another datastream Air quality readings with default FOI', description: 'New Datastream Air quality readings with default FOI for test', Thing: { '@iot.id': 1 }, ObservedProperty: { '@iot.id': 1 }, Sensor: { '@iot.id': 1 }, FeatureOfInterest: { '@iot.id': 2 } } 
```

  90. {post} Datastreams return Error if the payload is malformed [POST /v1.1/Datastreams](https://sensorthings.geosas.fr/test/v1.1/Datastreams) ✔️
```js
{} 
```

  91. {post} Datastreams Post with a Thing [POST /v1.1/Things(1)/Datastreams](https://sensorthings.geosas.fr/test/v1.1/Things(1)/Datastreams) ✔️
```js
{ name: 'Datastream Air Air Temperature DS', description: 'New Datastream Air Temperature DS for test', unitOfMeasurement: { name: 'New Degree Celsius', symbol: '°C', definition: 'http://unitsofmeasure.org/ucum.html#para-30' }, ObservedProperty: { name: 'New Area Temperature', description: 'The degree or intensity of heat present in the area', definition: 'http://www.qudt.org/qudt/owl/1.0.0/quantity/Instances.html#AreaTemperature' }, Sensor: { name: 'New Sensor DHT22', description: 'DHT22 temperature sensor [1]', encodingType: 'application/pdf', metadata: 'https://cdn-shop.adafruit.com/datasheets/DHT22.pdf' } } 
```

  92. {post} return added Datastreams from Thing [POST /v1.1/Things(1)/Datastreams](https://sensorthings.geosas.fr/test/v1.1/Things(1)/Datastreams) ✔️
```js
{ name: 'Pressure sensor [70b3d5e75e014f06]', description: 'New datastream for pressure sensor [70b3d5e75e014f06]', observationType: 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement', unitOfMeasurement: { name: 'New unitOfMeasurement pressure', symbol: 'B', definition: 'http://www.qudt.org/qudt/owl/1.0.0/unit/Instances.html#DegreeCelsius' }, ObservedProperty: { name: 'New pressure ObservedProperty', description: 'New pressure ObservedProperty in datastream for tests', definition: 'http://www.qudt.org/qudt/owl/1.0.0/quantity/Instances.html#AreaTemperature' }, Sensor: { name: 'New pressure sensor', description: 'New pressure sensor in datastream for tests', encodingType: 'application/pdf', metadata: 'https://www.watteco.fr/download/fiche-technique-torano-lorawan/?wpdmdl=8460&refresh=6405aa1c76d491678092828' } } 
```

  93. {patch} Datastreams Patch one [PATCH /v1.1/Datastreams(12)](https://sensorthings.geosas.fr/test/v1.1/Datastreams(12)) ✔️
```js
{ unitOfMeasurement: { name: 'Degrees Fahrenheit', symbol: 'degF', definition: 'http://www.qudt.org/qudt/owl/1.0.0/unit/Instances.html#DegreeFahrenheit' }, description: 'Water Temperature of Bow river' } 
```

  94. {patch} return Error if the Datastreams not exist [PATCH /v1.1/Datastreams(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/Datastreams(9007199254740991)) ✔️
```js
{ unitOfMeasurement: { symbol: 'ºC', name: 'Celsius', definition: 'http://unitsofmeasure.org/ucum.html' }, observationType: 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement', description: 'Temp readings', name: 'temp_readings' } 
```

  95. {delete} Datastreams Delete one [DELETE /v1.1/Datastreams(20)](https://sensorthings.geosas.fr/test/v1.1/Datastreams(20)) ✔️  96. {delete} return Error if the Datastreams not exist [DELETE /v1.1/Datastreams(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/Datastreams(9007199254740991)) ✔️## <a id="MultiDatastreams">MultiDatastreams</a>           [🚧](#start)   97. {get} MultiDatastreams Get all [GET /v1.1/MultiDatastreams](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams) ✔️   98. {get} MultiDatastreams(:id) Get one [GET /v1.1/MultiDatastreams(1)](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams(1)) ✔️   99. {get} return error if MultiDatastreams not exist [GET /v1.1/MultiDatastreams(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams(9007199254740991)) ✔️   100. {get} Things(11)/MultiDatastreams(:id) Get from specific Thing [GET /v1.1/Things(11)/MultiDatastreams](https://sensorthings.geosas.fr/test/v1.1/Things(11)/MultiDatastreams) ✔️   101. {get} all MultiDatastreams informations [GET /v1.1/MultiDatastreams(1)?$expand=Thing/Locations/FeatureOfInterest,Sensor,ObservedProperties](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams(1)?$expand=Thing/Locations/FeatureOfInterest,Sensor,ObservedProperties) ✔️   102. {get} MultiDatastreams Get From phenomenonTime search [GET /v1.1/MultiDatastreams?$filter=phenomenonTime eq 2023-03-01T10:49:32Z/2023-03-12T21:49:32Z](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams?$filter=phenomenonTime%20eq%202023-03-01T10:49:32Z/2023-03-12T21:49:32Z) ✔️   103. {get} MultiDatastreams(:id) Get Subentity Thing [GET /v1.1/MultiDatastreams(6)/Thing](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams(6)/Thing) ✔️   104. {get} MultiDatastreams(:id) Get Subentity Sensor [GET /v1.1/MultiDatastreams(6)/Sensor](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams(6)/Sensor) ✔️   105. {get} MultiDatastreams(:id) Get Subentity ObservedProperties [GET /v1.1/MultiDatastreams(6)/ObservedProperties](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams(6)/ObservedProperties) ✔️   106. {get} MultiDatastreams(:id) Get Subentity Observations [GET /v1.1/MultiDatastreams(6)/Observations](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams(6)/Observations) ✔️   107. {get} return MultiDatastreams Expand Thing [GET /v1.1/MultiDatastreams(1)?$expand=Thing](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams(1)?$expand=Thing) ✔️   108. {get} return MultiDatastreams Expand Sensor [GET /v1.1/MultiDatastreams(1)?$expand=Sensor](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams(1)?$expand=Sensor) ✔️   109. {get} return MultiDatastreams Expand Observations [GET /v1.1/MultiDatastreams(1)?$expand=Observations](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams(1)?$expand=Observations) ✔️   110. {get} return MultiDatastreams Expand ObservedProperties [GET /v1.1/MultiDatastreams(1)?$expand=ObservedProperties](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams(1)?$expand=ObservedProperties) ✔️  111. {post} MultiDatastreams Post with existing Thing And Sensor [POST /v1.1/MultiDatastreams](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams) ✔️
```js
{ description: 'Air quality readings', name: 'Air quality readings MultiDatastreams 2', Thing: { '@iot.id': 2 }, Sensor: { '@iot.id': 1 }, multiObservationDataTypes: [ 'Measurement', 'Measurement', [length]: 2 ], unitOfMeasurements: [ { symbol: '%', name: 'humidity 3', definition: 'http://unitsofmeasure.org/ucum.html' }, { name: 'Temperature 4', symbol: '°', definition: 'http://unitsofmeasure.org/blank.html' }, [length]: 2 ], ObservedProperties: [ { name: 'humidity 5', definition: 'humidity', description: "valeur en pourcentage du taux d'humidity de l'air" }, { name: 'Temperature 6', definition: 'Temperature', description: "valeur en degré de la Temperature de l'air" }, [length]: 2 ] } 
```

  112. {post} return Error if the payload is malformed [POST /v1.1/MultiDatastreams](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams) ✔️
```js
{} 
```

  113. {post} MultiDatastreams Post With Thing and Sensor [POST /v1.1/MultiDatastreams](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams) ✔️
```js
{ description: 'Air quality readings', name: 'Air quality readings MultiDatastreams 7', Thing: { description: 'A New SensorWeb thing', name: '"SensorWebThing Thing 8', properties: { organization: 'Mozilla', owner: 'Mozilla' } }, Sensor: { name: 'DHT72', description: 'DHT72 soil temperature 9', encodingType: 'application/pdf', metadata: 'https://cdn-shop.adafruit.com/datasheets/DHT72.pdf' }, multiObservationDataTypes: [ 'Measurement', 'Measurement', [length]: 2 ], unitOfMeasurements: [ { symbol: '%', name: 'Soil soil humidity 10', definition: 'http://unitsofmeasure.org/ucum.html' }, { name: 'Soil soil temperature 11', symbol: '°', definition: 'http://unitsofmeasure.org/blank.html' }, [length]: 2 ], ObservedProperties: [ { name: 'humidity 12', definition: 'humidity', description: "valeur en pourcentage du taux d'humidity de l'air" }, { name: 'Temperature 13', definition: 'Temperature', description: "valeur en degré de la Temperature de l'air" }, [length]: 2 ] } 
```

  114. {post} MultiDatastreams return Error if ObservedProperties length not equal multiObservationDataTypes [POST /v1.1/MultiDatastreams](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams) ✔️
```js
{ description: 'Air quality readings', name: 'air_quality_readings', Thing: { '@iot.id': 2 }, Sensor: { '@iot.id': 1 }, multiObservationDataTypes: [ 'Measurement', 'Measurement', [length]: 2 ], unitOfMeasurements: [ { symbol: '%', name: 'humidity', definition: 'http://unitsofmeasure.org/ucum.html' }, { name: 'Temperature', symbol: '°', definition: 'http://unitsofmeasure.org/blank.html' }, [length]: 2 ], ObservedProperties: [ { name: 'humidity', definition: 'humidity', description: "valeur en pourcentage du taux d'humidity de l'air" }, [length]: 1 ] } 
```

  115. {post} MultiDatastreams return Error if unitOfMeasurements length not equal multiObservationDataTypes [POST /v1.1/MultiDatastreams](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams) ✔️
```js
{ name: 'Air quality readings MultiDatastreams 14', description: 'Air quality readings', Thing: { '@iot.id': 2 }, Sensor: { '@iot.id': 1 }, multiObservationDataTypes: [ 'Measurement', 'Measurement', [length]: 2 ], unitOfMeasurements: [ { symbol: '%', name: 'humidity 15', definition: 'http://unitsofmeasure.org/ucum.html' }, [length]: 1 ], ObservedProperties: [ { name: 'humidity 16', definition: 'humidity', description: "valeur en pourcentage du taux d'humidity de l'air" }, { name: 'Temperature 17', definition: 'Temperature', description: "valeur en degré de la Temperature de l'air" }, [length]: 2 ] } 
```

  116. {post} MultiDatastreams Post with default FOI [POST /v1.1/MultiDatastreams](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams) ✔️
```js
{ description: 'Air quality readings', name: 'Air quality readings MultiDatastreams 18', Thing: { '@iot.id': 2 }, Sensor: { '@iot.id': 1 }, multiObservationDataTypes: [ 'Measurement', 'Measurement', [length]: 2 ], unitOfMeasurements: [ { symbol: '%', name: 'humidity 19', definition: 'http://unitsofmeasure.org/ucum.html' }, { name: 'Temperature 20', symbol: '°', definition: 'http://unitsofmeasure.org/blank.html' }, [length]: 2 ], ObservedProperties: [ { name: 'humidity 21', definition: 'humidity', description: "valeur en pourcentage du taux d'humidity de l'air" }, { name: 'Temperature 22', definition: 'Temperature', description: "valeur en degré de la Temperature de l'air" }, [length]: 2 ], FeaturesOfInterest: { '@iot.id': 2 } } 
```

  117. {patch} MultiDatastreams Patch one [PATCH /v1.1/MultiDatastreams(12)](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams(12)) ✔️
```js
{ description: 'Modification of the description' } 
```

  118. {patch} return Error if the MultiDatastreams not exist [PATCH /v1.1/MultiDatastreams(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams(9007199254740991)) ✔️
```js
{ observationType: 'http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement', description: 'Temp readings', name: 'temp_readings' } 
```

  119. {delete} MultiDatastreams Delete one [DELETE /v1.1/MultiDatastreams(12)](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams(12)) ✔️  120. {delete} return Error if the MultiDatastreams not exist [DELETE /v1.1/MultiDatastreams(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams(9007199254740991)) ✔️## <a id="Sensors">Sensors</a>           [🚧](#start)   121. {get} Sensors Get all [GET /v1.1/Sensors](https://sensorthings.geosas.fr/test/v1.1/Sensors) ✔️   122. {get} Sensors(:id) Get one [GET /v1.1/Sensors(1)](https://sensorthings.geosas.fr/test/v1.1/Sensors(1)) ✔️   123. {get} return error if Sensors not exist [GET /v1.1/Sensors(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/Sensors(9007199254740991)) ✔️   124. {get} Sensors(:id) Get Expands [GET /v1.1/Sensors(1)?$expand=Datastreams](https://sensorthings.geosas.fr/test/v1.1/Sensors(1)?$expand=Datastreams) ✔️   125. {get} Sensors(:id) Get Select [GET /v1.1/Sensors(1)?$select=description](https://sensorthings.geosas.fr/test/v1.1/Sensors(1)?$select=description) ✔️   126. {get} Sensors(:id) Get Subentity Datastreams [GET /v1.1/Sensors(6)/Datastreams](https://sensorthings.geosas.fr/test/v1.1/Sensors(6)/Datastreams) ✔️   127. {get} Sensors(:id) Get Subentity MultiDatastreams [GET /v1.1/Sensors(18)/MultiDatastreams](https://sensorthings.geosas.fr/test/v1.1/Sensors(18)/MultiDatastreams) ✔️   128. {get} return Sensors Expand Datastreams [GET /v1.1/Sensors(1)?$expand=Datastreams](https://sensorthings.geosas.fr/test/v1.1/Sensors(1)?$expand=Datastreams) ✔️   129. {get} return Sensors Expand MultiDatastreams [GET /v1.1/Sensors(1)?$expand=MultiDatastreams](https://sensorthings.geosas.fr/test/v1.1/Sensors(1)?$expand=MultiDatastreams) ✔️  130. {post} Sensors Post basic [POST /v1.1/Sensors](https://sensorthings.geosas.fr/test/v1.1/Sensors) ✔️
```js
{ description: 'PM 2.5 sensor', name: 'PM25 Sensors 23', encodingType: 'application/pdf', metadata: 'http://particle-sensor.com/' } 
```

  131. {post} Sensors return Error if the payload is malformed [POST /v1.1/Sensors](https://sensorthings.geosas.fr/test/v1.1/Sensors) ✔️
```js
{} 
```

  132. {patch} Sensors Patch one [PATCH /v1.1/Sensors(25)](https://sensorthings.geosas.fr/test/v1.1/Sensors(25)) ✔️
```js
{ description: 'This is a new PM 2.5 sensor' } 
```

  133. {patch} return Error if the Sensors not exist [PATCH /v1.1/Sensors(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/Sensors(9007199254740991)) ✔️
```js
{ description: 'This is a new PM 2.5 sensor' } 
```

  134. {delete} Sensors Delete one [DELETE /v1.1/Sensors(25)](https://sensorthings.geosas.fr/test/v1.1/Sensors(25)) ✔️  135. {delete} return Error if the Sensors not exist [DELETE /v1.1/Sensors(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/Sensors(9007199254740991)) ✔️## <a id="ObservedProperties">ObservedProperties</a>           [🚧](#start)   136. {get} ObservedProperties Get all [GET /v1.1/ObservedProperties](https://sensorthings.geosas.fr/test/v1.1/ObservedProperties) ✔️   137. {get} ObservedProperties(:id) Get one [GET /v1.1/ObservedProperties(2)](https://sensorthings.geosas.fr/test/v1.1/ObservedProperties(2)) ✔️   138. Return error if ObservedProperties not exist [GET /v1.1/ObservedProperties(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/ObservedProperties(9007199254740991)) ✔️   139. {get} Datastream(10/ObservedProperties Get from a specific Datastream [GET /v1.1/Datastreams(9)/ObservedProperty](https://sensorthings.geosas.fr/test/v1.1/Datastreams(9)/ObservedProperty) ✔️   140. {get} ObservedProperties(:id) Get Expand Datastreams [GET /v1.1/ObservedProperties(1)?$expand=Datastreams](https://sensorthings.geosas.fr/test/v1.1/ObservedProperties(1)?$expand=Datastreams) ✔️   141. {get} ObservedProperties(:id) Get from a Select [GET /v1.1/ObservedProperties(1)?$select=description](https://sensorthings.geosas.fr/test/v1.1/ObservedProperties(1)?$select=description) ✔️  142. {post} ObservedProperties Post basic [POST /v1.1/ObservedProperties](https://sensorthings.geosas.fr/test/v1.1/ObservedProperties) ✔️
```js
{ name: 'Area ObservedProperties 24', description: 'The degree or intensity of heat present in the area', definition: 'http://www.qudt.org/qudt/owl/1.0.0/quantity/Instances.html#AreaTemperature' } 
```

  143. {post} return Error if the payload is malformed [POST /v1.1/ObservedProperties](https://sensorthings.geosas.fr/test/v1.1/ObservedProperties) ✔️
```js
{} 
```

  144. {patch} ObservedProperties Patch one [PATCH /v1.1/ObservedProperties(31)](https://sensorthings.geosas.fr/test/v1.1/ObservedProperties(31)) ✔️
```js
{ name: 'New PM 2.5 ObservedProperties 25' } 
```

  145. {patch} return Error if the ObservedProperties not exist [PATCH /v1.1/ObservedProperties(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/ObservedProperties(9007199254740991)) ✔️
```js
{ name: 'New SensorWebThing Patch', properties: { organization: 'Mozilla', owner: 'Mozilla' } } 
```

  146. {delete} ObservedProperties Delete one [DELETE /v1.1/ObservedProperties(31)](https://sensorthings.geosas.fr/test/v1.1/ObservedProperties(31)) ✔️  147. {delete} return Error if the ObservedProperties not exist [DELETE /v1.1/ObservedProperties(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/ObservedProperties(9007199254740991)) ✔️## <a id="Observations">Observations</a>           [🚧](#start)   148. {get} Observations Get all [GET /v1.1/Observations](https://sensorthings.geosas.fr/test/v1.1/Observations) ✔️   149. {get} Observations(:id) Get one [GET /v1.1/Observations(1)](https://sensorthings.geosas.fr/test/v1.1/Observations(1)) ✔️   150. {get} return error if Observations not exist [GET /v1.1/Observations(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/Observations(9007199254740991)) ✔️   151. {get} Datastreams(2)/Observations Get all from Datastream [GET /v1.1/Datastreams(2)/Observations](https://sensorthings.geosas.fr/test/v1.1/Datastreams(2)/Observations) ✔️   152. {get} Observations(:id) Get Expands [GET /v1.1/Observations(1)?$expand=Datastream](https://sensorthings.geosas.fr/test/v1.1/Observations(1)?$expand=Datastream) ✔️   153. {get} Observations(:id) Get with Multi Select [GET /v1.1/Observations(1)?$select=phenomenonTime,result](https://sensorthings.geosas.fr/test/v1.1/Observations(1)?$select=phenomenonTime,result) ✔️   154. {get} Observations with Standard Results [GET /v1.1/Observations(11)](https://sensorthings.geosas.fr/test/v1.1/Observations(11)) ✔️   155. {get} Observations with Multi keyValue Results [GET /v1.1/Observations(378)?$valuesKeys=true](https://sensorthings.geosas.fr/test/v1.1/Observations(378)?$valuesKeys=true) ✔️   156. Return error with spliResult on Observation entity Only [GET /v1.1/Observations?$splitResult=ALL](https://sensorthings.geosas.fr/test/v1.1/Observations?$splitResult=ALL) ✔️   157. {get} Get with Split Results [GET /v1.1/MultiDatastreams(1)/Observations?$splitResult=all](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams(1)/Observations?$splitResult=all) ✔️   158. {get} Get with Split Result Property [GET /v1.1/MultiDatastreams(1)/Observations?$splitResult="Unit one of classic"](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams(1)/Observations?$splitResult=%22Unit%20one%20of%20classic%22) ✔️  159. {post} Observations Post with existing FOI [POST /v1.1/Observations](https://sensorthings.geosas.fr/test/v1.1/Observations) ✔️
```js
{ phenomenonTime: '2017-02-07T18:02:00.000Z', resultTime: '2017-02-07T18:02:05.000Z', result: 21.6, Datastream: { '@iot.id': 2 } } 
```

  160. {post} return Error if the payload is malformed [POST /v1.1/Observations](https://sensorthings.geosas.fr/test/v1.1/Observations) ✔️
```js
{} 
```

  161. {post} Observations Post with FOI [POST /v1.1/Observations](https://sensorthings.geosas.fr/test/v1.1/Observations) ✔️
```js
{ phenomenonTime: '2017-02-07T18:02:00.000Z', resultTime: '2017-02-07T18:02:05.000Z', result: 21.6, FeatureOfInterest: { name: 'Au Comptoir Vénitien (Created new location)', description: 'Au Comptoir Vénitien', encodingType: 'application/geo+json', feature: { type: 'Point', coordinates: [ 48.11829243294942, -1.717928984533772, [length]: 2 ] } }, Datastream: { '@iot.id': 6 } } 
```

  162. {post} Observations Post from Datastream [POST /v1.1/Datastreams(10)/Observations](https://sensorthings.geosas.fr/test/v1.1/Datastreams(10)/Observations) ✔️
```js
{ phenomenonTime: '2017-02-07T18:02:00.000Z', resultTime: '2017-02-07T18:02:05.000Z', result: 23 } 
```

  163. {post} Observations Post from Datastream and FOI [POST /v1.1/Datastreams(10)/Observations](https://sensorthings.geosas.fr/test/v1.1/Datastreams(10)/Observations) ✔️
```js
{
  phenomenonTime: '2017-02-07T18:02:00.000Z',
  resultTime: '2017-02-07T18:02:05.000Z',
  result: 21.6,
  FeatureOfInterest: { name: 'Au Comptoir Vénitien [7]', description: 'Au Comptoir Vénitien', encodingType: 'application/geo+json', feature: { type: 'Point', coordinates: [ 48.11829243294942, -1.717928984533772, [length]: 2 ] } }
} 
```

  164. {post} Observations Post from MultiDatastream [POST /v1.1/MultiDatastreams(2)/Observations](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams(2)/Observations) ✔️
```js
{
  phenomenonTime: '2017-02-07T18:02:00.000Z',
  resultTime: '2017-02-07T18:02:05.000Z',
  result: { 'Unit one of apostrophe': 10.1, 'Unit two of apostrophe': 10.2 },
  FeatureOfInterest: { name: 'Au Comptoir Vénitien', description: 'Au Comptoir Vénitien', encodingType: 'application/geo+json', feature: { type: 'Point', coordinates: [ 48.11829243294942, -1.717928984533772, [length]: 2 ] } }
} 
```

  165. {post} return error if There is no Stream [POST /v1.1/Observations](https://sensorthings.geosas.fr/test/v1.1/Observations) ✔️
```js
{
  phenomenonTime: '2017-02-07T18:02:00.000Z',
  resultTime: '2017-02-07T18:02:05.000Z',
  result: { 'Unit one of apostrophe': 10.1, 'Unit two of apostrophe': 10.2 },
  FeatureOfInterest: { name: 'Au Comptoir Vénitien[9]', description: 'Au Comptoir Vénitien', encodingType: 'application/geo+json', feature: { type: 'Point', coordinates: [ 48.11829243294942, -1.717928984533772, [length]: 2 ] } }
} 
```

  166. {post} Observations Post from MultiDatastream [POST /v1.1/MultiDatastreams(2)/Observations](https://sensorthings.geosas.fr/test/v1.1/MultiDatastreams(2)/Observations) ✔️
```js
{
  phenomenonTime: '2017-02-07T18:02:00.000Z',
  resultTime: '2017-02-07T18:02:05.000Z',
  result: { 'Unit one of apostrophe': 10.1 },
  FeatureOfInterest: { name: 'Au Comptoir Vénitien[9]', description: 'Au Comptoir Vénitien', encodingType: 'application/geo+json', feature: { type: 'Point', coordinates: [ 48.11829243294942, -1.717928984533772, [length]: 2 ] } }
} 
```

  167. {patch} Observations Patch a Thing [PATCH /v1.1/Observations(529)](https://sensorthings.geosas.fr/test/v1.1/Observations(529)) ✔️
```js
{ phenomenonTime: '2016-11-18T11:04:15.790Z', resultTime: '2016-11-18T11:04:15.790Z' } 
```

  168. {patch} return Error if the Observations not exist [PATCH /v1.1/Observations(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/Observations(9007199254740991)) ✔️
```js
{ phenomenonTime: '2016-11-18T11:04:15.790Z', resultTime: '2016-11-18T11:04:15.790Z', result: 20.4, Datastream: { '@iot.id': 1 } } 
```

  169. {patch} Observations Patch with Datastream [PATCH /v1.1/Observations(529)](https://sensorthings.geosas.fr/test/v1.1/Observations(529)) ✔️
```js
{ phenomenonTime: '2016-11-18T11:04:15.790Z', resultTime: '2016-11-18T11:04:15.790Z', result: 20.4, Datastream: { '@iot.id': 6 } } 
```

  170. {delete} Observations Delete one [DELETE /v1.1/Observations(529)](https://sensorthings.geosas.fr/test/v1.1/Observations(529)) ✔️  171. {delete} return Error if the Observations not exist [DELETE /v1.1/Observations(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/Observations(9007199254740991)) ✔️## <a id="FeaturesOfInterest">FeaturesOfInterest</a>           [🚧](#start)   172. {get} FeaturesOfInterest Get all [GET /v1.1/FeaturesOfInterest](https://sensorthings.geosas.fr/test/v1.1/FeaturesOfInterest) ✔️   173. {get} FeaturesOfInterest(:id) Get one [GET /v1.1/FeaturesOfInterest(1)](https://sensorthings.geosas.fr/test/v1.1/FeaturesOfInterest(1)) ✔️   174. {get} return error if FeaturesOfInterest not exist [GET /v1.1/FeaturesOfInterest(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/FeaturesOfInterest(9007199254740991)) ✔️   175. {get} FeaturesOfInterest(:id) Get one and expand [GET /v1.1/FeaturesOfInterest(1)?$expand=Observations](https://sensorthings.geosas.fr/test/v1.1/FeaturesOfInterest(1)?$expand=Observations) ✔️   176. {get} FeaturesOfInterest(:id) Get Subentity Observations [GET /v1.1/FeaturesOfInterest(12)/Observations](https://sensorthings.geosas.fr/test/v1.1/FeaturesOfInterest(12)/Observations) ✔️   177. {get} return FeaturesOfInterest Expand Observations [GET /v1.1/FeaturesOfInterest(12)?$expand=Observations](https://sensorthings.geosas.fr/test/v1.1/FeaturesOfInterest(12)?$expand=Observations) ✔️  178. {post} FeaturesOfInterest Post basic [POST /v1.1/FeaturesOfInterest](https://sensorthings.geosas.fr/test/v1.1/FeaturesOfInterest) ✔️
```js
{ name: 'Weather Station YYC.', description: 'This is a weather station located at Au Comptoir Vénitien.', encodingType: 'application/geo+json', feature: { type: 'Point', coordinates: [ 48.11829243294942, -1.717928984533772, [length]: 2 ] } } 
```

  179. {post} return Error if the payload is malformed [POST /v1.1/FeaturesOfInterest](https://sensorthings.geosas.fr/test/v1.1/FeaturesOfInterest) ✔️
```js
{} 
```

  180. {patch} FeaturesOfInterest Patch one [PATCH /v1.1/FeaturesOfInterest(15)](https://sensorthings.geosas.fr/test/v1.1/FeaturesOfInterest(15)) ✔️
```js
{ name: 'My New Name', feature: { type: 'Point', coordinates: [ 48.11829243294942, -1.717928984533772, [length]: 2 ] } } 
```

  181. {patch} return Error if the FeaturesOfInterest not exist [PATCH /v1.1/FeaturesOfInterest(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/FeaturesOfInterest(9007199254740991)) ✔️
```js
{ name: 'My New Name', feature: { type: 'Point', coordinates: [ -115.06, 55.05, [length]: 2 ] } } 
```

  182. {delete} FeaturesOfInterest Delete one [DELETE /v1.1/FeaturesOfInterest(15)](https://sensorthings.geosas.fr/test/v1.1/FeaturesOfInterest(15)) ✔️  183. {delete} return Error if the FeaturesOfInterest not exist [DELETE /v1.1/FeaturesOfInterest(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/FeaturesOfInterest(9007199254740991)) ✔️## <a id="CreateObservations">CreateObservations</a>           [🚧](#start)  184. {post} CreateObservations Add datastream [POST /v1.1/CreateObservations](https://sensorthings.geosas.fr/test/v1.1/CreateObservations) ✔️
```js
{ Datastream: { '@iot.id': 1 }, components: [ 'phenomenonTime', 'result', 'resultTime', 'FeatureOfInterest/id', [length]: 4 ], 'dataArray@iot.count': 4, dataArray: [ [ '2017-01-13T10:20:00.000Z', 90, '2017-01-13T10:20:00.000Z', 1, [length]: 4 ], [ '2017-01-13T10:21:00.000Z', 91, '2017-01-13T10:21:00.000Z', 1, [length]: 4 ], [ '2017-02-13T10:22:00.000Z', 92, '2017-02-13T10:22:00.000Z', 1, [length]: 4 ], [ '2017-02-13T10:22:00.000Z', 93, '2017-02-13T10:22:00.000Z', 1, [length]: 4 ], [length]: 4 ] } 
```

  185. {post} return Error if datastream does not exist [POST /v1.1/CreateObservations](https://sensorthings.geosas.fr/test/v1.1/CreateObservations) ✔️
```js
{ Datastream: { '@iot.id': '9007199254740991' }, components: [ 'phenomenonTime', 'result', 'resultTime', 'FeatureOfInterest/id', [length]: 4 ], 'dataArray@iot.count': 3, dataArray: [ [ '2017-01-13T10:20:00.000Z', 90, '2017-01-13T10:20:00.000Z', 1, [length]: 4 ], [ '2017-01-13T10:21:00.000Z', 91, '2017-01-13T10:21:00.000Z', 1, [length]: 4 ], [ '2017-01-13T10:22:00.000Z', 92, '2017-01-13T10:22:00.000Z', 1, [length]: 4 ], [length]: 3 ] } 
```

  186. {post} return Error if datastream does not exist [POST /v1.1/CreateObservations](https://sensorthings.geosas.fr/test/v1.1/CreateObservations) ✔️
```js
{ Datastream: { '@iot.id': 2 }, components: [ 'phenomenonTime', 'result', 'resultTime', 'FeatureOfInterest/id', [length]: 4 ], 'dataArray@iot.count': 4, dataArray: [ [ '2017-01-13T10:20:00.000Z', 90, '2017-01-13T10:20:00.000Z', 1, [length]: 4 ], [ '2017-01-13T10:21:00.000Z', 91, '2017-01-13T10:21:00.000Z', 1, [length]: 4 ], [ '2017-02-13T10:22:00.000Z', 92, '2017-02-13T10:22:00.000Z', 1, [length]: 4 ], [ '2017-02-13T10:22:00.000Z', 93, '2017-02-13T10:22:00.000Z', 1, [length]: 4 ], [length]: 4 ] } 
```

  187. {post} CreateObservations Add datastream duplicate. [POST /v1.1/CreateObservations](https://sensorthings.geosas.fr/test/v1.1/CreateObservations) ✔️
```js
{ Datastream: { '@iot.id': 2 }, components: [ 'phenomenonTime', 'result', 'resultTime', 'FeatureOfInterest/id', [length]: 4 ], 'dataArray@iot.count': 4, dataArray: [ [ '2017-01-13T10:20:00.000Z', 90, '2017-01-13T10:20:00.000Z', 1, [length]: 4 ], [ '2017-01-13T10:21:00.000Z', 91, '2017-01-13T10:21:00.000Z', 1, [length]: 4 ], [ '2017-02-13T10:22:00.000Z', 92, '2017-02-13T10:22:00.000Z', 1, [length]: 4 ], [ '2017-02-13T10:22:00.000Z', 93, '2017-02-13T10:22:00.000Z', 1, [length]: 4 ], [length]: 4 ] } 
```

  188. {post} CreateObservations Add datastream duplicate = delete. [POST /v1.1/CreateObservations](https://sensorthings.geosas.fr/test/v1.1/CreateObservations) ✔️
```js
{ duplicate: 'delete', Datastream: { '@iot.id': 2 }, components: [ 'phenomenonTime', 'result', 'resultTime', 'FeatureOfInterest/id', [length]: 4 ], 'dataArray@iot.count': 4, dataArray: [ [ '2017-01-13T10:20:00.000Z', 90, '2017-01-13T10:20:00.000Z', 1, [length]: 4 ], [ '2017-01-13T10:21:00.000Z', 91, '2017-01-13T10:21:00.000Z', 1, [length]: 4 ], [ '2017-02-13T10:22:00.000Z', 92, '2017-02-13T10:22:00.000Z', 1, [length]: 4 ], [ '2017-02-13T10:22:00.000Z', 93, '2017-02-13T10:22:00.000Z', 1, [length]: 4 ], [length]: 4 ] } 
```

  189. {post} CreateObservations Add multiDatastream duplicate. [POST /v1.1/CreateObservations](https://sensorthings.geosas.fr/test/v1.1/CreateObservations) ✔️
```js
{
  MultiDatastream: { '@iot.id': 2 },
  components: [ 'phenomenonTime', 'result', 'resultTime', 'FeatureOfInterest/id', [length]: 4 ],
  'dataArray@iot.count': 4,
  dataArray: [ [ '2017-01-13T10:20:00.000Z', [ 591, 592, 593, [length]: 3 ], '2017-01-13T10:20:00.000Z', 1, [length]: 4 ], [ '2017-01-13T10:21:00.000Z', [ 691, 692, 693, [length]: 3 ], '2017-01-13T10:21:00.000Z', 1, [length]: 4 ], [ '2017-02-13T10:22:00.000Z', [ 791, 792, 793, [length]: 3 ], '2017-02-13T10:22:00.000Z', 1, [length]: 4 ], [ '2017-02-13T10:22:00.000Z', [ 891, 892, 893, [length]: 3 ], '2017-02-13T10:22:00.000Z', 1, [length]: 4 ], [length]: 4 ]
} 
```

  190. {post} CreateObservations Add multiDatastream duplicate = delete. [POST /v1.1/CreateObservations](https://sensorthings.geosas.fr/test/v1.1/CreateObservations) ✔️
```js
{
  duplicate: 'delete',
  MultiDatastream: { '@iot.id': 2 },
  components: [ 'phenomenonTime', 'result', 'resultTime', 'FeatureOfInterest/id', [length]: 4 ],
  'dataArray@iot.count': 4,
  dataArray: [ [ '2017-01-13T10:20:00.000Z', [ 591, 592, 593, [length]: 3 ], '2017-01-13T10:20:00.000Z', 1, [length]: 4 ], [ '2017-01-13T10:21:00.000Z', [ 691, 692, 693, [length]: 3 ], '2017-01-13T10:21:00.000Z', 1, [length]: 4 ], [ '2017-02-13T10:22:00.000Z', [ 791, 792, 793, [length]: 3 ], '2017-02-13T10:22:00.000Z', 1, [length]: 4 ], [ '2017-02-13T10:22:00.000Z', [ 891, 892, 893, [length]: 3 ], '2017-02-13T10:22:00.000Z', 1, [length]: 4 ], [length]: 4 ]
} 
```

## <a id="Loras">Loras</a>           [🚧](#start)   191. {get} Loras Get all [GET /v1.1/Loras](https://sensorthings.geosas.fr/test/v1.1/Loras) ✔️   192. {get} Loras(:id) Get one [GET /v1.1/Loras(1)](https://sensorthings.geosas.fr/test/v1.1/Loras(1)) ✔️   193. {get} Loras(:deveui) Get one [GET /v1.1/Loras(2CF7F1202520017E)](https://sensorthings.geosas.fr/test/v1.1/Loras(2CF7F1202520017E)) ✔️   194. Return error if Loras not exist [GET /v1.1/Loras(9007199254740991)](https://sensorthings.geosas.fr/test/v1.1/Loras(9007199254740991)) ✔️   195. {get} Loras(:id) Get Subentity Datastream [GET /v1.1/Loras(5)/Datastream](https://sensorthings.geosas.fr/test/v1.1/Loras(5)/Datastream) ✔️   196. {get} Loras(:id) Get Subentity MultiDatastream [GET /v1.1/Loras(4)/MultiDatastream](https://sensorthings.geosas.fr/test/v1.1/Loras(4)/MultiDatastream) ✔️   197. {get} Loras(:id) Get Subentity Decoder [GET /v1.1/Loras(4)/Decoder](https://sensorthings.geosas.fr/test/v1.1/Loras(4)/Decoder) ✔️   198. {get} return Loras Expand Datastream [GET /v1.1/Loras(5)?$expand=Datastream](https://sensorthings.geosas.fr/test/v1.1/Loras(5)?$expand=Datastream) ✔️   199. {get} return Loras Expand MultiDatastream [GET /v1.1/Loras(4)?$expand=MultiDatastream](https://sensorthings.geosas.fr/test/v1.1/Loras(4)?$expand=MultiDatastream) ✔️   200. {get} return Loras Expand Decoder [GET /v1.1/Loras(4)?$expand=Decoder](https://sensorthings.geosas.fr/test/v1.1/Loras(4)?$expand=Decoder) ✔️  201. {post} Loras Post MultiDatastream basic [POST /v1.1/Loras](https://sensorthings.geosas.fr/test/v1.1/Loras) ✔️
```js
{ MultiDatastream: { '@iot.id': 2 }, Decoder: { '@iot.id': 1 }, name: 'Another lora Name', description: 'My new Lora Description', deveui: '8cf9574000009L8C' } 
```

  202. {post} Loras Post Datastream basic [POST /v1.1/Loras](https://sensorthings.geosas.fr/test/v1.1/Loras) ✔️
```js
{ Datastream: { '@iot.id': 14 }, Decoder: { '@iot.id': 3 }, name: 'Lora for datastream', description: 'My new Lora Description', deveui: '70b3d5e75e014f026' } 
```

  203. {post} return Error if the payload is malformed [POST /v1.1/Loras](https://sensorthings.geosas.fr/test/v1.1/Loras) ✔️
```js
{ Datastream: { '@iot.id': 155 }, Decoder: { '@iot.id': 3 }, name: 'Lora for datastream', description: 'My new Lora Description', deveui: '70b3d5e75e014f06' } 
```

  204. {post} Loras Post observation basic [POST /v1.1/Loras](https://sensorthings.geosas.fr/test/v1.1/Loras) ✔️
```js
{ deveui: '2CF7F1202520017E', timestamp: '2021-10-18T14:53:44+02:00', payload_ciphered: null, frame: '010610324200000107103E4900009808' } 
```

  205. {post} Loras Post observation payload basic [POST /v1.1/Loras](https://sensorthings.geosas.fr/test/v1.1/Loras) ✔️
```js
{ deveui: '8CF9574000002D1D', timestamp: '2021-10-18T14:53:44+02:00', payload_ciphered: null, frame: 'AA010610324200000107103E4900009808' } 
```

  206. {post} Loras Post basic [POST /v1.1/Loras](https://sensorthings.geosas.fr/test/v1.1/Loras) ✔️
```js
{ deveui: '8CF9574000002D2D', timestamp: '2021-10-18T14:53:44+02:00', payload_ciphered: null, frame: 'AA010610324200000107103E4900009808' } 
```

  207. {post} return Error if the payload is malformed [POST /v1.1/Loras](https://sensorthings.geosas.fr/test/v1.1/Loras) ✔️
```js
{} 
```

  208. {post} Loras Post Duplicate [POST /v1.1/Loras](https://sensorthings.geosas.fr/test/v1.1/Loras) ✔️
```js
{ deveui: '2CF7F1202520017E', timestamp: '2021-10-18T14:53:44+02:00', payload_ciphered: null, frame: '010610324200000107103E4900009808' } 
```

  209. {post} Loras Post Sort [POST /v1.1/Loras](https://sensorthings.geosas.fr/test/v1.1/Loras) ✔️
```js
{ data: { Temperature: 25, moisture: 100 }, deveui: '2CF7F1202520017E', sensor_id: '2CF7F1202520017E', timestamp: '2021-10-15T14:53:44+02:00', payload_ciphered: null } 
```

  210. {post} Loras Post Data Null [POST /v1.1/Loras](https://sensorthings.geosas.fr/test/v1.1/Loras) ✔️
```js
{ data: null, deveui: '2CF7F1202520017E', sensor_id: '2CF7F1202520017E', timestamp: '2021-10-15T14:53:44+02:00', payload_ciphered: null, payload_deciphered: '' } 
```

  211. {post} Loras Post Data Nots [POST /v1.1/Loras](https://sensorthings.geosas.fr/test/v1.1/Loras) ✔️
```js
{ data: { lost: 50, nothing: 25, dontknow: 100 }, deveui: '2CF7F1202520017E', sensor_id: '2CF7F1202520017E', timestamp: '2021-10-15T14:53:44+02:00', payload_ciphered: null, payload_deciphered: '' } 
```

## <a id="Odatas">Odatas</a>           [🚧](#start)   212. {get} Things(:id) Expand [GET /v1.1/Things(6)?$expand=Datastreams](https://sensorthings.geosas.fr/test/v1.1/Things(6)?$expand=Datastreams) ✔️   213. {get} Things(:id) Expand sub Entity [GET /v1.1/Things(6)?$expand=Datastreams/Sensor](https://sensorthings.geosas.fr/test/v1.1/Things(6)?$expand=Datastreams/Sensor) ✔️   214. {get} things(:id) expand with empty result [GET /v1.1/Things(6)?$expand=MultiDatastreams](https://sensorthings.geosas.fr/test/v1.1/Things(6)?$expand=MultiDatastreams) ✔️   215. {get} things(:id) expand with inner filter [GET /v1.1/Datastreams(2)?$expand=Observations($filter=result eq 240)](https://sensorthings.geosas.fr/test/v1.1/Datastreams(2)?$expand=Observations($filter=result%20eq%20240)) ✔️   216. {get} things(:id) expand with inner select [GET /v1.1/Datastreams?$expand=Observations($select=phenomenonTime,result;$orderby=phenomenonTime desc;$top=10)](https://sensorthings.geosas.fr/test/v1.1/Datastreams?$expand=Observations($select=phenomenonTime,result;$orderby=phenomenonTime%20desc;$top=10)) ✔️   217. {get} Things(:id) Select [GET /v1.1/Things(1)?$select=description](https://sensorthings.geosas.fr/test/v1.1/Things(1)?$select=description) ✔️   218. {get} Things(:id) Select multi [GET /v1.1/Things?$select=name,description](https://sensorthings.geosas.fr/test/v1.1/Things?$select=name,description) ✔️   219. {get} Things OrderBy [GET /v1.1/Things?$orderby=name desc](https://sensorthings.geosas.fr/test/v1.1/Things?$orderby=name%20desc) ✔️   220. {get} Observations Top [GET /v1.1/Observations?$top=5](https://sensorthings.geosas.fr/test/v1.1/Observations?$top=5) ✔️   221. {get} Observations Skip [GET /v1.1/Observations?$skip=500](https://sensorthings.geosas.fr/test/v1.1/Observations?$skip=500) ✔️   222. {get} Observations count [GET /v1.1/Observations?$skip=3&$top=2&$count=true](https://sensorthings.geosas.fr/test/v1.1/Observations?$skip=3&$top=2&$count=true) ✔️   223. {Get} filter Datastreams whose unitOfMeasurement property name = 'Degrees Fahrenheit' [GET /v1.1/Datastreams?$filter=unitOfMeasurement/name eq 'Degrees Fahrenheit'](https://sensorthings.geosas.fr/test/v1.1/Datastreams?$filter=unitOfMeasurement/name%20eq%20'Degrees%20Fahrenheit') ✔️   224. {Get} filter name OR description of thing [GET /v1.1/Things?$filter=name eq 'Climatic chamber' or description eq 'A New SensorWeb thing'](https://sensorthings.geosas.fr/test/v1.1/Things?$filter=name%20eq%20'Climatic%20chamber'%20or%20description%20eq%20'A%20New%20SensorWeb%20thing') ✔️   225. {Get} filter name AND description of thing [GET /v1.1/Things?$filter=name eq 'classic Thing' and description eq 'Description of classic Thing'](https://sensorthings.geosas.fr/test/v1.1/Things?$filter=name%20eq%20'classic%20Thing'%20and%20description%20eq%20'Description%20of%20classic%20Thing') ✔️   226. {Get} filter name STARTWITH [GET /v1.1/Things?$filter=startswith(description,'A New')](https://sensorthings.geosas.fr/test/v1.1/Things?$filter=startswith(description,'A%20New')) ✔️   227. {Get} filter name CONTAINS [GET /v1.1/Things?$filter=contains(description,'chamber')](https://sensorthings.geosas.fr/test/v1.1/Things?$filter=contains(description,'chamber')) ✔️   228. {Get} filter date greater Than [GET /v1.1/Observations?$filter=phenomenonTime gt '2023-10-13'](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=phenomenonTime%20gt%20'2023-10-13') ✔️   229. {Get} filter date eq [GET /v1.1/Observations?$filter=result eq '92' and resultTime eq '2017-02-13'](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=result%20eq%20'92'%20and%20resultTime%20eq%20'2017-02-13') ✔️   230. {get} Thing filter date greater than and less than [GET /v1.1/Observations?$filter=phenomenonTime gt '2021-01-01' and phenomenonTime lt '2021-10-16'](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=phenomenonTime%20gt%20'2021-01-01'%20and%20phenomenonTime%20lt%20'2021-10-16') ✔️## <a id="Built in filter">Built in filter</a>           [🚧](#start)   231. {get} Observations eq [GET /v1.1/Observations?$filter=result eq 310](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=result%20eq%20310) ✔️   232. {get} Observations ne [GET /v1.1/Observations?$filter=result ne 45](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=result%20ne%2045) ✔️   233. {get} Observations gt [GET /v1.1/Observations?$filter=result gt 45](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=result%20gt%2045) ✔️   234. {get} Odata Built-in operator gt AND lt [GET /v1.1/Observations?$filter=result gt 20 and result lt 22](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=result%20gt%2020%20and%20result%20lt%2022) ✔️   235. {get} Observations ge [GET /v1.1/Observations?$filter=result ge 45](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=result%20ge%2045) ✔️   236. {get} Observations lt [GET /v1.1/Observations?$filter=result lt 45](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=result%20lt%2045) ✔️   237. {get} Observations le [GET /v1.1/Observations?$filter=result le 45](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=result%20le%2045) ✔️   238. {get} Thing and [GET /v1.1/Things?$filter=name eq 'classic Thing' and description eq 'Description of classic Thing'](https://sensorthings.geosas.fr/test/v1.1/Things?$filter=name%20eq%20'classic%20Thing'%20and%20description%20eq%20'Description%20of%20classic%20Thing') ✔️   239. {get} Thing or [GET /v1.1/Things?$filter=name eq 'classic Thing' or description eq 'Description of Hack $debug=true Thing'](https://sensorthings.geosas.fr/test/v1.1/Things?$filter=name%20eq%20'classic%20Thing'%20or%20description%20eq%20'Description%20of%20Hack%20$debug=true%20Thing') ✔️## <a id="Built in Functions">Built in Functions</a>           [🚧](#start)   240. {get} Things(:id) substringof [GET /v1.1/Things?$filter=substringof('description', 'chamber') eq true](https://sensorthings.geosas.fr/test/v1.1/Things?$filter=substringof('description',%20'chamber')%20eq%20true) ✔️   241. {get} substringof('name', 'with') [GET /v1.1/Things?$filter=substringof('name', 'with')](https://sensorthings.geosas.fr/test/v1.1/Things?$filter=substringof('name',%20'with')) ✔️   242. {get} Things(:id) endwith [GET /v1.1/Things?$filter=endswith('name', 'Thing') eq true](https://sensorthings.geosas.fr/test/v1.1/Things?$filter=endswith('name',%20'Thing')%20eq%20true) ✔️   243. {get} endwith('description', 'one') [GET /v1.1/Things?$filter=endswith('description', 'Thing')](https://sensorthings.geosas.fr/test/v1.1/Things?$filter=endswith('description',%20'Thing')) ✔️   244. {get} Things(:id) startswith [GET /v1.1/Sensors?$filter=startswith('name', 'Hack') eq true](https://sensorthings.geosas.fr/test/v1.1/Sensors?$filter=startswith('name',%20'Hack')%20eq%20true) ✔️   245. {get} endwith(description, 'one') [GET /v1.1/Datastreams?$filter=startswith('name', 'Outlet')](https://sensorthings.geosas.fr/test/v1.1/Datastreams?$filter=startswith('name',%20'Outlet')) ✔️   246. {get} Things(:id) Length [GET /v1.1/Things?$filter=length(description) le 25](https://sensorthings.geosas.fr/test/v1.1/Things?$filter=length(description)%20le%2025) ✔️   247. {get} indexof [GET /v1.1/Things?$filter=indexof('name', 'Piezo') eq 1](https://sensorthings.geosas.fr/test/v1.1/Things?$filter=indexof('name',%20'Piezo')%20eq%201) ✔️   248. {get} Things substring(str, nb) [GET /v1.1/Things?$filter=substring('name', 1) eq 'hing with new Location test'](https://sensorthings.geosas.fr/test/v1.1/Things?$filter=substring('name',%201)%20eq%20'hing%20with%20new%20Location%20test') ✔️   249. {get} Things substring(str, index, nb) [GET /v1.1/Things?$filter=substring('description', 10, 6) eq 'outlet'](https://sensorthings.geosas.fr/test/v1.1/Things?$filter=substring('description',%2010,%206)%20eq%20'outlet') ✔️   250. {get} Things toLower [GET /v1.1/Things?$filter=tolower('name') eq 'piezo f5b'](https://sensorthings.geosas.fr/test/v1.1/Things?$filter=tolower('name')%20eq%20'piezo%20f5b') ✔️   251. {get} Things toUpper [GET /v1.1/Things?$filter=toupper('name') eq 'PIEZOMETER F4'](https://sensorthings.geosas.fr/test/v1.1/Things?$filter=toupper('name')%20eq%20'PIEZOMETER%20F4') ✔️   252. {get} Things trim [GET /v1.1/Things?$filter=trim('name') eq 'Piezo F5b'](https://sensorthings.geosas.fr/test/v1.1/Things?$filter=trim('name')%20eq%20'Piezo%20F5b') ✔️   253. {get} Things concat [GET /v1.1/Things?$filter=concat('name', 'test') eq 'Piezometer F4test'](https://sensorthings.geosas.fr/test/v1.1/Things?$filter=concat('name',%20'test')%20eq%20'Piezometer%20F4test') ✔️## <a id="Built in Dates">Built in Dates</a>           [🚧](#start)   254. {get} Observations Year [GET /v1.1/Observations?$filter=resultTime eq 2017-01-13](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=resultTime%20eq%202017-01-13) ✔️   255. {get} search by resultTime eq 01-13-2017 [GET /v1.1/Observations?$filter=resultTime eq '13-01-2017'](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=resultTime%20eq%20'13-01-2017') ✔️   256. {get} search by resultTime gt 13-01-2017 [GET /v1.1/Observations?$filter=resultTime gt '13-01-2017'](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=resultTime%20gt%20'13-01-2017') ✔️   257. {get} search by resultTime lt 15-10-2021 [GET /v1.1/Observations?$filter=resultTime lt '15-10-2021'](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=resultTime%20lt%20'15-10-2021') ✔️   258. {get} Observations Year [GET /v1.1/Observations?$filter=year(resultTime) eq 2017](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=year(resultTime)%20eq%202017) ✔️   259. {get} Observations Month [GET /v1.1/Observations?$filter=month(resultTime) eq 10](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=month(resultTime)%20eq%2010) ✔️   260. {get} Observations Day [GET /v1.1/Observations?$filter=day(resultTime) eq 11](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=day(resultTime)%20eq%2011) ✔️   261. {get} Observations Hour [GET /v1.1/Observations?$filter=hour(resultTime) eq 12](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=hour(resultTime)%20eq%2012) ✔️   262. {get} Observations minute [GET /v1.1/Observations?$filter=minute(resultTime) eq 50](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=minute(resultTime)%20eq%2050) ✔️   263. {get} Observations second [GET /v1.1/Observations?$filter=second(resultTime) ge 40](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=second(resultTime)%20ge%2040) ✔️   264. {get} Observations date [GET /v1.1/Observations?$filter=date(resultTime) eq date(phenomenonTime)](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=date(resultTime)%20eq%20date(phenomenonTime)) ✔️   265. {get} Observations time [GET /v1.1/Observations?$filter=time(resultTime) ne time(phenomenonTime)](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=time(resultTime)%20ne%20time(phenomenonTime)) ✔️   266. {get} Observations Now() [GET /v1.1/Observations?$filter=resultTime le now()](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=resultTime%20le%20now()) ✔️## <a id="Built in Maths">Built in Maths</a>           [🚧](#start)   267. {get} Observations Round [GET /v1.1/Observations?$filter=round(result) eq 63](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=round(result)%20eq%2063) ✔️   268. {get} Observations Floor [GET /v1.1/Observations?$filter=floor(result) eq 63](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=floor(result)%20eq%2063) ✔️   269. {get} Observations Ceiling [GET /v1.1/Observations?$filter=ceiling(result) eq 63](https://sensorthings.geosas.fr/test/v1.1/Observations?$filter=ceiling(result)%20eq%2063) ✔️## <a id="Built in Miscs">Built in Miscs</a>           [🚧](#start)   270. {get} Observations Interval [GET /v1.1/Datastreams(3)/Observations?$interval=1 hour](https://sensorthings.geosas.fr/test/v1.1/Datastreams(3)/Observations?$interval=1%20hour) ✔️   271. {get} interval(15 min) [GET /v1.1/Datastreams(3)/Observations?$interval=15 min](https://sensorthings.geosas.fr/test/v1.1/Datastreams(3)/Observations?$interval=15%20min) ✔️   272. {get} interval(1 min) [GET /v1.1/Datastreams(3)/Observations?$interval=1 min](https://sensorthings.geosas.fr/test/v1.1/Datastreams(3)/Observations?$interval=1%20min) ✔️   273. {get} interval(1 day) [GET /v1.1/Datastreams(4)/Observations?$interval=1 day](https://sensorthings.geosas.fr/test/v1.1/Datastreams(4)/Observations?$interval=1%20day) ✔️## <a id="Import">Import</a>           [🚧](#start)  274. {post} CreateObservations with simple csv attached file [POST /v1.1/CreateObservations](https://sensorthings.geosas.fr/test/v1.1/CreateObservations) ✔️
  275. {post} CreateObservations with simple csv attached file [POST /v1.1/CreateObservations](https://sensorthings.geosas.fr/test/v1.1/CreateObservations) ✔️
  276. {post} CreateObservations with multi csv attached file [POST /v1.1/CreateObservations](https://sensorthings.geosas.fr/test/v1.1/CreateObservations) ✔️
  277. {post} CreateObservations with multi csv attached file [POST /v1.1/CreateObservations](https://sensorthings.geosas.fr/test/v1.1/CreateObservations) ✔️
## <a id="Various">Various</a>           [🚧](#start)   278. result => 1 :  [GET /test/v1.1/Things?$filter=Datastreams/ObservedProperty/description eq 'Description of classic Observed Property'](https://sensorthings.geosas.fr/test/test/v1.1/Things?$filter=Datastreams/ObservedProperty/description%20eq%20'Description%20of%20classic%20Observed%20Property') ✔️   279. result => 6 :  [GET /test/v1.1/Observations?$filter=phenomenonTime gt 2023-10-13T06:37:13+02:00](https://sensorthings.geosas.fr/test/test/v1.1/Observations?$filter=phenomenonTime%20gt%202023-10-13T06:37:13+02:00) ✔️   280. result => 1 :  [GET /test/v1.1/Things?$filter=Datastreams/unitOfMeasurement/name eq 'Pression'](https://sensorthings.geosas.fr/test/test/v1.1/Things?$filter=Datastreams/unitOfMeasurement/name%20eq%20'Pression') ✔️   281. result => 1 :  [GET /test/v1.1/Things?$filter=Datastreams/unitOfMeasurement/name eq 'PM 2.5 Particulates (ug/m3)'](https://sensorthings.geosas.fr/test/test/v1.1/Things?$filter=Datastreams/unitOfMeasurement/name%20eq%20'PM%202.5%20Particulates%20(ug/m3)') ✔️   282. result => 524 :  [GET /test/v1.1/Observations?$filter=result gt 290 or result eq 250](https://sensorthings.geosas.fr/test/test/v1.1/Observations?$filter=result%20gt%20290%20or%20result%20eq%20250) ✔️   283. result => 551 :  [GET /test/v1.1/Observations?$filter=length(result) le 2](https://sensorthings.geosas.fr/test/test/v1.1/Observations?$filter=length(result)%20le%202) ✔️   284. result => 4 :  [GET /test/v1.1/Things?$filter=Datastreams/Observations/resultTime ge 2020-06-01T00:00:00Z and Datastreams/Observations/resultTime le 2022-07-01T00:00:00Z](https://sensorthings.geosas.fr/test/test/v1.1/Things?$filter=Datastreams/Observations/resultTime%20ge%202020-06-01T00:00:00Z%20and%20Datastreams/Observations/resultTime%20le%202022-07-01T00:00:00Z) ✔️   285. result => 3 :  [GET /test/v1.1/Locations?$filter=geo.intersects(location, geography'POLYGON ((-4.21284 47.87193, -4.22584 48.04148, -3.99840 48.05802,-4.01317 47.90265,-4.21284 47.87193))') and location/type eq 'Point'](https://sensorthings.geosas.fr/test/test/v1.1/Locations?$filter=geo.intersects(location,%20geography'POLYGON%20((-4.21284%2047.87193,%20-4.22584%2048.04148,%20-3.99840%2048.05802,-4.01317%2047.90265,-4.21284%2047.87193))')%20and%20location/type%20eq%20'Point') ✔️   286. result => 3 :  [GET /test/v1.1/Locations?$filter=geo.intersects(geography'POLYGON ((-4.21284 47.87193, -4.22584 48.04148, -3.99840 48.05802,-4.01317 47.90265,-4.21284 47.87193))', location) and location/type eq 'Point'](https://sensorthings.geosas.fr/test/test/v1.1/Locations?$filter=geo.intersects(geography'POLYGON%20((-4.21284%2047.87193,%20-4.22584%2048.04148,%20-3.99840%2048.05802,-4.01317%2047.90265,-4.21284%2047.87193))',%20location)%20and%20location/type%20eq%20'Point') ✔️