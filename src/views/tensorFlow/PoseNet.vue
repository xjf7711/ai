<template>
    <div>
        <div id="info" style="display:none"></div>
        <div id="loading">
            Loading the model...
        </div>

        <div id="main" style="display:none">
            <video id="video" playsinline="" class="video"></video>
            <canvas id="output"></canvas>
        </div>
        <div class="footer">
            <div class="footer-text">
                <p>
                    PoseNet runs with either a <strong>single-pose</strong> or <strong>multi-pose</strong> detection algorithm. The single person pose detector is faster and more accurate but requires only one subject present in the image.
                    <br>
                    <br> The <strong>output stride</strong> and <strong>image scale factor</strong> have the largest effects on accuracy/speed. A <i>higher</i> output stride results in lower accuracy but higher speed. A <i>higher</i> image scale factor results in higher accuracy but lower speed.
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
export default {
  name: "PostNet",
  data() {
    return {};
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      // const net = await posenet.load();
      const imageScaleFactor = 0.5;
      const flipHorizontal = false;
      const outputStride = 16;
      const imageElement = document.getElementById("cat");
      // load the posenet model
      const net = await posenet.load();
      const pose = await net.estimateSinglePose(
        imageElement,
        scaleFactor,
        flipHorizontal,
        outputStride
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.video {
  -moz-transform: scaleX(-1);
  -o-transform: scaleX(-1);
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
  display: none;
}
</style>
