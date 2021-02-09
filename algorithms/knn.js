function knn ({ data, checkData, topNum, futureData }) {
  let len = data.length - checkData.length * 10
  if (!topNum) {
    topNum = 20
  }
  let tmpSum = 0
  let records = []
  let similarity
  const futureDataLength = 20
  const pushSort = (i) => {
    records.push({
      time: data[i].time,
      timeExpand: data[i + checkData.length + futureDataLength].time, // 延长分析20根K线
      similarity,
      data: data.slice(i, i + checkData.length).map(v => v.rate),
      futureData: data.slice(i + checkData.length, i + checkData.length + futureDataLength).map(v => v.rate)
    })
    records.sort((a, b) => a.similarity - b.similarity)
  }
  for (let i = 0; i < len; i++) {
    let lastR1 = 1
    let lastR2 = 1
    for (let j = 0; j < checkData.length; j++) {
      lastR1 = lastR1 * (1 + data[i + j].rate)
      lastR2 = lastR2 * (1 + checkData[j].rate)
      tmpSum += (lastR2 - lastR1) * (lastR2 - lastR1)
    }
    similarity = Math.sqrt(tmpSum / checkData.length)
    if (records.length < topNum) {
      pushSort(i)
      // i += 5 // 防止出现同天相似K线，导致未来样本数据统计放大  ps: 同样也会使得后面的历史数据记录变少
    } else if (records[records.length - 1].similarity > similarity) {
      records.pop()
      pushSort(i)
      // i += 5
    }
    tmpSum = 0
  }
  let trueLen = 0
  // 分析后N日均值同向性，均值，最大值，最小值
  let seriesData = records.reduce((prev, v, idx) => {
    let value = v.data.reduce((prev1, v1) => prev1.concat(prev1[prev1.length - 1] * (1 + v1)), [1])
    if (!prev.avg) {
      if (v.similarity === 0) {
        return prev
      }
      prev = {
        max: [...value],
        min: [...value],
        avg: [...value]
      }
    } else {
      for (let i = 0; i < value.length; i++) {
        if (prev.max[i] < value[i]) {
          prev.max[i] = value[i]
        }
        if (prev.min[i] > value[i]) {
          prev.min[i] = value[i]
        }
        prev.avg[i] += value[i]
      }
    }
    trueLen++
    return prev
  }, {})
  seriesData.avg = seriesData.avg.map(v => v / trueLen)

  trueLen = 0
  let seriesDataF = records.reduce((prev, v, idx) => {
    let value = v.futureData.reduce((prev1, v1) => prev1.concat(prev1[prev1.length - 1] * (1 + v1)), [1])
    if (!prev.avg) {
      if (v.similarity === 0) {
        return prev
      }
      prev = {
        max: [...value],
        min: [...value],
        avg: [...value]
      }
    } else {
      for (let i = 0; i < value.length; i++) {
        if (prev.max[i] < value[i]) {
          prev.max[i] = value[i]
        }
        if (prev.min[i] > value[i]) {
          prev.min[i] = value[i]
        }
        prev.avg[i] += value[i]
      }
    }
    trueLen++
    return prev
  }, {})
  seriesDataF.avg = seriesDataF.avg.map(v => v / trueLen)

  let fttx = []
  let ftzj = []
  const fd = futureData.reduce((prev, v1) => prev.concat(prev[prev.length - 1] * (1 + v1.rate)), [1])
  for (let i = 0; i < fd.length; i++) {
    fttx[i] = ((seriesDataF.avg[i] > 1) && (fd[i] > 1)) || ((seriesDataF.avg[i] < 1) && (fd[i] < 1))
    ftzj[i] = fd[i] > seriesDataF.min[i] && fd[i] < seriesDataF.max[i]
  }
  return {
    records,
    statistics: {
      seriesData,
      seriesDataF,
      rawData: checkData.reduce((prev, v1) => prev.concat(prev[prev.length - 1] * (1 + v1.rate)), [1]),
      futureData: fd,
      fttx,
      ftzj
    }
  }
}

exports.knn = knn
