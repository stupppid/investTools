<template>
  <div id="app">
    <el-header class="header">
      <el-menu
        mode="horizontal"
        @select="headerSelect">
        <el-submenu index="algorithm">
          <template slot="title">algorithm</template>
          <el-menu-item v-for="(item,i) in algorithms" :key="i" :index="item">
            {{item}}
          </el-menu-item>
        </el-submenu>
        <el-submenu index="uploadData">
          <template slot="title">uploadData</template>
          <el-menu-item index="mt5">
            mt5
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-header>
    <el-main class="main">
      <keep-alive>
        <router-view/>
      </keep-alive>
    </el-main>
    <el-footer class="footer">Footer</el-footer>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'App',
  computed: {
    ...mapState({
      algorithms: state => state.algorithms
    })
  },
  methods: {
    headerSelect (value, argv) {
      // if (argv[0] === 'algorithm') {
      //   this.$router.push(`/algorithm/${value}`).catch(() => {})
      // }
      this.$router.push(`/${argv.join('/')}`).catch(() => {})
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.header {
  height: 60px;
}
.main {
  height: calc(100vh - 120px);
}
.footer {
  height: 60px;
}
.pointer {
  cursor: pointer;
}
</style>
