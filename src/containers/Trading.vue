<template>
    <div style="height: 100%">
        <tabs style="height: 100%">
            <tab id="soldOutOrders" class="tab-content-container" title="Sold Out" :selected="true">
                    <h1 class="title">Sold Out Orders</h1>
                    <div class="inner-container">
                        <soldOutItemsList class="content"></soldOutItemsList>
                    </div>
            </tab>

            <tab id="priceChangeOrders" class="tab-content-container" title="Price Change">
                <h1 class="title">Orders that needs price change</h1>
                <div class="inner-container">
                    <priceChangeItemsList class="content"></priceChangeItemsList>
                </div>
            </tab>

            <tab id="findPotentialProfit" class="tab-content-container" title="Find Potential Profit">
                <h1 class="title">Find potential profit of item</h1>
                <div class="inner-container">
                    <findPotentialProfit class="content"></findPotentialProfit>
                </div>
            </tab>
        </tabs>
    </div>
</template>

<style lang="scss" scoped>
.tab-content-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.inner-container {
    flex: 1 1 auto;
    background-color: #EFEFEF;
    padding: 30px;
    font-size: 14px;
    color: #606060;
    font-family: 'Proxima Nova', Georgia, sans-serif;
}

.content {
    width: 80%;
    margin: auto;
    padding: 30px;
    background-color: #fff;
}

.title {
    text-align: center;
    text-transform: uppercase;
    font-family: 'Audiowide', monospace;
    letter-spacing: 1.5px;
    color: #D0A502;
    font-weight: normal;
    margin: 45px 0 50px 0;
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