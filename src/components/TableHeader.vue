<template>
    <thead class="table-header">
        <th v-for="headerLabel in headerLabels"
            :key="headerLabel.label"
            :class="{
                'align-left': headerLabel.alignLeft
            }"
        >
            {{ headerLabel.label }}
        </th>
    </thead>
</template>

<style lang="scss" scoped>
th {
    font-family: 'Audiowide', monospace;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 12px;
    font-weight: bold;
    padding: 5px 10px 5px 0px;
    text-align: right;
}

.align-left {
    text-align: left;
}
</style>


<script>
export default {
    name: 'tableHeader',
    props: {
        headerLabels: Array
    }
}
</script>