/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import { Toast } from "vant";
import { fingerprints as trainFeatures } from "./train.js";
import { fingerprints as testFeatures } from "./test.js";
// import { BostonHousingDataset, featureDescriptions } from "./data";
import * as normalization from "./normalization";
import { strToHexToArray } from "../../assets/js/parseNumber";
// import * as ui from "./ui";

// Some hyperparameters for model training.
export const NUM_EPOCHS = 200;
export const BATCH_SIZE = 40;
const LEARNING_RATE = 0.01;

// const fingerData = new BostonHousingDataset();
export const tensors = {};
function loadData(fingerprints) {
  const xs = [];
  const labels = [];
  fingerprints.forEach(item => {
    // console.log("fingerprints begins.");
    // console.log(index, "index ");
    const feature = strToHexToArray(item.features.substr(0, 384));
    xs.push(feature);
    const uid = parseInt(item.user_sn);
    // // console.log("uid is ",typeof uid);
    // const label = this.labels[uid];
    // console.log("loadData label is ", label);
    labels.push([uid]);
  });
  // console.log("xs is ", xs);
  console.log("loadData labels is ", labels);
  // console.log("tf.tensor2d(xs).reshape([-1, 16, 24, 1]) is ", tf.tensor2d(xs).reshape([-1, 16, 24, 1]).dataSync());
  // const xsReshape = tf.tensor(xs).reshape([-1, 16, 24, 1]);
  return {
    xs,
    labels
  };
}
// Convert loaded data into tensors and creates normalized versions of the
// features.
export function arraysToTensors() {
  console.log("trainFeatures is ", trainFeatures);
  const trainData = loadData(trainFeatures);
  const testData = loadData(testFeatures);
  tensors.rawTrainFeatures = tf.tensor2d(trainData.xs);
  tensors.trainTarget = tf.tensor2d(trainData.labels);
  tensors.rawTestFeatures = tf.tensor2d(testData.xs);
  console.log("fingerData.testTarget is ", testData.labels);
  tensors.testTarget = tf.tensor2d(testData.labels);
  console.log("tensors.testTarget is ", tensors.testTarget.dataSync());
  // Normalize mean and standard deviation of data.
  let { dataMean, dataStd } = normalization.determineMeanAndStddev(
    tensors.rawTrainFeatures
  );

  tensors.trainFeatures = normalization.normalizeTensor(
    tensors.rawTrainFeatures,
    dataMean,
    dataStd
  );
  tensors.testFeatures = normalization.normalizeTensor(
    tensors.rawTestFeatures,
    dataMean,
    dataStd
  );
}

/**
 * Builds and returns Linear Regression Model.
 *
 * @returns {tf.Sequential} The linear regression model.
 */
export function linearRegressionModel() {
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [384], units: 1 }));

  model.summary();
  return model;
}

/**
 * Builds and returns Multi Layer Perceptron Regression Model
 * with 1 hidden layers, each with 10 units activated by sigmoid.
 *
 * @returns {tf.Sequential} The multi layer perceptron regression model.
 */
export function multiLayerPerceptronRegressionModel1Hidden() {
  const model = tf.sequential();
  console.log("fingerData is ", trainFeatures);
  console.log("fingerData.numFeatures is ", 384);
  // console.log("fingerData.numFeatures.dataSync() is ", fingerData.numFeatures.data);
  model.add(
    tf.layers.dense({
      inputShape: [384],
      units: 50,
      activation: "sigmoid",
      kernelInitializer: "leCunNormal"
    })
  );
  model.add(tf.layers.dense({ units: 1 }));

  model.summary();
  return model;
}

/**
 * Builds and returns Multi Layer Perceptron Regression Model
 * with 2 hidden layers, each with 10 units activated by sigmoid.
 *
 * @returns {tf.Sequential} The multi layer perceptron regression mode  l.
 */
export function multiLayerPerceptronRegressionModel2Hidden() {
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      inputShape: [384],
      units: 50,
      activation: "sigmoid",
      kernelInitializer: "leCunNormal"
    })
  );
  model.add(
    tf.layers.dense({
      units: 50,
      activation: "sigmoid",
      kernelInitializer: "leCunNormal"
    })
  );
  model.add(tf.layers.dense({ units: 1 }));

  model.summary();
  return model;
}

/**
 * Describe the current linear weights for a human to read.
 *
 * @param {Array} kernel Array of floats of length 384.  One value per feature.
 * @returns {List} List of objects, each with a string feature name, and value
 *     feature weight.
 */
export function describeKernelElements(kernel) {
  tf.util.assert(
    kernel.length === 384,
    `kernel must be a array of length 384, got ${kernel.length}`
  );
  const outList = [];
  for (let idx = 0; idx < kernel.length; idx++) {
    outList.push({ description: featureDescriptions[idx], value: kernel[idx] });
  }
  return outList;
}
export const featureDescriptions = [
  "Crime rate",
  "Land zone size",
  "Industrial proportion",
  "Next to river",
  "Nitric oxide concentration",
  "Number of rooms per house",
  "Age of housing",
  "Distance to commute",
  "Distance to highway",
  "Tax rate",
  "School class size",
  "School drop-out rate"
];

/**
 * Compiles `model` and trains it using the train data and runs model against
 * test data. Issues a callback to update the UI after each epcoh.
 *
 * @param {tf.Sequential} model Model to be trained.
 * @param {boolean} weightsIllustration Whether to print info about the learned
 *  weights.
 */
export async function run(model, modelName, weightsIllustration) {
  model.compile({
    optimizer: tf.train.sgd(LEARNING_RATE),
    loss: "meanSquaredError"
  });

  let trainLogs = [];
  const container = document.querySelector(`#${modelName} .chart`);

  Toast("Starting training process...");
  // ui.updateStatus("Starting training process...");
  await model.fit(tensors.trainFeatures, tensors.trainTarget, {
    batchSize: BATCH_SIZE,
    epochs: NUM_EPOCHS,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        // await ui.updateModelStatus(
        //   `Epoch ${epoch + 1} of ${NUM_EPOCHS} completed.`,
        //   modelName
        // );
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

export function computeBaseline() {
  const avgPrice = tf.mean(tensors.trainTarget);
  console.log(`Average price: ${avgPrice.dataSync()}`);
  const baseline = tf.mean(tf.pow(tf.sub(tensors.testTarget, avgPrice), 2));
  console.log(`Baseline loss: ${baseline.dataSync()}`);
  const baselineMsg = `Baseline loss (meanSquaredError) is ${baseline
    .dataSync()[0]
    .toFixed(2)}`;
  console.log(baselineMsg);
  // ui.updateBaselineStatus(baselineMsg);
}
export async function start() {
  console.log("start.");
  // await fingerData.loadData();

  // ui.updateStatus("Data loaded, converting to tensors");
  Toast("Data loaded, converting to tensors");
  arraysToTensors();
  // ui.updateStatus(
  //   "Data is now available as tensors.\n" + "Click a train button to begin."
  // );
  Toast(
    "Data is now available as tensors.\n" + "Click a train button to begin."
  );
  // TODO Explain what baseline loss is. How it is being computed in this
  // Instance
  // ui.updateBaselineStatus("Estimating baseline loss");
  Toast("Estimating baseline loss");
  computeBaseline();
  // await ui.setup();
}
