const createStringFunction = require("./helper/createStringFunction.js");
const message = require("./helper/message.js");

const _NAME = "Watteco";

function decode (bytes) {
    if (typeof bytes === "string") bytes = Buffer.from(bytes,'hex');

	var decoded = {
		valid: false,
		payload: "",
		messages: []
	};

    function Bytes2Float32(bytes) {
        var sign = (bytes & 0x80000000) ? -1 : 1;
        var exponent = ((bytes >> 23) & 0xFF) - 127;
        var significand = (bytes & ~(-1 << 23));
    
        if (exponent == 128) 
            return sign * ((significand) ? Number.NaN : Number.POSITIVE_INFINITY);
    
        if (exponent == -127) {
            if (significand == 0) return sign * 0.0;
            exponent = -126;
            significand /= (1 << 22);
        } else significand = (significand | (1 << 23)) / (1 << 23);
    
        return sign * significand * Math.pow(2, exponent);
    }

	var bytes_len_	= bytes.length;
	var temp_hex_str = "";

	for( var j = 0; j < bytes_len_; j++ )

	{
		temp_hex_str = bytes[j].toString( 16 ).toUpperCase( );
		if( temp_hex_str.length == 1 )
		{
		  temp_hex_str = "0" + temp_hex_str;
		}
		decoded.payload += temp_hex_str;
		var date = new Date();
		decoded.date = date.toISOString();
	}
	
	//trame standard
	if (!(bytes[0] & 0x01) === false) {
		attributID = -1;
		cmdID = -1;
		clusterdID = -1;
		//command ID
		cmdID = bytes[1]; 
		//Cluster ID
		clusterdID = bytes[2]*256 + bytes[3]; 
		// decode report and read atrtribut response
		if((cmdID === 0x0a)|(cmdID === 0x8a)|(cmdID === 0x01)){
			//Attribut ID 
			attributID = bytes[4]*256 + bytes[5];
			//data index start
			if ((cmdID === 0x0a) | (cmdID === 0x8a))	index = 7;
			if (cmdID === 0x01)	index = 8;			
			if ((clusterdID === 0x000c ) & (attributID === 0x0055)) {
				const decodedValue = Bytes2Float32(bytes[index]*256*256*256+bytes[index+1]*256*256+bytes[index+2]*256+bytes[index+3]);
				decoded.messages.push({ 
					type : "analog",  
					measurementName: "analog", 
					measurementValue: decodedValue
				});	
				decoded.datas = decodedValue;
			}			
		}
	}
	decoded.valid=true;
	return decoded;
}

const srcValue = {
	"data": {
	  "Data": 4.590106964111328,
	  "Cause": [],
	  "Report": "Standard",
	  "EndPoint": 0,
	  "ClusterID": "AnalogInput",
	  "CommandID": "ReportAttributes",
	  "AttributeID": "PresentValue",
	  "AttributeType": "SinglePrecision"
	},
	"fcnt": 6536,
	"rxpk": {
	  "datr": "SF8BW125",
	  "freq": 867.1,
	  "lsnr": 1.7999999523163,
	  "rssi": -116
	},
	"frame": "110A000C0055394092E228",
	"DevEUI": "70b3d5e75e014f06",
	"deveui": "70B3D5E75E014F06",
	"DevAddr": "00014f06",
	"timestamp": 1695116976,
	"sensorInstallId": "70b3d5e75e014f06"
  };


const nomenclature = {};

const F = new Function(["input", "nomenclature"], createStringFunction(decode.toString()));

  console.log(message(`START ${_NAME}`));
  const test = F(srcValue["frame"], nomenclature);
  console.log(test);

  if (test["datas"] && test["datas"] === srcValue["data"]["Data"]) 
  console.log(message("OK")); 
  else console.log(message());

  
  module.exports = createStringFunction(decode.toString());