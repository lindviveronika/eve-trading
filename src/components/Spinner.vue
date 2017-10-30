<template>
    <svg class="spinner" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" class="spinner-circle"></circle>
    </svg>
</template>

<style>
.spinner {
    --animation-speed: 1.6s;
    --spinner-stroke-width: 4px;
    --spinner-size: 35px;
    --spinner-color: var(--primary-color);

    width: var(--spinner-size);
    height: var(--spinner-size);
    animation: var(--animation-speed) rotate linear infinite;
}

.spinner-circle {
    stroke: var(--spinner-color);
    stroke-width: var(--spinner-stroke-width);
    stroke-linecap: round;
    fill: transparent;
    stroke-dasharray: 20, 105;
    animation: var(--animation-speed) spin ease-in-out infinite;
}

@keyframes spin {
    50% {
        stroke-dashoffset: 62.5px;
        stroke-dasharray: 105, 20;
    }

    100% {
        stroke-dashoffset: 125px;
        stroke-dasharray: 20, 105;
    }
}

@keyframes rotate {
    100% {
        transform: rotate(-360deg);
    }
}
</style>


<script>
export default {
    name: 'Spinner',
}
</script>