<template>
  <div class="algo">
    <!-- 4个维度 输入长度, 种类, 周期 输出历史记录,输出历史记录当输入其他两个后才能看 -->
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
          <el-option v-for="(item, key) in symbols" :key="key" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item
        label="period"
        prop="period"
      >
        <el-select v-model="form.period" placeholder="period" :clearable="true">
          <el-option v-for="(item, key) in periods" :key="key" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="form.startTime"
          type="datetime"
          placeholder="start time">
        </el-date-picker>
        <i class="el-icon-d-arrow-right pointer" @click="syncTime('endTime')"></i>
      </el-form-item>
      <el-form-item>
        <i class="el-icon-d-arrow-left pointer" @click="syncTime('startTime')"></i>
        <el-date-picker
          v-model="form.endTime"
          type="datetime"
          placeholder="end time">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="text" @click="search">search</el-button>
        <el-button type="text" @click="calculate">calculate</el-button>
      </el-form-item>
    </el-form>
    <span>
      <card></card>
    </span>
    <el-dialog
      title="input time infomation"
      :visible.sync="calculateDialogVisible"
      width="30%">
      <span v-for="(item, key) in form" :key="key">
        {{ key }}: {{ item }}
        <br>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="calculateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitCalculate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Card from './card.vue'
import { knnGetResult, knnCalculate } from '@/api/invest'
import moment from 'moment'
export default {
  name: 'KNN',
  components: {Card},
  computed: {
    ...mapState({
      symbols: state => state.symbols,
      periods: state => state.periods
    })
  },
  data () {
    return {
      calculateDialogVisible: false,
      rules: {},
      form: {
        inputLength: 30,
        startTime: moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')
      }
    }
  },
  methods: {
    getData () {
      knnGetResult(this.form).then(r => {
        console.log(r)
      })
    },
    calculate () {
      this.calculateDialogVisible = true
    },
    submitCalculate () {
      knnCalculate({ ...this.form })
      this.calculateDialogVisible = false
    },
    syncTime (type) {
      switch (type) {
        case 'endTime':
          this.form.endTime = this.form.startTime
          break
        case 'startTime':
          this.form.startTime = this.form.endTime
          break
      }
    },
    search () {
      this.getData()
    }
  },
  created () {
    this.form.symbol = this.symbols[0]
    this.form.period = this.periods[0]
    this.getData()
  }
}
</script>

<style lang="sass" scoped>
</style>
