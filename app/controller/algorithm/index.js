const algorithmService = require('../../service/algorithm')
const investService = require('../../service/invest')
const knn = require('../../../algorithms/knn').knn
const times = require('influx/lib/src/grammar/times.js')
const router = require('koa-router')()
router.prefix(`/algorithm`)

router.get('/knn/getResult', async function (ctx, next) {
  const { inputLength, symbol, period, startTime, endTime } = ctx.request.query
  let arr
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
    let data = await Promise.all(rawResult.map(async v => {
      arr = JSON.parse(v.assumes)
      let querys = arr.reduce((prev, v) => {
        return prev.concat({
          symbol,
          period,
          times: [[Number(times.dateToTime(new Date(v.time), 'n')),
            Number(times.dateToTime(new Date(v.timeExpand), 'n'))
          ]]
        })
      }, [])
      delete v.assumes
      let t = await investService.getBatch(querys)
      return {
        ...v,
        assumes: {
          data: t,
          similarity: arr.map(v => v.similarity)
        }
      }
    }))
    ctx.body = {
      code: 0,
      data
    }
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
      code: 200,
      message: 'knn calculate start, the process would use a long time'
    }
  } catch (e) {
    ctx.body = {
      code: -1,
      message: e.message
    }
  }
})

module.exports = router
