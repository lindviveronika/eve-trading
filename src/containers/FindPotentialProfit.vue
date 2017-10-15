<template>
    <div>
        <div class="input-wrapper">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                <path d="M0 0h24v24H0z" fill="none"/>
            </svg>
            <input class="input-field" type="text" placeholder="Search" v-model="userInput" v-on:keyup="keyUpHandler">
        </div>
        <div v-show="isSearching">Searching...</div>
        <p v-show="feedbackMessage" class="feedback-message">{{ feedbackMessage }}</p>
        <table v-show="displayResults" class="table">
            <tableHeader :headerLabels="headerLabels"></tableHeader>
            <tbody>
                <tr>
                    <td>{{ itemName }}</td>
                    <td>{{ sellPrice }}</td>
                    <td>{{ buyPrice }} </td>
                    <td>{{ profit }}</td>
                    <td>{{ profitMargin | percentage }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style lang="scss" scoped>
.table {
    border-collapse: collapse;
    width: 100%;
    margin-top: 30px;
}

td {
    padding: 5px 10px 5px 0px;
    text-align: right;
    background-color: #efefef;
}

td:first-of-type {
    text-align: left;
}

.input-wrapper {
    border: 2px solid #CCC;
    border-radius: 3px;
    max-width: 600px;
    width: 100%;
    margin: auto;
    display: flex;
    height: 35px;
}

.search-icon {
    fill: #888;
    align-self: center;
    flex: 0 1 40px;
}

.input-field {
    flex: 1 1 auto;
    font-size: 14px;
    border: none;
    outline: none;
}

.feedback-message {
    width: 100%;
    margin: 0 auto;
    margin-top: 30px;
    text-align: center;
}
</style>

<script>
import { calculateProfitMargin, parseJSON } from '@/Util';
import { fetchItemIdFromName, fetchMarketOrdersInRegion,  } from '@/ApiCalls';
import TableHeader from '@/components/TableHeader';

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
    components: {
        TableHeader
    },

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
            itemName: '',
            isSearching: false,
            displayResults: false,
            userInput: '',
            headerLabels: [
                { label: 'Item Name', alignLeft: true },
                { label: 'Sell Price' },
                { label: 'Buy Price' },
                { label: 'Profit' },
                { label: 'Profit Margin ' }
            ]
        }
    },

    methods: {
        resetData() {
            this.feedbackMessage = '';
            this.sellPrice = undefined;
            this.buyPrice = undefined;
            this.isSearching = false;
            this.displayResults = false;
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

        checkItemProfitability(itemId, itemName, marketOrdersInCitadel = []) {
            const sellOrderWithLowestPrice = this.getSellOrderWithLowestPrice(itemId, marketOrdersInCitadel);
            const buyOrderWithLowestPrice = this.getBuyOrderWithLowestPrice(itemId);

            return Promise.all([sellOrderWithLowestPrice, buyOrderWithLowestPrice])
                .then(values => {
                    const sellPrice = values[0] ? values[0].price : null;
                    const buyPrice = values[1] ? values[1].price : null;

                    this.isSearching = false;
                    this.displayResults = true;
                    this.itemName = itemName;
                    this.sellPrice = sellPrice;
                    this.buyPrice = buyPrice;
                })
        },

        async getItemIdFromItemName(userInput) {
            const response = await fetchItemIdFromName(userInput);
            const parsedReponse = parseJSON(response);

            return parsedReponse.inventorytype;
        },

        async findPotentialProfit() {
            this.resetData();

            this.isSearching = true;
            const itemId = await this.getItemIdFromItemName(this.userInput);

            if (itemId && itemId.length) {
                this.checkItemProfitability(itemId, this.userInput);
            } else {
                this.isSearching = false;
                this.feedbackMessage = 'No item found...';
            }
        },

        keyUpHandler(event) {
            if (event.key === 'Enter') {
                this.findPotentialProfit();
            }
        }
    },

    name: 'findPotentialProfit'
}
</script>