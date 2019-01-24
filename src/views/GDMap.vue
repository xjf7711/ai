<template>
    <div>
        <hello-world msg="hello world. "></hello-world>
        <div id="gdMap"></div>
    </div>
</template>

<script>
import AMap from "AMap";
import HelloWorld from "../components/HelloWorld";
export default {
  name: "GDMap",
  components: {
    HelloWorld
  },
  data() {
    return {
      msg: "GaoDe Map"
    };
  },
  computed: {
    list() {
      console.log(
        "computed this.$store.state.tableData is ",
        this.$store.state.tableData
      );
      return this.$store.state.tableData;
    }
  },
  mounted() {
    new AMap.Map("gdMap", {
      resizeEnable: true, //是否监控地图容器尺寸变化
      zoom: 11, //初始化地图层级
      center: [116.397428, 39.90923] //初始化地图中心点
    });
    // this.$store.commit("setTableData", [116.397428, 39.90923]);
    console.log("this.list is ", this.list);
  },
  methods: {}
};
</script>

<style scoped lang="scss">
#gdMap {
  height: 300px;
  width: 100%;
}
</style>
