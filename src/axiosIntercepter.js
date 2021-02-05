import axios from 'axios'
import { Message } from 'element-ui'

// HTTPresponse拦截
axios.interceptors.response.use(
  res => {
    let status = 200
    res.data.code = res.data.code === 0 ? 200 : res.data.code
    res.data.success = !!(res.data.code === 0 || res.data.code === 200)
    if (res.data.code === undefined || res.data.code === null || res.data.code === '') {
      status = res.status
    } else {
      status = res.data.code
    }
    const message = res.data.error || res.data.message || res.data.msg

    if (status !== 200 && status !== 0) {
      Message({
        message: message || 'error',
        type: 'error'
      })
      return
    } else if (message && res.config.method !== 'get') {
      Message({
        message: message,
        type: 'success'
      })
    }
    return res
  },
  error => {
    if (!error.response) {
      Message({
        message: error.message || error.error || 'network error!',
        type: 'error'
      })
    } else {
      Message({
        message: error.message || error.error || 'network error',
        type: 'error'
      })
    }
  }
)
