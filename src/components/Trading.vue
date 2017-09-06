<template>
    <div>
        <header>
            <h1>Eve Trading</h1>
        </header>
        <h2>Sold out items</h2>
        <table id="soldOutItemsList">
            <thead>
                <th>Item Name</th>
                <th>Nr of items to buy</th>
                <th>Sell Price</th>
                <th>Buy Price</th>
                <th>Profit Margin</th>
            </thead>
        </table>

        <h2>Orders that needs price change</h2>
        <table id="priceChangeNeededList">
            <thead>
                <th>Item Name</th>
                <th>Sell Price</th>
                <th>Competing Price</th>
                <th>Competing Quantity Remaining</th>
            </thead>
        </table>

        <h2>Find potential profit margin for item</h2>
        <label>Item name:</label>
        <input type="text" id="findPotentialProfitInput">
        <button v-on:click="findPotentialProfitHandler">Find</button>
        <span id="findPotentialProfitFeedback" style="color: red"></span>
        <table id="potentialSellItemList">
            <thead>
                <th>Sell price</th>
                <th>Buy price</th>
                <th>Profit</th>
                <th>Profit Margin</th>
            </thead>
            <tbody>
                <tr>
                    <td id="potentialItemSellPrice"></td>
                    <td id="potentialItemBuyPrice"></td>
                    <td id="potentialItemProfit"></td>
                    <td id="potentialItemProfitMargin"></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style lang="scss">
</style>

<script>
import { keyId, vCode } from '@/Keys';

let marketOrdersInCitadel;

const SELL_REGION = '10000048';
const BUY_REGION = '10000002';

const SELL_STATIONS = [60001396, 60001399, 60001393, 60010327, 60011017, 60001390, 60010330, 60006799, 60006805, 60011008, 60010333];
const BUY_STATIONS = [60003760];

function getQueryString(field) {
    var href = window.location.href;
    var reg = new RegExp( '[#|&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? string[1] : null;
};

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

function parseXml(xml) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "application/xml");
    const rowCollection = xmlDoc.getElementsByTagName('row');
    const rows = convertHtmlCollectionToArray(rowCollection);
    const namedNodeMaps = rows.map(row => row.attributes);

    return namedNodeMaps.map(namedNodeMapToObject);
}

function parseJSON(data) {
    return data ? JSON.parse(data) : [];
}

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

function createWalletTransactionWithoutMarketOrderFilter(marketOrders) {
    return walletTransaction => {
        return marketOrders.every(marketOrder => marketOrder.typeID !== walletTransaction.typeID);
    }
}

function createWalletTransactionWhereNoVolumeRemainigFilter(marketOrders) {
    return walletTransaction => {
        return marketOrders
            .filter(marketOrder => marketOrder.typeID === walletTransaction.typeID)
            .every(marketOrder => marketOrder.volRemaining === '0');
    };
}

function createDateRangeFilter(endDate, numberOfDays) {
    const startDate = new Date(endDate.getTime() - numberOfDays*24*60*60*1000);
    return item => {
        const itemTransactionDate = new Date(item.transactionDateTime);
        return itemTransactionDate <= endDate && itemTransactionDate >= startDate
    };
}

function sellItemFilter(walletTransaction) {
    return walletTransaction.transactionType === 'sell';
}

function solarSystemFilter(structure) {
    return structure.solar_system_id === 30003836;
}

function createLocationIdFilter(locationIds) {
    return item => locationIds.includes(item.location_id);
}

function createTypeIdFilter(typeId) {
    return item => item.type_id === typeId || item.typeID === typeId;
}

function findOrderWithLowestPrice(orders) {
    if (orders.length) {
        return orders.reduce((orderWithLowestPrice, currentOrder) => (
            orderWithLowestPrice.price && orderWithLowestPrice.price < currentOrder.price ?
                orderWithLowestPrice : currentOrder
        ));
    }
}

