<template>
  <div class="invest">
    <!-- search bar -->
    <!-- watchList 状态 -->
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'invest',
  data () {
    return {
      algorithms: [{
        name: 'KNN'
      }]
    }
  },
  methods: {
    test () {
      axios.get('/api/v1/users').then(r => {
        console.log(r)
      })
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
