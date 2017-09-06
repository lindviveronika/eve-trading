<template>
    <div>
        <h2>Sold out items</h2>
        <table id="soldOutItemsList">
            <thead>
                <th></th>
                <th>Item Name</th>
                <th>Nr of items to buy</th>
                <th>Sell Price</th>
                <th>Buy Price</th>
                <th>Profit Margin</th>
            </thead>
            <tbody>
                <soldOutItem v-for="item in soldOutItems" 
                    :key="item.id"
                    :item="item.data"
                    :markAsProfitable="item.markAsProfitable"
                    :markAsVeryProfitable="item.markAsVeryProfitable"
                >
                </soldOutItem>
            </tbody>
        </table>
    </div>
</template>

<style lang="scss">
</style>

<script>
import SoldOutItem from '@/components/SoldOutItem';

import { getAccessToken, parseJSON, parseXml, removeDuplicates, dayDiff, calculateProfitMargin} from '@/Util';
import {
    fetchMarketOrdersInCitadel,
    fetchWalletTransactions,
    fetchMarketOrders,
    fetchMarketOrdersInRegion
    } from '@/ApiCalls';

const SELL_REGION = '10000048';
const BUY_REGION = '10000002';

const SELL_STATIONS = [60001396, 60001399, 60001393, 60010327, 60011017, 60001390, 60010330, 60006799, 60006805, 60011008, 60010333];
const BUY_STATIONS = [60003760];

function sellItemFilter(walletTransaction) {
    return walletTransaction.transactionType === 'sell';
}

