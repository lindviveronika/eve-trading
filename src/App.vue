<template>
  <div id="app" class="app-container">
    <router-view></router-view>
  </div>
</template>

<style lang="scss">
    @import url('https://fonts.googleapis.com/css?family=Audiowide');

    /* Resets */
    html, body {
        min-height: 100%;
        width: 100%;
        margin: 0;
    }

    ul {
        margin: 0;
    }

    li {
        list-style: none;
    }

    button {
        border: none;
        box-shadow: none;
        outline: none;
        background-color: transparent;
        cursor: pointer;
        margin: 0;
    }

    /* End resets */

    body {
        background: rgba(0, 0, 0, 0.8);
        background-image: url('https://images.pexels.com/photos/134074/pexels-photo-134074.jpeg?w=1260&h=750&auto=compress&cs=tinysrgb');
        background-size: cover;
        background-blend-mode: soft-light;
    }

    .app-container {
        height: 100%;
    }
</style>


<script>
export default {
  name: 'app'
}
</script>
