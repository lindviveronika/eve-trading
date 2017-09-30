<template>
    <div>
        <ul class="tab-container">
            <li v-for="tab in tabs" v-on:click="selectTab(tab)" :key="tab.id" :class="{ isActive: tab.isActive, tab }">
                {{ tab.title }}
            </li>
        </ul>

        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
.tab-container {
    display: flex;
    justify-content: center;
    text-transform: uppercase;
    font-family: 'Audiowide', monospace;
    letter-spacing: 1.5px;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 30px;
}

.tab {
    margin: 0 25px;
    color: white;
    font-size: 14px;
    cursor: pointer;
}

.tab:hover {
    color: #00AEFF;
}

.isActive {
    color: #00AEFF;
}
</style>

<script>
export default {
    created() {
        this.tabs = this.$children
    },

    data() {
        return {
            tabs: []
        }
    },

    name: 'Tabs',

    methods: {
        selectTab(selectedTab) {
            this.tabs.forEach(tab => {
                tab.isActive = selectedTab.id === tab.id;
            });
        }
    }
}
</script>