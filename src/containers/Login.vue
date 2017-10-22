<template>
    <div>
        <header>
            <h1>Eve Trading</h1>
        </header>
        <button v-on:click="redirectToLogin">Login</button>
    </div>
</template>

<style scoped>
h1 {
    color: orange;
}

button {
    background-color: blue;
}
</style>

<script>
import { clientId } from '@/Keys';

function getLoginUrl() {
    const callbackUri = encodeURIComponent('http://localhost:8080/#/trading');
    return 'https://login.eveonline.com/oauth/authorize/?response_type=token&redirect_uri=' + callbackUri + '&client_id=' + clientId + '&scope=esi-universe.read_structures.v1%20esi-markets.structure_markets.v1';
}

export default {
    name: 'login',
    methods: {
        redirectToLogin: function (event) {
        window.location = getLoginUrl();
        }
    }
}
</script>