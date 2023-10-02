let openedLog = undefined;
let Logfilter = undefined;

logs.onclick = async () => {
  const jsonObj = await getFetchDatas(`${optHost.value}/${optVersion.value}/Logs?$select=id,date,code,method,database&$orderby=date%20desc`, "json");
  updateWinLogs(jsonObj);
};

 function closeLineTabLog() { 
    if(openedLog) {
      openedLog.classList.remove('is-active');
      openedLog.nextSibling.innerHTML = "";
    }
 }

async function deleteLog(id) { 
  try {
    if (id > 0) {
      const url = `${optHost.value}/${optVersion.value}/Logs(${id})`;
      let response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status == 204) {
        closeLineTabLog();
        openedLog.innerHTML = "Deleted";
        notifyAlert("Delete", "delete log"); 
      } else notifyError("Error", `delete Log id : ${id}`);  
    } 
  } catch (err) {
    notifyError("Error", err);
  } finally {
    wait(false);
  } 
}
async function replayLog(id) { 
  const url = `${optHost.value}/${optVersion.value}/Logs(${getId(id)})`;
  const jsonObj = await getFetchDatas(url, "json");
  if(jsonObj.datas) {
    const myUrl = `${optHost.value}/${optVersion.value}/Loras?$log=${jsonObj["@iot.id"]}`;
    const response = await fetch(myUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonObj["datas"]),
    });
    closeLineTabLog(); 
    const temp = openedLog;
    openedLog = undefined;
    openLineTabLog(temp);
  }
}
async function patchLog(id) { 
  const url = `${optHost.value}/${optVersion.value}/Logs(${getId(id)})`;
  const jsonObj = await getFetchDatas(url, "json");
  
  if(jsonObj.datas) {
    const myUrl = `${optHost.value}/${optVersion.value}/Loras?$log=${jsonObj["@iot.id"]}`;
    const response = await fetch(myUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonObj["datas"]),
    });
    closeLineTabLog(); 
    const temp = openedLog;
    openedLog = undefined;
    openLineTabLog(temp);
  }
}

async function openLineTabLog(element) { 
  // close opened tab
  closeLineTabLog();
  if(element === openedLog) { 
    openedLog = undefined;
    return;
  }
  // get log info
  const id = getId(element.id);
  const url = `${optHost.value}/${optVersion.value}/Logs(${id})`;
  const jsonObj = await getFetchDatas(url, "json");

  const btns = ['<div class="patrom-button-bar__item"> <button class="patrom-button-bar__button" id="btnCopyLog">Copy To query</button> </div>'];
  if(_PARAMS.user.canDelete === true) btns.push(`<div class="patrom-button-bar__item"> <button class="patrom-button patrom-button--danger"  id="RemoveLog${id}">Delete</button> </div>`);
  if(_PARAMS.user.canPost === true && jsonObj["replayid"] === null) btns.push(`<div class="patrom-button-bar__item"> <button class="patrom-button patrom-button--success" id="ReplayLog${id}">Replay</button> </div>`);
  element.nextSibling.innerHTML = ` <div class="patrom-button-bar">${btns.join("")}</div> <pre class="json-viewer" id="jsonLogRenderer"> </pre> `;


  // element.nextSibling.innerHTML = ` <div class="patrom-button-bar"> &nbsp; <div class="patrom-button-bar__item"> <button class="patrom-button-bar__button" id="btnCopyLog">Copy To query</button> </div> &nbsp; <div class="patrom-button-bar__item"> <button class="patrom-button patrom-button--danger" id="RemoveLog">Delete</button> </div> &nbsp; <div class="patrom-button-bar__item"> <button class="patrom-button patrom-button--success" id="ReplayLog${id}">Replay</button> </div> </div> <pre class="json-viewer" id="jsonLogRenderer" </pre> `;
  openedLog = element;
  jsonTempViewer = new JSONViewer();
  jsonLogRenderer.appendChild(jsonTempViewer.getContainer());
  jsonTempViewer.setRoot(optHost.value);
  jsonTempViewer.showJSON(jsonObj);
  element.classList.add('is-active');

}

// btnLoraLogs.onclick = async (e) => {
//     if (e) e.preventDefault();
//     wait(true);
//     let url = `${optHost.value}/${optVersion.value}/`;
//     if(replayId.value.startsWith("where")) {
//       const encoded = btoa(`select * from "log_request" ${replayId.value}`);
//       url += `Sql?$query=${encoded}`;
//       const jsonObj = await getFetchDatas(url, "json");
//       wait(false);
//       updateWinResult("rien");
//       if (getIfChecked("checkReplay") === false) {
//         updateWinJsonResult(jsonObj, `[${method.value}]:${url}`); 
//         return;
//       }
//       updateWinResult(`<div class="json-viewer"><ul id="listResult" class="json-dict"><li data-key-type="object">url: <span class="json-literal">response</span></li></ul></div>`);
//       jsonObj.forEach(async element => {
//         if(element.datas) {
//           const myUrl = `${optHost.value}/${optVersion.value}/Loras?$log=${element["id"]}`;
//           const response = await fetch(myUrl, {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify(element["datas"]),
//           });
//           addToResultList(response.status, myUrl, response.statusText);
//         }
//       }); 
//     } else {
//       url += `Logs?$filter=method eq 'POST'`;
//       if(replayId.value != "") url += ` and datas/deveui eq '${replayId.value}'`;
//       url += ` and code eq 404 and entityid eq null`;
//       url += `&$orderby=date desc&$top=200000`;
//       url = addDebug(url);
//       const jsonObj = await getFetchDatas(url, "json");
//       wait(false);
//       updateWinJsonResult(jsonObj, `[${method.value}]:${url}`); 
//       if (getIfChecked("checkReplay") === false) return;
//       for (const property in jsonObj.value) {
//         if(jsonObj.value[property].datas) {
//           const datas = jsonObj.value[property].datas;
//           const myUrl = `${optHost.value}/${optVersion.value}/Loras?$log=${jsonObj.value[property]["@iot.id"]}`;
//           const response = await fetch(myUrl, {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify(datas),
//           });
//           if (response.status === 500) return;
//         }
//       }        
//     }
//   };