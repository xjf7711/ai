<template>
    <div class="mobile-net">
        <section class='title-area'>
            <h1>TensorFlow.js: Using a pretrained MobileNet</h1>
        </section>

        <!--<section>-->
            <!--<p class='section-head'>Description</p>-->
            <!--<p>-->
                <!--This demo uses the pretrained MobileNet_25_224 model from Keras which you can find-->
                <!--<a href="https://github.com/fchollet/deep-learning-models/releases/download/v0.6/mobilenet_2_5_224_tf.h5">here</a>.-->

                <!--It is not trained to recognize human faces. For best performance, upload images of objects-->
                <!--like piano, coffee mugs, bottles, etc. You can see all the objects types it has been trained to recognize in <a-->
                    <!--href="https://github.com/tensorflow/tfjs-examples/blob/master/mobilenet/imagenet_classes.js">imagenet_classes.js</a>.-->
            <!--</p>-->
        <!--</section>-->
        <section>
            <p class='section-head'>Model Output</p>
            <div id="file-container">
                Upload an image: <input type="file" id="files" name="files[]" multiple @change="upImage"/>
            </div>
            <div ref="predictions">
                <div  v-for="(row, index) in predictions" :key="index">
                    <div v-for="(item,index) in row" :key="index">
                        {{item.className}}: {{item.probability}}
                    </div>
                    <img :src="row.src" height="224"/>
                </div>
            </div>
            <img style="display: none" ref="cat" src="../../assets/images/cat.jpg" width="224" height="224"/>
        </section>

    </div>
</template>

<script>
import * as tf from "@tensorflow/tfjs";
import { IMAGENET_CLASSES } from "../../assets/js/imagenet_classes";
import { Toast } from "vant";
// const MOBILENET_MODEL_PATH =
//   // tslint:disable-next-line:max-line-length
//   "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json";

const IMAGE_SIZE = 224;
const TOPK_PREDICTIONS = 10;
export default {
  name: "MobileNet",
  data() {
    return {
      showCat: false,
      predictions: []
    };
  },
  created() {},
  async mounted() {
    await this.mobilenetDemo();
  },
  methods: {
    upImage(evt) {
      let files = evt.target.files;
      // Display thumbnails & issue call to predict each image.
      for (let i = 0, f; (f = files[i]); i++) {
        // Only process image files (skip non image files)
        if (!f.type.match("image.*")) {
          continue;
        }
        let reader = new FileReader();
        // const idx = i;
        // Closure to capture the file information.
        reader.onload = e => {
          // Fill the image & call predict.
          let img = document.createElement("img");
          img.src = e.target.result;
          img.width = IMAGE_SIZE;
          img.height = IMAGE_SIZE;
          img.onload = () => this.predict(img);
          // console.log("img is ", img)
          // this.$refs.predictions.insertBefore(img, this.$refs.predictions.firstChild);
        };

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
      }
    },
    async mobilenetDemo() {
      Toast.loading({
        mask: true,
        duration: 0, // 持续展示 toast
        forbidClick: true, // 禁用背景点击
        loadingType: "spinner",
        message: "Loading \n model..."
      });
      // mobilenet = await tf.loadModel(MOBILENET_MODEL_PATH);
      // mobilenet.save("indexeddb://mobilenet");

      this.mobilenet = await tf.loadModel("indexeddb://mobilenet");
      // Warmup the model. This isn't necessary, but makes the first prediction
      // faster. Call `dispose` to release the WebGL memory allocated for the return
      // value of `predict`.
      this.mobilenet
        .predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3]))
        .dispose();

      Toast.clear();
      // Make a prediction through the locally hosted cat.jpg.
      // const catElement = document.getElementById("cat");
      if (this.$refs.cat.complete && this.$refs.cat.naturalHeight !== 0) {
        this.predict(this.$refs.cat);
        // this.$refs.cat.style.display = "";
      } else {
        this.$refs.cat.onload = () => {
          this.predict(this.$refs.cat);
          // this.$refs.cat.style.display = "";
        };
      }
    },
    /**
     * Given an image element, makes a prediction through mobilenet returning the
     * probabilities of the top K classes.
     */
    async predict(imgElement) {
      console.log("predict begins. ");
      // console.log("imgElement is ", imgElement);
      Toast.loading({
        duration: 0,
        forbidClick: true,
        loadingType: "spinner",
        message: "Predicting..."
      });
      const startTime = performance.now();
      const logits = tf.tidy(() => {
        // tf.fromPixels() returns a Tensor from an image element.
        const img = tf.fromPixels(imgElement).toFloat();

        const offset = tf.scalar(127.5);
        // Normalize the image from [0, 255] to [-1, 1].
        const normalized = img.sub(offset).div(offset);
        console.log("normalized is ", normalized);
        // Reshape to a single-element batch so we can pass it to predict.
        const batched = normalized.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3]);
        console.log("batched is ", batched);
        // Make a prediction through mobilenet.
        return this.mobilenet.predict(batched);
      });
      console.log("logits is ", logits);
      // Convert logits to probabilities and class names.
      const classes = await this.getTopKClasses(logits, TOPK_PREDICTIONS);
      // console.log("imgElement.src is ", imgElement.src);
      classes.src = imgElement.src;
      console.log("classes is ", classes);
      this.predictions.unshift(classes);
      const totalTime = performance.now() - startTime;
      Toast.success(`Done in \n ${Math.floor(totalTime)} ms`);
    },

    /**
     * Computes the probabilities of the topK classes given logits by computing
     * softmax to get probabilities and then sorting the probabilities.
     * @param logits Tensor representing the logits from MobileNet.
     * @param topK The number of top predictions to show.
     */
    async getTopKClasses(logits, topK) {
      const values = await logits.data();

      const valuesAndIndices = [];
      for (let i = 0; i < values.length; i++) {
        valuesAndIndices.push({ value: values[i], index: i });
      }
      valuesAndIndices.sort((a, b) => {
        return b.value - a.value;
      });
      const topkValues = new Float32Array(topK);
      const topkIndices = new Int32Array(topK);
      for (let i = 0; i < topK; i++) {
        topkValues[i] = valuesAndIndices[i].value;
        topkIndices[i] = valuesAndIndices[i].index;
      }

      const topClassesAndProbs = [];
      for (let i = 0; i < topkIndices.length; i++) {
        topClassesAndProbs.push({
          className: IMAGENET_CLASSES[topkIndices[i]],
          probability: topkValues[i]
        });
      }
      return topClassesAndProbs;
    }
  }
};
</script>

<style scoped>
.toast {
  width: 300px;
}
.mobile-net >>> .van-toast--default {
  min-width: 120px;
  max-width: 300px;
}
</style>
