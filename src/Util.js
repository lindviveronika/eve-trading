function getQueryString(field) {
    var href = window.location.href;
    var reg = new RegExp( '[#|&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? string[1] : null;
}

function getAccessToken() {
    return getQueryString('access_token');
}

function namedNodeMapToObject(namedNodeMap) {
    const obj = {};
    for (let i = 0; i < namedNodeMap.length; i++) {
        obj[namedNodeMap[i].name] = namedNodeMap[i].nodeValue;
    }
    return obj;
}

function convertHtmlCollectionToArray(collection) {
    return [].slice.call(collection);
}

function dayDiff(firstDate, secondDate) {
    const oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds

    return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
}

function removeDuplicates(objects, attributeName) {
    const uniqueValues = [];
    const uniqueObjects = [];

    objects.forEach(obj => {
        if (uniqueValues.indexOf(obj[attributeName]) === -1) {
            uniqueValues.push(obj[attributeName]);
            uniqueObjects.push(obj);
        }
    });

    return uniqueObjects;
}

function parseJSON(data) {
    return data ? JSON.parse(data) : [];
}

function parseXml(xml) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "application/xml");
    const rowCollection = xmlDoc.getElementsByTagName('row');
    const rows = convertHtmlCollectionToArray(rowCollection);
    const namedNodeMaps = rows.map(row => row.attributes);

    return namedNodeMaps.map(namedNodeMapToObject);
}

function calculateProfitMargin(sellPrice, buyPrice) {
    if (!sellPrice || !buyPrice) {
        return;
    }

    const netIncome = sellPrice - buyPrice;

    return netIncome / sellPrice;
}

export {
    parseJSON,
    parseXml,
    getAccessToken,
    removeDuplicates,
    dayDiff,
    calculateProfitMargin
}