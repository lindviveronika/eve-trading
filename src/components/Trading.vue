<template>
    <tabs>
        <tab id="soldOutOrders" title="Sold out orders" :selected="true">
            <h1>Sold Out Orders</h1>
            <soldOutItemsList></soldOutItemsList>
        </tab>

        <tab id="priceChangeOrders" title="Orders that needs price change">
            <h1>Orders that needs price change</h1>
            <priceChangeItemsList></priceChangeItemsList>
        </tab>

        <tab id="findPotentialProfit" title="Find potential profit">
            <h1>Find potential profit of item</h1>
        </tab>
    </tabs>
</template>

<style>
</style>

<script>
    import Tabs from '@/components/Tabs';
    import Tab from '@/components/Tab';
    import SoldOutItemsList from '@/components/SoldOutItemsList';
    import PriceChangeItemsList from '@/components/PriceChangeItemsList';

    export default {
        components: {
            Tabs,
            Tab,
            SoldOutItemsList,
            PriceChangeItemsList
        }
    }
</script>