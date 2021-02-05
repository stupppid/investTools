<template>
  <el-card :body-style="{ padding: '0px' }">
    <span class="chart" ref="chart"></span>
    <div>
      <span>{{knnData.time}}</span>
      <div class="bottom">
        <time>{{knnData.time}}</time>
        <el-button type="text" class="button" @click="showDetail">detail</el-button>
      </div>
    </div>
    <el-dialog
      title="input time infomation"
      :visible.sync="detailDialogVisible"
      width="80%">
      <div>
        <!-- <span class="detailChart" ref="detailChart"></span> -->
        <span class="statisticChart" ref="statisticChart"></span>
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
  watch: {
    knnData (v) {
      this.generateChart()
    }
  },
  methods: {
    showDetail () {
      this.detailDialogVisible = true
      this.$nextTick(() => {
        this.detailChart()
      })
    },
    detailChart () {
      const data = this.knnData.assumes.data
      // detail chart
      const statisticChart = echarts.init(this.$refs.statisticChart)
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
          type: 'category'
        },
        yAxis: {
          type: 'value',
          min: Math.min(seriesData.min),
          max: Math.min(seriesData.max)
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
      statisticChart.setOption(statisticChartOption)
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
        series: this.knnData.assumes.data.map(v => ({
          data: v.reduce((prev, v1) => prev.concat(prev[prev.length - 1] * (1 + v1.rate)), [1]),
          type: 'line'
        }))
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
  width: 200px;
  height: 200px;
  display: block;

}
.statisticChart {
  width: 50vw;
  height: 50vh;
  display: block;

}
</style>
