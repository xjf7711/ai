<template>
  <van-nav-bar  :title="headerTitle">
    <van-icon @click="backPath" slot="left" v-if="back" name="arrow-left" size="22px" color="#ffffff"></van-icon>
    <!--<svg-icon slot="right" icon-class="ble" class-name="iconfont tabs-icon" v-if="$route.path==='/openlock/index'&&$store.state.myInfo.duty===0" @click.native="toPath('/openlock/ble')"></svg-icon>-->
    <!--<svg-icon slot="left" icon-class="zigbee" class-name="iconfont tabs-icon"  v-if="$route.path==='/openlock/index'&&$store.state.myInfo.duty===0" @click.native="toPath('/openlock/USBSerial/undefined')"></svg-icon>-->

    <!--<i class="van-icon van-icon-arrow-left van-nav-bar__arrow">-->
    <!--<van-icon name="search" slot="right" />-->
  </van-nav-bar>
</template>
<script>
// import { Toast } from "vant";

export default {
  name: "vHeader",
  data() {
    return {
      //        appVersion: '1603.TT03.V2.534',
      //        back: false
      isOpenLock: false
    };
  },
  computed: {
    //根据路由设置头部显示的title
    headerTitle() {
      // console.log("this.$route is ", this.$route);
      return this.$route.meta.title;
    },
    baseUrl() {
      return this.$store.state.baseUrl;
    },
    // code() {
    //   return this.$store.state.code;
    // },
    back() {
      //        if (this.$route.path.indexOf('/config/')!== -1) {
      //          return true
      //        }
      //        else {
      //          return false
      //        }
      return !this.$route.path.includes("/index");
    }
  },
  created() {
    console.log("Header created");

    // this.checkVersion()
    //        localStorage.setItem('client_version',this.appVersion)
    //      this.$store.commit('setAppVersion',this.appVersion)

    //判断是否已经登录
    // const localUser = JSON.parse(localStorage.getItem("userInfo"));
    // console.log("Header localUser is " + JSON.stringify(localUser));
    // if (localUser) {
    //   this.$store.commit("setMyInfo", localUser);
    //   this.checkLogin(localUser.phonenum, localUser.password);
    // } else {
    //   this.$router.push("/login");
    // }
  },
  methods: {
    backPath() {
      this.$router.go(-1);
    },
    toPath(path) {
      console.log("toPath path is ", path);
      this.$router.push(path);
    }
  }
};
</script>

<style lang="scss" scoped>
.van-nav-bar {
  background-color: #26a2ff;
  /*height: 40px;*/
}
.van-nav-bar__title {
  color: #ffffff;
}
/*.icon {*/
/*font-size: 1em;*/
/*}*/
</style>
