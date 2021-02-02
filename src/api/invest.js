import axios from 'axios'
import * as qs from 'qs'

export const knnGet = (data) => {
  return axios({
    method: 'get',
    url: '/algorithm/knn/getResult?' + qs.stringify(data)
  })
}