function createTypeIdFilter(typeId) {
    return item => item.type_id === typeId || item.typeID === typeId;
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

function createLocationIdFilter(locationIds) {
    return item => locationIds.includes(item.location_id);
}

export default {
    components: {
        SoldOutItem
    },

    data() {
        return {
            soldOutItems: []
        }
    },

    methods: {
        getUniqueItems(items) {
            return removeDuplicates(items, 'typeName');
        },

        getLatestTransactionDate(transactions) {
            return transactions.reduce((latestDate, currentTransaction) => {
                const currentTransactionDate = new Date(currentTransaction.transactionDateTime);
                return currentTransactionDate > latestDate ? currentTransactionDate : latestDate;
            }, new Date(transactions[0].transactionDateTime));
        },

        getFirstTransactionDate(transactions) {
            return transactions.reduce((firstDate, currentTransaction) => {
                const currentTransactionDate = new Date(currentTransaction.transactionDateTime);
                return currentTransactionDate < firstDate ? currentTransactionDate : firstDate;
            }, new Date(transactions[0].transactionDateTime));
        },

        getTotalQuantity(transactions) {
            return transactions.reduce((total, currentTransaction) => {
                return total + parseInt(currentTransaction.quantity);
            }, 0);
        },

        findSoldOutMarketOrders(walletTransactions, marketOrders) {
            const noMarketOrderFilter = createWalletTransactionWithoutMarketOrderFilter(marketOrders);
            const noVolumeRemainingFilter = createWalletTransactionWhereNoVolumeRemainigFilter(marketOrders);

            const totalSoldOutTransactions = [
                ...walletTransactions.filter(noMarketOrderFilter),
                ...walletTransactions.filter(noVolumeRemainingFilter)
            ];

            return totalSoldOutTransactions;;
        },


        checkHowManyItemsToBuy(item, walletTransactions) {
            if (!walletTransactions || walletTransactions.length < 4) {
                return 'N/A';
            }

            const typeIdFilter = createTypeIdFilter(item.typeID);
            const walletTransactionsForItem = walletTransactions.filter(typeIdFilter);
            const latestTransactionDate = this.getLatestTransactionDate(walletTransactionsForItem);
            const firstTransactionDate = this.getFirstTransactionDate(walletTransactionsForItem);

            const numberOfDays = dayDiff(firstTransactionDate, latestTransactionDate);

            if (numberOfDays < 2) {
                return 'N/A';
            }

            const totalQuantity = this.getTotalQuantity(walletTransactionsForItem);

            return Math.round((totalQuantity / numberOfDays) * 30);
        },

        findOrderWithLowestPrice(orders) {
            if (orders.length) {
                return orders.reduce((orderWithLowestPrice, currentOrder) => (
                    orderWithLowestPrice.price && orderWithLowestPrice.price < currentOrder.price ?
                        orderWithLowestPrice : currentOrder
                ));
            }
        },

        getBuyOrderWithLowestPrice(itemId) {
            const locationIdFilter = createLocationIdFilter(BUY_STATIONS);

            return fetchMarketOrdersInRegion(itemId, BUY_REGION)
                .then(parseJSON)
                .then(orders => orders.filter(locationIdFilter))
                .then(orders => this.findOrderWithLowestPrice(orders));
        },

        getSellOrderWithLowestPrice(itemId, marketOrdersInCitadel) {
            const locationIdFilter = createLocationIdFilter(SELL_STATIONS);
            const typeIdFilter = createTypeIdFilter(itemId);

            const ordersFromCitdadel = marketOrdersInCitadel.filter(typeIdFilter);

            return fetchMarketOrdersInRegion(itemId, SELL_REGION)
                .then(parseJSON)
                .then(orders => orders.filter(locationIdFilter))
                .then(ordersFromRegion => {
                    return this.findOrderWithLowestPrice([...ordersFromRegion, ...ordersFromCitdadel]);
                });
        },

        checkItemProfitability(itemId, marketOrdersInCitadel) {
            const sellOrderWithLowestPrice = this.getSellOrderWithLowestPrice(itemId, marketOrdersInCitadel);
            const buyOrderWithLowestPrice = this.getBuyOrderWithLowestPrice(itemId);

            return Promise.all([sellOrderWithLowestPrice, buyOrderWithLowestPrice])
                .then(values => {
                    const sellPrice = values[0] ? values[0].price : null;
                    const buyPrice = values[1] ? values[1].price : null;
                    const profitMargin = calculateProfitMargin(sellPrice, buyPrice);

                    return {
                        sellPrice,
                        buyPrice,
                        profitMargin
                    }
                })
        },

        getSoldOutMarketOrders(walletTransactions, marketOrders) {
            const soldOutMarketOrders = this.findSoldOutMarketOrders(walletTransactions, marketOrders);
            return this.getUniqueItems(soldOutMarketOrders);
        },

        getMarketOrdersFromCitdadel() {
            const citadelId = '1024376813358';
            const accessToken = getAccessToken();

            return fetchMarketOrdersInCitadel(citadelId, accessToken)
                .then(parseJSON);
        },

        getMarketOrders() {
            return fetchMarketOrders().then(parseXml);
        },

        getWalletTransaction() {
            return fetchWalletTransactions()
                .then(parseXml)
                .then(transactions => transactions.filter(sellItemFilter));
        },

        async getSoldOutItemData(order, walletTransactions, marketOrdersInCitadel) {
            const numberOfItemsToBuy = this.checkHowManyItemsToBuy(order, walletTransactions);
            const itemProfitability = await this.checkItemProfitability(order.typeID, marketOrdersInCitadel);
            const markAsProfitable = itemProfitability.profitMargin > 0.3;
            const markAsVeryProfitable = !itemProfitability.sellPrice;

            return {
                id: order.typeID,
                data: {
                    name: order.typeName,
                    numberOfItemsToBuy,
                    ...itemProfitability
                },
                markAsProfitable,
                markAsVeryProfitable
            }
        },

        async fetchData() {
            const marketOrdersInCitadel = await this.getMarketOrdersFromCitdadel();

            const [walletTransactions, marketOrders] = await Promise.all(
                [this.getWalletTransaction(), this.getMarketOrders()]
            );

            const soldOutOrders = this.getSoldOutMarketOrders(walletTransactions, marketOrders);

            const soldOutItems = soldOutOrders.map(order => {
                return this.getSoldOutItemData(order, walletTransactions, marketOrdersInCitadel);
            });

            this.soldOutItems = await Promise.all(soldOutItems);
        }
    },

    mounted() {
        this.fetchData();
    },

    name: 'soldOutItemsList',

}
</script>