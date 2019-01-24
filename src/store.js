import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    tableData: null
  },
  mutations: {
    setTableData(state, data) {
      console.log("store mutaions setTableData data is ", data);
      state.tableData = data;
    }
  },
  actions: {}
});
