import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    symbols: ['eurusd', 'gbpusd'],
    algorithms: ['knn', 'rsi']
  },
  mutations: {

  },
  actions: {

  },
  getters: {}
})
