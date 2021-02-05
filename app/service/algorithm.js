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
  return `SELECT * FROM knnHst where ${e.toString()}`
}

class Algorithm extends Base {
  async getRaw ({ inputLength, symbol, period, startTime, endTime }) {
    return {
      code: 200,
      data: await this.influxdb.query(baseSql(symbol, period, inputLength, [[startTime, endTime]]))
    }
  }
  async knnCalculate ({ inputLength, symbol, period, startTime, endTime }) {
    const data = await investService.get(symbol, period)
    const startIndex = data.findIndex(v => moment(startTime).isSame(v.time))
    if (startIndex === -1) {
      throw new Error('no record of the start time')
    }
    let points = []
    let endIndex, tmp
    if (endTime) {
      endIndex = data.findIndex(v => moment(v.time).isSameOrAfter(endTime)) || data.length - inputLength
    } else {
      endIndex = data.length - inputLength
    }
    for (let i = startIndex; i < endIndex; i++) {
      tmp = knn({ data, checkData: data.slice(i, i + inputLength) })
      points.push({
        measurement: 'knnHst',
        tags: { symbol, period, inputLength },
        fields: {
          assumes: JSON.stringify(tmp)
        },
        timestamp: data[i].time
      })
    }
    if (points.length > 0) {
      this.influxdb.writePoints(points, {precision: 'm'})
    }
  }
}
module.exports = new Algorithm()
