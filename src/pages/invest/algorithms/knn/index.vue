<template>
  <div class="algo">
    <!-- 3个维度 输入长度, 种类, 输出历史记录,输出历史记录当输入其他两个后才能看 -->
    <el-form :model="form" :rules="rules" :inline="true" ref="form" :clearable="true">
      <el-form-item
        label="input length"
        prop="inputLength"
      >
        <el-input placeholder="inputLength" v-model.number="form.inputLength" :max="100" :min="3" :clearable="true"></el-input>
      </el-form-item>
      <el-form-item
        label="symbol"
        prop="symbol"
      >
        <el-select v-model="form.symbol" placeholder="symbol" :clearable="true">
          <el-option v-for="(item, key) in symbols" :key="key" :label="item" :value="key" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="text">expand</el-button>
      </el-form-item>
    </el-form>
    <div>
      <card></card>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Card from './card.vue'
import { knnGet } from '@/api/invest'
export default {
  name: 'KNN',
  components: {Card},
  computed: {
    ...mapState({
      symbols: state => state.symbols
    })
  },
  data () {
    return {
      rules: {},
      form: {
        inputLength: 30
      }
    }
  },
  methods: {
    getData () {
      knnGet(this.form).then(r => {
        console.log(r)
      })
    }
  },
  created () {
    debugger
    this.getData()
  }
}
</script>

<style lang="sass" scoped>
</style>
