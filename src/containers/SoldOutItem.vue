<template>
    <tr id="key" v-bind:class="{
        'highlighted': markAsProfitable,
        'extra-highlighted': markAsVeryProfitable
        }">
        <td>
            <button class="copy-button" v-clipboard:copy="item.name">
                <svg xmlns="http://www.w3.org/2000/svg" class="copy-icon" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M0 0h24v24H0z" fill="none"/>
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
            </button>
        </td>
        <td>{{ item.name }}</td>
        <td>{{ item.numberOfItemsToBuy }}</td>
        <td>{{ item.sellPrice  | currency }}</td>
        <td>{{ item.buyPrice | currency }}</td>
        <td>{{ item.profitMargin | percentage }}</td>
    </tr>
</template>

<style scoped>
.highlighted {
    color: #e2b100;
}

.extra-highlighted {
    color: #27c63c;
}

td {
    padding: 5px 10px 5px 0px;
    text-align: right;
}

td:nth-of-type(2) {
    text-align: left;
}

.copy-icon {
    fill: var(--primary-text-color);
}

button:hover svg {
    fill: var(--primary-color);
}

button:active svg {
    fill: #008bcc;
}
</style>

<script>
import Vue from 'vue';
import VueClipBoard from 'vue-clipboard2';

Vue.use(VueClipBoard);

export default {
    name: 'soldOutItem',

    props: {
        item: Object,
        markAsProfitable: Boolean,
        markAsVeryProfitable: Boolean
    }
}
</script>