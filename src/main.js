import Vue from 'vue';
import App from './App.vue';
import router from './router';

new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})

Vue.filter('percentage', function(value, decimals) {
  if (typeof value !== 'number') {
    return;
  }

	if(!value) value = 0;
	if(!decimals) decimals = 0;

	value = value * 100;
	return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals) + "%";
});

Vue.filter('currency', function(value) {
  if (typeof value !== 'number') {
    return;
  }

  return value.toLocaleString();
}); 