const fs = require('fs')
const isoOrTimeToDate = require('influx/lib/src/grammar/times.js').isoOrTimeToDate
const investService = require('../../service/invest')
const algorithmService = require('../../service/algorithm')
const router = require('koa-router')()
router.prefix(`/invest`)
router.get('/list', function (ctx, next) {
  ctx.body = 'this is a user list'
})
/**
 * 存储csv数据文件到influxdb
 */
router.post('/posts', function (ctx, next) {
  const file = ctx.request.files.file
  const reader = fs.createReadStream(file.path)
  const arr = file.name.split('.')[0].split('_')
  const symbol = arr[0].toUpperCase()
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
      let timestamp = isoOrTimeToDate(arr[0])
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
    investService.saveBatch(allPoints)
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

router.post('/expert/knn', async function (ctx, next) {
  let { symbol, period, lastData, data } = ctx.request.body
  let lastClose = lastData.close
  let rate = (close - lastClose) / lastClose
  let timestamp = isoOrTimeToDate(data.time)
  let point = {
    measurement: 'hst',
    tags: {symbol, period},
    fields: {
      open: parseFloat(data.open),
      high: parseFloat(data.high),
      low: parseFloat(data.low),
      close: parseFloat(data.close),
      volume: parseFloat(data.volume),
      rate: rate
    },
    timestamp
  }
  let p = await investService.saveBatch([point]).then(async v => {
    let points = await algorithmService.knnCalculate({
      inputLength: 30,
      symbol,
      period
    })
    return points
  })
  // todo 整合数据
  ctx.body = {
    code: 200,
    data: p[0]
  }
})

module.exports = router
