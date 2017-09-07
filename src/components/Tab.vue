<template>
    <article v-show="isActive">
        <slot></slot>
    </article>
</template>

<style>
</style>

<script>
    export default {
        data() {
            return {
                isActive: false
            }
        },

        name: 'Tab',

        props: {
            id: { 
                type: String,
                required: true 
            },
            title: { 
                type: String,
                required: true
            }
        }
    }
</script>