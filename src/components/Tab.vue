<template>
    <article v-show="isActive">
        <slot></slot>
    </article>
</template>

<script>
export default {
    data() {
        return {
            isActive: false
        }
    },

    name: 'Tab',

    mounted() {
        this.isActive = this.selected;
    },

    props: {
        id: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        selected: false
    }
}
</script>