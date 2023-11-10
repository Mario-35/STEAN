// ===============================================================================
// |                                   EVENTS                                    |
// ===============================================================================

submit.onclick = () => {
	wait(true);
	try {
		const text = jsonDatas.innerText.replace(/[^\x00-\x7F]/g, '');
		datas.innerText = text;
		document.getElementById("actionForm").requestSubmit();
	} catch (error) {
		console.log(error);
	}
};

services.addEventListener("change", () => {
	window.location.href = `${_PARAMS.host.split(`/${_PARAMS.host.split("/").pop()}`)[0]}/${services.value}/${optVersion.value}/Query`;
});

preview.onclick = () => {
	updateWinJsonResult(jsonDatas.innerText, "Preview datas");
};

logout.onclick = () => {
	window.location.href = `${optHost.value}/${optVersion.value}/logout`;
};

info.onclick = () => {
	window.location.href = `${optHost.value}/${optVersion.value}/status`;
};

doc.onclick = () => {
	var temp = optHost.value.split("/");
	temp.pop();
	window.location.href = temp.join("/");
};

git.onclick = () => {
	window.location.href = "https://github.com/Mario-35/STEAN";
};

debug.onclick = () => {
	isDebug = !isDebug;
	if (isDebug)
		debug.classList.add("debug");
	else debug.classList.remove("debug");
};

btnShowLinks.onclick = () => {
	const temp = createUrl();
	updateWinLinks(JSON.parse(` { "direct" : "${temp.direct}", "query" : "${temp.query}"}`));
};

btnPostTemplate.onclick = () => {
	const result = (importFile == true) ? JSON.stringify({
		"header": true,
		"nan": true,
		"duplicates": true,
		"columns": {
			"1": {
				"datastream": "1",
				"featureOfInterest": "1"
			}
		}
	}) : {};
	const src = Object.keys(_PARAMS._DATAS[entityOption.value].columns);
	src.forEach(e => {
		if (_PARAMS._DATAS[entityOption.value].columns[e].type)
			switch (_PARAMS._DATAS[entityOption.value].columns[e].type.split(":")[0]) {
				case "json":
					result[e] = {};
					break;
				case "relation":
					result[e.split("_id")[0]] = {
						"@iot.id": -1
					};
					break;
				case "text":
					result[e] = "";
					break;

				default:
					break;
			} else console.log(e);
	});

	beautifyDatas(getElement("jsonDatas"), result, "json");
};

btnRoot.onclick = async () => {
	const url = `${optHost.value}/${optVersion.value}/`;
	const jsonObj = await getFetchDatas(url, "GET");
	updateWinJsonResult(jsonObj, `[GET]:${url}`);
};

btnClear.onclick = () => {
	datas.innerText = "";
	buttonGo();
};

