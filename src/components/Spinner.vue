<template>
    <div class="spinner">
    </div>
</template>

<style>
.spinner {
    --spinner-stroke-width: 3px;
    --spinner-size: 30px;
    --spinner-color: var(--primary-color);
    --spinner-background-color: transparent;
    --animation-speed: 1500ms;

    border: var(--spinner-stroke-width) solid var(--spinner-color);
    border-radius: 50%;
    height: var(--spinner-size);
    width: var(--spinner-size);
    position: relative;
    margin: 0 auto;
}

.spinner:before,
.spinner:after {
    position: absolute;
    background-color: var(--spinner-background-color);
    content: '';
    height: calc(100% + var(--spinner-stroke-width) * 2);
    width: calc(50% + var(--spinner-stroke-width));
    bottom: calc(var(--spinner-stroke-width) * -1);
    animation: var(--animation-speed) spin infinite ease;
}

.spinner:before {
    right: calc(var(--spinner-stroke-width) * -1);
    animation-delay: calc(var(--animation-speed) / 4);
    transform-origin: center left;
}

.spinner:after {
    left: calc(var(--spinner-stroke-width) * -1);
    transform-origin: center right;
}

@keyframes spin {
    100% {
        transform: rotate(360deg);
    }
}
</style>


<script>
export default {
    name: 'Spinner',
}
</script>