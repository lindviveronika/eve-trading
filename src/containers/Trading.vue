<template>
    <div style="height: 100%">
        <tabs style="height: 100%">
            <tab id="soldOutOrders" class="tab-content-container" title="Sold Out" :selected="true">
                    <div class="inner-container">
                        <soldOutItemsList class="content">
                            <h1 class="title">Sold Out Orders</h1>
                        </soldOutItemsList>
                    </div>
            </tab>

            <tab id="priceChangeOrders" class="tab-content-container" title="Price Change">
                <div class="inner-container">
                    <priceChangeItemsList class="content">
                        <h1 class="title">Orders that needs price change</h1>
                    </priceChangeItemsList>
                </div>
            </tab>

            <tab id="findPotentialProfit" class="tab-content-container" title="Find Potential Profit">
                <div class="inner-container">
                    <findPotentialProfit class="content">
                        <h1 class="title">Find potential profit of item</h1>
                    </findPotentialProfit>
                </div>
            </tab>
        </tabs>
    </div>
</template>

<style scoped>
.tab-content-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.inner-container {
    flex: 1 1 auto;
    margin: 10px 1%;
    font-size: 14px;
    color: var(--text-color-primary);
    font-family: 'Proxima Nova', Georgia, sans-serif;
}

.content {
    width: 80%;
    margin: auto;
    padding: 30px;
    background-color: rgba(66, 162, 245, 0.12);
    border-left: 2px solid var(--primary-color);;
    border-right: 2px solid var(--primary-color);;
}

.title {
    text-align: center;
    text-transform: uppercase;
    font-family: 'Audiowide', monospace;
    letter-spacing: 1.5px;
    font-weight: normal;
    margin: 0 0 30px 0;
    font-size: 14px;
    color: var(--primary-color);
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