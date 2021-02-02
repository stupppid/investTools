import Vue from 'vue'
import Router from 'vue-router'
import invest from '@/pages/invest'
import algorithm from '@/pages/invest/algorithms'
import knn from '@/pages/invest/algorithms/knn'
import rsi from '@/pages/invest/algorithms/rsi'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/algorithm',
      component: algorithm,
      children: [
        {
          path: 'knn',
          component: knn
        },
        {
          path: 'rsi',
          component: rsi
        }
      ]
    },
    {
      path: '/',
      component: invest
    },
    {
      path: '/',
      redirect: '/invest'
    }
  ]
})
