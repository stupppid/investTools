<template>
  <el-card :body-style="{ padding: '0px' }">
    <img src="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png" class="image">
    <div>
      <span>{{symbol}} {{inputLength}}</span>
      <div class="bottom">
        <time class="time">{{time}}</time>
        <el-button type="text" class="button" @click="$emit('showHistory', { symbol, inputLength })">show history</el-button>
      </div>
    </div>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'
export default {
  name: 'Card',
  props: ['symbol', 'inputLength', 'time'],
  methods: {

  },
  created () {
    console.log(echarts)
  }
}
</script>

<style lang="sass" scoped>
</style>
