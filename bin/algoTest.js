
const times = require('influx/lib/src/grammar/times.js')
const algorithmService = require('../app/service/algorithm')
let inputLength = '30'
let symbol = 'EURUSD'
let period = 'H1'
let startTime = '2017.01.01 00:00:00'
let endTime = '2020.10.01 00:00:00'
algorithmService.getRaw({
  inputLength,
  symbol,
  period,
  startTime: Number(times.dateToTime(new Date(startTime), 'n')),
  endTime: (endTime ? Number(times.dateToTime(new Date(endTime), 'n')) : undefined)
}).then(res => {
  this.knnDataAll = res.map(v => ({
    ...v,
    // records: JSON.parse(v.records),
    statistics: JSON.parse(v.statistics)
  }))
  for (let gap = 0; gap <= 0.0015; gap += 0.0001) {
    let m = Array(20).fill(0)
    let high = 1 + gap
    let low = 1 - gap
    let test = this.knnDataAll.reduce((prev, value) => {
      prev.fttx = prev.fttx.map((v, i) => {
        if (value.statistics.seriesDataF.avg[i] > high || value.statistics.seriesDataF.avg[i] < low) {
          m[i]++
          return v + Number(value.statistics.fttx[i])
        }
        return v
      })
      // prev.ftzj = value.statistics.ftzj.map((v, i) => v + Number(prev.ftzj[i]))
      return prev
    }, { fttx: Array(21).fill(0), ftzj: Array(21).fill(0) })
    let arr = test.fttx.map((v, i) => v / m[i])
    let t = arr.slice(5, arr.length).reduce((prev, v) => v ? prev + v : prev, 0)
    console.log(gap, arr, t / 15)
  }
})
