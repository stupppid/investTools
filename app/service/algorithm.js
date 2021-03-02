const Base = require('./base')
const investService = require('./invest')
const moment = require('moment')
const knn = require('../../algorithms/knn').knn
const Expression = require('influx/lib/src/builder').Expression
const times = require('influx/lib/src/grammar/times.js')

function baseSql (symbol, period, inputLength, times = []) {
  const e = new Expression()
  if (symbol) {
    e.tag('symbol').equals.value(symbol.toUpperCase())
  }
  if (period) {
    e.and.tag('period').equals.value(period.toUpperCase())
  }
  if (inputLength) {
    e.and.tag('inputLength').equals.value(String(inputLength))
  }
  if (times && times.length > 0) {
    let tmp, tmpv
    e.and.exp(e => times.reduce((prev, v, i) => {
      tmp = prev.exp(e => {
        if (v[0]) {
          tmpv = e.field('time').gte.value(v[0])
        }
        if (v[1]) {
          tmpv = tmpv.and.field('time').lte.value(v[1])
        }
        return tmpv
      })
      if (i !== times.length - 1) {
        tmp = tmp.or
      }
      return tmp
    }, e))
  }
  return `SELECT statistics,records FROM knnHst where ${e.toString()}`
}

class Algorithm extends Base {
  async getRaw ({ inputLength, symbol, period, startTime, endTime }) {
    let t = await this.influxdb.query(baseSql(symbol, period, inputLength, [[startTime, endTime]]))
    return t
  }
  // 使用原数据计算
  async knnCalculate ({ inputLength, symbol, period, startTime, endTime }) {
    inputLength = Number(inputLength)
    const data = await investService.get(symbol, period)
    let points = []
    let startIndex
    let endIndex
    if (startTime) {
      startIndex = data.findIndex(v => moment(startTime).isSame(v.time))
      if (startIndex === -1) {
        throw new Error('no record of the start time' + startTime)
      }
      if (endTime) {
        endIndex = data.findIndex(v => moment(endTime).isSame(v.time)) || data.length - inputLength
        if (endIndex === -1) {
          throw new Error('no record of the end time' + endTime)
        }
      } else {
        endIndex = data.length - inputLength
      }
    } else {
      // 计算最后一个
      startIndex = data.length - inputLength
      endIndex = data.length - inputLength
    }
    const t = Math.floor((endIndex - startIndex) / 10)
    for (let i = startIndex; i <= endIndex; i++) {
      let tmp = data.slice(i + inputLength, i + inputLength + 20)
      let { records, statistics } = knn({ data, checkData: data.slice(i, i + inputLength), futureData: tmp })
      points.push({
        measurement: 'knnHst',
        tags: { symbol, period, inputLength },
        fields: {
          records: JSON.stringify(records),
          statistics: JSON.stringify(statistics)
        },
        timestamp: data[i].time
      })
      if (points.length > 600) {
        await this.influxdb.writePoints(points, {precision: 'm'}).catch(e => {
          console.error(e)
        })
        points = []
      }
      if ((i - startIndex) % t === 0) {
        console.log(`${i - startIndex}/${endIndex - startIndex} knn calculate finished`)
      }
    }
    if (points.length > 0) {
      await this.influxdb.writePoints(points, {precision: 'm'}).catch(e => {
        console.error(e)
      })
    }
    console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' knn calculate success')
    return points
  }
  // 传入外部数据计算，并且不保留外部数据
  async knnCalculateByCheckData ({ checkData, symbol, period }) {
    const inputLength = checkData.length
    const data = await investService.get(symbol, period)
    let points = []
    let lastData = await this.getRaw({
      inputLength,
      symbol,
      period,
      startTime: Number(times.dateToTime(checkData[0].time, 'n')),
      endTime: Number(times.dateToTime(checkData[0].time, 'n'))
    })
    if (lastData && lastData.length > 0) {
      console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' get knn Result from memory')
      return JSON.parse(lastData[0].statistics)
    } else {
      let { records, statistics } = knn({ data, checkData })
      points.push({
        measurement: 'knnHst',
        tags: { symbol, period, inputLength },
        fields: {
          records: JSON.stringify(records),
          statistics: JSON.stringify(statistics)
        },
        timestamp: checkData[0].time
      })
      await this.influxdb.writePoints(points, {precision: 'm'}).catch(e => {
        console.error(e)
      })
      console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' knn calculate success')
      return statistics
    }
  }
}
module.exports = new Algorithm()
