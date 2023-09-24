function decodeFull(input, nomenclature) {
	const decoded = {
		valid: true,
		err: 0,
		payload: input,
		messages: []
	};
	const temp = input.match(/.{1,2}/g);
	if (temp != null) {
		if (temp[0] == "01" || temp[0] == "81") {
			decoded.messages.push({
				type: "report_telemetry",
				measurementName: nomenclature["0610"],
				measurementValue: (parseInt(String(temp[2]) + String(temp[1]), 16) * 175.72) / 65536 - 46.85
			});
			decoded.messages.push({
				type: "report_telemetry",
				measurementName: nomenclature["0710"],
				measurementValue: (parseInt(temp[3], 16) * 125) / 256 - 6
			});
			decoded.messages.push({
				type: "upload_battery",
				measurementName: nomenclature["period"],
				measurementValue: parseInt(String(temp[5]) + String(temp[4]), 16) * 2
			});
			decoded.messages.push({
				type: "upload_battery",
				measurementName: nomenclature["voltage"],
				measurementValue: (parseInt(temp[8], 16) + 150) * 0.01
			});
			return decoded;
		}
	}
	decoded["valid"] = false;
	decoded["err"] = -1;
	return decoded;
}


const nomenclature = { "voltage": "battery voltage", "period": "periods", "0110": "air temperature", "0210": "air humidity", "0310": "light intensity", "0410": "humidity", "0510": "barometric pressure", "0610": "soil temperature", "0700": "battery", "0710": "soil moisture" }; 
const src = "010610A6580000010710C80000007FF0";
const test = decodeFull(src.toUpperCase(),nomenclature);
console.log(test);