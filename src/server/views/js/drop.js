function jsonDatasPasteEvent(event) { 
  setTimeout(() => {
    beautifyDatas(getElement("jsonDatas"), event.explicitOriginalTarget.innerText, "json") ;
  }, "500");  
}
