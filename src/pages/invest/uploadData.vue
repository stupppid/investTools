<template>
  <div>
    <el-upload
      :action="action"
      multiple
      :limit="100"
      :on-exceed="handleExceed"
      :file-list="fileList">
      <el-button size="small" type="primary">点击上传</el-button>
      <div slot="tip" class="el-upload__tip">上传csv格式文件, 名称是 symbol_period.csv</div>
    </el-upload>
    <button @click="test">test</button>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'uploadData',
  props: [],
  data () {
    return {
      action: '/invest/posts',
      fileList: []
    }
  },
  methods: {
    handleExceed () {
    },
    test () {
      axios({
        method: 'post',
        url: '/invest/expert/knn',
        data: {
          symbol: 'TEST',
          period: 'H1',
          lastData: {
            open: 1,
            high: 1,
            low: 1,
            close: 1,
            volume: 1,
            time: '2020.01.01 00:00:03'
          },
          data: {

            open: 1,
            high: 1,
            low: 1,
            close: 1.1,
            volume: 1,
            time: '2020.01.01 00:00:04'
          }
        }
      }).then(r => {
        console.log(r)
      })
    }
  }
}
</script>
<style scoped>

</style>
