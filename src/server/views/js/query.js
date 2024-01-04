const pretty = new pp();
const SubOrNot = () => _PARAMS.admin === false && subentityOption.value !== _NONE ? subentityOption.value : entityOption.value;
const isObservation = () => entityOption.value == "Observations" || subentityOption.value == "Observations";
const isLog = () => resultFormatOption.value === "logs";

const testNull = (input) => (input.value == "<empty string>" || input.value.trim() == "" || input.value.trim()[0] == "0" || input.value.startsWith(_NONE));


// DON'T REMOVE !!!!
// @start@

function setChecked(objName, state) {
	const elemId = getElement(objName);
	if (elemId) elemId.checked = state;														
}

function getIfChecked(objName) {
	const elemId = getElement(objName);
	if (elemId) return (elemId.checked === true);
	return false;
}

function getIfId(objName) {
	const index = Number(nb.value);
	return (index > 0);
}

function getDefaultValue(obj, list) {
	return obj.value != "" && list.includes(obj.value) ? obj.value : list[0];
}

function getFormatOptions() {
	let temp = importFile ? ["json"] : ["json", "csv", "txt", "dataArray", "sql"];
	if (isObservation() || resultFormatOption.value == "graph") {
		temp.push("graph");
		temp.push("graphDatas");
	}
	if (entityOption.value === "Logs") temp.push("logs");
	return temp;
}

function tabEnabledDisabled(objName, test) {
	const elemId = (typeof objName === "string") ? document.getElementsByName(objName)[0] : objName;
	if (typeof(elemId) != 'undefined' && elemId != null) {
		if (test === true) elemId.removeAttribute("disabled");
		else {
			elemId.setAttribute('disabled', '');
			elemId.checked = false;
		}
	}
}


function updateBuilder() {
	const ent = getEntityName(SubOrNot());
	if (!ent) return;
	const columns = getColumnsList(ent);
	const fields = [];
	columns.forEach(e => {
		fields.push({
			"value": e,
			"label": e,
			"type": _PARAMS._DATAS[ent].columns[e] && _PARAMS._DATAS[ent].columns[e].type ? _PARAMS._DATAS[ent].columns[e].type : "text",
		});
	});
	if (builder) builder.clear("query-builder", fields);
	else builder = new QueryBuilder("query-builder", fields);
}

function canShowQueryButton() {
	EnabledOrDisabled([go, btnShowLinks], (!testNull(subentityOption) && testNull(idOption)) ? false : true);
}

// ===============================================================================
// |                                  GO Button                                  |
// ===============================================================================

function whatButton(obj) {
	if (go === obj) show(getElement(go));
	else hide(getElement(go));
}

function buttonGo() {
	if (importFile === true) {
		hide(go);
		console.log(submit.value);
		show(submit);
		hide(btnCreate);
	} else if (_PARAMS.methods.includes("POST") && jsonDatas.innerText.includes('"create": {')) {
		hide(go);
		show(btnCreate);
		hide(submit);
	} else {
		show(go);
		canShowQueryButton();
		hide(submit);
		hide(btnCreate);
	}
}

async function editDataClicked(id, _PARAMS) {
	const name = _PARAMS.seriesName;
	const when = _PARAMS.name;
	const myUrl = `${optHost.value}/${optVersion.value}/Observations(${id})`;
	let getEditData = await fetch(myUrl, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const editData = await getEditData.json();

	new Prompt({
		title: `Editing  ${name}`,
		submitText: "Valid",
		content: `date : ${when}`,
		placeholderText: (typeof editData.result === "object") ? `${editData.result[name]}` : `${editData.result}`,
	});
}

// ===============================================================================
// |                                    OPTIONS                                  |
// ===============================================================================

function createOptionsLine() {
	const temp = [];
	for (var key in listOptions) {
		temp.push("$" + key + "=" + listOptions[key]);
	}
	return temp.join("&");
}

function ToggleOption(test, key, value, deleteFalse) {
	if (test) addOption(key, value, deleteFalse);
	else delete listOptions[key];
}

var addOption = function(key, value, deleteFalse) {
	if ((deleteFalse && value.toUpperCase() === deleteFalse) || !value || value === "" || value === "<empty string>")
		delete listOptions[key];
	else listOptions[key] = value;
	queryOptions.value = createOptionsLine();
};

var deleteOption = function(key) {
	delete listOptions[key];
	queryOptions.value = createOptionsLine();
};

function clear() {
	entityOption.value = _NONE;
	subentityOption.value = _NONE;
	topOption.value = 0;
	skipOption.value = 0;
	idOption.value = 0;
	resultFormatOption.value = "JSON";
	methodOption.value = "GET";
}

function init() {
	header("==== Init ====");
	hide(datas);

	if (isDebug) console.log(_PARAMS);
	new SplitterBar(container, first, two);
	wait(false);
	const tempEntity = _PARAMS.entity || "Things";
	populateSelect(entityOption, getEntityList(), tempEntity);
	const subs = getRelationsList(tempEntity);
	populateSelect(subentityOption, subs, subs.includes(_PARAMS.subentityOption) ? _PARAMS.subentityOption : _NONE, true);

	populateSelect(entityOption, Object.keys(_PARAMS._DATAS), tempEntity);
	populateSelect(services, _PARAMS.services, _PARAMS.host.split("/").pop());

	populateSelect(methodOption, entityOption.value == "Loras" ? ["GET", "POST"] : _PARAMS.methods, _PARAMS.method ? _PARAMS.method : "GET");
	hide(subExpandOption);
	idOption.value = _PARAMS.id;

	refresh();
	populateMultiSelect("queryMetric", _PARAMS.metrics);
	optVersion.value = 'v' + _PARAMS.version;
	optHost.value = _PARAMS.host;
	if (_PARAMS.datas) datas.json_value = _PARAMS.datas;
	queryOptions.value = _PARAMS.options;

	// decodeUrl(window.location.href);
	jsonViewer = new JSONViewer();
}


init();