function calculateProfitMargin(sellPrice, buyPrice) {
    const netIncome = sellPrice - buyPrice;
    return netIncome / sellPrice;
}

function getItemNameFromMarketOrder(order) {
    return fetchItemInformation(order.typeID)
        .then(parseJSON)
        .then(item => item.name);
}

function getItemIdFromItemName(itemName) {
    return fetchItemIdFromName(itemName)
        .then(parseJSON)
        .then(response => response.inventorytype);
}

function getBuyOrderWithLowestPrice(itemId) {
    const locationIdFilter = createLocationIdFilter(BUY_STATIONS);

    return fetchMarketOrdersInRegion(itemId, BUY_REGION)
        .then(parseJSON)
        .then(orders => orders.filter(locationIdFilter))
        .then(orders => findOrderWithLowestPrice(orders));
}

function getSellOrderWithLowestPrice(itemId) {
    const locationIdFilter = createLocationIdFilter(SELL_STATIONS);
    const typeIdFilter = createTypeIdFilter(itemId);

    const ordersFromCitdadel = marketOrdersInCitadel.filter(typeIdFilter);

    return fetchMarketOrdersInRegion(itemId, SELL_REGION)
        .then(parseJSON)
        .then(orders => orders.filter(locationIdFilter))
        .then(ordersFromRegion => {
            return findOrderWithLowestPrice([...ordersFromRegion, ...ordersFromCitdadel]);
        });
}

function checkItemProfitability(itemId) {
    const sellOrderWithLowestPrice = getSellOrderWithLowestPrice(itemId);
    const buyOrderWithLowestPrice = getBuyOrderWithLowestPrice(itemId);

    return Promise.all([sellOrderWithLowestPrice, buyOrderWithLowestPrice])
        .then(values => {
            const sellPrice = values[0] ? values[0].price : null;
            const buyPrice = values[1] ? values[1].price : null;
            const profit = sellPrice - buyPrice;
            const profitMargin = calculateProfitMargin(sellPrice, buyPrice);

            return {
                sellPrice,
                buyPrice,
                profit,
                profitMargin
            }
        })
}

function getCompetingSellOrderWithLowestPrice(item) {
    const locationIdFilter = createLocationIdFilter(SELL_STATIONS);

    return fetchMarketOrdersInRegion(item.typeID, SELL_REGION)
        .then(parseJSON)
        .then(order => order.filter(locationIdFilter))
        .then(findOrderWithLowestPrice);
}

function findSoldOutMarketOrders(data) {
    const [walletTransactions, marketOrders] = data;

    const noMarketOrderFilter = createWalletTransactionWithoutMarketOrderFilter(marketOrders);
    const noVolumeRemainingFilter = createWalletTransactionWhereNoVolumeRemainigFilter(marketOrders);

    const totalSoldOutTransactions = [
        ...walletTransactions.filter(noMarketOrderFilter),
        ...walletTransactions.filter(noVolumeRemainingFilter)
    ];

    return totalSoldOutTransactions;;
}

function getMarketOrdersFromCitdadel() {
    const citadelId = '1024376813358';
    const accessToken = getAccessToken();

    return fetchMarketOrdersInCitadel(citadelId, accessToken)
        .then(parseJSON)
        .then(result => {
            marketOrdersInCitadel = result;
        });
}

function getWalletTransaction() {
    return fetchWalletTransactions()
        .then(parseXml)
        .then(transactions => transactions.filter(sellItemFilter));
}

function getMarketOrders() {
    return fetchMarketOrders().then(parseXml);
}

function getSoldOutMarketOrders(walletTransactions, marketOrders) {
    return Promise.all([walletTransactions, marketOrders])
        .then(findSoldOutMarketOrders)
        .then(getUniqueItems);
}

function getUniqueItems(items) {
    return removeDuplicates(items, 'typeName');
}

