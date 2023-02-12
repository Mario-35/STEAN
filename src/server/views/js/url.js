

  function addDebug(input) {
    if (input.trim() != "") input += '&';
    return getIfChecked("checkDebug") ? `${input}$debug=true`: input;
  }
  function decodeOptions(input) {
    if (isDebug) console.log("==================== decodeOptions ====================");
    if (isDebug) console.log(`decode : ${input}`);

    try {
      // return true if some works are done (for init to not delete value)
      let decode = false;

      const  myOptions =   (input.includes('?')) ? input.split('?')[1] : input;
      // process options
      myOptions.split('&').forEach((element) => {
        const temp = element.split('=');
        const key = temp[0].substring(1);
        switch (key) {
          case '$splitResult':
            const objChk = getElement("splitResultOption");
            const objName = getElement("splitResultOptionName");
            if(objChk) objChk.checked = true;
            if(objName) objName.value = temp[1];
            addOption('splitResult',temp[1], 'FALSE');
            decode = true;
            break;
          case 'resultFormat':
            queryResultFormat.value = [temp[1].split(",")[0]];
            decode = true;
            break;
          case 'expand':
            console.log(capitalize(key));
            setMultiSelect(`query${capitalize(key)}`, [temp[1].split(",")[0]]);
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
      if (isDebug) console.log(listOptions);

      return decode;
    } catch (error) {
        return false;
    } 
  };

  function decodeUrl(input) {
    if (isDebug) console.log("==================== decodeUrl ====================");
    if (isDebug) console.log(`decode : ${input}`);

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
                } else entity.value = element;          
              } else if (index === 1) {
                if (element.includes('?')) queryOptions.value = element;
                else if (_PARAMS._DATAS[element]) populateSelect(subentity, Object.keys(_PARAMS._DATAS[entity.value].relations), element, true);
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
    const listOptions = [];
    temp = `${optHost.value}/${optVersion.value}`;
  
    let directLink = temp;
    let queryLink = `${temp}/Query?&method=${method.value}`; 
  
    queryLink = queryLink + `&entity=${entity.value}`;
  
    const index = Number(nb.value);
    
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
    } else  directLink = directLink;

    if (queryProperty.value != "none") {
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
  
    if (queryOptions.value != "") {
      listOptions.push(queryOptions.value);
      queryLink += `&options=${queryOptions.value}`;
    }
  
    const queryBuilder = getElement("query-builder").innerText;
  
    const listOr = [];
    JSON.parse(queryBuilder).forEach((whereOr) => {    
      const listAnd = [];
      whereOr.forEach((whereAnd) => {    
        if (whereAnd.criterium && whereAnd.criterium != "" && whereAnd.condition && whereAnd.criterium != "" && whereAnd.criterium && whereAnd.value != "")
        {
          const value = isNaN(whereAnd.value) ? `'${whereAnd.value}'` : whereAnd.value;
          listAnd.push(`${whereAnd.criterium} ${whereAnd.condition} ${value}`);
        }
        });
      listOr.push(listAnd.join(" and "))
    });
    
    const where = listOr.join(" or ");
    if (where != "") listOptions.push(`$filter=${where}`);  

    const addMark = listOptions.length > 0 ? "?":"";
    return { "direct" : `${directLink}${addMark}${listOptions.join("&")}`, "query": queryLink};
  };