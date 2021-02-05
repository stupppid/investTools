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
    <button @click="test">dsad</button>
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
        url: '/invest/getData',
        data: {
          symbol: 'EURUSD',
          period: 'H1',
          times: [[1611316800000]]
        }
      }).then(r => {})
    }
  }
}
</script>
<style scoped>

</style>
