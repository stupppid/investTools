const algorithmService = require('../../service/algorithm')
const investService = require('../../service/invest')
const knn = require('../../../algorithms/knn').knn
const times = require('influx/lib/src/grammar/times.js')
const router = require('koa-router')()
router.prefix(`/algorithm`)
const knnPeriodMap = {
  'H1': 3600000000000
}

router.get('/knn/getResult', async function (ctx, next) {
  const { inputLength, symbol, period, startTime, endTime, outputLength = 30 } = ctx.request.query
  let arr
  ctx.body = {
    code: 0,
    data: await algorithmService.getRaw({
      inputLength,
      symbol,
      period,
      startTime: Number(times.dateToTime(new Date(startTime), 'n')),
      endTime: (endTime ? Number(times.dateToTime(new Date(endTime), 'n')) : undefined)
    }).map(v => {
      arr = JSON.parse(v.assumes)
      arr.reduce((prev, v) => {
        return prev.concat({
          symbol,
          period,
          times: [[v.time, v.time + knnPeriodMap[period] * outputLength]]
        })
      }, [])
      delete v.assumes
      return {
        ...v,
        assumes: {
          data: investService.getBatch(arr)
        }
      }
    })
  }
})

router.get('/knn/list', function (ctx, next) {
  ctx.body = 'this is a user list'
})

router.get('/knn/calculate', function (ctx, next) {
  const { inputLength, symbol, period, startTime, endTime } = ctx.request.query
  if (!startTime) {
    ctx.body = {
      code: -1,
      message: 'no startTime input'
    }
    return
  }
  try {
    algorithmService.knnCalculate({ inputLength, symbol: symbol.toUpperCase(), period: period.toUpperCase(), startTime, endTime })
    ctx.body = {
      code: 200
    }
  } catch (e) {
    ctx.body = {
      code: -1,
      message: e.message
    }
  }
})

module.exports = router
