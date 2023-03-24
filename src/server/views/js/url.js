

  function addDebug(input) {
    if (input.trim() != "") input += '&';
    return getIfChecked("checkDebug") ? `${input}$debug=true`: input;
  }

  function decodeOptions() {
    header("decodeOptions", queryOptions.value);
    if (queryOptions.value === "") return;
    try {
      // return true if some works are done (for init to not delete value)
      let decode = false;

      const  myOptions =  (input.includes('?')) ? input.split('?')[1] : input;
      // process options
      myOptions.split('&').forEach((element) => {
        const temp = element.split('=');
        const key = temp[0].replace("$","");
        const value = decodeURIComponent(temp[1]);
        switch (key) {
          case 'splitResult':
            const objChk = getElement("splitResultOption");
            const objName = getElement("splitResultOptionName");
            if(objChk) objChk.checked = true;
            if(objName) objName.value = temp[1];
            addOption('splitResult',temp[1], 'FALSE');
            decode = true;
            break;
          case 'resultFormat':
            getElement("queryResultFormat").value = value;
            deleteOption(key);
            break;
          case 'interval':
            getElement("intervalOption").value = value;
            deleteOption(key);
            break;
          case 'expand':
            setMultiSelect(`query${capitalize(key)}`, [temp[1].split(",")[0]]);
            decode = true;
          break;
          case 'debug':
            checkDebug.checked = (temp[1] == "true");
            deleteOption(key);
          break;
          case '$skip':
          case '$top':
            const obj = getElement(`${key}Option`);
            if(obj) {
              if (typeof obj.add !== "undefined") { 
                  obj.add(new Option(temp[1]));
              }
              obj.value = temp[1];
              addOption(key,temp[1], '0');
            }
            decode = true;
            break;
          default :
          if (isDebug) console.log(`NOT FOUND key : ${key} value : ${value}`);
        }
      });
      canShowQueryButton();
      return decode;
    } catch (error) {
        return false;
    } 
  };

  function decodeUrl(input) {
    header("decodeUrl", input);
    try {
      // return true if some works are done (for init to not delete value)
      let decode = false;

      // delete all before
      let myRoot = input;
      let myOptions = input;
      let myPath = input;
      // get options if exists
      if (input.includes('?')) {
        const splitStr = input.split('?');
        myRoot = splitStr[0];
        myOptions = splitStr[1];
      } 
      const version = getVersion(input);
      // get version
      if (version) {
        const splitStr = myRoot.split(version);
        myPath = splitStr[1];
        myRoot = splitStr[0];
      }
      // process my path
      myPath.split('/')
            .filter((word) => word !== '')
            .forEach((element, index) => {
              if (index === 0) {
                if (element.includes('(')) {
                  const temp = element.split('(');
                  entity.value = temp[0];
                  nb.value = temp[1].replace(')', '');
                } else entity.value = getEntityName(element);          
              } else if (index === 1) {
                if (element.includes('?')) queryOptions.value = element;
                else if (_PARAMS._DATAS[getEntityName(element)]) populateSelect(subentity, Object.keys(_PARAMS._DATAS[entity.value].relations), element, true);
              }
            });    

      // process options
      myOptions.split('&').forEach((element) => {
        const temp = element.split('=');
        const key = temp[0].substring(1);
        switch (temp[0]) {
          case '$splitResult':
            const objChk = getElement("splitResultOption");
            const objName = getElement("splitResultOptionName");
            if(objChk) objChk.checked = true;
            if(objName) objName.value = temp[1];
            addOption('splitResult',temp[1], 'FALSE');
            decode = true;
            break;
          case '$resultFormat':
          case '$expand':
            setMultiSelect(`query${capitalize(key)}`, temp[1].split(","));
            decode = true;
          break;
          case '$skip':
          case '$top':
            const obj = getElement(`${key}Option`);
            if(obj) {
              if (typeof obj.add !== "undefined") { 
                  obj.add(new Option(temp[1]));
              }
              obj.value = temp[1];
              addOption(key,temp[1], '0');
            }
            decode = true;
            break;
        }
      });
      canShowQueryButton();      
      return decode;
    } catch (error) {
        return false;
    } 
  };

  createUrl = () => {
    header("createUrl");
    const queryOptions = [];

    var addInOption = function(key, value) {
      if (value != "") queryOptions.push(`${key}=${value}`);
    };

    const index = Number(nb.value);

    const root = `${optHost.value}/${optVersion.value}`;
  
    let directLink = root;
    let queryLink = `${root}/Query?&method=${method.value}`; 
  
    queryLink += `&entity=${entity.value}`;

    
    if (index > 0) {
      directLink = directLink + "/" + entity.value + "(" + index + ")";
      queryLink = queryLink + `&id=${index}`;
    } else {
      if (entity.value == "Loras" && nb.value != "") 
        directLink = directLink + "/" + entity.value + "(" + nb.value + ")";
       else 
        directLink = directLink + "/" + entity.value;
    }
    
    if (subentity.value != "none") {
      directLink = directLink + "/" + subentity.value;
      queryLink = queryLink + `&subentity=${subentity.value}`;
    }

    if (queryProperty.value != "none" && nb.value != "") {
        directLink = directLink + "/" + queryProperty.value;
        queryLink = queryLink + `&property=${queryProperty.value}`;
    
      if (getIfChecked("onlyValue") === true) {
        directLink = directLink + "/$value";
        queryLink = queryLink + `&onlyValue=true`;
      } 
    }  
  
    if (jsonDatas.innerText  != "") {
      const datasEncoded = encodeURIComponent(jsonDatas.innerText );
      queryLink = queryLink + `&datas=${datasEncoded}`;
    }
  
    addInOption("resultFormat", (queryResultFormat.value != "json" ) ? queryResultFormat.value : "");
    addInOption("debug", getIfChecked("checkDebug") ? "true" : "");
    if (intervalOption.value != "" && isObservation() ) addInOption("interval",intervalOption.value);
    if (!["","0"].includes(skipOption.value)) addInOption("skip",skipOption.value);
    if (!["","0"].includes(topOption.value)) addInOption("top",topOption.value);
    if (!queryExpand.value.startsWith(_NONE))  addInOption("expand", getMultiSelect(queryExpand));
    addInOption("orderby",getOrderBy());
    addInOption("select",getMultiSelect(querySelect));

  
    const queryBuilder = getElement("query-builder").innerText;
  
    const listOr = [];
    JSON.parse(queryBuilder).forEach((whereOr) => {    
      const listAnd = [];
      whereOr.forEach((whereAnd) => {    
        if (whereAnd.criterium && whereAnd.criterium != "" && whereAnd.condition && whereAnd.criterium != "" && whereAnd.criterium && whereAnd.value != "")
        {
          const value = isNaN(whereAnd.value) ? `'${whereAnd.value}'` : whereAnd.value;
          switch (whereAnd.condition) {
            case "contains":
              case "endswith":
                case "startswith":
              listAnd.push(`${whereAnd.condition}(${whereAnd.criterium},${value})`);              
              break;
            case "between":
              listAnd.push(`${whereAnd.criterium} gt ${whereAnd.value.first} and ${whereAnd.criterium} lt ${whereAnd.value.second} `);              
              break;
          
            default:
              listAnd.push(`${whereAnd.criterium} ${whereAnd.condition} ${value}`);
              break;
          }
        }
        });
      listOr.push(listAnd.join(" and "))
    });
    
    const where = listOr.join(" or ");
    addInOption("filter", where);  

    const addMark = queryOptions.length > 0 ? "?$":"";
    directLink = `${directLink}${addMark}${queryOptions.join("&$")}`;
    queryLink = `${queryLink}${addMark}options=${encodeURI(queryOptions.join("&"))}`;
    if (isDebug) {
      console.log(`direct : ${directLink}`);
      console.log(`query : ${queryLink}`);
    }
    return { "direct" : directLink, "query": queryLink};
  };