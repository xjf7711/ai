<template>
    <div class='tfjs-example-container centered-container'>
        <section>
            <p class='section-head'>Status</p>
            <p id="status">Loading data...</p>
            <p id="baselineStatus">Baseline not computed...</p>
        </section>

        <section>
            <p class='section-head'>Training Progress</p>
            <div class="with-cols">
                <div id="linear">
                    <div class="chart"></div>
                    <div class="status"></div>
                    <div id="modelInspectionOutput">
                        <p id="inspectionHeadline"></p>
                        <table id="myTable"></table>
                    </div>
                </div>
                <div id="oneHidden">
                    <div class="chart"></div>
                    <div class="status"></div>
                </div>
                <div id="twoHidden">
                    <div class="chart"></div>
                    <div class="status"></div>
                </div>
            </div>

            <div id="buttons">
                <div class="with-cols">
                    <van-button type="primary" id="simple-mlr" @click="trainSimpleLinearRegression">Train Linear Regressor</van-button><br/>
                    <van-button type="warning" id="nn-mlr-1hidden" @click="trainNeuralNetworkLinearRegression1Hidden">Train Neural Network Regressor (1 hidden layer)</van-button><br/>
                    <van-button type="danger" id="nn-mlr-2hidden" @click="trainNeuralNetworkLinearRegression2Hidden">Train Neural Network Regressor (2 hidden layers)</van-button>
                </div>
            </div>

        </section>
    </div>
</template>

<script>
// 这是一个分类问题使用线性回归的算法的反例。
// 结果很奇怪。
// import { BostonHousingDataset, featureDescriptions } from "./data";
import {
  run,
  start,
  // arraysToTensors,
  // computeBaseline,
  multiLayerPerceptronRegressionModel1Hidden,
  multiLayerPerceptronRegressionModel2Hidden,
  linearRegressionModel
} from "./common";
// const bostonData = new BostonHousingDataset();
export default {
  name: "Index",
  data() {
    return {
      status: "",
      baselineStatus: ""
    };
  },
  async mounted() {
    start();
    // await bostonData.loadData();
    //
    // // ui.updateStatus("Data loaded, converting to tensors");
    // this.status = "Data loaded, converting to tensors";
    // arraysToTensors();
    // // ui.updateStatus(
    // //   "Data is now available as tensors.\n" + "Click a train button to begin."
    // // );
    // this.status =
    //   "Data is now available as tensors.\n" + "Click a train button to begin.";
    // // TODO Explain what baseline loss is. How it is being computed in this
    // // Instance
    // // ui.updateBaselineStatus("Estimating baseline loss");
    // this.baselineStatus = "Estimating baseline loss";
    // computeBaseline();
    // // await ui.setup();
  },
  methods: {
    async trainSimpleLinearRegression() {
      const model = linearRegressionModel();
      await run(model, "linear", true);
    },
    async trainNeuralNetworkLinearRegression1Hidden() {
      const model = multiLayerPerceptronRegressionModel1Hidden();
      await run(model, "oneHidden", false);
    },
    async trainNeuralNetworkLinearRegression2Hidden() {
      const model = multiLayerPerceptronRegressionModel2Hidden();
      await run(model, "twoHidden", false);
    }
  }
};
</script>

<style scoped>
.negativeWeight {
  color: #cc0000;
}

.positiveWeight {
  color: #00aa00;
}

#buttons {
  margin-top: 20px;
  padding: 5px;
}

#oneHidden {
  border-left: 1px solid #ededed;
  border-right: 1px solid #ededed;
}

#linear,
#oneHidden,
#twoHidden {
  padding: 5px;
}
</style>
