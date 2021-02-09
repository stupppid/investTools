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
        // this.detailChart(JSON.parse(this.knnData.statistics), this.$refs.detailChart)
        this.statisticChart(this.knnData.statistics, this.$refs.statisticChart, this.$refs.statisticChart1)
        // this.detailChart(this.knnData.statistics, this.$refs.detailChart, this.$refs.detailChart1)
        // this.detailChart()
        // this.statisticChart()
      })
    },
    statisticChart ({seriesData, seriesDataF, rawData, futureData, fttx, ftzj}, ref, ref2) {
      let xAxisData = []
      for (let i = 0; i < rawData.length; i++) {
        xAxisData.push(i)
      }
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
          data: rawData,
          type: 'line'
        }],
        legend: {}
      }
      const statisticChart = echarts.init(ref)
      statisticChart.setOption(statisticChartOption)

      xAxisData = []
      for (let i = 0; i < futureData.length; i++) {
        xAxisData.push(i)
      }
      const futureChartOption = {
        xAxis: {
          type: 'category',
          data: xAxisData
        },
        yAxis: {
          type: 'value',
          min: Math.min(seriesDataF.min),
          max: Math.max(seriesDataF.max)
        },
        tooltip: {
          trigger: 'axis'
        },
        series: [{
          name: 'avg',
          data: seriesDataF.avg,
          type: 'line'
        }, {
          name: 'min',
          data: seriesDataF.min,
          type: 'line'
        }, {
          name: 'max',
          data: seriesDataF.max,
          type: 'line'
        }, {
          name: 'raw',
          data: futureData,
          type: 'line'
        }],
        legend: {}
      }
      const futureChart = echarts.init(ref2)
      futureChart.setOption(futureChartOption)
    },
    detailChart ({seriesData, seriesDataF, rawData, futureData, fttx, ftzj}, ref, ref2) {
      let xAxisData = []
      for (let i = 0; i < rawData[0].length; i++) {
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
          min: Math.min(rawData),
          max: Math.max(rawData)
        },
        series: seriesData.map((v, idx) => ({
          name: idx,
          data: v,
          type: 'line'
        })),
        legend: {},
        tooltip: {
          trigger: 'axis'
        }
      }
      const detailChart = echarts.init(ref)
      detailChart.setOption(detailOption)
    },
    generateChart () {
      // const myChart = echarts.init(this.$refs.chart)
      // const option = {
      //   xAxis: {
      //     type: 'category'
      //   },
      //   yAxis: {
      //     type: 'value'
      //   },
      //   series: this.knnData.assumes.data.map((v, idx) => ({
      //     name: idx,
      //     data: v.reduce((prev, v1) => prev.concat(prev[prev.length - 1] * (1 + v1.rate)), [1]),
      //     type: 'line'
      //   })),
      //   legend: {}
      // }
      // myChart.setOption(option)
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
