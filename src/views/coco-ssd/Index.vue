<template>
    <div>
        <h1>TensorFlow.js Object Detection</h1>
        <select id='base_model' @change="select">
            <option value="lite_mobilenet_v2">SSD Lite Mobilenet V2</option>
            <option value="mobilenet_v1">SSD Mobilenet v1</option>
            <option value="mobilenet_v2">SSD Mobilenet v2</option>
        </select>
        <button type="button" id="run" @click="run">Run</button>
        <button type="button" id="toggle" @click="toggle">Toggle Image</button>
        <div>
            <img id="image" ref="image" :src="imgPath"/>
            <canvas id="canvas" width="600" height="399"></canvas>
        </div>
    </div>
</template>

<script>
import * as cocoSsd from "@tensorflow-models/coco-ssd";

import imageURL from "./demo/image1.jpg";
import image2URL from "./demo/image2.jpg";
export default {
  name: "Index",
  data() {
    return {
      selected: "lite_mobilenet_v2",
      imgPath: imageURL,
      modelPromise: null
    };
  },
  watch: {
    selected(newVal, oldVal) {
      console.log(newVal, oldVal);
    }
  },
  mounted() {
    this.modelPromise = cocoSsd.load();
    console.log("modelPromise is ", this.modelPromise);
  },
  methods: {
    toggle() {
      this.imgPath = this.$refs.image.src.endsWith(imageURL)
        ? image2URL
        : imageURL;
    },
    async select(event) {
      const model = await this.modelPromise;
      model.dispose();
      this.modelPromise = cocoSsd.load(
        event.srcElement.options[event.srcElement.selectedIndex].value
      );
    },
    async run() {
      // const image = document.getElementById("image");
      // image.src = imageURL;
      const model = await this.modelPromise;
      console.log("model loaded");
      console.log("model is ", model);
      // console.log("image is ", this.$refs.image);
      console.time("predict1");
      const result = await model.detect(this.$refs.image);
      // console.log("result is ", result);
      console.timeEnd("predict1");

      const c = document.getElementById("canvas");
      console.log("c is ", c);
      const context = c.getContext("2d");
      context.drawImage(this.$refs.image, 0, 0);
      context.font = "10px Arial";

      console.log("number of detections: ", result.length);
      for (let i = 0; i < result.length; i++) {
        context.beginPath();
        context.rect(...result[i].bbox);
        context.lineWidth = 1;
        context.strokeStyle = "green";
        context.fillStyle = "green";
        context.stroke();
        context.fillText(
          result[i].score.toFixed(3) + " " + result[i].class,
          result[i].bbox[0],
          result[i].bbox[1] > 10 ? result[i].bbox[1] - 5 : 10
        );
      }
    }
  }
};
</script>

<style scoped>
</style>
