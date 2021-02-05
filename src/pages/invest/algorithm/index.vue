<template>
  <div class="invest">
    <div>
      <router-view />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import rsi from './rsi'
import knn from './knn'
export default {
  name: 'algorithm',
  data () {
    return {
      algoMap: {
        knn, rsi
      }
    }
  },
  computed: {
    ...mapState({
      symbols: state => state.symbols,
      algorithms: state => state.algorithms
    })
  },
  methods: {
  },
  created () {
  }
}
</script>

<style lang="sass" scoped>
</style>
