const fs = require('fs')

const router = require('koa-router')()

router.get('/', async (ctx, next) => {
  ctx.response.type = 'html'
  ctx.response.body = fs.readFileSync('./dist/index.html', {encoding: 'utf8', flag: 'r'})
})

router.get('/error', async (ctx, next) => {
  ctx.response.body = 'view error'
})

module.exports = router
