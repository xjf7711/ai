<template>
    <div>
        <section class='title-area'>
            <h1>TensorFlow.js: Polynomial Regression</h1>
            <p class='subtitle'>Train a model to predict y-values for a cubic equation using a single layer perceptron</p>
        </section>

        <section>
            <p class="section-head">Description</p>
            <p>This model learns to generate a curve to match a polynomial equation. It uses a single layer perceptron with 4
                weights.</p>
        </section>

        <section>
            <p class="section-head">Data Generation</p>
            <p>We generate training data using the following function and co-efficients. You can edit the co-efficients to
                generate new data and fit the model.</p>
            <div class="equation-div">
                <span>y =</span>
                <input v-model="cubicCoeff" @keyup="fitAndRender"/>
                <span>* x^3 +</span>
                <input v-model="quadCoeff" @keyup="fitAndRender"/>
                <span>* x^2 +</span>
                <input v-model="linearCoeff" @keyup="fitAndRender"/>
                <span>* x +</span>
                <input v-model="constCoeff" @keyup="fitAndRender"/>
            </div>
        </section>

        <section>
            <p class="section-head">Training Parameters</p>
            <div class="input-div">
                <span>Learning rate:</span>
                <input v-model="learningRate" @keyup="fitAndRender"/>
            </div>
            <div class="input-div">
                <span>Epochs:</span>
                <input v-model="epochs" @keyup="fitAndRender"/>
            </div>
        </section>

        <section>
            <p class="section-head">Model Output</p>
            <p>We plot a curve using y-coordinate predictions the model has learned to make for each x-coordinate.</p>
            <div>
                <canvas id="canvas"></canvas>
            </div>
        </section>
    </div>
</template>

<script>
import {
  generateXYData,
  fitModel,
  drawXYData,
  renderModelPredictions
} from "../../assets/js/polynomial";
export default {
  name: "Polynomial",
  data() {
    return {
      canvas: null,
      cubicCoeff: "6e-6",
      quadCoeff: "-2e-3",
      linearCoeff: 0.1,
      constCoeff: 10,
      learningRate: 0.5,
      epochs: 40,
      order: 3
    };
  },
  mounted() {
    this.canvas = document.getElementById("canvas");
    // const cubicCoeffElement = document.getElementById("cubic-coeff");
    // const quadCoeffElement = document.getElementById("quad-coeff");
    // const linearCoeffElement = document.getElementById("linear-coeff");
    // const constCoeffElement = document.getElementById("const-coeff");
    //
    // const epochsElement = document.getElementById("epochs");
    // const learningRateElement = document.getElementById("learning-rate");
    //
    // cubicCoeffElement.addEventListener("keyup", fitAndRender);
    // quadCoeffElement.addEventListener("keyup", fitAndRender);
    // linearCoeffElement.addEventListener("keyup", fitAndRender);
    // constCoeffElement.addEventListener("keyup", fitAndRender);
    //
    // epochsElement.addEventListener("keyup", fitAndRender);
    // learningRateElement.addEventListener("keyup", fitAndRender);

    // this.fitAndRender();
  },
  methods: {
    // Fit a model and render the data and predictions.
    async fitAndRender() {
      const epochs = +this.epochs;
      const learningRate = +this.learningRate;
      if (!isFinite(epochs) || !isFinite(learningRate)) {
        return;
      }
      const coeffs = [
        +this.cubicCoeff,
        +this.quadCoeff,
        +this.linearCoeff,
        +this.constCoeff
      ];
      console.log("True coefficients: " + JSON.stringify(coeffs));
      let xyData = generateXYData(this.canvas, coeffs);
      drawXYData(this.canvas, xyData);
      const fitOutputs = await fitModel(
        xyData,
        epochs,
        learningRate,
        this.order
      );
      const model = fitOutputs[0];
      const xPowerMeans = fitOutputs[1];
      const xPowerStddevs = fitOutputs[2];
      const yMean = fitOutputs[3];
      const yStddev = fitOutputs[4];
      await renderModelPredictions(
        this.canvas,
        this.order,
        model,
        xPowerMeans,
        xPowerStddevs,
        yMean,
        yStddev
      );
    }
  }
};
</script>

<style scoped lang="scss">
#canvas {
  width: 100%;
  height: 300px;
}
</style>
