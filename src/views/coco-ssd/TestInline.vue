<template>
    <div>
        <!-- Replace this with your image. Make sure CORS settings allow reading the image! -->
        <img id="img" ref="img" src="./demo/cat.jpg" alt="" @click="predict"/>
    </div>
</template>

<script>
import * as cocoSsd from "@tensorflow-models/coco-ssd";
export default {
  name: "TestInline",
  async mounted() {
    // const img = document.getElementById("img");
    // // Load the model.
    // cocoSsd.load().then(model => {
    //   console.log("cocoSsd loaded, and model is ", model);
    //   // detect objects in the image.
    //   model.detect(img).then(predictions => {
    //     console.log("Predictions: ", predictions);
    //   });
    // });
  },
  methods: {
    async predict() {
      // Load the model.
      const model = await cocoSsd.load();
      console.log("cocoSsd loaded, and model is ", model);

      // Classify the image.
      const predictions = await model.detect(this.$refs.img);

      console.log("Predictions: ");
      console.log(predictions);
    }
  }
};
</script>

<style scoped>
</style>
