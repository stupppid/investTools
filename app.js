const Koa = require('koa')
const app = new Koa()
const http = require('http')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
// const xmlParser = require('koa-xml-body')
const logger = require('koa-logger')
const koaBody = require('koa-body')
const fs = require('fs')
const path = require('path')
const port = 80
// error handler
onerror(app)

// middlewares
// app.use(xmlParser())
// app.use(bodyparser({
//   enableTypes: ['json', 'form', 'text']
// }))

app.use(json())
app.use(logger())
app.use(require('koa-static')(`${__dirname}/dist`))
app.use(koaBody({
  multipart: true,
  formidable: {
      maxFileSize: 2000*1024*1024
  }
}));
// router
const routers = fs.readdirSync('./app/controller')
routers.forEach(function (fileName, index) {
  let router = require(`./app/controller/${fileName}`)
  app.use(router.routes(), router.allowedMethods())
})
// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})

let server = http.createServer(app.callback())

server.listen(port)

server.on('error', (err) => {
  console.error(err)
  process.exit(1)
})

server.on('listening', () => {
  console.log(`The ${process.env.NODE_ENV || 'development'} App listening on http://localhost:${port}`)
})

module.exports = server
