<template>
    <tr id="key" v-bind:class="{ 
        'highlighted': markAsProfitable,
        'extra-highlighted': markAsVeryProfitable
        }">
        <td><button v-clipboard:copy="item.name">Copy Name</button></td>
        <td>{{ item.name }}</td>
        <td>{{ item.numberOfItemsToBuy }}</td>
        <td>{{ item.sellPrice  | currency }}</td>
        <td>{{ item.buyPrice | currency }}</td>
        <td>{{ item.profitMargin | percentage }}</td>
    </tr>
</template>

<style lang="scss">
    .highlighted {
        background: yellow;
    }

    .extra-highlighted {
        background: lime;
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