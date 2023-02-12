const pretty = new pp();
const SubOrNot = () => _PARAMS.admin === false && subentity.value !== _NONE ? subentity.value : entity.value;
const isObservation = () => entity.value == "Observations" || subentity.value == "Observations";
const testNull = (input) => (input.value == "<empty string>" || input.value.trim() == "" || input.value.trim()[0] == "0" || input.value.startsWith(_NONE)); 


/**
 * Show spinner for wating
 * @param {boolean} on 
 */
function wait(on) {
  toggleShowHide(spinner, on);
};

// load file json
let importFile = false;

// DON'T REMOVE !!!!
// @start@

/**
 * Show message popup
 * @param {*} titleMess 
 * @param {*} bodyMess 
 */
function notifyError(titleMess, err) {
    new Error({
      title: titleMess,
      content: typeof err === "object"?  err.message: err
    });        
  };
    
    function notifyAlert(titleMess, message) {
      new Alert({
        title: titleMess,
        content: message
      }); 
    };
    function notifyPrompt(titleMess, message,submitText,placeholderText) {
      new Prompt({
        title: titleMess,
        content: message,
        submitText,
        placeholderText
      }); 
    };

    function notifyJson(titleMess, contentJson) {
      new ViewJson({
        title: titleMess,
        content: contentJson
      }); 
    };
      
