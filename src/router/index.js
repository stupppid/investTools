import Vue from 'vue'
import Router from 'vue-router'
import invest from '@/pages/invest'
import algorithm from '@/pages/invest/algorithm'
import knn from '@/pages/invest/algorithm/knn'
import rsi from '@/pages/invest/algorithm/rsi'
import uploadData from '@/pages/invest/uploadData'

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
      path: '/uploadData/mt5',
      component: uploadData
    },
    {
      path: '/',
      redirect: '/invest'
    }
  ]
})
