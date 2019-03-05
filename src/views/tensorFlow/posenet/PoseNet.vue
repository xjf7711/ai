<template>
    <div>
        <div id="info" style="display:none"></div>
        <div id="loading" v-if="isShow">
            Loading the model...
        </div>
        <div id='main' style='display:none'>
            <video id="video" playsinline style=" -moz-transform: scaleX(-1);
        -o-transform: scaleX(-1);
        -webkit-transform: scaleX(-1);
        transform: scaleX(-1);
        display: none;
        ">
            </video>
            <canvas id="output" />
        </div>

        <img id='cat' ref="cat" src='./onewoman.jpeg' width="100%">
        <!--<img alt="Vue logo" src="../../assets/logo.png">-->
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
import * as posenet from "@tensorflow-models/posenet";
// import * as imgUrl from "../../assets/images/cat.jpg";
export default {
  name: "PostNet",
  data() {
    return {
      // imgUrl: BASE_URL + "cat.jpg"
      isShow: false
    };
  },
  mounted() {
    // const imageElement = document.getElementById("cat");

    const pose = this.estimatePoseOnImage(this.$refs.cat);

    console.log("pose is ", pose);
  },
  methods: {
    async estimatePoseOnImage(imageElement) {
      this.isShow = true;
      const imageScaleFactor = 0.5;
      const outputStride = 16;
      const flipHorizontal = false;
      // load the posenet model from a checkpoint
      const net = await posenet.load();
      this.isShow = false;
      return await net.estimateSinglePose(
        imageElement,
        imageScaleFactor,
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
