<template>
  <van-tabbar :value="active">
    <van-tabbar-item  @click.native="routeTo('/mainview/index')">
      <span>首页</span>
      <svg-icon slot="icon" icon-class="home" class-name="iconfont tab-icon"></svg-icon>
    </van-tabbar-item>
    <van-tabbar-item @click.native="routeTo('/borrow/index')">
      <span>借源</span>
      <svg-icon slot="icon" icon-class="borrow" class-name="iconfont tab-icon"></svg-icon>
    </van-tabbar-item>
    <van-tabbar-item @click.native="routeTo('/return/index')">
      <span>还源</span>
      <svg-icon slot="icon" icon-class="return" class-name="iconfont tab-icon"></svg-icon>
    </van-tabbar-item>
    <van-tabbar-item @click.native="routeTo('/openlock/index')">
      <span>开锁</span>
      <svg-icon slot="icon" icon-class="openLock" class-name="iconfont tab-icon"></svg-icon>
    </van-tabbar-item>
    <van-tabbar-item @click.native="routeTo('/configs/index')">
      <span>设置</span>
      <svg-icon slot="icon" icon-class="configs" class-name="iconfont tab-icon"></svg-icon>
    </van-tabbar-item>
  </van-tabbar>
</template>
<script>
export default {
  name: "Footer",
  data() {
    return {
      // active: 0,
      msg: "footer"
    };
  },
  computed: {
    active() {
      return this.$route.meta.active;
    }
  },
  methods: {
    routeTo(path) {
      this.$router.push({ path: path });
    }
  }
};
</script>

<style lang="scss" scoped>
/*.bottom_tabs .fa {*/
/*font-size: 22px;*/
/*}*/
.iconfont {
  font-size: 24px;
}
.tabs-icon {
  color: #999898;
}
/*.is-selected .tabs-icon {*/
/*color: #26a2ff;*/
/*}*/
</style>
