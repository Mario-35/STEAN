const pretty = new pp();
const SubOrNot = () => _PARAMS.admin === false && subentity.value !== _NONE ? subentity.value : entity.value;
const isObservation = () => entity.value == "Observations" || subentity.value == "Observations";

const testNull = (input) => (input.value == "<empty string>" || input.value.trim() == "" || input.value.trim()[0] == "0" || input.value.startsWith(_NONE)); 


// DON'T REMOVE !!!!
// @start@


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
    let temp = importFile ? ["json"] : ["json","csv","txt","dataArray","sql"];
    if (isObservation() || queryResultFormat.value == "graph") {
      temp.push("graph");
      temp.push("graphDatas");
    }
    if (entity.value === "Logs") temp.push("logs");
    return temp;
  }

  function tabEnabledDisabled(objName, test) {
    const elemId = (typeof objName === "string") ? document.getElementsByName(objName)[0] : objName;
    if (typeof(elemId) != 'undefined' && elemId != null) {
      if (test === true ) elemId.removeAttribute("disabled");
        else {
          elemId.setAttribute('disabled', '');
          elemId.checked = false;
        }
    }
  }

  function updateForm() {
    header("updateForm");    
    toggleShowHide(logout, _PARAMS.user.canPost);
    buttonGo();

    const tempOptions = getFormatOptions() ;
    populateSelect(queryResultFormat, tempOptions, getDefaultValue(queryResultFormat, tempOptions));
    getElement("actionForm").action = `${optHost.value}/${optVersion.value}/${entity.value}${entity.value === "CreateObservations" ? "" : `${entity.value}(${nb.value})/CreateFile` }`;
    tabEnabledDisabled("propertyTab", (nb.value != ""));
    tabEnabledDisabled("importTab", _PARAMS.user.canPost);
    tabEnabledDisabled("multiDatastreamTab", entity.value === "MultiDatastreams" && subentity.value === "Observations");
    tabEnabledDisabled("observationsTab", isObservation());
    
  }


  function refresh() {
    header("refresh");
    const tempEntity = SubOrNot();
    populateMultiSelect("querySelect", columnsList(tempEntity).filter(e => !e.includes("_")) , "all");
    populateMultiSelect("queryOrderBy", columnsList(tempEntity));
    populateSelect(queryProperty, columnsList(tempEntity), _PARAMS.property != undefined ? _PARAMS.property :_NONE, true);
    populateMultiSelect("queryExpand", relationsList(tempEntity));
    updateForm();
    updateBuilder();
    canShowQueryButton();
    toggleShowHide(getElement("payloadPartTab"), entity.value === "Decoders" );
    toggleShowHide(getElement("logsPartTab"), entity.value === "Logs" );
  }

  function updateBuilder() {
    const ent = getEntityName(SubOrNot());
    if (!ent) return;
    const columns = columnsList(ent);
    const fields = [];
    columns.forEach(e => {
      fields.push({
        "value": e,
        "label": e,
        "type":  _PARAMS._DATAS[ent].columns[e] && _PARAMS._DATAS[ent].columns[e].type ? _PARAMS._DATAS[ent].columns[e].type : "text",
      });
    });
    if (builder) builder.clear("query-builder", fields); else builder = new QueryBuilder("query-builder", fields);
  }

  function canShowQueryButton() {
    EnabledOrDisabled([go, btnShowLinks], (!testNull(subentity) && testNull(nb)) ? false : true);    
  }

  // ===============================================================================
  // |                                  GO Button                                  |
  // ===============================================================================

  function whatButton(obj) {
      if (go === obj) show(getElement(go));
      else hide(getElement(go));
  }

  function buttonGo() {
    if (importFile == true) {
      hide(go);    
      show(submit);   
    } else {
      show(go);
      canShowQueryButton();
      hide(submit);          
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
        title:  `Editing  ${name}`,
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

  function ToggleOption(test, key, value, deleteFalse){
    if (test) addOption(key, value, deleteFalse);
    else delete listOptions[key];
  }

  var addOption = function(key, value, deleteFalse){
    if ((deleteFalse && value.toUpperCase() === deleteFalse) || !value || value === "" || value === "<empty string>") 
      delete listOptions[key];
    else listOptions[key] = value; 
    queryOptions.value = createOptionsLine();
  };

  var deleteOption = function(key){
    delete listOptions[key];
    queryOptions.value = createOptionsLine();
  };

  function clear() {
    entity.value = _NONE;
    subentity.value = _NONE;
    topOption.value = 0;
    skipOption.value = 0;
    nb.value = 0;
    splitResultOption.checked = false;
    splitResultOptionName.value = "";
    queryResultFormat.value = "JSON";
    method.value = "GET";
  }

  function init() {
    header("==== Init ====");
    hide(datas);
   
    if (isDebug) console.log(_PARAMS);
    new SplitterBar(container, first, two);
    wait(false);
    const tempEntity = _PARAMS.entity && _PARAMS.entity != "" ? _PARAMS.entity : "Things";
    populateSelect(entity, entityList(), tempEntity);
    const subs = relationsList(tempEntity);
    populateSelect(subentity, subs, subs.includes(_PARAMS.subentity) ? _PARAMS.subentity : _NONE, true);

    populateSelect(entity, Object.keys(_PARAMS._DATAS), tempEntity);

    populateSelect(method, entity.value == "Loras" ? ["GET","POST"] : _PARAMS.methods, _PARAMS.method ? _PARAMS.method : "GET");
    hide(querySubExpand);
    nb.value = _PARAMS.id;
    
    refresh();

    optVersion.value = _PARAMS.version;
    optHost.value = _PARAMS.host;
    if(_PARAMS.datas) datas.json_value = _PARAMS.datas;
    queryOptions.value = _PARAMS.options;

    decodeOptions();
    jsonViewer = new JSONViewer();
  }

  
init();

