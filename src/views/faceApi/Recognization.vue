<template>
    <div>
        {{message}}
        <img id="myImg" src="/images/example.png" />
        <video id="myVideo" src="/media/example.mp4" />
        <canvas id="myCanvas" />
    </div>
</template>

<script>
import * as faceapi from "face-api.js";
import * as canvas from "canvas";
export default {
  name: "recognization",
  data() {
    return {
      message: "face recognization. "
    };
  },
  mounted() {},
  methods: {
    async recognization() {
      const MODEL_URL = "/models";
      await faceapi.loadModels(MODEL_URL);
      const minConfidence = 0.8;
      const input = document.getElementById("myImg");
      const fullFaceDescriptions = await faceapi.allFaces(input, minConfidence);
      const resized = fullFaceDescriptions.map(fd => fd.forSize(width, height));
      fullFaceDescriptions.forEach((fd, i) => {
        faceapi.drawDetection(canvas, fd.detection, { withScore: true });
        // faceapi.drawLandmarks(canvas, fd.landmarks, { drawLines: true })
      });

      // fetch images from url as blobs
      const blobs = await Promise.all(
        ["sheldon.png", "raj.png", "leonard.png", "howard.png"].map(async uri =>
          (await fetch(uri)).blob()
        )
      );
      // convert blobs (buffers) to HTMLImage elements
      const images = await Promise.all(
        blobs.map(async blob => await faceapi.bufferToImage(blob))
      );
      const refDescriptions = await Promise.all(
        images.map(async img => (await faceapi.allFaces(img))[0])
      );

      const refDescriptors = refDescriptions.map(fd => fd.descriptor);
      const sortAsc = (a, b) => a - b;
      const labels = ["sheldon", "raj", "leonard", "howard"];
      const results = fullFaceDescriptions.map((fd, i) => {
        const bestMatch = refDescriptors
          .map(refDesc => ({
            label: labels[i],
            distance: faceapi.euclideanDistance(fd.descriptor, refDesc)
          }))
          .sort(sortAsc)[0];
        return {
          detection: fd.detection,
          label: bestMatch.label,
          distance: bestMatch.distance
        };
      });
      // 0.6 is a good distance threshold value to judge
      // whether the descriptors match or not
      const maxDistance = 0.6;

      results.forEach(result => {
        faceapi.drawDetection(canvas, result.detection, { withScore: false });

        const text = `${
          result.distance < maxDistance ? result.className : "unkown"
        } (${result.distance})`;
        const { x, y, height: boxHeight } = detection.getBox();
        faceapi.drawText(canvas.getContext("2d"), x, y + boxHeight, text);
      });
    }
  }
};
</script>

<style scoped>
</style>
