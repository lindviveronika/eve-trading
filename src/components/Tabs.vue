<template>
    <div>
        <ul>
            <li v-for="tab in tabs" v-on:click="selectTab(tab)" :key="tab.id" :class="{ isActive: tab.isActive }">
                {{ tab.title }}
            </li>
        </ul>

        <slot></slot>
    </div>
</template>

<style>
    .isActive {
        color: red;
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