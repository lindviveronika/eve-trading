import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '@/containers/Login';
import Trading from '@/containers/Trading';

Vue.use(VueRouter);

const routes = [
  { path: '/', component: Login },
  { path: '/trading', component: Trading }
];

export default new VueRouter({
  routes
})