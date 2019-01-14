<template>
  <div class="layout">
    <v-header v-show="showHeader"></v-header>
    <router-view></router-view>
    <!--<v-footer v-if="showFooter"/>-->
  </div>
</template>
<script>
// import VFooter from "./Footer";
import VHeader from "./Header";
export default {
  name: "Layout",
  components: {
    // VFooter,
    VHeader
  },
  computed: {
    showHeader() {
      return (
        this.$route.path !== "/borrow/index" &&
        this.$route.path !== "/return/index"
      );
    },
    showFooter() {
      return !(
        (this.$route.path.includes("/openlock") ||
          this.$route.path.includes("/configs")) &&
        !this.$route.path.includes("/index")
      );
    }
  }
};
</script>
<style lang="scss" scoped>
.layout {
  height: 100%;
}
</style>
