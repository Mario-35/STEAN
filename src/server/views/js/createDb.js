async function send(url, datas) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(datas),
    });
    const value = await response.text();
}

function createOwnUrl(name) {
	const url = optHost.value.split("/");
    url[url.length - 1] = name;
    return `${url.join("/")}/${optVersion.value}`;

}

async function createDb() {
    const datas = JSON.parse(jsonDatas.innerText);
    const serviceName = datas["create"]["name"];
    const url = createOwnUrl(serviceName);
    if (_PARAMS.services.includes(serviceName)) await getFetchDatas(`${url}/drop`) ;
    else await send(`${optHost.value}/${optVersion.value}/Configs`, datas["create"]); 
    asyncForEach(["Things", "Locations", "FeaturesOfInterest", "ObservedProperties","Sensors","Datastreams","MultiDatastreams","Decoders","Loras"],
    async (e) => {
       if (datas[e]) await send(`${url}/${e}`, datas[e]);
    });
    wait(false);
}