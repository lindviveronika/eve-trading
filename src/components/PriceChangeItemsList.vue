<template>
    <div>
        <table>
            <thead>
                <th></th>
                <th>Item Name</th>
                <th>Sell Price</th>
                <th>Competing Price</th>
                <th>Competing Quantity Remaining</th>
            </thead>
            <tbody>
                <tr v-for="item in itemsThatNeedsPriceChange" :key="item.typeID">
                    <td></td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.price }}</td>
                    <td>{{ item.competingPrice }}</td>
                    <td>{{ item.competingVolumeRemaining }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style lang="scss">
</style>

<script>
import { parseXml, parseJSON } from '@/Util';
import { fetchMarketOrders, fetchItemInformation, fetchMarketOrdersInRegion } from '@/ApiCalls';

const SELL_REGION = '10000048';
const SELL_STATIONS = [60001396, 60001399, 60001393, 60010327, 60011017, 60001390, 60010330, 60006799, 60006805, 60011008, 60010333];

function createLocationIdFilter(locationIds) {
    return item => locationIds.includes(item.location_id);
}

export default {
    data() {
        return {
            itemsThatNeedsPriceChange: []
        }
    },

    methods: {
        findOrderWithLowestPrice(orders) {
            if (orders.length) {
                return orders.reduce((orderWithLowestPrice, currentOrder) => (
                    orderWithLowestPrice.price && orderWithLowestPrice.price < currentOrder.price ?
                        orderWithLowestPrice : currentOrder
                ));
            }
        },

        getMarketOrders() {
            return fetchMarketOrders().then(parseXml);
        },

        addItemNameToMarketOrder(order) {
            return fetchItemInformation(order.typeID)
                .then(parseJSON)
                .then(item => ({name: item.name, ...order}));
        },

        async getCompetingPrice(order) {
            const locationIdFilter = createLocationIdFilter(SELL_STATIONS);

            const competingOrderWithLowestPrice = await fetchMarketOrdersInRegion(order.typeID, SELL_REGION)
                .then(parseJSON)
                .then(order => order.filter(locationIdFilter))
                .then(this.findOrderWithLowestPrice);

            return {
                ...order,
                competingPrice: competingOrderWithLowestPrice ? competingOrderWithLowestPrice.price : undefined,
                competingVolumeRemaining: competingOrderWithLowestPrice ? competingOrderWithLowestPrice.volume_remain: undefined
            };
        },

        async fetchData() {
            const marketOrders = await this.getMarketOrders();

            const ordersWithName = await Promise.all(marketOrders.map(this.addItemNameToMarketOrder));
            const ordersWithCompetingPrice = await Promise.all(ordersWithName.map(this.getCompetingPrice));

            this.itemsThatNeedsPriceChange = ordersWithCompetingPrice.filter(order => order.competingPrice < order.price);
       }
    },

    mounted() {
        this.fetchData();
    },

    name: 'priceChangeItemsList',

}
</script>