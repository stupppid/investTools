<template>
  <div style="display:flex;">
    <span class="statisticChart" ref="statisticChart"></span>
    <span class="statisticChart" ref="statisticChart1"></span>
    <span class="detailChart" ref="detailChart"></span>
    <span class="detailChart" ref="detailChart1"></span>
  </div>
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
  methods: {
    showDetail () {
      this.detailDialogVisible = true
      this.$nextTick(() => {
        this.detailChart(this.knnData.records, this.knnData.statistics, this.$refs.detailChart, this.$refs.detailChart1)
        this.statisticChart(this.knnData.statistics, this.$refs.statisticChart, this.$refs.statisticChart1)
      })
    },
    statisticChart ({seriesData, seriesDataF, rawData, futureData, fttx, ftzj}, ref, ref2) {
      let xAxisData = []
      for (let i = 0; i < rawData.length; i++) {
        xAxisData.push(i)
      }
      const statisticChartOption = {
        animation: false,
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
      for (let i = 0; i < seriesDataF.avg.length; i++) {
        xAxisData.push(i)
      }
      const futureChartOption = {
        animation: false,
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
    detailChart (records, {rawData, futureData}, ref, ref2) {
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
        series: records.map((v, idx) => ({
          name: idx,
          data: v.data.reduce((prev, v1) => prev.concat(prev[prev.length - 1] * (1 + v1)), [1]),
          type: 'line'
        })).concat({
          name: 'raw',
          data: rawData,
          type: 'line'
        }),
        legend: {},
        tooltip: {
          trigger: 'axis'
        }
      }
      const detailChart = echarts.init(ref)
      detailChart.setOption(detailOption)

      xAxisData = []
      for (let i = 0; i < rawData[0].length; i++) {
        xAxisData.push(i)
      }
      // detail chart
      const detailOption1 = {
        xAxis: {
          type: 'category',
          data: xAxisData
        },
        yAxis: {
          type: 'value',
          min: Math.min(rawData),
          max: Math.max(rawData)
        },
        series: records.map((v, idx) => ({
          name: idx,
          data: v.futureData.reduce((prev, v1) => prev.concat(prev[prev.length - 1] * (1 + v1)), [1]),
          type: 'line'
        })).concat({
          name: 'raw',
          data: futureData,
          type: 'line'
        }),
        legend: {},
        tooltip: {
          trigger: 'axis'
        }
      }
      const detailChart1 = echarts.init(ref2)
      detailChart1.setOption(detailOption1)
    }
  },
  mounted () {
    this.showDetail()
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
  width: 50%;
  height: 240px;
  display: block;

}
</style>