go.onclick = async (e) => {
	wait(true);
	if (e) e.preventDefault();
	const tablewrapper = getElement("tablewrapper");
	if (tablewrapper) {
		while (tablewrapper.firstChild) {
			tablewrapper.removeChild(tablewrapper.lastChild);
		}
	}
	two.classList.remove("scrolling");

	const temp = createUrl();
	let url = temp.direct;

	switch (methodOption.value) {
		case "GET":
			// ===============================================================================
			// |                                     GET                                     |
			// ===============================================================================
			if (resultFormatOption.value === "graph") {
				window.open(url);
				wait(false);
				return;
			} 
			const jsonObj = await getFetchDatas(url, resultFormatOption.value);
			try {
				if (resultFormatOption.value === "sql")
					updateWinSqlQuery(jsonObj);
				else if (resultFormatOption.value === "csv")
					updateWinCsvResult(jsonObj);
				else if (resultFormatOption.value === "graph")
					updateWinGraph(jsonObj);
				else if (resultFormatOption.value === "logs")
					updateWinLogs(jsonObj);
				else updateWinJsonResult(jsonObj, `[${methodOption.value}]:${url}`);
			} catch (err) {
				notifyError("Error", err);
			} finally {
				wait(false);
			}
			break;
		case "POST":
		case "PATCH":
			// ===============================================================================
			// |                               POST $ PATCH                                  |
			// ===============================================================================
			if (entityOption.value === "createDB") {
				const response = await fetch(`${optHost.value}/${optVersion.value}/createDB`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: jsonDatas.innerText,
				});
				const value = await response.text();
				if (response.status == 401) {
					window.location.href = `${_PARAMS.inkBase}/${_PARAMS.version}/login`;
				}
				wait(false);
				updateWinJsonResult(JSON.parse(value), `[${methodOption.value}]:${url}`);
			} else {
				const response = await fetch(url, {
					method: methodOption.value,
					headers: {
						"Content-Type": "application/json",
					},
					body: jsonDatas.innerText,
				});
				const value = await response.json();
				if (response.status == 401) {
					// window.location.replace(value);
					window.location.href = "/login";
				}
				wait(false);
				updateWinJsonResult(value, `[${methodOption.value}]:${url}`);
			}
			break;
		case "DELETE":
			// ===============================================================================
			// |                                   DELETE                                    |
			// ===============================================================================
			try {
				if (idOption.value && Number(idOption.value) > 0 || (entityOption.value === "Loras" && idOption.value !== "")) {
					let response = await fetch(url, {
						method: "DELETE",
						headers: {
							"Content-Type": "application/json",
						},
					});

					if (response.status == 204)
						notifyAlert("Delete", `delete ${entityOption.value} id : ${idOption.value}`);
					else notifyError("Error", `delete ${entityOption.value} id : ${idOption.value}`);
				}
			} catch (err) {
				notifyError("Error", err);
			} finally {
				wait(false);
			}
			break;
		default:
			break;
	}
};

idOption.addEventListener("change", () => {
	updateForm();
});

idOption.addEventListener("exit", () => {
	refresh();
});

entityOption.addEventListener("change", () => {
	refresh_entity();
	refresh();
});

subentityOption.addEventListener("change", () => {
	refresh();
});

propertyOption.addEventListener("change", () => {
	updateForm();
});

resultFormatOption.addEventListener("change", () => {
	updateForm();
});

fileone.addEventListener("change", (e) => {
	header("fileone");
	var fileName = "";
	try {
		if (this.files && this.files.length > 1)
			fileName = (this.getAttribute("data-multiple-caption") || "").replace("{count}", this.files.length);
		else
			fileName = e.target.value.split("\\").pop();

		if (fileName) {
			fileonelabel.selectOptionor("span").innerHTML = fileName;
			methodOption.value = "POST";
			// const key = "Datastreams";
			// entityOption.value = key;
			// if (Object.keys( _PARAMS._DATAS [key].relations)) populateSelect(subentityOption, Object.keys( _PARAMS._DATAS [key].relations)[entityOption.value], "Observations", true);
			importFile = true;
		} else {
			fileonelabel.innerHTML = labelVal;
		}
	} catch (err) {
		notifyError("Error", err);
	} finally {
		buttonGo();
	}
});

function addToResultList(key, value, plus) {
	var li = document.createElement("li");
	li.innerText = `${key}: `;
	var span = document.createElement("span");
	span.className = "json-literal";
	span.innerText = value;
	li.appendChild(span);
	getElement("listResult").appendChild(li);
	if (plus) {
		addToResultList("-->", plus);
	}
}


function prepareForm() {
	if (importFile === true) {
		const text = jsonDatas.innerText.replace(/[^\x00-\x7F]/g, '');
		datas.innerText = text;
		document.getElementById("actionForm").requestSubmit();
	}
}

btnTool.onclick = async () => {
	var i = 0;
	var step = +loopStep.value;
	for (i = 5; i <= 1000000; i += step) {

		console.log(i);
	}

};