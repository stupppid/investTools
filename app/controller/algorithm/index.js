const algorithmService = require('../../service/algorithm')
const times = require('influx/lib/src/grammar/times.js')
const router = require('koa-router')()
router.prefix(`/algorithm`)

router.get('/knn/getResult', async function (ctx, next) {
  const { inputLength, symbol, period, startTime, endTime } = ctx.request.query
  let rawResult = await algorithmService.getRaw({
    inputLength,
    symbol,
    period,
    startTime: Number(times.dateToTime(new Date(startTime), 'n')),
    endTime: (endTime ? Number(times.dateToTime(new Date(endTime), 'n')) : undefined)
  })
  if (!rawResult || rawResult.length === 0) {
    ctx.body = {
      code: -1,
      message: 'no knn calculated data depend on the searching condition'
    }
  } else {
    ctx.body = {
      code: 0,
      data: rawResult
    }
  }
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
      code: 200,
      message: 'knn calculate start, the process may take some time.'
    }
  } catch (e) {
    ctx.body = {
      code: -1,
      message: e.message
    }
  }
})

module.exports = router
