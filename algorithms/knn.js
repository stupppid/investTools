function knn ({ data, checkData, topNum, maxSimilarity }) {
  let len = data.length - checkData.length * 2
  if (!topNum) {
    topNum = len * 0.001 > 50 ? 50 : Math.ceil(len * 0.001)
  }
  let tmpSum = 0
  let records = []
  let tmp, similarity
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < checkData.length; j++) {
      tmp = data[i + j].rate - checkData[j].rate
      tmp *= tmp
      tmpSum += tmp
    }
    similarity = tmpSum / checkData.length
    // if (similarity < maxSimilarity) {
    // }
    if (records.length < topNum) {
      records.push({
        time: data[i].time,
        similarity
      })
      records.sort((a, b) => a.similarity - b.similarity)
    } else if (records[records.length - 1].similarity > similarity) {
      records.pop()
      records.push({
        time: data[i].time,
        similarity
      })
      records.sort((a, b) => a.similarity - b.similarity)
    }
    tmpSum = 0
  }
  return records
}

exports.knn = knn
