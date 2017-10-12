<template>
    <div class="sold-out-item-list">
        <div class="container">
            <table>
                <tableHeader :headerLabels="headerLabels"></tableHeader>
                <tbody>
                    <tr class="sold-out-item" v-for="item in itemsThatNeedsPriceChange" :key="item.typeID">
                        <td>
                            <button class="copy-button" v-clipboard:copy="item.name">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="#606060" height="24" viewBox="0 0 24 24" width="24">
                                    <path d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                                </svg>
                            </button>
                        </td>
                        <td>{{ item.name }}</td>
                        <td>{{ item.price }}</td>
                        <td>{{ item.competingPrice }}</td>
                        <td>{{ item.competingVolumeRemaining }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.sold-out-item-list {
    padding: 30px;
    font-size: 14px;
    color: #606060;
    font-family: 'Proxima Nova', Georgia, sans-serif;
}

.container {
    width: 80%;
    min-width: 450px;
    margin: auto;
    padding: 30px;
    background-color: #fff;
}

.table {
    border-collapse: collapse;
    width: 100%;
}

.sold-out-item:nth-child(odd) {
    background-color: #efefef;
}

td {
    padding: 5px 10px 5px 0px;
    text-align: right;
}

td:nth-of-type(1) {
    text-align: left;
}

button:hover {
    svg {
        fill: #00AEFF;
    }
}

button:active {
    svg {
        fill: darken(#00AEFF, 10%);
    }
}
</style>

<script>
import { parseXml, parseJSON } from '@/Util';
import { fetchMarketOrders, fetchItemInformation, fetchMarketOrdersInRegion } from '@/ApiCalls';
import TableHeader from '@/components/TableHeader';
import Vue from 'vue';
import VueClipBoard from 'vue-clipboard2';

Vue.use(VueClipBoard);

const SELL_REGION = '10000048';
const SELL_STATIONS = [60001396, 60001399, 60001393, 60010327, 60011017, 60001390, 60010330, 60006799, 60006805, 60011008, 60010333];

function createLocationIdFilter(locationIds) {
    return item => locationIds.includes(item.location_id);
}

export default {
    components: {
        TableHeader
    },

    data() {
        return {
            itemsThatNeedsPriceChange: [],
            headerLabels: [
                { label: '' },
                { label: 'Item Name', alignLeft: true },
                { label: 'Sell Price' },
                { label: 'Competing Price' },
                { label: 'Competing Quantity Remaining' }
            ]
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