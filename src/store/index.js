import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    symbols: ['EURUSD', 'GBPUSD'],
    algorithms: ['knn', 'rsi'],
    periods: ['M5', 'M15', 'H1', 'D1', 'H4']
  },
  mutations: {

  },
  actions: {

  },
  getters: {}
})
