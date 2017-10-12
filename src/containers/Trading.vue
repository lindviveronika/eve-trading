<template>
    <div>
        <tabs>
            <tab id="soldOutOrders" title="Sold Out" :selected="true">
                <h1 class="title">Sold Out Orders</h1>
                <soldOutItemsList class="content"></soldOutItemsList>
            </tab>

            <tab id="priceChangeOrders" title="Price Change">
                <h1 class="title">Orders that needs price change</h1>
                <priceChangeItemsList class="content"></priceChangeItemsList>
            </tab>

            <tab id="findPotentialProfit" title="Find Potential Profit">
                <h1 class="title">Find potential profit of item</h1>
                <findPotentialProfit class="content"></findPotentialProfit>
            </tab>
        </tabs>
    </div>
</template>

<style lang="scss" scoped>
.title {
    text-align: center;
    text-transform: uppercase;
    font-family: 'Audiowide', monospace;
    letter-spacing: 1.5px;
    color: #D0A502;
    font-weight: normal;
    margin: 45px 0 50px 0;
}

.content {
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    top: 210px;
    background-color: #EFEFEF;
}
</style>

<script>
import Tabs from '@/components/Tabs';
import Tab from '@/components/Tab';
import SoldOutItemsList from '@/containers/SoldOutItemsList';
import PriceChangeItemsList from '@/containers/PriceChangeItemsList';
import FindPotentialProfit from '@/containers/FindPotentialProfit';

export default {
    components: {
        Tabs,
        Tab,
        SoldOutItemsList,
        PriceChangeItemsList,
        FindPotentialProfit
    }
}
</script>