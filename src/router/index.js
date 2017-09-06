import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '@/components/Login';
import SoldOutItemsList from '@/components/SoldOutItemsList';

Vue.use(VueRouter);

const routes = [
  { path: '/', component: Login },
  { path: '/trading', component: SoldOutItemsList }
];

export default new VueRouter({
  routes
})