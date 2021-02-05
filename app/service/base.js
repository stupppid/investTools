const ApiError = require('../../utils/ApiError')
const logger = require('../../utils/Logger')
const Influx = require('influx')
const {influxdb} = require('../../config/application')

const influxdbInstance = new Influx.InfluxDB(influxdb.linkString)
class Base {
  constructor () {
    this.influxdb = influxdbInstance
  }

  throwError (msg, code) {
    throw new ApiError(msg, code)
  }

  get logger () {
    return logger
  }
}

module.exports = Base
