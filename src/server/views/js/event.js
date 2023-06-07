// ===============================================================================
// |                                   EVENTS                                    |
// ===============================================================================

  submit.onclick = () => wait(true);

  preview.onclick = () => {
    updateWinJsonResult(datas.innerText, "Preview datas");
  };

  logout.onclick = () => {
    window.location.href = `${optHost.value}/${optVersion.value}/logout`;
  };

  info.onclick = () => {
    window.location.href = `${optHost.value}/${optVersion.value}/status`;
  };

  doc.onclick = () => {
    window.location.href = "https://sensorthings.geosas.fr/apidoc/";
  };

  git.onclick = () => {
    window.location.href = "https://github.com/Mario-35/api-sensorthing";
  };

  btnShowLinks.onclick = () => { 
    const temp = createUrl();
    updateWinLinks(JSON.parse(` { "direct" : "${temp.direct}", "query" : "${temp.query}"}`));
  };

  addImport.onclick = () => {
    datas.innerText = JSON.stringify({
      "header": true,
      "nan": true,
      "duplicates": true,
      "columns": {
        "1": {
          "datastream": "1",
          "featureOfInterest": "1"
        }
      }
    });
    
  };

  btnLimit.onclick = async () => {
    const myUrl = `${optHost.value}/${optVersion.value}/Datastreams(1)/Observations?$limit=resultTime`;
    const response = await fetch(myUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const value = await response.json();
    const min = value["min"].split("T")[0];
    const max = value["max"].split("T")[0];
    dateMin.min = min;
    dateMin.max = max;
    dateMax.min = min;
    dateMax.max = max;
    dateMin.value = min;
    dateMax.value = max;
    new Error({
      title: "Limits",
      useInnerHTML:true,
      content: `count : ${value["count"]} item(s)<br>Date min : ${value["min"]} <br>Date max: ${value["max"]}`
    });
  };

  btnCreateDateFilter.onclick = async () => {
    addOption('filter', `phenomenonTime gt '${dateMin.value}' and phenomenonTime lt '${dateMax.value}'`, '');
  };

  btnPostTemplate.onclick = () => {
    const result = {};
    const src = Object.keys(_PARAMS._DATAS[entity.value].columns);
    src.forEach(e => {
      if(_PARAMS._DATAS[entity.value].columns[e].type)
        switch (_PARAMS._DATAS[entity.value].columns[e].type.split(":")[0]) {
          case "json":
            result[e]= {};
            break;
          case "relation":
            result[e.split("_id")[0]]= {"@iot.id": -1};
            break;
          case "text":
            result[e]= "";
            break;
        
          default:
            break;
        } else console.log(e);
    });
    beautifyDatas(getElement("datas"), result, "json") ;
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
    
    switch (method.value) {
      case "GET":
        // ===============================================================================
        // |                                     GET                                     |
        // ===============================================================================
        console.log(queryResultFormat.value );
        if (queryResultFormat.value === "graph") url=url.replace("resultFormat=graph","resultFormat=graphDatas");
        const jsonObj = await getFetchDatas(url, queryResultFormat.value);
        try {
          if (queryResultFormat.value === "sql") 
            updateWinSqlQuery(jsonObj);
          else if (queryResultFormat.value === "csv") 
            updateWinCsvResult(jsonObj);
          else if (queryResultFormat.value === "graph")   
            showGraph(jsonObj);   
          else updateWinJsonResult(jsonObj, `[${method.value}]:${url}`);     
        } catch (err) {
          notifyError("Error", err);
        } finally {
          wait(false);
        }       
        break;
      case"POST":
      case "PATCH":
        // ===============================================================================
        // |                               POST $ PATCH                                  |
        // ===============================================================================
        if (entity.value === "createDB") {
          const response = await fetch(`${optHost.value}/${optVersion.value}/createDB`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: datas.innerText ,
          });
            const value = await response.text();
            if (response.status == 401) {
              window.location.href = `${_PARAMS.inkBase}/${_PARAMS.version}/login`;
            }
            wait(false);
            updateWinJsonResult(JSON.parse(value), `[${method.value}]:${url}`);    
        } else {
          const response = await fetch(url, {
            method: method.value,
            headers: {
              "Content-Type": "application/json",
            },
            body: datas.innerText,
          });
          const value = await response.json();
          if (response.status == 401) {
            // window.location.replace(value);
            window.location.href = "/login";
          }
          wait(false);
          updateWinJsonResult(value, `[${method.value}]:${url}`);    
        }
        break;
      case"DELETE":
        // ===============================================================================
        // |                                   DELETE                                    |
        // ===============================================================================
        try {
          if (nb.value && Number(nb.value) > 0 || (entity.value === "Loras" && nb.value !== "")) {
            let response = await fetch(url, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            });

            if (response.status == 204) 
              notifyAlert("Delete", `delete ${entity.value} id : ${nb.value}`); 
              else notifyError("Error", `delete ${entity.value} id : ${nb.value}`);  
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

  function clickLink(event) {
    canGo = false;
    const className = Object.values(event.explicitOriginalTarget.classList)[0];
    if (className === "json-url") {
      clear();
      decodeUrl(event.explicitOriginalTarget.innerText);
      refresh();
      canGo = true;
    } else if (className === "json-code" || (event.previousElementSibling && Object.values(event.previousElementSibling.classList).includes("json-code"))) {
      try {
        updateWinDecoderCode(event.explicitOriginalTarget.innerText);  
      } catch (err) {     
        notifyError("Error", err);
      } finally {
        canGo = true;
        buttonGo();
      }
    }
  }

  function dblClickLink(element) {
      if (canGo === true) go.onclick(element);
  }

  nb.addEventListener("change", () => {
    updateForm();
  });

  queryExpand.addEventListener("change", () => {
    const test = !queryExpand.value.startsWith(_NONE);
    toggleShowHide(querySubExpand, test);
    if (test) populateMultiSelect("querySubExpand", Object.keys( _PARAMS._DATAS [queryExpand.value].relations)[subentity.value], null, _NONE);
  });

  entity.addEventListener("change", () => {
    const relations = relationsList(entity.value);
    if (!relations.includes(subentity.value)) {
      subentity.options.length = 0;
      if ((entity.value.includes("createDB") && _PARAMS.user.canCreateDb == true) || importFile) method.value = "POST";
      else if (entity.value === "createDB") method.value = "POST";
      else {
        if (relations) populateSelect(subentity, relations, relations.includes(_PARAMS.subentity) ? _PARAMS.subentity : _NONE, true);
        populateSelect(method, entity.value == "Loras" ? ["GET","POST"] : _PARAMS.methods ,"GET"); 
      }
    }
    refresh();    
  });

  subentity.addEventListener("change", () => {
    refresh();
  });  

  splitResultOption.addEventListener("change", () => {
    const test = getIfChecked("splitResultOption");
    if (test) {
      const element = getElement("splitResultOptionName");
      if(!element) return;
      EnabledOrDisabled(element, test);    
      addOption('splitResult', element.value.trim ()== "" ? "All" : element.value );
    } else deleteOption('splitResult');
    updateForm();
  });


  splitResultOptionName.addEventListener("change", () => {
    if (getElement("splitResultOptionName").value === "") getElement("splitResultOptionName").value = "All";
    addOption('splitResult', getIfChecked("splitResultOption") ? getElement("splitResultOptionName").value : 'false', 'FALSE');
    updateForm();
  });

  queryProperty.addEventListener("change", () => {
    updateForm();
  });

  queryResultFormat.addEventListener("change", () => {
    updateForm();
  });

  fileone.addEventListener( "change", ( e ) => 	{
    var fileName = "";
    try {
      if (this.files && this.files.length > 1 )
        fileName = ( this.getAttribute( "data-multiple-caption" ) || "" ).replace( "{count}", this.files.length );
      else
        fileName = e.target.value.split( "\\" ).pop();
      
      if(fileName) {
        fileonelabel.querySelector( "span" ).innerHTML = fileName;
        method.value = "POST";
        // const key = "Datastreams";
        // entity.value = key;
        // if (Object.keys( _PARAMS._DATAS [key].relations)) populateSelect(subentity, Object.keys( _PARAMS._DATAS [key].relations)[entity.value], "Observations", true);
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
  
  btnLoraLogs.onclick = async (e) => {
    if (e) e.preventDefault();
    wait(true);
    let url = `${optHost.value}/${optVersion.value}/`;
    if(replayId.value.startsWith("where")) {
      const encoded = btoa(`select * from "log_request" ${replayId.value}`);
      url += `Sql?$query=${encoded}`;
      const jsonObj = await getFetchDatas(url, "json");
      wait(false);
      updateWinResult("rien");
      if (getIfChecked("checkReplay") === false) {
        updateWinJsonResult(jsonObj, `[${method.value}]:${url}`); 
        return;
      }
      updateWinResult(`<div class="json-viewer"><ul id="listResult" class="json-dict"><li data-key-type="object">url: <span class="json-literal">response</span></li></ul></div>`);
      jsonObj.forEach(async element => {
        if(element.datas) {
          const myUrl = `${optHost.value}/${optVersion.value}/Loras?$log=${element["id"]}`;
          const response = await fetch(myUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(element["datas"]),
          });
          addToResultList(response.status, myUrl, response.statusText);
        }
      }); 
    } else {
      url += `Logs?$filter=method eq 'POST'`;
      if(replayId.value != "") url += ` and datas/deveui eq '${replayId.value}'`;
      url += ` and code eq 404 and code eq 400 and entityid eq null`;
      url += `&$orderby=date desc&$top=200000`;
      url = addDebug(url);
      const jsonObj = await getFetchDatas(url, "json");
      wait(false);
      updateWinJsonResult(jsonObj, `[${method.value}]:${url}`); 
      if (getIfChecked("checkReplay") === false) return;
      for (const property in jsonObj.value) {
        if(jsonObj.value[property].datas) {
          const datas = jsonObj.value[property].datas;
          const myUrl = `${optHost.value}/${optVersion.value}/Loras?$log=${jsonObj.value[property]["@iot.id"]}`;
          const response = await fetch(myUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(datas),
          });
          if (response.status === 500) return;
        }
      }        
    }
  };

  function prepareForm() {
    const text = jsonDatas.innerText.replace(/[^\x00-\x7F]/g, '');
    datas.innerText = text;
    document.getElementById("actionForm").requestSubmit();
  }