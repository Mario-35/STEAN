let openedLog=void 0,Logfilter=void 0;function closeLineTabLog(){openedLog&&(openedLog.classList.remove("is-active"),openedLog.nextSibling.innerHTML="")}async function deleteLog(e){try{var o;0<e&&(o=`${optHost.value}/${optVersion.value}/Logs(${e})`,204==(await fetch(o,{method:"DELETE",headers:{"Content-Type":"application/json"}})).status?(closeLineTabLog(),openedLog.innerHTML="Deleted",notifyAlert("Delete","delete log")):notifyError("Error","delete Log id : "+e))}catch(e){notifyError("Error",e)}finally{wait(!1)}}async function replayLog(e){var o,e=`${optHost.value}/${optVersion.value}/Logs(${getId(e)})`,e=await getFetchDatas(e,"json");e.datas&&(o=`${optHost.value}/${optVersion.value}/Loras?$log=`+e["@iot.id"],await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e.datas)}),closeLineTabLog(),o=openedLog,openedLog=void 0,openLineTabLog(o))}async function patchLog(e){var o,e=`${optHost.value}/${optVersion.value}/Logs(${getId(e)})`,e=await getFetchDatas(e,"json");e.datas&&(o=`${optHost.value}/${optVersion.value}/Loras?$log=`+e["@iot.id"],await fetch(o,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(e.datas)}),closeLineTabLog(),o=openedLog,openedLog=void 0,openLineTabLog(o))}async function openLineTabLog(e){var o,t,a;closeLineTabLog(),e===openedLog?openedLog=void 0:(o=getId(e.id),t=`${optHost.value}/${optVersion.value}/Logs(${o})`,t=await getFetchDatas(t,"json"),a=['<div class="patrom-button-bar__item"> <button class="patrom-button-bar__button" id="btnCopyLog">Copy To query</button> </div>'],!0===_PARAMS.user.canDelete&&a.push(`<div class="patrom-button-bar__item"> <button class="patrom-button patrom-button--danger"  id="RemoveLog${o}">Delete</button> </div>`),!0===_PARAMS.user.canPost&&null===t.replayid&&a.push(`<div class="patrom-button-bar__item"> <button class="patrom-button patrom-button--success" id="ReplayLog${o}">Replay</button> </div>`),e.nextSibling.innerHTML=` <div class="patrom-button-bar">${a.join("")}</div> <pre class="json-viewer" id="jsonLogRenderer"> </pre> `,openedLog=e,jsonTempViewer=new JSONViewer,jsonLogRenderer.appendChild(jsonTempViewer.getContainer()),jsonTempViewer.setRoot(optHost.value),jsonTempViewer.showJSON(t),e.classList.add("is-active"))}logs.onclick=async()=>{var e=await getFetchDatas(`${optHost.value}/${optVersion.value}/Logs?$select=id,date,code,method,database&$orderby=date%20desc`,"json");updateWinLogs(e)};