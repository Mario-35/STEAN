function Decoder(bytes, port) {
    var obj = new Object();
    
    //temp
    var tempEncoded=(bytes[2]<<8)|(bytes[1]);
    var tempDecoded=(tempEncoded*175.72/65536)-46.85;
    obj.temp=tempDecoded.toFixed(2);
    
    //humidity
    var humEncoded=(bytes[3]);
    var humDecoded=(humEncoded*125/256)-6;
    obj.hum=humDecoded.toFixed(2);
    
    //period
    var periodEncoded=(bytes[5]<<8)|(bytes[4]);
    var periodDecoded=(periodEncoded*2);
    obj.period=periodDecoded+" sec";
    
    //battery
    var batteryEncoded=(bytes[8]);
    var batteryDecoded=(batteryEncoded+150)*0.01;
    obj.battery=batteryDecoded.toFixed(2);
    
    
    return obj;
    }

    // function t(r) {
    //     for (var e = [], t = 0; t < r.length; t += 2) e.push(r.substring(t, t + 2));
    //     console.log(e);
    //     return e;
    // }
    
    var sample = Decoder("010610A6580000010710C80000007FF0", null);
    // console.log(sample);
    
    console.log(sample);