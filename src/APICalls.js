import { keyId, vCode } from '@/Keys';

function fetchFromApi(url) {
    const init = { 
        method: 'GET' 
    };

    const request = new Request(url, init);

    return fetch(request).then(response => {
        if (response.status !== 200) {
            console.log('something went wrong... ');
        } else {
            return response.text();
        }
    });
}

function fetchMarketOrders() {
    const url = `https://api.eveonline.com/char/MarketOrders.xml.aspx?keyID=${keyId}&vCode=${vCode}`;
    return fetchFromApi(url);
}

function fetchWalletTransactions() {
    const url = `https://api.eveonline.com/char/WalletTransactions.xml.aspx?keyID=${keyId}&vCode=${vCode}`;
    return fetchFromApi(url);
}

function fetchMarketOrdersInRegion(typeId, regionId) {
    const url = `https://esi.tech.ccp.is/latest/markets/${regionId}/orders/?datasource=tranquility&order_type=sell&type_id=${typeId}`;
    return fetchFromApi(url);
}

function fetchStructureIds() {
    const url = `https://esi.tech.ccp.is/latest/universe/structures/?datasource=tranquility`;
    return fetchFromApi(url);
}

function fetchMarketOrdersInCitadel(citadelId, token) {
    const url = `https://esi.tech.ccp.is/latest/markets/structures/${citadelId}/?datasource=tranquility&token=${token}`;
    return fetchFromApi(url);
}

function fetchItemInformation(typeId) {
    const url = `https://esi.tech.ccp.is/latest/universe/types/${typeId}/?datasource=tranquility&language=en-us`;
    return fetchFromApi(url);
}

function fetchItemIdFromName(itemName) {
    const itemNameEncoded = encodeURIComponent(itemName);
    const url = `https://esi.tech.ccp.is/latest/search/?categories=inventorytype&datasource=tranquility&language=en-us&search=${itemNameEncoded}&strict=true`;
    return fetchFromApi(url);
}

export {
    fetchMarketOrders,
    fetchWalletTransactions,
    fetchMarketOrdersInRegion,
    fetchStructureIds,
    fetchMarketOrdersInCitadel,
    fetchItemInformation,
    fetchItemIdFromName
}