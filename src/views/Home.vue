<template>
  <div class="home">
    <!--<img alt="Vue logo" src="../assets/logo.png">-->
    <!--<HelloWorld msg="Welcome to Your Vue.js App"/>-->
    <van-cell-group v-for="(item,index) in list" :key="index">
      <van-cell :title="item.meta.title" @click="$router.push(item.path)"></van-cell>
      <van-cell class="child" v-for="(child,j) in item.children" :key="j" :title="child.meta.title" @click="$router.push(item.path+'/'+child.path)"></van-cell>
    </van-cell-group>

  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";
import { routeMap } from "../router";
export default {
  name: "home",
  data() {
    return {
      list: null
    };
  },
  // components: {
  //   HelloWorld
  // },
  mounted() {
    // console.log(routeMap);
    this.list = routeMap;
  }
};
</script>
<style lang="scss" scoped>
.child {
  padding-left: 50px;
  text-underline: #d9d9d9;
}
</style>
