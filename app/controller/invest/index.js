const fs = require('fs')
const isoOrTimeToDate = require('influx/lib/src/grammar/times.js').isoOrTimeToDate
const investService = require('../../service/invest')
const algorithmService = require('../../service/algorithm')
const router = require('koa-router')()
const periodMap = {
  '60': 'H1',
  '5': 'M5',
  '15': 'M15',
  '240': 'H4',
  '1440': 'D1'
}

router.prefix(`/invest`)
/**
 * 存储csv数据文件到influxdb
 */
router.post('/posts', function (ctx, next) {
  const file = ctx.request.files.file
  const reader = fs.createReadStream(file.path)
  const arr = file.name.split('.')[0].split('_')
  const symbol = arr[0].toUpperCase().slice(0, 6)
  const period = arr[1].toUpperCase()
  if (!period || !symbol) {
    ctx.body = {
      code: -1,
      message: 'period or symbol is not set'
    }
    return
  }

  const chunks = []

  reader.on('readable', () => {
    let chunk
    while ((chunk = reader.read()) !== null) {
      chunks.push(chunk)
    }
  })

  reader.on('end', () => {
    let arr, close, lastClose
    let rate = 0
    let allPoints = chunks.join('').split('\r\n').map(v => {
      if (!v) {
        return undefined
      }
      arr = v.split(',')
      close = parseFloat(arr[4])
      if (lastClose) {
        rate = (close - lastClose) / lastClose
      }
      lastClose = close
      let timestamp = isoOrTimeToDate(arr[0]) // fixme 这里存储的时间本身就是错误的，计算时保存的也是按照错误的来的
      return {
        measurement: 'hst',
        tags: {symbol, period},
        fields: {
          open: parseFloat(arr[1]),
          high: parseFloat(arr[2]),
          low: parseFloat(arr[3]),
          close,
          volume: parseFloat(arr[5]),
          rate: rate
        },
        timestamp
      }
    }).filter(v => v)
    allPoints.shift()
    const onceMax = 100000
    if (allPoints.length > onceMax) {
      for (let i = 0; i < Math.ceil(allPoints.length / onceMax); i++) {
        investService.saveBatch(allPoints.slice(i * onceMax, (i + 1) * onceMax)).then(r => {
          console.log('数据存储成功')
        }).catch(e => {
          console.error('数据存储失败', e)
        })
      }
    } else {
      investService.saveBatch(allPoints).then(r => {
        console.log('数据存储成功')
      }).catch(e => {
        console.error('数据存储失败', e)
      })
    }
  })

  ctx.body = {
    code: 200
  }
})

router.post('/getData', async function (ctx, next) {
  let { symbol, period, times } = ctx.request.body
  ctx.body = {
    code: 200,
    data: await investService.get(symbol, period, times)
  }
})

// deprecated
router.post('/expert/knn', async function (ctx, next) {
  let { symbol, period, lastData, data } = ctx.request.body
  let lastClose = parseFloat(lastData.split(',')[4])
  let [time, open, high, low, close, volume] = data.split(',')
  let rate = (parseFloat(close) - lastClose) / lastClose
  let timestamp = isoOrTimeToDate(time)
  let point = {
    measurement: 'hst',
    tags: {symbol: symbol.slice(0, 6), period: periodMap[period]},
    fields: {
      open: parseFloat(open),
      high: parseFloat(high),
      low: parseFloat(low),
      close: parseFloat(close),
      volume: parseFloat(volume),
      rate: rate
    },
    timestamp
  }
  let p = await investService.saveBatch([point]).then(async v => {
    let p1 = await algorithmService.knnCalculate({
      inputLength: 30,
      symbol: symbol.slice(0, 6),
      period: periodMap[period]
    })
    return p1
  })
  let statistics = JSON.parse(p.pop().fields.statistics)
  let avg = statistics.seriesDataF.avg
  let max = Math.max(...avg.filter(v => v))
  let maxId = avg.findIndex(v => v === max)
  let min = Math.min(...avg.filter(v => v))
  let minId = avg.findIndex(v => v === min)
  let str = `${maxId} ${max} ${minId} ${min}`
  ctx.body = str
})

// deprecated
router.post('/expert/knnInit', async function (ctx, next) {
  let { symbol, period, data } = ctx.request.body
  let arr = data.split('\r\n').reverse()
  let lastClose
  let points = arr.reduce((prev, value) => {
    let [time, open, high, low, close, volume] = value.split(',')
    if (lastClose === undefined) {
      lastClose = close
      return prev
    }
    let rate = (parseFloat(close) - lastClose) / lastClose
    let timestamp = isoOrTimeToDate(time)
    prev.push({
      measurement: 'hst',
      tags: {symbol: symbol.slice(0, 6), period: periodMap[period]},
      fields: {
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
        volume: parseFloat(volume),
        rate: rate
      },
      timestamp
    })
    lastClose = close
    return prev
  }, [])

  let p = await investService.saveBatch(points).then(async v => {
    let p1 = await algorithmService.knnCalculate({
      inputLength: 30,
      symbol: symbol.slice(0, 6),
      period: periodMap[period]
    })
    return p1
  })
  let statistics = JSON.parse(p.pop().fields.statistics)
  let avg = statistics.seriesDataF.avg
  let max = Math.max(...avg.filter(v => v))
  let maxId = avg.findIndex(v => v === max)
  let min = Math.min(...avg.filter(v => v))
  let minId = avg.findIndex(v => v === min)
  let str = `${maxId} ${max} ${minId} ${min}`
  ctx.body = str
})

router.post('/expert/knnCheck', async function (ctx, next) {
  let { symbol, period, data } = ctx.request.body
  let arr = data.split('\r\n').reverse()
  let lastClose
  let checkData = arr.reduce((prev, value) => {
    let [time, open, high, low, close, volume] = value.split(',')
    if (lastClose === undefined) {
      lastClose = close
      return prev
    }
    let rate = (parseFloat(close) - lastClose) / lastClose
    prev.push({
      rate: rate,
      time: new Date(time)
    })
    lastClose = close
    return prev
  }, [])
  let statistics = await algorithmService.knnCalculateByCheckData({
    checkData,
    symbol: symbol.slice(0, 6),
    period: periodMap[period]
  })
  let avg = statistics.seriesDataF.avg
  let max = Math.max(...avg.filter(v => v))
  let maxId = avg.findIndex(v => v === max)
  let min = Math.min(...avg.filter(v => v))
  let minId = avg.findIndex(v => v === min)
  let str = `${maxId} ${max} ${minId} ${min}`
  ctx.body = str
})

module.exports = router
