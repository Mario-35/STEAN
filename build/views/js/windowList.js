var clickCount=0,singleClickTimer=0;function updateWinLinks(e){var t;wins.Links&&null!==wins.Links&&null!==wins.Links.content||(t=new Window("Links",{state:WindowState.NORMAL,size:{width:750,height:250},selected:!0,minimizable:!1,always_on_top:!0,container:two,lang:"json"}),wins.Links=t);let n='<div class="linkCcontainer"> <center> ';e.direct&&(n+=`<br> <button id="btnDirect" class="clipboard">Click me to copy current Url</button> <br> <br>  <a href="${e.direct}" target="_blank" class="buttonLink">${e.direct}</a> <br> <hr> <br>`),e.query&&(n+=`<a href="${e.query}" target="_self" class="loadInQuery">Load in query</a>`),e.sqlUrl&&(n=(n=n+`<a href="${e.sqlUrl}" target="_blank" class="buttonLink">Sql Query</a>`+"<hr>")+`<input type="text" class="urlForm" v-model="url" value="${e.sqlUrl}"/>`),n+="</center> </div>",wins.Links.content.innerHTML=n,wins.Links.show(),e.direct&&btnDirect.addEventListener("click",()=>{navigator&&navigator.clipboard&&navigator.clipboard.writeText&&navigator.clipboard.writeText(e.direct).then(()=>{alert("url copied")})})}function updateWinSqlQuery(e){wins.Sql&&null!==wins.Sql&&null!==wins.Sql.content||(t=new Window("Script SQL",{state:WindowState.NORMAL,size:{width:750,height:500},selected:!0,minimizable:!1,always_on_top:!0,container:two,lang:"sql"}),wins.Sql=t),wins.Sql.show(),wins.Sql.content.innerHTML=`<div contenteditable spellcheck="false" id="wins.Sql" class='shj-lang-sql'>${highlightText(e,"sql")}</div>`;var t=[{text:"Execute script",events:{click:function(e){executeSqlValues(e)}}},{text:"Encoded html",events:{click:function(e){updateWinLinks(JSON.parse(` { "sqlUrl" : "${optHost.value}/${optVersion.value}/Sql?$query=${btoa(wins.Sql.content.innerText)}"}`))}}}],n=new ContextMenu(t);wins.Sql.content.addEventListener("contextmenu",function(e){n.display(e)})}function simpleClick(e){e.includes&&optHost&&e.includes(optHost.value)&&(clear(),decodeUrl(e),refresh(),canGo=!0)}function openClick(e){'"'===(e='"'===e[e.length-1]?e.slice(0,-1):e)[0]&&(e=e.slice(1)),window.open(e.trim(),"_blank").focus()}function updateWinJsonResult(e,t){wins.Json&&null!==wins.Json&&null!==wins.Json.content?wins.Json.setTitle(t):wins.Json=new Window(t,{state:getWinActives()?WindowState.NORMAL:WindowState.MAXIMIZED,size:{width:750,height:500},selected:!0,minimizable:!1,container:two,lang:"sql"}),wins.Json.content.innerHTML='<pre class="json-viewer" id="jsonRenderer" </pre>',jsonRenderer.addEventListener("click",function(e){1===++clickCount?Array.from(e.target.classList).includes("type-url-")&&(singleClickTimer=Array.from(e.target.classList).includes("type-url-link")?setTimeout(function(){clickCount=0,simpleClick(e.target.innerHTML)},400):setTimeout(function(){clickCount=0},400)):2===clickCount&&(clearTimeout(singleClickTimer),clickCount=0,Array.from(e.target.classList).includes("type-url-link")?(simpleClick(e.target.innerHTML),go.onclick()):Array.from(e.target.classList).includes("type-url-external")&&openClick(e.target.innerHTML))}),jsonRenderer.appendChild(jsonViewer.getContainer()),jsonViewer.setRoot(optHost.value),jsonViewer.showJSON(e),wins.Json.show()}function updateWinCsvResult(e){var t;wins.Csv&&null!==wins.Csv&&null!==wins.Csv.content||(t=new Window("Csv file",{state:getWinActives()?WindowState.NORMAL:WindowState.MAXIMIZED,size:{width:750,height:500},selected:!0,minimizable:!1,container:two,lang:"sql"}),wins.Csv=t),wins.Csv.content.innerHTML='<div id="csvRenderer" class="patrom-table-container"></div>',buildTableWithCsv(e,";",csvRenderer),wins.Csv.show()}function updateWinLogs(e){var t,n;wins.Logs&&null!==wins.Logs&&null!==wins.Logs.content||(t=new Window("Result",{state:getWinActives()?WindowState.NORMAL:WindowState.MAXIMIZED,size:{width:750,height:500},selected:!0,minimizable:!1,container:two,lang:"any"}),wins.Logs=t);const i=[];e.value.forEach(e=>{i.push(`<dt class="collapsible-title" id="log${e["@iot.id"]} " ><button class="patrom-button--${e.code<300?"success":"danger"} size-xs" disabled="">${e.method}</button>&nbsp;${e.date} </dt>`),i.push('<dd class="collapsible-content">pipo</dd>')}),wins.Logs.content.innerHTML=`<div spellcheck="false" id="wins.Logs"> <dl class="collapsible"> ${i.join("")} </dl> </div>`,wins.Logs.content.addEventListener("click",async function(e){var t;Array.from(e.target.classList).includes("collapsible-title")&&"Deleted"!==e.target.innerHTML?await openLineTabLog(e.target):Array.from(e.target.classList).includes("patrom-button--success")?(t=getId(e.target.id),await replayLog(t)):Array.from(e.target.classList).includes("patrom-button--danger")?(t=getId(e.target.id),await deleteLog(t)):Array.from(e.target.classList).includes("patrom-button--primary")&&(t=getId(e.target.id),await patchLog(t))}),wins.Logs.show(),isLog()&&(n=new ContextMenu([{text:"Errors only",events:{click:function(e){Logfilter="code gt 400",go.onclick()}}},{text:"Good Only",events:{click:function(e){Logfilter="code gt 199 and code lt 300",go.onclick()}}},{text:"all",events:{click:function(e){Logfilter=void 0,go.onclick()}}}]),wins.Logs.content.addEventListener("contextmenu",function(e){n.display(e)}))}