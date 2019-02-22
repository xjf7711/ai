import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import { Toast } from "vant";
import { fingerprints as trainData } from "./train.js";
import { fingerprints as testData } from "./test.js";
import { strToHexToArray } from "../../assets/js/parseNumber";

const HEIGH = 12;
const WIDTH = 12;
const SIZE = 43;
const lossValues = [[], []];
const accuracyValues = [[], []];

export default class Fingerprint {
  constructor(modelType, trainEpochs) {
    this.modelType = modelType; // DenseNet,ConvNet
    this.trainEpochs = trainEpochs;
    // this.featureLength = 256;
    this.labels = {};
    // lossLabel: null,
    // accuracyLabel: null,
    //   trainData: {},
    // testData: {},
    // examples: {},
    // labels: [],
  }
  start() {
    this.formatLabels(trainData);
    this.trainData = this.loadData(trainData);
    console.log("trainData is ", this.trainData);
    this.testData = this.loadData(testData);
  }
  /**
   * oneHot标签
   * todo tf中有oneHot函数，应该用tf.oneHot函数实现。？？？
   * @param fingerprints
   */
  formatLabels(fingerprints) {
    const labels = [];
    fingerprints.forEach(item => {
      const uid = parseInt(item.user_sn);
      labels.push(uid);
    });
    const labelSet = new Set(labels);
    console.log("labelSet is ", labelSet);
    this.labelArray = Array.from(labelSet);
    console.log("labelArray is ", this.labelArray);
    this.labelArray.forEach((item, index) => {
      const label = new Array(SIZE).fill(0, 0, SIZE);
      // const label = tf.oneHot(item, SIZE);
      // console.log("tf.oneHot ", tf.oneHot(item, SIZE).dataSync());
      label[index] = 1;
      // console.log("label is ", label.dataSync());
      this.labels[item] = label;
    });
    console.log("this.labels is ", this.labels);
  }
  loadData(fingerprints) {
    const xs = [];
    const labels = [];
    fingerprints.forEach(item => {
      // console.log("fingerprints begins.");
      // console.log(index, "index ");
      const feature = strToHexToArray(item.features.substr(0, HEIGH * WIDTH));
      xs.push(feature);
      const uid = parseInt(item.user_sn);
      // // console.log("uid is ",typeof uid);
      const label = this.labels[uid];
      // console.log("loadData label is ", label);
      labels.push(label);
    });
    console.log("xs is ", xs);
    console.log("loadData labels is ", labels);
    // console.log("tf.tensor2d(xs).reshape([-1, HEIGH, WIDTH, 1]) is ", tf.tensor2d(xs).reshape([-1, HEIGH, WIDTH, 1]).dataSync());
    // const xsReshape = tf.tensor(xs).reshape([-1, HEIGH, WIDTH, 1]);
    return {
      xs: tf.tensor2d(xs).reshape([-1, HEIGH, WIDTH, 1]),
      labels: tf.tensor2d(labels)
    };
  }
  async handlerTrain() {
    console.log("handlerTrain begins.");
    // this.isDisabled = true;
    Toast("Creating model...");
    const model = this.createModel();
    model.summary();

    // ui.logStatus("Starting model training...");
    Toast("Starting model training...");
    await this.train(model, () => this.showPredictions(model));
  }
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
    const optimizer = "adam"; // GD，SGD，Adam, Momentum,RMSProp rmsprop改为adam后明显改善 50次能全对
    console.log("model.compile begins . ");
    model.compile({
      optimizer,
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"]
    });

    const batchSize = 50;

    // Leave out the last 15% of the training data for validation, to monitor
    // overfitting during training.
    // 改为0.25后效果变差了？？？
    // 改为0.08后效果变好了？？？
    const validationSplit = 0.08;

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
  }

  /**
   * Show predictions on a number of test examples.
   * @param {tf.Model} model The model to be used for making the predictions.
   */
  async showPredictions(model) {
    console.log("showPredictions begins.  ");
    // const testExamples = 100;
    // const examples = this.testData;
    // const examples = this.data.getTestData(testExamples);
    // console.log("examples is ", examples);

    tf.tidy(() => {
      // const output = model.predict(examples.xs);
      const output = model.predict(this.testData.xs);
      // console.log("output is ", output.dataSync());
      const axis = 1;
      const labels = Array.from(this.testData.labels.argMax(axis).dataSync());
      // const uids = labels.map(item => this.labelArray[item]);
      console.log(
        "true user_sn is ",
        labels
        // labels.map(item => this.labelArray[item])
      );
      const predictions = Array.from(output.argMax(axis).dataSync());
      console.log(
        "predict user_sn is ",
        predictions
        // predictions.map(item => this.labelArray[item])
      );
      Fingerprint.showTestResults(this.testData, predictions, labels);
    });
  }

  static showTestResults(batch, predictions, labels) {
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
      Fingerprint.draw(image.flatten(), canvas);

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
  }

  static draw(image, canvas) {
    const [width, height] = [HEIGH, WIDTH];
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
  }
  createModel() {
    let model;
    // const modelType = ui.getModelTypeId();
    if (this.modelType === "ConvNet") {
      model = Fingerprint.createConvModel();
    } else if (this.modelType === "DenseNet") {
      model = Fingerprint.createDenseModel();
    } else {
      throw new Error(`Invalid model type: ${this.modelType}`);
    }
    return model;
  }
  /**
   * Creates a convolutional neural network (Convnet) for the MNIST data.
   * @returns {tf.Model} An instance of tf.Model.
   */
  static createConvModel() {
    console.log("createConvModel begins. ");
    const model = tf.sequential();
    console.log("conv2d begins. ");
    const layer1 = tf.layers.conv2d({
      inputShape: [HEIGH, WIDTH, 1], // 输入
      kernelSize: 3,
      filters: 32,
      padding: "same",
      activation: "relu"
    });
    model.add(layer1);
    // 池化 Max pooling first.
    model.add(
      tf.layers.maxPooling2d({ poolSize: 2, strides: 2, padding: "same" })
    );
    // Our third layer is another convolution, this time with 32 filters.
    model.add(
      tf.layers.conv2d({
        kernelSize: 3, // 大小
        filters: 64, // 过滤器
        padding: "same",
        activation: "relu" // 激活函数
      })
    );

    // Max pooling again.
    model.add(
      tf.layers.maxPooling2d({ poolSize: 2, strides: 2, padding: "same" })
    );

    // Add another conv2d layer.
    model.add(
      tf.layers.conv2d({ kernelSize: 3, filters: 64, activation: "relu" })
    );
    console.log("flatten begins. ");
    model.add(tf.layers.flatten({}));
    console.log("relu begins. ");
    model.add(
      // First layer must have an input shape defined.
      tf.layers.dense({
        units: 128, // 输出的维度
        activation: "relu" // 激活函数
      })
    );
    console.log("softmax begins.");
    model.add(
      tf.layers.dense({
        units: 43, // 输出的维度
        activation: "softmax" // 分类算法
      })
    );

    return model;
  }

  static createDenseModel() {
    console.log("createDenseModel begins.");
    const model = tf.sequential();
    console.log("model add flatten.");
    model.add(tf.layers.flatten({ inputShape: [HEIGH, WIDTH, 1] }));
    console.log("model add relu. ");
    model.add(tf.layers.dense({ units: 32, activation: "relu" }));
    model.add(tf.layers.dense({ units: 64, activation: "relu" }));
    model.add(tf.layers.dense({ units: 128, activation: "relu" }));
    console.log("model add softmax. ");
    model.add(tf.layers.dense({ units: SIZE, activation: "softmax" }));
    return model;
  }

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
  }
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
