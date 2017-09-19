<template>
    <div>
        <label>Item name:</label>
        <input type="text">
        <button>Find</button>
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
import { calculateProfitMargin } from '@/Util';
export default {
    computed: {
        profit() {
            return this.sellPrice - this.buyPrice;
        },
        profitMargin() {
            return calculateProfitMargin(this.sellPrice, this.buyPrice);
        }
    },
    data() {
        return {
            sellPrice: 4,
            buyPrice: 2,
            feedbackMessage: undefined
        }
    },
    name: 'findPotentialProfit'
}
</script>