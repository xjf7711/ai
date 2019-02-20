<template>
    <div>
        <section>
            <p class='section-head'>Training Parameters</p>
            <div>
                <label>Model Type:</label>
                <label for="model-type"></label><select id="model-type" v-model="modelType" :disabled="isDisabled">
                <option>ConvNet</option>
                <option>DenseNet</option>
            </select>
            </div>

            <div>
                <label># of training epochs:</label>
                <input id="train-epochs" v-model="trainEpochs">
                <!--<van-field label="epochs: " v-model="trainEpochs"></van-field>-->
            </div>

            <button id="train" @click="handlerTrain" :disabled="isDisabled">Load Data and Train Model</button>
            <!--<van-button type="primary" @click="handlerTrain" :disabled="isDisabled">Load Data and Train Model</van-button>-->
        </section>

        <section>
            <p class='section-head'>Training Progress</p>
            <p id="status"></p>
            <p id="message"></p>

            <div id="stats">
                <div class="canvases">
                    <label id="loss-label"></label>
                    <div id="loss-canvas"></div>
                </div>
                <div class="canvases">
                    <label id="accuracy-label"></label>
                    <div id="accuracy-canvas"></div>
                </div>
            </div>
        </section>

        <section>
            <p class='section-head'>Inference Examples</p>
            <div id="images"></div>
        </section>
    </div>
</template>

<script>
import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";

