<template>
    <div class='tfjs-example-container centered-container'>
        <section class='title-area'>
            <h1>TensorFlow.js: Addition RNN</h1>
            <p class='subtitle'>Train a model to learn addition by example</p>
        </section>
        <section>
            <p class='section-head'>Description</p>
            <p>
                This example trains a <a href="https://en.wikipedia.org/wiki/Recurrent_neural_network">Recurrent Neural Network</a>
                to do addition without explicitly defining the addition operator. Instead
                we feed it examples of sums and let it learn from that.
            </p>
            <p>
                Given a <span class='in-type'>string</span> like
                <span class='in-example'>3 + 4</span>, it will learn to output
                a <span class='out-type'>number</span>
                like <span class=out-example>7</span>.
            </p>
            <p>
                This example generates it's own training data programatically.
            </p>
        </section>

        <div>
            <section>
                <p class='section-head'>Instructions</p>
                <p>
                    Click the "Train Model" to start the model training button. You can edit the
                    parameters used to train the model as well.
                </p>
            </section>

            <div class="controls with-rows">
                <div class="settings">
                    <div class="setting">
                        <span class="setting-label">Digits:</span>
                        <input id="digits" value="2"/>
                    </div>
                    <div class="setting">
                        <span class="setting-label">Training Size:</span>
                        <input id="trainingSize" value="5000"/>
                    </div>
                    <div class="setting">
                        <span class="setting-label">RNN Type:</span>
                        <select id="rnnType">
                            <option value="SimpleRNN">SimpleRNN</option>
                            <option value="GRU">GRU</option>
                            <option value="LSTM">LSTM</option>
                        </select>
                    </div>
                    <div class="setting">
                        <span class="setting-label">RNN Layers:</span>
                        <input id="rnnLayers" value="1"/>
                    </div>
                    <div class="setting">
                        <span class="setting-label">RNN Hidden Layer Size:</span>
                        <input id="rnnLayerSize" value="128"/>
                    </div>
                    <div class="setting">
                        <span class="setting-label">Batch Size:</span>
                        <input id="batchSize" value="128"/>
                    </div>
                    <div class="setting">
                        <span class="setting-label">Train Iterations:</span>
                        <input id="trainIterations" value="100"/>
                    </div>
                    <div class="setting">
                        <span class="setting-label"># of test examples:</span>
                        <input id="numTestExamples" value="20"/>
                    </div>
                </div>

                <div>
          <span>
            <button class="btn-primary" id="trainModel" @click="runAdditionRNNDemo">Train Model</button>
          </span>
                </div>
            </div>


            <section>
                <p class='section-head'>Training Progress</p>
                <p id="trainStatus"></p>
                <div class='with-cols'>
                    <div id="lossChart"></div>
                    <div id="accuracyChart"></div>
                    <!-- <div id="examplesPerSecCanvas"></div> -->
                </div>
            </section>

            <section>
                <p class='section-head'>Test Examples</p>
                <p id="testExamples"></p>
            </section>
        </div>
    </div>
</template>
<script>
import AdditionRNNDemo from "./AdditionRNNDemo";

export default {
  name: "Index",
  mounted() {
  },
  methods: {
    async runAdditionRNNDemo() {
      const digits = +document.getElementById("digits").value;
      const trainingSize = +document.getElementById("trainingSize").value;
      const rnnTypeSelect = document.getElementById("rnnType");
      const rnnType = rnnTypeSelect.options[
        rnnTypeSelect.selectedIndex
      ].getAttribute("value");
      const layers = +document.getElementById("rnnLayers").value;
      const hiddenSize = +document.getElementById("rnnLayerSize").value;
      const batchSize = +document.getElementById("batchSize").value;
      const trainIterations = +document.getElementById("trainIterations").value;
      const numTestExamples = +document.getElementById("numTestExamples").value;

      // Do some checks on the user-specified parameters.
      const status = document.getElementById("trainStatus");
      if (digits < 1 || digits > 5) {
        status.textContent = "digits must be >= 1 and <= 5";
        return;
      }
      const trainingSizeLimit = Math.pow(Math.pow(10, digits), 2);
      if (trainingSize > trainingSizeLimit) {
        status.textContent =
          `With digits = ${digits}, you cannot have more than ` +
          `${trainingSizeLimit} examples`;
        return;
      }

      const demo = new AdditionRNNDemo(
        digits,
        trainingSize,
        rnnType,
        layers,
        hiddenSize
      );
      await demo.train(trainIterations, batchSize, numTestExamples);
    }
  }
};
</script>

<style scoped lang="scss">
.setting {
  padding: 6px;
}

#trainModel {
  margin-top: 12px;
}

.setting-label {
  display: inline-block;
  width: 12em;
  background-color: green;
}

.answer-correct {
  color: green;
}

.answer-wrong {
  color: red;
}
</style>
