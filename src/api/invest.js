import axios from 'axios'
import * as qs from 'qs'

export const knnGetResult = (data) => {
  return axios({
    method: 'get',
    url: '/algorithm/knn/getResult?' + qs.stringify(data)
  })
}

export const knnCalculate = (data) => {
  return axios({
    method: 'get',
    url: '/algorithm/knn/calculate?' + qs.stringify(data)
  })
}