function displaySoldOutItem(item, numberOfItemsToBuy) {
    const soldOutItemsListEl = document.getElementById('soldOutItemsList');

    const newTableRow = document.createElement('tr');
    newTableRow.setAttribute('id', item.typeID);

    const newTableCell = document.createElement('td');
    const itemNameEl = document.createElement('textarea');
    const itemContent = document.createTextNode(item.typeName);
    const copyButtonEl = document.createElement('button');
    const buttonContent = document.createTextNode('Copy');

    const itemsToBuyEl = document.createElement('td');
    itemsToBuyEl.textContent = numberOfItemsToBuy;

    itemNameEl.appendChild(itemContent);
    copyButtonEl.appendChild(buttonContent);
    newTableCell.appendChild(itemNameEl);
    newTableCell.appendChild(copyButtonEl);
    newTableRow.appendChild(newTableCell);
    newTableRow.appendChild(itemsToBuyEl);
    soldOutItemsListEl.appendChild(newTableRow);
    copyButtonEl.addEventListener('click', () => {
        itemNameEl.select();
        document.execCommand('copy');
    });
}

function displayItemProfitability(item, result) {
    const {sellPrice, buyPrice, profitMargin} = result;
    const itemEl = document.getElementById(item.typeID);

    const sellPriceEl = document.createElement('td');
    const buyPriceEl = document.createElement('td');
    const profitMarginEl = document.createElement('td');

    sellPriceEl.textContent = sellPrice;
    buyPriceEl.textContent = buyPrice;

    itemEl.appendChild(sellPriceEl);
    itemEl.appendChild(buyPriceEl);
    itemEl.appendChild(profitMarginEl);

    if (sellPrice && buyPrice) {        
        profitMarginEl.textContent = Math.round(profitMargin * 100) + '%';

        if (profitMargin > 0.30) {
            itemEl.style.backgroundColor = 'yellow';
        }
    } else if (buyPrice) {
        itemEl.style.backgroundColor = 'lime';
    }
}

function displayItemProfitabilityFromSearch(result) {
    const feedbackEl = document.getElementById('findPotentialProfitFeedback');
    feedbackEl.textContent = ''; //reset feedback

    if (typeof result === 'string') {
        feedbackEl.textContent = result;
    }

    const {sellPrice, buyPrice, profit, profitMargin} = result;

    const resultBuyPriceEl = document.getElementById('potentialItemBuyPrice');
    const resultSellPriceEl = document.getElementById('potentialItemSellPrice');
    const resultProfitEl = document.getElementById('potentialItemProfit');
    const resultProfitMarginEl = document.getElementById('potentialItemProfitMargin');

    resultBuyPriceEl.textContent = buyPrice;
    resultSellPriceEl.textContent = sellPrice;

    if (buyPrice && sellPrice) {
        resultProfitEl.textContent = parseFloat(profit).toFixed(2);;
        resultProfitMarginEl.textContent = Math.round(profitMargin * 100) + '%';
    }
}

function appendItemToNeedPriceChangeList(itemName, itemPrice, competingOrder) {
    const priceChangeNeededListEl = document.getElementById('priceChangeNeededList');

    const newTableRow = document.createElement('tr');
    newTableRow.setAttribute('id', itemName);

    const newTableCell = document.createElement('td');
    const itemNameEl = document.createElement('textarea');
    const itemContent = document.createTextNode(itemName);
    const copyButtonEl = document.createElement('button');
    const buttonContent = document.createTextNode('Copy');

    itemNameEl.appendChild(itemContent);
    copyButtonEl.appendChild(buttonContent);
    newTableCell.appendChild(itemNameEl);
    newTableCell.appendChild(copyButtonEl);

    const sellPriceEl = document.createElement('td');
    const competingPriceEl = document.createElement('td');
    const competingQuantityEl = document.createElement('td');
    sellPriceEl.textContent = itemPrice;
    competingPriceEl.textContent = competingOrder.price;
    competingQuantityEl.textContent = competingOrder.volume_remain;

    newTableRow.appendChild(newTableCell);
    newTableRow.appendChild(sellPriceEl);
    newTableRow.appendChild(competingPriceEl);
    newTableRow.appendChild(competingQuantityEl);
    priceChangeNeededListEl.appendChild(newTableRow);

    copyButtonEl.addEventListener('click', () => {
        itemNameEl.select();
        document.execCommand('copy');
    });
}

