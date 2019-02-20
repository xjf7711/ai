<template>
    <div>
        <!--<section class='title-area'>-->
            <!--<h1>TensorFlow.js: Digit Recognizer with Layers</h1>-->
            <!--<p class='subtitle'>Train a model to recognize handwritten digits from the MNIST database using the tf.layers-->
                <!--api.-->
            <!--</p>-->
        <!--</section>-->

        <!--<section>-->
            <!--<p class='section-head'>Description</p>-->
            <!--<p>-->
                <!--This examples lets you train a handwritten digit recognizer using either a Convolutional Neural Network-->
                <!--(also known as a ConvNet or CNN) or a Fully Connected Neural Network (also known as a DenseNet).-->
            <!--</p>-->
            <!--<p>The MNIST dataset is used as training data.</p>-->
        <!--</section>-->

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
import { Toast } from "vant";
import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
// This is a helper class for loading and managing MNIST data specifically.
// It is a useful example of how you could create your own data manager class
// for arbitrary data though. It's worth a look :)
import { IMAGE_H, IMAGE_W, MnistData } from "./MnistData";
const lossValues = [[], []];
const accuracyValues = [[], []];
export default {
  name: "Mnist",
  data() {
    return {
      message: "",
      isDisabled: false,
      data: null,
      lossLabel: null,
      accuracyLabel: null,
      modelType: "ConvNet",
      trainEpochs: 3
    };
  },
  mounted() {
    // this.setTrainButtonCallback(async () => {
    //   console.log("setTrainButtonCallback begins. ");
    //   // ui.logStatus("Loading MNIST data...");
    //   Toast("Loading MNIST data...");
    //   await this.load();
    //
    //   // ui.logStatus("Creating model...");
    //   Toast("Creating model...");
    //   const model = this.createModel();
    //   model.summary();
    //
    //   // ui.logStatus("Starting model training...");
    //   Toast("Starting model training...");
    //   await this.train(model, () => this.showPredictions(model));
    // });
  },
  methods: {
    async handlerTrain() {
      console.log("handlerTrain begins.");
      // ui.logStatus("Loading MNIST data...");
      Toast("Loading MNIST data...");
      this.isDisabled = true;
      await this.load();
      console.log("this.data is ", this.data);
      // ui.logStatus("Creating model...");
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
      // Now that we've defined our model, we will define our optimizer. The
      // optimizer will be used to optimize our model's weight values during
      // training so that we can decrease our training loss and increase our
      // classification accuracy.

      // The learning rate defines the magnitude by which we update our weights each
      // training step. The higher the value, the faster our loss values converge,
      // but also the more likely we are to overshoot optimal parameters
      // when making an update. A learning rate that is too low will take too long
      // to find optimal (or good enough) weight parameters while a learning rate
      // that is too high may overshoot optimal parameters. Learning rate is one of
      // the most important hyperparameters to set correctly. Finding the right
      // value takes practice and is often best found empirically by trying many
      // values.
      // const LEARNING_RATE = 0.01;

      // We are using rmsprop as our optimizer.
      // An optimizer is an iterative method for minimizing an loss function.
      // It tries to find the minimum of our loss function with respect to the
      // model's weight parameters.
      const optimizer = "rmsprop";

      // We compile our model by specifying an optimizer, a loss function, and a
      // list of metrics that we will use for model evaluation. Here we're using a
      // categorical crossentropy loss, the standard choice for a multi-class
      // classification problem like MNIST digits.
      // The categorical crossentropy loss is differentiable and hence makes
      // model training possible. But it is not amenable to easy interpretation
      // by a human. This is why we include a "metric", namely accuracy, which is
      // simply a measure of how many of the examples are classified correctly.
      // This metric is not differentiable and hence cannot be used as the loss
      // function of the model.
      model.compile({
        optimizer,
        loss: "categoricalCrossentropy",
        metrics: ["accuracy"]
      });

      // Batch size is another important hyperparameter. It defines the number of
      // examples we group together, or batch, between updates to the model's
      // weights during training. A value that is too low will update weights using
      // too few examples and will not generalize well. Larger batch sizes require
      // more memory resources and aren't guaranteed to perform better.
      const batchSize = 320;

      // Leave out the last 15% of the training data for validation, to monitor
      // overfitting during training.
      const validationSplit = 0.15;

      // Get number of training epochs from the UI.
      // const trainEpochs = ui.getTrainEpochs();

      // We'll keep a buffer of loss and accuracy values over time.
      let trainBatchCount = 0;

      const trainData = this.data.getTrainData();
      console.log("trainData  is ", trainData);
      const testData = this.data.getTestData();
      console.log("testData  is ", testData);
      console.log("trainData.xs.shape[0] is ", trainData.xs.shape[0]);
      const totalNumBatches =
        Math.ceil((trainData.xs.shape[0] * (1 - validationSplit)) / batchSize) *
        this.trainEpochs;
      console.log("totalNumBatches is ", totalNumBatches);
      // During the long-running fit() call for model training, we include
      // callbacks, so that we can plot the loss and accuracy values in the page
      // as the training progresses.
      let valAcc;
      console.log("model.fit begins. ");
      console.log("trainData.xs is ", trainData.xs);
      console.log("trainData.labels is ", trainData.labels)
      await model.fit(trainData.xs, trainData.labels, {
        batchSize,
        validationSplit,
        epochs: this.trainEpochs,
        callbacks: {
          onBatchEnd: async (batch, logs) => {
            trainBatchCount++;
            // ui.logStatus(
            //   `Training... (` +
            //     `${((trainBatchCount / totalNumBatches) * 100).toFixed(1)}%` +
            //     ` complete). To stop training, refresh or close page.`
            // );
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
      model.save("indexeddb://mnist");
      this.isDisabled = false;
      const testResult = model.evaluate(testData.xs, testData.labels);
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
    },

    /**
     * Creates a convolutional neural network (Convnet) for the MNIST data.
     * @returns {tf.Model} An instance of tf.Model.
     */
    createConvModel() {
      // Create a sequential neural network model. tf.sequential provides an API
      // for creating "stacked" models where the output from one layer is used as
      // the input to the next layer.
      const model = tf.sequential();

      // The first layer of the convolutional neural network plays a dual role:
      // it is both the input layer of the neural network and a layer that performs
      // the first convolution operation on the input. It receives the 28x28 pixels
      // black and white images. This input layer uses 16 filters with a kernel size
      // of 5 pixels each. It uses a simple RELU activation function which pretty
      // much just looks like this: __/
      model.add(
        tf.layers.conv2d({
          inputShape: [IMAGE_H, IMAGE_W, 1],
          kernelSize: 3,
          filters: 16,
          activation: "relu"
        })
      );

      // After the first layer we include a MaxPooling layer. This acts as a sort of
      // downsampling using max values in a region instead of averaging.
      // https://www.quora.com/What-is-max-pooling-in-convolutional-neural-networks
      model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

      // Our third layer is another convolution, this time with 32 filters.
      model.add(
        tf.layers.conv2d({ kernelSize: 3, filters: 32, activation: "relu" })
      );

      // Max pooling again.
      model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

      // Add another conv2d layer.
      model.add(
        tf.layers.conv2d({ kernelSize: 3, filters: 32, activation: "relu" })
      );

      // Now we flatten the output from the 2D filters into a 1D vector to prepare
      // it for input into our last layer. This is common practice when feeding
      // higher dimensional data to a final classification output layer.
      model.add(tf.layers.flatten({}));

      model.add(tf.layers.dense({ units: 64, activation: "relu" }));

      // Our last layer is a dense layer which has 10 output units, one for each
      // output class (i.e. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9). Here the classes actually
      // represent numbers, but it's the same idea if you had classes that
      // represented other entities like dogs and cats (two output classes: 0, 1).
      // We use the softmax function as the activation for the output layer as it
      // creates a probability distribution over our 10 classes so their output
      // values sum to 1.
      model.add(tf.layers.dense({ units: 10, activation: "softmax" }));

      return model;
    },

    /**
     * Creates a model consisting of only flatten, dense and dropout layers.
     *
     * The model create here has approximately the same number of parameters
     * (~31k) as the convnet created by `createConvModel()`, but is
     * expected to show a significantly worse accuracy after training, due to the
     * fact that it doesn't utilize the spatial information as the convnet does.
     *
     * This is for comparison with the convolutional network above.
     *
     * @returns {tf.Model} An instance of tf.Model.
     */
    createDenseModel() {
      const model = tf.sequential();
      model.add(tf.layers.flatten({ inputShape: [IMAGE_H, IMAGE_W, 1] }));
      model.add(tf.layers.dense({ units: 42, activation: "relu" }));
      model.add(tf.layers.dense({ units: 10, activation: "softmax" }));
      return model;
    },

    /**
     * Show predictions on a number of test examples.
     * @param {tf.Model} model The model to be used for making the predictions.
     */
    async showPredictions(model) {
      const testExamples = 100;
      const examples = this.data.getTestData(testExamples);
      console.log("examples is ", examples);
      // Code wrapped in a tf.tidy() function callback will have their tensors freed
      // from GPU memory after execution without having to call dispose().
      // The tf.tidy callback runs synchronously.
      tf.tidy(() => {
        const output = model.predict(examples.xs);

        // tf.argMax() returns the indices of the maximum values in the tensor along
        // a specific axis. Categorical classification tasks like this one often
        // represent classes as one-hot vectors. One-hot vectors are 1D vectors with
        // one element for each output class. All values in the vector are 0
        // except for one, which has a value of 1 (e.g. [0, 0, 0, 1, 0]). The
        // output from model.predict() will be a probability distribution, so we use
        // argMax to get the index of the vector element that has the highest
        // probability. This is our prediction.
        // (e.g. argmax([0.07, 0.1, 0.03, 0.75, 0.05]) == 3)
        // dataSync() synchronously downloads the tf.tensor values from the GPU so
        // that we can use them in our normal CPU JavaScript code
        // (for a non-blocking version of this function, use data()).
        const axis = 1;
        const labels = Array.from(examples.labels.argMax(axis).dataSync());
        const predictions = Array.from(output.argMax(axis).dataSync());

        this.showTestResults(examples, predictions, labels);
      });
    },
    draw(image, canvas) {
      const [width, height] = [28, 28];
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
    async load() {
      console.log("load begins. ");
      this.data = new MnistData();
      console.log("this.data is ", this.data);
      await this.data.load();
    },
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

<style scoped lang="scss">
#train {
  margin-top: 10px;
}

label {
  display: inline-block;
  width: 250px;
  padding: 6px 0 6px 0;
}

.canvases {
  display: inline-block;
}

.prediction-canvas {
  width: 100px;
}

.pred {
  font-size: 20px;
  line-height: 25px;
  width: 100px;
}

.pred-correct {
  background-color: #00cf00;
}

.pred-incorrect {
  background-color: red;
}

.pred-container {
  display: inline-block;
  width: 100px;
  margin: 10px;
}
</style>
