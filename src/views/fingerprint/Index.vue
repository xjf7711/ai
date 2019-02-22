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
                <!--<input id="train-epochs" v-model="trainEpochs">-->
                <van-field label="epochs: " v-model="trainEpochs"></van-field>
            </div>
            <!--<button id="train" @click="handlerTrain" :disabled="isDisabled">Load Data and Train Model</button>-->
            <van-button type="primary" @click="handlerTrain" :disabled="isDisabled">Load Data and Train Model</van-button>
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
import Fingerprint from "./Fingerprint";
export default {
  name: "Fingerprint",
  data() {
    return {
      isDisabled: false,
      modelType: "ConvNet", // DenseNet,ConvNet
      trainEpochs: 50,
      fingerprint: null
    };
  },
  created() {
    console.log("created begins. ");
  },
  mounted() {
  },
  methods: {
    async handlerTrain() {
      console.log("handlerTrain begins.");
      this.fingerprint = new Fingerprint(this.modelType, this.trainEpochs);
      this.fingerprint.start();
      this.isDisabled = true;
      this.fingerprint.handlerTrain();
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
