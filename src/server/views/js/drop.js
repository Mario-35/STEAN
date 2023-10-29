function jsonDatasPasteEvent(event) {
	setTimeout(() => {
		try {
			// getElement("jsonDatas").innerHtml = beautify(event.explicitOriginalTarget.innerText);
			beautifyDatas(getElement("jsonDatas"), event.explicitOriginalTarget.innerText.replace(/[^\x00-\x7F]/g, ''), "json");
		} catch (error) {
			getElement("jsonDatas").innerText = event.explicitOriginalTarget.innerText;
		}
	}, "500");
}