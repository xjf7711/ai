<template>
    <div class='tfjs-example-container centered-container'>
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
            </div>
            <div id="buttons">
                <div class="with-cols">
                    <van-button type="primary" id="simple-mlr" @click="trainSimpleLinearRegression">Train Linear Regressor</van-button><br/>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
// import { BostonHousingDataset, featureDescriptions } from "./data";
import { Toast } from "vant";
import { strToHexToArray } from "../../assets/js/parseNumber";
import { fingerprints } from "./train.js";
import { fingerprints as testData } from "./test.js";
import {
  run,
  start,
  // arraysToTensors,
  // // computeBaseline,
  // multiLayerPerceptronRegressionModel1Hidden,
  // multiLayerPerceptronRegressionModel2Hidden,
  linearRegressionModel
} from "../tensorFlow/boston-housing/common";
export default {
  name: "LinearRegressor",
  data() {
    return {
      // message: "fingerprint",
      isDisabled: false,
      data: null,
      lossLabel: null,
      accuracyLabel: null,
      modelType: "LinearRegressor", // DenseNet,ConvNet
      trainEpochs: 100,
      trainData: {},
      testData: {},
      examples: {},
      labels: [],
      labelSize: 43
    };
  },
  created() {
    console.log("created begins. ");
    this.formatLabels();
    this.trainData = this.loadData(fingerprints);
    console.log("trainData is ", this.trainData);
    this.testData = this.loadData(testData);
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