import { Toast } from "vant";
import { strToHexToArray } from "../../assets/js/parseNumber";
import { fingerprints } from "./train.js";
import { fingerprints as testData } from "./test.js";
const lossValues = [[], []];
const accuracyValues = [[], []];
export default {
  name: "Fingerprint",
  data() {
    return {
      // message: "fingerprint",
      isDisabled: false,
      data: null,
      lossLabel: null,
      accuracyLabel: null,
      modelType: "ConvNet", // DenseNet,ConvNet
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
  mounted() {
    // this.handlerTrain();
  },
  methods: {
    formatLabels() {
      const labels = [];
      fingerprints.forEach(item => {
        const uid = parseInt(item.user_sn);
        labels.push(uid);
      });
      const labelSet = new Set(labels);
      console.log("labelSet is ", labelSet);
      const labelArray = tf.tensor1d(Array.from(labelSet), "int32");
      console.log("labelArray is ", labelArray.dataSync());
      const oneHots = tf.oneHot(labelArray, 43);
      console.log("oneHots is ", oneHots.dataSync());
      Array.from(labelSet).forEach((item, index) => {
        const label = new Array(this.labelSize).fill(0, 0, this.labelSize);
        label[index] = 1;
        this.labels[item] = label;
      });
      // console.log("this.labels is ", this.labels);
    },
    loadData(fingerprints) {
      const xs = [];
      const labels = [];
      fingerprints.forEach(item => {
        // console.log("fingerprints begins.");
        // console.log(index, "index ");
        const feature = strToHexToArray(item.features.substr(0, 384));
        xs.push(feature);
        const uid = parseInt(item.user_sn);
        // // console.log("uid is ",typeof uid);
        const label = this.labels[uid];
        // console.log("label is ", label);
        labels.push(label);
      });
      // console.log("xs is ", xs);
      // console.log("labels is ", labels);
      // console.log("xs is  ", xs);
      // console.log("tf.tensor2d(xs).reshape([-1, 16, 24, 1]) is ", tf.tensor2d(xs).reshape([-1, 16, 24, 1]).dataSync());
      // const xsReshape = tf.tensor(xs).reshape([-1, 16, 24, 1]);
      return {
        xs: tf.tensor2d(xs).reshape([-1, 16, 24, 1]),
        labels: tf.tensor(labels)
      };
    },
    async handlerTrain() {
      console.log("handlerTrain begins.");
      // this.isDisabled = true;
      Toast("Creating model...");
      const model = this.createModel();
      model.summary();

      // ui.logStatus("Starting model training...");
      Toast("Starting model training...");
      await this.train(model, () => this.showPredictions(model));
    },

    /**
     * Compile and train the given model.
     *
     * @param {*} model The model to
     */
    async train(model, onIteration) {
      console.log("train begins. ");
      // ui.logStatus("Training model...");
      Toast.loading({
        duration: 0,
        forbidClick: true,
        loadingType: "spinner",
        message: "Training model..."
      });
      const optimizer = "rmsprop";
      console.log("model.compile begins . ");
      model.compile({
        optimizer,
        loss: "categoricalCrossentropy",
        metrics: ["accuracy"]
      });

      const batchSize = 50;

      // Leave out the last 15% of the training data for validation, to monitor
      // overfitting during training.
      const validationSplit = 0.15;

      let trainBatchCount = 0;

      // const trainData = this.data.getTrainData();
      // const testData = this.data.getTestData();

      const totalNumBatches =
        Math.ceil(
          (this.trainData.xs.shape[0] * (1 - validationSplit)) / batchSize
        ) * this.trainEpochs;
      console.log("totalNumBatches is ", totalNumBatches);
      // During the long-running fit() call for model training, we include
      // callbacks, so that we can plot the loss and accuracy values in the page
      // as the training progresses.
      let valAcc;
      console.log("model.fit begins. ");
      // await model.fit(trainData.xs, trainData.labels, {
      console.log("train this.trainData.xs is ", this.trainData.xs);
      await model.fit(this.trainData.xs, this.trainData.labels, {
        batchSize,
        validationSplit,
        epochs: this.trainEpochs,
        callbacks: {
          onBatchEnd: async (batch, logs) => {
            console.log("callbacks onBatchEnd.");
            trainBatchCount++;

            this.plotLoss(trainBatchCount, logs.loss, "train");
            this.plotAccuracy(trainBatchCount, logs.acc, "train");
            Toast.loading({
              duration: 0,
              forbidClick: true,
              loadingType: "spinner",
              message:
                `Training... (` +
                `${((trainBatchCount / totalNumBatches) * 100).toFixed(1)}%` +
                ` complete). To stop training, refresh or close page.`
            });
            if (onIteration && batch % 10 === 0) {
              onIteration("onBatchEnd", batch, logs);
            }
            await tf.nextFrame();
          },
          onEpochEnd: async (epoch, logs) => {
            console.log("callbacks onEpochEnd.");
            valAcc = logs.val_acc;
            this.plotLoss(trainBatchCount, logs.val_loss, "validation");
            this.plotAccuracy(trainBatchCount, logs.val_acc, "validation");
            if (onIteration) {
              onIteration("onEpochEnd", epoch, logs);
            }
            await tf.nextFrame();
          }
        }
      });
      model.save("indexeddb://fingerprints");
      this.isDisabled = false;
      console.log("testResult begins. ");
      const testResult = model.evaluate(this.testData.xs, this.testData.labels);
      // const testResult = model.evaluate(testData.xs, testData.labels);
      const testAccPercent = testResult[1].dataSync()[0] * 100;
      const finalValAccPercent = valAcc * 100;
      // ui.logStatus(
      //   `Final validation accuracy: ${finalValAccPercent.toFixed(1)}%; ` +
      //     `Final test accuracy: ${testAccPercent.toFixed(1)}%`
      // );
      Toast.clear();
      Toast(
        `Final validation accuracy: ${finalValAccPercent.toFixed(1)}%; ` +
          `Final test accuracy: ${testAccPercent.toFixed(1)}%`
      );
      console.log("testAccPercent is ", testAccPercent.toFixed(1));
    },

    /**
     * Creates a convolutional neural network (Convnet) for the MNIST data.
     * @returns {tf.Model} An instance of tf.Model.
     */
    createConvModel() {
      console.log("createConvModel begins. ");
      const model = tf.sequential();
      console.log("conv2d begins. ");
      const conv1 = tf.layers.conv2d({
        inputShape: [16, 24, 1],
        kernelSize: 3,
        filters: 16,
        activation: "relu"
      });
      model.add(conv1);
      // model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));
      // Our third layer is another convolution, this time with 32 filters.
      model.add(
        tf.layers.conv2d({ kernelSize: 3, filters: 32, activation: "relu" })
      );

      // // Max pooling again.
      model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

      // Add another conv2d layer.
      model.add(
        tf.layers.conv2d({ kernelSize: 3, filters: 64, activation: "relu" })
      );
      console.log("flatten begins. ");
      model.add(tf.layers.flatten({}));
      console.log("relu begins. ");
      model.add(tf.layers.dense({ units: 128, activation: "relu" }));
      console.log("softmax begins.");
      model.add(tf.layers.dense({ units: 43, activation: "softmax" }));

      return model;
    },

    createDenseModel() {
      const model = tf.sequential();
      model.add(tf.layers.flatten({ inputShape: [16, 24, 1] }));
      // model.add(tf.layers.dense({ units: 1155, activation: "relu" }));
      // model.add(tf.layers.dense({ units: 55, activation: "relu" }));
      model.add(tf.layers.dense({ units: 155, activation: "relu" }));
      model.add(
        tf.layers.dense({ units: this.labelSize, activation: "softmax" })
      );
      return model;
    },

    /**
     * Show predictions on a number of test examples.
     * @param {tf.Model} model The model to be used for making the predictions.
     */
    async showPredictions(model) {
      // const testExamples = 100;
      // const examples = this.testData;
      // const examples = this.data.getTestData(testExamples);
      // console.log("examples is ", examples);

      tf.tidy(() => {
        // const output = model.predict(examples.xs);
        const output = model.predict(this.testData.xs);
        console.log("output is ", output);
        const axis = 1;
        const labels = Array.from(this.testData.labels.argMax(axis).dataSync());
        console.log("tf.tidy labels is ", labels);
        const predictions = Array.from(output.argMax(axis).dataSync());
        console.log("tf.tidy predictions is ", predictions);
        this.showTestResults(this.testData, predictions, labels);
      });
    },
    draw(image, canvas) {
      const [width, height] = [16, 24];
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      const imageData = new ImageData(width, height);
      const data = image.dataSync();
      for (let i = 0; i < height * width; ++i) {
        const j = i * 4;
        imageData.data[j + 0] = data[i] * 255;
        imageData.data[j + 1] = data[i] * 255;
        imageData.data[j + 2] = data[i] * 255;
        imageData.data[j + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
    },
    createModel() {
      let model;
      // const modelType = ui.getModelTypeId();
      if (this.modelType === "ConvNet") {
        model = this.createConvModel();
      } else if (this.modelType === "DenseNet") {
        model = this.createDenseModel();
      } else {
        throw new Error(`Invalid model type: ${this.modelType}`);
      }
      return model;
    },
    // setTrainButtonCallback(callback) {
    //   const trainButton = document.getElementById("train");
    //   const modelType = document.getElementById("model-type");
    //   trainButton.addEventListener("click", () => {
    //     trainButton.setAttribute("disabled", true);
    //     modelType.setAttribute("disabled", true);
    //     callback();
    //   });
    // },
    // async load() {
    //   console.log("load begins. ");
    //   this.data = new MnistData();
    //   console.log("this.data is ", this.data);
    //   await this.data.load();
    // },
    showTestResults(batch, predictions, labels) {
      console.log("showTestResults begins. ");
      const testExamples = batch.xs.shape[0];
      console.log("testExamples is ", testExamples);
      const imagesElement = document.getElementById("images");
      imagesElement.innerHTML = "";
      for (let i = 0; i < testExamples; i++) {
        const image = batch.xs.slice([i, 0], [1, batch.xs.shape[1]]);

        const div = document.createElement("div");
        div.className = "pred-container";

        const canvas = document.createElement("canvas");
        canvas.className = "prediction-canvas";
        this.draw(image.flatten(), canvas);

        const pred = document.createElement("div");

        const prediction = predictions[i];
        const label = labels[i];
        const correct = prediction === label;

        pred.className = `pred ${correct ? "pred-correct" : "pred-incorrect"}`;
        pred.innerText = `pred: ${prediction}`;

        div.appendChild(pred);
        div.appendChild(canvas);

        imagesElement.appendChild(div);
      }
    },
    plotLoss(batch, loss, set) {
      const series = set === "train" ? 0 : 1;
      lossValues[series].push({ x: batch, y: loss });
      const lossContainer = document.getElementById("loss-canvas");
      tfvis.render.linechart(
        { values: lossValues, series: ["train", "validation"] },
        lossContainer,
        {
          xLabel: "Batch #",
          yLabel: "Loss",
          width: 400,
          height: 300
        }
      );
      this.lossLabel = `last loss: ${loss.toFixed(3)}`;
    },
    plotAccuracy(batch, accuracy, set) {
      const accuracyContainer = document.getElementById("accuracy-canvas");
      const series = set === "train" ? 0 : 1;
      accuracyValues[series].push({ x: batch, y: accuracy });
      tfvis.render.linechart(
        {
          values: accuracyValues,
          series: ["train", "validation"]
        },
        accuracyContainer,
        {
          xLabel: "Batch #",
          yLabel: "Loss",
          width: 400,
          height: 300
        }
      );
      this.accuracyLabel = `last accuracy: ${(accuracy * 100).toFixed(1)}%`;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