function notifyConfirm(titleMess, message) {
      new Confirm({
        title: titleMess,
        content: message
    });        
};

  function getVersion(input) {
    const splitVersion = (str) =>
      str
        .replace(/[//]+/g, '/')
        .split('/')
        .filter((value) => value.match(/v{1}\d\.\d/g));
        
    return splitVersion(input)[0];
  };

  function hide(obj) {
    obj.style.display = _NONE;
  }

  function show(obj) {
    obj.style.display = "block";
  }

  function toggleShowHide(obj, test) {
    obj.style.display = test === true ? "block" : _NONE;
  }

  function EnabledOrDisabled(obj, test) {
    if (obj.length == undefined) obj = [obj];
    obj.forEach(e => {
      if (test) e.removeAttribute('disabled', ''); 
      else e.setAttribute('disabled', ''); 
    });
  }

  function getIfChecked(objName) {
    const elemId = getElement(objName);
    if (elemId) return (elemId.checked === true);
    return false;
  };

  function getIfId(objName) {
    const index = Number(nb.value);
    return (index > 0);
  };
  
  function getDefaultValue(obj, list) {
    return obj.value != "" && list.includes(obj.value) ? obj.value : list[0]; 
  };

  function getFormatOptions() {
    let temp = importFile ? ["json"]  : ["json","csv","txt","dataArray","sql"];
    if (isObservation() || queryResultFormat.value == "graph") {
      temp.push("graph")
      temp.push("graphDatas")
    };
    return temp;
  };

  function updateForm() {
    toggleShowHide(observationsTab, isObservation());    
    toggleShowHide(importTab, _PARAMS.user.canPost);    
    toggleShowHide(logout, _PARAMS.user.canPost);
    toggleShowHide(fileone, _PARAMS.user.canPost);
    toggleShowHide(fileonelabel, _PARAMS.user.canPost);  
    buttonGo();
    ToggleOption( getIfChecked("splitResultOption") && isObservation(), 'splitResult',splitResultOptionName.value, "");

    const temp = getFormatOptions() ;
    populateSelect(queryResultFormat, temp, getDefaultValue(queryResultFormat, temp));
  };



  function refreshAfterEntityOrSubEntity() {
    const tempEntity = SubOrNot();
    populateMultiSelect("querySelect", columnsList(tempEntity) , null, "all");
    populateMultiSelect("queryOrderBy", columnsList(tempEntity) , null, _NONE, true);
    populateSelect(queryProperty, columnsList(tempEntity), _PARAMS.property != undefined ? _PARAMS.property :_NONE, true);
    populateMultiSelect("queryExpand", relationsList(tempEntity), null, _NONE);
    refresh();
    updateForm();
    updateBuilder();
    canShowQueryButton();
    canShowSplitsElements();
  };

  function updateBuilder() {
    const ent = SubOrNot();
    if (!ent) return;
    const columns = columnsList(ent);
    const fields = [];
      relationsList(ent).forEach(e => {
        fields.push({
          "value": e,
          "label": e,
          "type":  _PARAMS._DATAS[ent].columns[e] && _PARAMS._DATAS[ent].columns[e].type  ? _PARAMS._DATAS[ent].columns[e].type : "text",
        });
      });
     if (builder) builder.clear("query-builder", fields); else builder = new QueryBuilder("query-builder", fields);
  }


// ===============================================================================
// |                                   REFRESH                                   |
// ===============================================================================



  function whatButton(obj) {
    [ go, addImport].forEach(elem => {
      if (elem === obj) show(getElement(elem));
      else hide(getElement(elem));
    });
  }

  function buttonGo() {
    if (importFile == true) {
      hide(go);
      show(addImport);
      
      const textValue = jsonDatas.last_string_content;
      
      toggleShowHide(submit, textValue.match("columns") != null);
      
    } else {
      show(go);
      canShowQueryButton();
      hide(submit);
      hide(addImport);
    }
  };

  function canShowQueryButton() {
    EnabledOrDisabled([go, btnShowLinks], (!testNull(subentity) && testNull(nb)) ? false : true);    
  };

  function canShowSplitsElements() {
    EnabledOrDisabled([splitResultOption, splitResultOptionName], ((!testNull(subentity) && subentity.value === "Observations") && (!testNull(entity) && entity.value === "MultiDatastreams")));
  }

// ===============================================================================
// |                                  GO Button                                  |
// ===============================================================================


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
// |                                 REFRESH                                     |
// ===============================================================================


function refresh() {
  queryOptions.value =  createOptionsLine();
  const elemForm = getElement("pro-form");
  const elemId = getElement("debug");
  if (elemId && elemForm) {
    if (elemId.checked === true) {
      if (!elemForm.action.includes("?$debug=true")) elemForm.action = elemForm.action + "?$debug=true";
    } else elemForm.action = elemForm.action.replace("?$debug=true","");
  }
};


// ===============================================================================
// |                                    OPTIONS                                  |
// ===============================================================================

function createOptionsLine() {
  const temp = [];
  for (var key in listOptions) {
    temp.push("$" + key + "=" + listOptions[key]);
  }
  return temp.join("&");
};

function ToggleOption(test, key, value, deleteFalse){
  if (test) addOption(key, value, deleteFalse);
  else delete listOptions[key];
}

var addOption = function(key, value, deleteFalse){
  if ((deleteFalse && value.toUpperCase() === deleteFalse) || !value || value === "" || value === "<empty string>") 
    delete listOptions[key];
   else listOptions[key] = value; 
   queryOptions.value =  createOptionsLine();
};

var deleteOption = function(key){
  delete listOptions[key];
  queryOptions.value =  createOptionsLine();
};

  function clear() {
    entity.value = _NONE;
    subentity.value = _NONE
    topOption.value = 0;
    skipOption.value = 0;
    nb.value = 0;
    splitResultOption.checked = false;
    splitResultOptionName.value = "";
    queryResultFormat.value = "JSON";
    method.value = "GET";
  }

function init() {
  if (isDebug) console.log("==================== Init ====================");
  if (isDebug) console.log(_PARAMS);
  new SplitterBar(container, first, two);
  wait(false);
  const tempEntity = _PARAMS.entity &&  _PARAMS.entity != "" ? _PARAMS.entity : "Things";
  populateSelect(entity, entityList(), tempEntity);
  const subs = relationsList(tempEntity);
  populateSelect(subentity, subs, subs.includes(tempEntity) ? _PARAMS.subentity : _NONE, true);

  if (_PARAMS.admin == true) populateSelect(entity, Object.keys(_PARAMS._DATAS), tempEntity);

  populateSelect(method, entity.value == "Loras" ? ["GET","POST"]  : _PARAMS.methods, _PARAMS.method ? _PARAMS.method : "GET");
  populateSelect(selectSeries, ["year", "month", "day"], _NONE, true); 
  
  
  // hide _PARAMS
  // if (!isDebug)  history.replaceState({}, null, `${optHost.value}/${optVersion.value}/Query`);
  hide(querySubExpand);
  nb.value = _PARAMS.id;
  
  refreshAfterEntityOrSubEntity();

  if (decodeOptions(_PARAMS.options) == false) {
    onlyValue.checked = _PARAMS.onlyValue == "true"; 
    
    optVersion.value = _PARAMS.version;
    optHost.value = _PARAMS.host;
    
    queryOptions.value = _PARAMS.options;
    if (queryOptions.value[0] == "&") queryOptions.value = queryOptions.value.substring(1);
    if(_PARAMS.datas) jsonDatas.json_value = _PARAMS.datas;
  }

};



init();


