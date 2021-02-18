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
          @change="syncForm"
          v-model="dates"
          type="datetimerange">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="text" @click="search">search</el-button>
        <el-button type="text" @click="calculate">calculate</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="knnDataAll"
      style="width: 100%">
      <el-table-column
        prop="time"
        label="时间">
      </el-table-column>
      <el-table-column type="expand">
        <template slot-scope="props">
          <card :knnData="props.row"/>
        </template>
      </el-table-column>
    </el-table>
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
        symbol: '',
        period: '',
        inputLength: 30,
        startTime: moment().startOf('day').add({days: -7}).format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')
      },
      knnDataAll: [],
      dates: []
    }
  },
  methods: {
    calculate () {
      this.calculateDialogVisible = true
    },
    submitCalculate () {
      knnCalculate({ ...this.form })
      this.calculateDialogVisible = false
    },
    search () {
      knnGetResult(this.form).then(res => {
        this.knnDataAll = res.data.data.map(v => ({
          ...v,
          // records: JSON.parse(v.records),
          statistics: JSON.parse(v.statistics)
        })).reverse()
      })
    },
    syncForm () {
      this.form.startTime = this.dates[0]
      this.form.endTime = this.dates[1]
    }
  },
  created () {
    this.form.symbol = this.symbols[0]
    this.form.period = 'H1'
    this.dates = [this.form.startTime, this.form.endTime]
    this.search()
  }
}
</script>

<style scoped>
.card-wrapper {
  width: 200px;
  display: inline-block;
}
</style>
