const Expression = require('influx/lib/src/builder').Expression
const Base = require('./base')

function baseSql (symbol, period, times = []) {
  const e = new Expression()
  if (symbol) {
    e.tag('symbol').equals.value(symbol.toUpperCase())
  }
  if (period) {
    e.and.tag('period').equals.value(period.toUpperCase())
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
  return `SELECT time,rate FROM hst where ${e.toString()}`
}

class Invest extends Base {
  // 存储基础数据
  saveBatch (data) {
    return this.influxdb.writePoints(data, {precision: 'm'})
  }
  // 读取基础数据
  get (symbol, period, times = []) {
    return this.influxdb.query(baseSql(symbol, period, times), {precision: 'm'})
  }
  // 读取基础数据
  getBatch (arr) {
    return this.influxdb.query(arr.map((v) => baseSql(v.symbol, v.period, v.times)), {precision: 'm'}).catch(e => {
      console.error(e)
    })
  }
}

module.exports = new Invest()
