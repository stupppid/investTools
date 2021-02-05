<template>
  <el-card :body-style="{ padding: '0px' }">
    <span class="chart" ref="chart"></span>
    <div>
      <span>{{knnData.symbol}} {{ knnData.period }}</span>
      <div class="bottom">
        <small>{{ knnData.time }}</small>
        <el-button type="text" class="button" @click="showDetail">detail</el-button>
      </div>
    </div>
    <el-dialog
      title="input time infomation"
      :visible.sync="detailDialogVisible"
      width="80%">
      <div>
        <span class="detailChart" ref="detailChart"></span>
        <span class="statisticChart" ref="statisticChart"></span>
      </div>
      <div>
        <span class="detailChart" ref="detailChart1"></span>
        <span class="statisticChart" ref="statisticChart1"></span>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'
export default {
  name: 'Card',
  props: ['knnData'],
  data () {
    return {
      detailDialogVisible: false
    }
  },
  filter: {
    toDateTime (v) {
      return new Date(v).toString()
    }
  },
  watch: {
    knnData (v) {
      this.generateChart()
    }
  },
  methods: {
    showDetail () {
      this.detailDialogVisible = true
      this.$nextTick(() => {
        this.detailChart(this.knnData.assumes, this.$refs.detailChart)
        this.statisticChart(this.knnData.assumes, this.$refs.statisticChart)
        // this.detailChart()
        // this.statisticChart()
      })
    },
    statisticChart (assumes, ref) {
      const data = assumes.data
      let xAxisData = []
      for (let i = 0; i < data[0].length; i++) {
        xAxisData.push(i)
      }
      let seriesData = data.reduce((prev, v) => {
        let value = v.reduce((prev, v1) => prev.concat(prev[prev.length - 1] * (1 + v1.rate)), [1])
        if (!prev.avg) {
          prev = {
            max: [...value],
            min: [...value],
            avg: [...value],
            raw: value
          }
        } else {
          for (let i = 0; i < value.length; i++) {
            if (prev.max[i] < value[i]) {
              prev.max[i] = value[i]
            }
            if (prev.min[i] > value[i]) {
              prev.min[i] = value[i]
            }
            prev.avg[i] += value[i]
          }
        }
        return prev
      }, {})
      seriesData.avg = seriesData.avg.map(v => v / data.length)
      const statisticChartOption = {
        xAxis: {
          type: 'category',
          data: xAxisData
        },
        yAxis: {
          type: 'value',
          min: Math.min(seriesData.min),
          max: Math.max(seriesData.max)
        },
        tooltip: {
          trigger: 'axis'
        },
        series: [{
          name: 'avg',
          data: seriesData.avg,
          type: 'line'
        }, {
          name: 'min',
          data: seriesData.min,
          type: 'line'
        }, {
          name: 'max',
          data: seriesData.max,
          type: 'line'
        }, {
          name: 'raw',
          data: seriesData.raw,
          type: 'line'
        }],
        legend: {}
      }
      const statisticChart = echarts.init(ref)
      statisticChart.setOption(statisticChartOption)
    },
    detailChart (assumes, ref) {
      const data = assumes.data
      const realData = data.map((v, idx) => v.reduce((prev, v1) => prev.concat(prev[prev.length - 1] * (1 + v1.rate)), [1]))
      let xAxisData = []
      for (let i = 0; i < data[0].length; i++) {
        xAxisData.push(i)
      }
      // detail chart
      const detailOption = {
        xAxis: {
          type: 'category',
          data: xAxisData
        },
        yAxis: {
          type: 'value',
          min: Math.min(realData),
          max: Math.max(realData)
        },
        series: assumes.data.map((v, idx) => ({
          name: idx + '|' + assumes.similarity[idx],
          data: v.reduce((prev, v1) => prev.concat(prev[prev.length - 1] * (1 + v1.rate)), [1]),
          type: 'line'
        })),
        legend: {},
        tooltip: {
          trigger: 'axis'
        },
        markLine: {
          symbol: ['none', 'none'],
          label: {show: false},
          data: [
            {xAxis: Number(this.knnData.inputLength)},
          ]
        },
      }
      const detailChart = echarts.init(ref)
      detailChart.setOption(detailOption)
    },
    generateChart () {
      const myChart = echarts.init(this.$refs.chart)
      const option = {
        xAxis: {
          type: 'category'
        },
        yAxis: {
          type: 'value'
        },
        series: this.knnData.assumes.data.map((v, idx) => ({
          name: idx,
          data: v.reduce((prev, v1) => prev.concat(prev[prev.length - 1] * (1 + v1.rate)), [1]),
          type: 'line'
        })),
        legend: {}
      }
      myChart.setOption(option)
    }
  },
  mounted () {
    this.generateChart()
  }
}
</script>

<style scoped>
.chart {
  width: 200px;
  height: 200px;
  display: block;
}
.detailChart {
  width: 50vw;
  height: 50vh;
  display: block;

}
.statisticChart {
  width: 50vw;
  height: 50vh;
  display: block;

}
</style>
