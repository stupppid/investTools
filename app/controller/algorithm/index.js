const Joi = require('../../../utils/Joi')
const ApiError = require('../../../utils/ApiError')
const detail = require('../../service/user/detail')

const router = require('koa-router')()
router.prefix(`/algorithm`)

router.get('/knn/getResult', function (ctx, next) {
  const { inputLength, symbol } = ctx.request.query
  ctx.body = 'get'
})

router.get('/list', function (ctx, next) {
  ctx.body = 'this is a user list'
})

module.exports = router
