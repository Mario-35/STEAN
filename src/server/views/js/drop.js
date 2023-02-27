function jsonDatasPasteEvent(event) { 
  setTimeout(() => {
      try {
        beautifyDatas(getElement("jsonDatas"),  event.explicitOriginalTarget.innerText, "json") ;
      } catch (error) {
        getElement("jsonDatas").innerText = event.explicitOriginalTarget.innerText; 
      }
    }, "500");  
}
