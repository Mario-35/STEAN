function populateSelect(t,e,l,n){for(;t.firstChild;)t.removeChild(t.lastChild);t.options.length=0,e&&(e=[...new Set(e)],n&&e.unshift("none"),e.forEach(e=>{t.add(new Option(e))}),t.selectedIndex=e.indexOf(l))}function populateMultiSelect(e,t,l){e=getElement(e);e&&multiSelects[e.id].loadSourceArray(t,l)}