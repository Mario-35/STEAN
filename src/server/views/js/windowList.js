function updateWinLinks(input) {
    if (!winLinks || winLinks === null || winLinks.content === null) {
    const temp = new Window("Links", {
      state: WindowState.NORMAL,
      size: {
        width: 750,
        height: 250
      },
      selected: true,
      minimizable: false,
      always_on_top: true,
      container: two ,
      lang: "json"
    });
    winLinks = temp;
} 
let str = '<div class="linkCcontainer">';
if (input.direct) str += `<a href="${input.direct}" target="_blank" class="buttonLink">${input.direct}</a>`;
if (input.direct) str += "<hr>";
if (input.query) str += `<a href="${input.query}" target="_self" class="buttonLink">Load in query</a>`;
if (input.sqlUrl) {
  str += `<a href="${input.sqlUrl}" target="_blank" class="buttonLink">Sql Query</a>`;
  str += "<hr>";
  str += `<input type="text" class="urlForm" v-model="url" value="${input.sqlUrl}"/>`;
}

str += "</div>";
winLinks.content.innerHTML = str;
winLinks.show();
}

function updateWinDecoderResult(input) {
    if (!winDecoderResult || winDecoderResult === null || winDecoderResult.content === null) {
    const temp = new Window("Decoding result", {
      state: WindowState.NORMAL,
      size: {
        width: 750,
        height: 500
      },
      selected: true,
      minimizable: false,
      container: two ,
      lang: "json"
    });
    winDecoderResult = temp;
}
winDecoderResult.content.innerHTML = `<div contenteditable spellcheck="false" id="winDecoderResult" class='shj-lang-json'>${highlightText(pretty.json(input), "json")}</div>`;
winDecoderResult.show();
}

function updateWinDecoderCode(input) {
    if (!winDecoderCode || winDecoderCode === null || winDecoderCode.content === null) {
        const temp = new Window("Decoder code", {
            state: WindowState.NORMAL,
            size: {
                width: 750,
                height: 500
            },
            selected: true,
            minimizable: false,
      container: two ,
      lang: "js"
    });
    winDecoderCode = temp;
  }
  winDecoderCode.show();
  winDecoderCode.content.innerHTML = `<div contenteditable spellcheck="false" onpaste="jsDatasPasteEvent(event)" ondrop="jsDatasPasteEvent(event)" id="winDecoderCode" class='shj-lang-js'>${highlightText(pretty.js(input), "js")}</div>`;
  const menuitems = [
    {
      "text": "Execute code",
      "events": { 
        "click": function(e){
          executeJS(e);
        }
      }
    },
    {
      "text": "Save",
      "events": {
        "click": function(e){
          updateWinLinks(JSON.parse(` { "sqlUrl" : "${optHost.value}/${optVersion.value}/Sql?$query=${btoa(winSqlQuery.content.innerText)}"}`));
        }
      }
    }
  ];
  
  var menu = new ContextMenu(menuitems);

  winDecoderCode.content.addEventListener("contextmenu", function(e){
    menu.display(e);
  });
}

function updateWinSqlQuery(input) {
    if (!winSqlQuery || winSqlQuery === null || winSqlQuery.content === null) {
        const temp = new Window("Script SQL", {
            state: WindowState.NORMAL,
            size: {
                width: 750,
                height: 500
            },
            selected: true,
            minimizable: false,
            always_on_top: true,
      container: two ,
      lang: "sql"
    });
    winSqlQuery = temp;
  }
  winSqlQuery.show();
  winSqlQuery.content.innerHTML = `<div contenteditable spellcheck="false" id="winSqlQuery" class='shj-lang-sql'>${highlightText(input, "sql")}</div>`;
  const menuitems = [
    {
      "text": "Execute script",
      "events": {                              // Adds eventlisteners to the item (you can use any event there is)
        "click": function(e){
          executeSql(e);
        }
      }
    },
    {
      "text": "Encoded html",
      "events": {
        "click": function(e){
          updateWinLinks(JSON.parse(` { "sqlUrl" : "${optHost.value}/${optVersion.value}/Sql?$query=${btoa(winSqlQuery.content.innerText)}"}`));
        }
      }
    }
  ];
  
  var menu = new ContextMenu(menuitems);

  winSqlQuery.content.addEventListener("contextmenu", function(e){
    menu.display(e);
  });
}

function updateWinJsonResult(input, title) {
    if (!winJsonResult || winJsonResult === null || winJsonResult.content === null) {
        const temp = new Window(title, {
            state: WindowState.MAXIMIZED,
            size: {
                width: 750,
                height: 500
            },
            selected: true,
            minimizable: false,
      container: two ,
      lang: "sql"
    });
    winJsonResult = temp;
  } else  winJsonResult.setTitle(title);
  winJsonResult.content.innerHTML = `<pre class="json-viewer" id="jsonRenderer" onclick = "clickLink(event)" ondblclick = "dblClickLink(event)" ></pre>`;
  jsonRenderer.addEventListener("click", function(e){
    e.preventDefault();
    self.close();
  });
  jsonViewer(input, jsonRenderer);
  winJsonResult.show();
}

function updateWinCsvResult(input) {
  if (!winCsvResult || winCsvResult === null || winCsvResult.content === null) {
      const temp = new Window("Csv file", {
          state: WindowState.MAXIMIZED,
          size: {
              width: 750,
              height: 500
          },
          selected: true,
          minimizable: false,
      container: two ,
      lang: "sql"
    });
    winCsvResult = temp;
  } ;
  winCsvResult.content.innerHTML = `<div id="csvRenderer"></div>`;
  // jsonViewer(input, jsonRenderer);
  buildTableWithCsv(input, ";", csvRenderer);
  winCsvResult.show();
}

function updateWinResult(input) {
  if (! winResult ||  winResult === null ||  winResult.content === null) {
  const temp = new Window("Result", {
    state: WindowState.NORMAL,
    size: {
      width: 750,
      height: 500
    },
    selected: true,
    minimizable: false,
    container: two ,
    lang: "any"
  });
   winResult = temp;
}
 winResult.content.innerHTML = `<div spellcheck="false" id=" winResult">${input}</div>`;
 winResult.show();
}

function addToResultList(key, value, plus) {
  var li = document.createElement("li");
  li.innerText = `${key}: `;
  var span = document.createElement("span");
  span.className = "json-literal";
  span.innerText = value;
  li.appendChild(span);
  getElement("listResult").appendChild(li);
  if (plus) addToResultList("-->", plus);
};