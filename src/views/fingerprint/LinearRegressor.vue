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
import * as tf from "@tensorflow/tfjs";
// import { BostonHousingDataset, featureDescriptions } from "./data";
import { Toast } from "vant";
// import { strToHexToArray } from "../../assets/js/parseNumber";
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
      const model = tf.sequential();
      model.add(tf.layers.dense({ inputShape: [-1, 144], units: 1 }));

      model.summary();
      model.compile({
        optimizer: tf.train.sgd(0.0001),
        loss: "meanSquaredError"
      });
      Toast("Starting training process...");
      // ui.updateStatus("Starting training process...");
      await model.fit(tensors.trainFeatures, tensors.trainTarget, {
        batchSize: BATCH_SIZE,
        epochs: NUM_EPOCHS,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            Toast.loading({
              duration: 0,
              message: `Epoch ${epoch + 1} of ${NUM_EPOCHS} completed.`
            });
            trainLogs.push(logs);
            tfvis.show.history(container, trainLogs, ["loss", "val_loss"]);

            if (weightsIllustration) {
              model.layers[0]
                .getWeights()[0]
                .data()
                .then(kernelAsArr => {
                  const weightsList = describeKernelElements(kernelAsArr);
                  // ui.updateWeightDescription(weightsList);
                  console.log(weightsList);
                });
            }
          }
        }
      });

      // ui.updateStatus("Running on test data...");
      const result = model.evaluate(tensors.testFeatures, tensors.testTarget, {
        batchSize: BATCH_SIZE
      });
      const testLoss = result.dataSync()[0];

      const trainLoss = trainLogs[trainLogs.length - 1].loss;
      const valLoss = trainLogs[trainLogs.length - 1].val_loss;
      // await ui.updateModelStatus(
      //   `Final train-set loss: ${trainLoss.toFixed(4)}\n` +
      //     `Final validation-set loss: ${valLoss.toFixed(4)}\n` +
      //     `Test-set loss: ${testLoss.toFixed(4)}`,
      //   modelName
      // );
      Toast.success({
        message:
          `Final train-set loss: ${trainLoss.toFixed(4)}\n` +
          `Final validation-set loss: ${valLoss.toFixed(4)}\n` +
          `Test-set loss: ${testLoss.toFixed(4)}`
      });
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
