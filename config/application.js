module.exports = {
    influxdb: {
        // linkString: 'http://172.21.165.193:8086/mt5'
        linkString: 'http://192.168.92.128:8086/mt5'
    },
    knnSample: {
         // 选取knn基础数据样本的最后时间，导入历史数据文件的最后时间之前，并且不能被EApush的数据影响
        endTime: new Date('2020.10.01'),
    }
}