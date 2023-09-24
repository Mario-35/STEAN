
go.onclick = async (e) => {
	e.preventDefault();
	// let temp = 'delete FROM "observation" WHERE 1=1';
	const datasJson = {
		header: false,
		nan: true,
		columns: { '1': { Datastream: '1', FeaturesOfInterest: '1' } }
	  };
	  
	 Object.keys(datasJson["columns"]).forEach((key) => {
		 console.log(datasJson["columns"][key]);
		 resultat.value = datasJson["columns"][key];

	 });
};