
const times = require('influx/lib/src/grammar/times.js')
const algorithmService = require('../app/service/algorithm')
const moment = require('moment')
const fs = require('fs')
let inputLength = '30'
let symbol = 'NZDUSD'
let period = 'H1'
let startTime = '2017.01.01 00:00:00'
let endTime = '2020.12.31 00:00:00'

function writeFileForMT5 (fileName, content) {
  fs.writeFile(fileName, content, function (err) {
    if (err) {
      return console.error(err)
    }
    console.log('数据写入成功！' + fileName)
  })
}

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
  // for (let gap = 0; gap <= 0.0015; gap += 0.0001) {
  // let m = Array(20).fill(0)
  // let high = 1 + gap
  // let low = 1 - gap
  // let test = this.knnDataAll.reduce((prev, value) => {
  //   prev.fttx = prev.fttx.map((v, i) => {
  //     if (value.statistics.seriesDataF.avg[i] > high || value.statistics.seriesDataF.avg[i] < low) {
  //       m[i]++
  //       return v + Number(value.statistics.fttx[i])
  //     }
  //     return v
  //   })
  //   // prev.ftzj = value.statistics.ftzj.map((v, i) => v + Number(prev.ftzj[i]))
  //   return prev
  // }, { fttx: Array(21).fill(0), ftzj: Array(21).fill(0) })
  // let arr = test.fttx.map((v, i) => v / m[i])
  // let t = arr.slice(5, arr.length).reduce((prev, v) => v ? prev + v : prev, 0)
  // console.log(gap, arr, t / 15)
  let str = ''
  for (let i = 0; i < this.knnDataAll.length; i++) {
    let max = Math.max(...this.knnDataAll[i].statistics.seriesDataF.avg.filter(v => v))
    let maxId = this.knnDataAll[i].statistics.seriesDataF.avg.findIndex(v => v === max)
    let min = Math.min(...this.knnDataAll[i].statistics.seriesDataF.avg.filter(v => v))
    let minId = this.knnDataAll[i].statistics.seriesDataF.avg.findIndex(v => v === min)
    str += `${moment(this.knnDataAll[i].time).format('YYYY.MM.DD HH:mm')} ${maxId} ${max} ${minId} ${min}\r\n`
  }
  writeFileForMT5('./Datas.csv', str)
  // }
})
