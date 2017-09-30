<template>
    <div>
        <label>Item name:</label>
        <input type="text" v-model="itemName">
        <button v-on:click="findPotentialProfit">Find</button>
        <span style="color: red">{{ feedbackMessage }}</span>
        <table>
            <thead>
                <th>Sell price</th>
                <th>Buy price</th>
                <th>Profit</th>
                <th>Profit Margin</th>
            </thead>
            <tbody>
                <tr>
                    <td>{{ sellPrice }}</td>
                    <td>{{ buyPrice }} </td>
                    <td>{{ profit }}</td>
                    <td>{{ profitMargin | percentage }}</td>
                </tr>
            </tbody>
        </table>    
    </div>
</template>

<style lang="scss">
</style>

<script>
import { calculateProfitMargin, parseJSON } from '@/Util';
import { fetchItemIdFromName, fetchMarketOrdersInRegion,  } from '@/ApiCalls';

const SELL_REGION = '10000048';
const BUY_REGION = '10000002';

const SELL_STATIONS = [60001396, 60001399, 60001393, 60010327, 60011017, 60001390, 60010330, 60006799, 60006805, 60011008, 60010333];
const BUY_STATIONS = [60003760];

function createLocationIdFilter(locationIds) {
    return item => locationIds.includes(item.location_id);
}

function createTypeIdFilter(typeId) {
    return item => item.type_id === typeId || item.typeID === typeId;
}

export default {
    computed: {
        profit() {
            return this.sellPrice ? this.sellPrice - this.buyPrice : '';
        },

        profitMargin() {
            return calculateProfitMargin(this.sellPrice, this.buyPrice);
        }
    },

    data() {
        return {
            sellPrice: undefined,
            buyPrice: undefined,
            feedbackMessage: undefined,
            itemName: ''
        }
    },

    methods: {
        resetData() {
            this.feedbackMessage = '';
            this.sellPrice = undefined;
            this.buyPrice = undefined;
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

        checkItemProfitability(itemId, marketOrdersInCitadel = []) {
            const sellOrderWithLowestPrice = this.getSellOrderWithLowestPrice(itemId, marketOrdersInCitadel);
            const buyOrderWithLowestPrice = this.getBuyOrderWithLowestPrice(itemId);

            return Promise.all([sellOrderWithLowestPrice, buyOrderWithLowestPrice])
                .then(values => {
                    const sellPrice = values[0] ? values[0].price : null;
                    const buyPrice = values[1] ? values[1].price : null;

                    this.sellPrice = sellPrice;
                    this.buyPrice = buyPrice;
                })
        },

        async getItemIdFromItemName(itemName) {
            const response = await fetchItemIdFromName(itemName);
            const parsedReponse = parseJSON(response);
            
            return parsedReponse.inventorytype;
        },

        async findPotentialProfit() {
            const itemId = await this.getItemIdFromItemName(this.itemName);

            this.resetData();

            if (itemId && itemId.length) {
                this.checkItemProfitability(itemId);
            } else {
                this.feedbackMessage = 'No item found...';
            }
        }
    },

    name: 'findPotentialProfit'
}
</script>