const Base = require('./base')
const investService = require('./invest')
const moment = require('moment')
const knn = require('../../algorithms/knn').knn
const Expression = require('influx/lib/src/builder').Expression

function baseSql (symbol, period, inputLength, times = []) {
  const e = new Expression()
  if (symbol) {
    e.tag('symbol').equals.value(symbol.toUpperCase())
  }
  if (period) {
    e.and.tag('period').equals.value(period.toUpperCase())
  }
  if (inputLength) {
    e.and.tag('inputLength').equals.value(inputLength)
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
  return `SELECT statistics FROM knnHst where ${e.toString()}`
}

class Algorithm extends Base {
  async getRaw ({ inputLength, symbol, period, startTime, endTime }) {
    let t = await this.influxdb.query(baseSql(symbol, period, inputLength, [[startTime, endTime]]))
    return t
  }
  async knnCalculate ({ inputLength, symbol, period, startTime, endTime }) {
    inputLength = Number(inputLength)
    const data = await investService.get(symbol, period)
    let points = []
    let startIndex
    let endIndex
    if (startTime) {
      startIndex = data.findIndex(v => moment(startTime).isSameOrBefore(v.time))
      if (startIndex === -1) {
        throw new Error('no record of the start time' + startTime)
      }
      if (endTime) {
        endIndex = data.findIndex(v => moment(endTime).isSameOrBefore(v.time)) || data.length - inputLength
      } else {
        endIndex = data.length - inputLength
      }
    } else {
      // 计算最后一个
      startIndex = data.length - inputLength
      endIndex = data.length - inputLength
    }
    for (let i = startIndex; i <= endIndex; i++) {
      let { records, statistics } = knn({ data, checkData: data.slice(i, i + inputLength), futureData: data.slice(i + inputLength, i + inputLength + 20) })
      points.push({
        measurement: 'knnHst',
        tags: { symbol, period, inputLength },
        fields: {
          records: JSON.stringify(records),
          statistics: JSON.stringify(statistics)
        },
        timestamp: data[i].time
      })
      console.log(`${i - startIndex}/${endIndex - startIndex} knn calculate finished`)
      if (points.length > 600) {
        await this.influxdb.writePoints(points, {precision: 'm'}).catch(e => {
          console.error(e)
        })
        points = []
      }
    }
    if (points.length > 0) {
      await this.influxdb.writePoints(points, {precision: 'm'}).catch(e => {
        console.error(e)
      })
    }
    console.log('knn calculate success')
    return points
  }
}
module.exports = new Algorithm()