function getLatestTransactionDate(transactions) {
    return transactions.reduce((latestDate, currentTransaction) => {
        const currentTransactionDate = new Date(currentTransaction.transactionDateTime);
        return currentTransactionDate > latestDate ? currentTransactionDate : latestDate;
    }, new Date(transactions[0].transactionDateTime));
}

function getFirstTransactionDate(transactions) {
    return transactions.reduce((firstDate, currentTransaction) => {
        const currentTransactionDate = new Date(currentTransaction.transactionDateTime);
        return currentTransactionDate < firstDate ? currentTransactionDate : firstDate;
    }, new Date(transactions[0].transactionDateTime));
}

function getTotalQuantity(transactions) {
    return transactions.reduce((total, currentTransaction) => {
        return total + parseInt(currentTransaction.quantity);
    }, 0);
}

function checkHowManyItemsToBuy(item, walletTransactions) {
    if (!walletTransactions || walletTransactions.length < 4) {
        return 'N/A';
    }

    const typeIdFilter = createTypeIdFilter(item.typeID);
    const walletTransactionsForItem = walletTransactions.filter(typeIdFilter);
    const latestTransactionDate = getLatestTransactionDate(walletTransactionsForItem);
    const firstTransactionDate = getFirstTransactionDate(walletTransactionsForItem);

    const numberOfDays = dayDiff(firstTransactionDate, latestTransactionDate);

    if (numberOfDays < 2) {
        return 'N/A';
    }

    const totalQuantity = getTotalQuantity(walletTransactionsForItem);

    return Math.round((totalQuantity / numberOfDays) * 30);
}

function listSoldOutItems(soldOutItems, walletTransactions) {
    Promise.all([soldOutItems, walletTransactions])
    .then(data => {
        const [soldOutItems, walletTransactions] = data;

        soldOutItems.forEach(item => {
            const numberOfItemsToBuy = checkHowManyItemsToBuy(item, walletTransactions);
            displaySoldOutItem(item, numberOfItemsToBuy);
            checkItemProfitability(item.typeID).then(result => {
                displayItemProfitability(item, result);
            });
        });
    });
}

function listItemsThatNeedsPriceChange(marketOrders) {
    marketOrders
        .then(marketOrders => {
            marketOrders.forEach(item => {
                const itemName = getItemNameFromMarketOrder(item);
                const competingSellOrder = getCompetingSellOrderWithLowestPrice(item);

                    Promise.all([itemName, competingSellOrder]).then(data => {
                        const [itemName, competingOrder] = data;
                    
                        const competingPrice = competingOrder ? competingOrder.price : Infinity;

                        if (competingPrice < item.price) {
                            appendItemToNeedPriceChangeList(itemName, item.price, competingOrder);
                        }
                    });
            });
        });
}

const findPotentialProfitHandler = () => {
    const inputValue = document.getElementById('findPotentialProfitInput').value;
    getItemIdFromItemName(inputValue)
        .then(itemId => {
            if (itemId) {
                return checkItemProfitability(itemId)
            }
            return 'No item found';
        })
        .then(displayItemProfitabilityFromSearch);
} 


function fetchData() {
    getMarketOrdersFromCitdadel().then(() => {
        const walletTransactions = getWalletTransaction();
        const marketOrders = getMarketOrders();
        const soldOutItems = getSoldOutMarketOrders(walletTransactions, marketOrders);

        listSoldOutItems(soldOutItems, walletTransactions);
        listItemsThatNeedsPriceChange(marketOrders);
    });
}

export default {
    name: 'trading',

    methods: {
        findPotentialProfitHandler
    },

    // mounted () {
    //     fetchData();
    // }
}
</script>