import * as tf from "@tensorflow/tfjs";
import { fingerprints } from "./train";
import { strToHexToArray } from "../../assets/js/parseNumber";

export function formatLabels(size) {
  const labels = [];
  fingerprints.forEach(item => {
    const uid = parseInt(item.user_sn);
    labels.push(uid);
  });
  const labelSet = new Set(labels);
  console.log("labelSet is ", labelSet);
  const labelArray = tf.tensor1d(Array.from(labelSet), "int32");
  console.log("labelArray is ", labelArray.dataSync());
  const oneHots = tf.oneHot(labelArray, 43);
  console.log("oneHots is ", oneHots.dataSync());
  Array.from(labelSet).forEach((item, index) => {
    const label = new Array(size).fill(0, 0, size);
    label[index] = 1;
    labels[item] = label;
  });
  // console.log("this.labels is ", this.labels);
  return labels;
}
export function loadData(fingerprints) {
  const xs = [];
  const labels = [];
  fingerprints.forEach(item => {
    // console.log("fingerprints begins.");
    // console.log(index, "index ");
    const feature = strToHexToArray(item.features.substr(0, 384));
    xs.push(feature);
    const uid = parseInt(item.user_sn);
    // // console.log("uid is ",typeof uid);
    const label = labels[uid];
    // console.log("label is ", label);
    labels.push(label);
  });
  // console.log("xs is ", xs);
  // console.log("labels is ", labels);
  // console.log("xs is  ", xs);
  // console.log("tf.tensor2d(xs).reshape([-1, 16, 24, 1]) is ", tf.tensor2d(xs).reshape([-1, 16, 24, 1]).dataSync());
  // const xsReshape = tf.tensor(xs).reshape([-1, 16, 24, 1]);
  return {
    xs: tf.tensor2d(xs).reshape([-1, 16, 24, 1]),
    labels: tf.tensor(labels)
  };
}
