
// ===============================================================================
// |                                   HELPERS                                   |
// ===============================================================================

  const capitalize = s => s && s[0].toUpperCase() + s.slice(1)

  // show spinner
  function wait(on) {
    toggleShowHide(spinner, on);
  };

  async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
  }

  const getElement = (input) =>  {
    const elem = (typeof input === "string") ? document.getElementById(input) : input;
    return (typeof(elem) != 'undefined' && elem != null) ? elem : undefined;
  }

  function getEntityName(search) {
    const testString = search
        .match(/[a-zA-Z_]/g)
        ?.join("")
        .trim();
  
    return testString
        ? _PARAMS._DATAS.hasOwnProperty(testString)
            ? testString
            : Object.keys(_PARAMS._DATAS).filter((elem) => _PARAMS._DATAS[elem].table == testString.toLowerCase() || _PARAMS._DATAS[elem].singular == testString)[0]
        : undefined;
    }

  function createBlankJsonDatas() {
    jsonDatas.remove();
    const newDiv = document.createElement("div");
    newDiv.setAttribute("contenteditable", "");
    newDiv.setAttribute("spellcheck", "false");
    newDiv.id = "jsonDatas";
    newDiv.clientHeight = "100%";
    newDiv.classList.add("shj-lang-json");
    jsonDatasContainer.appendChild(newDiv);
  }


  function isValidJson(json) {
    try {
        JSON.parse(json);
        return true;
    } catch (e) {
        return false;
    }
  }

  function classIsValidJson(element) {
    if (isValidJson(element.value)) {
      element.classList.add("good");
      element.classList.remove("error");
      return true;
    } else {
      element.classList.remove("good");
      element.classList.add("error");
      return false;
    }
  };

  const getValue = (element) =>{ 
    if (element.type == "textarea") {
         return classIsValidJson (element) ? JSON.parse(element.value) : undefined;
    }
    else return element.value.trim() == "" ? undefined :element.value;
}

async function  getFetchDatas(url, format) {
  if (isDebug) console.log("==================== getFetchDatas ====================");
  if (isDebug) console.log(url);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (format && ["csv","txt","sql"].includes(format))
      return await response.text();
      else  return await response.json();
}


function LoadDatas(source, lang) {
  try {
    const element = getElement(jsonDatas);
    if (element) highlightElement(source, lang);
  } catch (err) {
    notifyError("Error", err);
  } finally {
    buttonGo();
  }
}




function beautifyDatas(element, source, lang) {
  try {
    switch (lang) {
      case "sql":
        break;
      case "js":
        source = pretty.js(source);
        break;
      default:
        source = pretty.json(source);
        break;
    }
    if (element) highlightElement(element, source, lang);
  }
  catch (err) {
    notifyError("Error", err);
  } finally {
    buttonGo();
  }
}

async function executeSql(e) {
  wait(true); 
  if (e) e.preventDefault();
  try {
    const encoded = btoa(winSqlQuery.content.innerText); 
    const url = `${optHost.value}/${optVersion.value}/Sql?$query=${encoded}`;
    const jsonObj = await getFetchDatas(url);
    updateWinJsonResult(jsonObj, url);          
  }
  catch (err) {
    notifyError("Error", err);
  } finally {
    wait(false);
  } 
}

async function executeJS(e) {
  wait(true); 
  if (e) e.preventDefault();
  try {
    
    new ExecuteCode({
      title:  "Execute code",
      submitText: "Execute",
      content: `enter payload`,
      placeholderText: "payload",
      code: winDecoderCode.content.innerText
    });

  }
  catch (err) {
    notifyError("Error", err);
  } finally {
    wait(false);
  } 
}