<template>
    <div class="mobile-net">
        <section class='title-area'>
            <h1>TensorFlow.js: Using a pretrained MobileNet</h1>
        </section>

        <section>
            <p class='section-head'>Description</p>
            <p>
                This demo uses the pretrained MobileNet_25_224 model from Keras which you can find
                <a href="https://github.com/fchollet/deep-learning-models/releases/download/v0.6/mobilenet_2_5_224_tf.h5">here</a>.

                It is not trained to recognize human faces. For best performance, upload images of objects
                like piano, coffee mugs, bottles, etc. You can see all the objects types it has been trained to recognize in <a
                    href="https://github.com/tensorflow/tfjs-examples/blob/master/mobilenet/imagenet_classes.js">imagenet_classes.js</a>.
            </p>
        </section>
        <section>
            <p class='section-head'>Model Output</p>
            <div id="file-container" v-show="showFile">
                Upload an image: <input type="file" id="files" name="files[]" multiple @change="upImage"/>
            </div>

            <div ref="predictions">
                <div  v-for="(row, index) in predictions" :key="index">
                    <div v-for="(item,index) in row" :key="index">
                        {{item.className}}: {{item.probability}}
                    </div>
                    <img :src="row.src" width="224" height="224"/>
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
      showFile: false,
      showCat: false,
      predictions: []
    };
  },
  async created() {
    await this.mobilenetDemo();
  },
  mounted() {
    // const filesElement = document.getElementById("files");
    // filesElement.addEventListener("change", evt => {
    //   let files = evt.target.files;
    //   // Display thumbnails & issue call to predict each image.
    //   for (let i = 0, f; (f = files[i]); i++) {
    //     // Only process image files (skip non image files)
    //     if (!f.type.match("image.*")) {
    //       continue;
    //     }
    //     let reader = new FileReader();
    //     // const idx = i;
    //     // Closure to capture the file information.
    //     reader.onload = e => {
    //       // Fill the image & call predict.
    //       let img = document.createElement("img");
    //       img.src = e.target.result;
    //       img.width = IMAGE_SIZE;
    //       img.height = IMAGE_SIZE;
    //       img.onload = () => this.predict(img);
    //       console.log("img is ", img)
    //       this.$refs.predictions.appendChild(img);
    //     };
    //
    //     // Read in the image file as a data URL.
    //     reader.readAsDataURL(f);
    //   }
    // });
    // const predictionsElement = document.getElementById("predictions");
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
      // this.status("Loading model...");
      Toast.loading({
        duration: 0, // 持续展示 toast
        forbidClick: true, // 禁用背景点击
        loadingType: "spinner",
        message: "Loading model ..."
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

      // status("");
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

      // document.getElementById("file-container").style.display = "";
      this.showFile = true;
    },
    /**
     * Given an image element, makes a prediction through mobilenet returning the
     * probabilities of the top K classes.
     */
    async predict(imgElement) {
      console.log("imgElement is ", imgElement);
      // this.status("Predicting...");
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

        // Reshape to a single-element batch so we can pass it to predict.
        const batched = normalized.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3]);

        // Make a prediction through mobilenet.
        return this.mobilenet.predict(batched);
      });

      // Convert logits to probabilities and class names.
      const classes = await this.getTopKClasses(logits, TOPK_PREDICTIONS);
      console.log("imgElement.src is ", imgElement.src);
      classes.src = imgElement.src;
      console.log("classes is ", classes);
      this.predictions.unshift(classes);
      const totalTime = performance.now() - startTime;
      Toast.success(`Done in ${Math.floor(totalTime)}ms`);
      // Show the classes in the DOM.
      // this.showResults(imgElement, classes);
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
    // showResults(imgElement, classes) {
    //   // const predictionContainer = document.createElement("div");
    //   // predictionContainer.className = "pred-container";
    //   //
    //   // const imgContainer = document.createElement("div");
    //   // imgContainer.appendChild(imgElement);
    //   // predictionContainer.appendChild(imgContainer);
    //   //
    //   // const probsContainer = document.createElement("div");
    //   // for (let i = 0; i < classes.length; i++) {
    //   //   const row = document.createElement("div");
    //   //   row.className = "row";
    //   //
    //   //   const classElement = document.createElement("div");
    //   //   classElement.className = "cell";
    //   //   classElement.innerText = classes[i].className;
    //   //   row.appendChild(classElement);
    //   //
    //   //   const probsElement = document.createElement("div");
    //   //   probsElement.className = "cell";
    //   //   probsElement.innerText = classes[i].probability.toFixed(3);
    //   //   row.appendChild(probsElement);
    //   //
    //   //   probsContainer.appendChild(row);
    //   // }
    //   // predictionContainer.appendChild(probsContainer);
    //   //
    //   // predictionsElement.insertBefore(
    //   //   predictionContainer,
    //   //   predictionsElement.firstChild
    //   // );
    // }
  }
};
</script>

<style scoped>
</style>
