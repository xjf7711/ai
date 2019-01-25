/**
* @license
* Copyright 2018 Google LLC. All Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http:// www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* ==============================================================================
*/

// This tiny example illustrates how little code is necessary build /
// train / predict from a model in TensorFlow.js.  Edit this code
// and refresh the index.html to quickly explore the API.

// Tiny TFJS train / predict example.
<template>
    <div>
        <h4>Tiny TFJS example<hr/></h4>
        <div v-if="!outPut">Training...</div>
        <div v-text="outPut"></div>
    </div>
</template>
<script>
// 引用 TensorFlow.js
import * as tf from "@tensorflow/tfjs";
export default {
  name: "Start",
  data() {
    return {
      outPut: ""
    };
  },
  mounted() {
    this.run();
  },
  methods: {
    // 回归预测，数据集为：
    // 构造符合 Y=2X-1 的几个点，
    // 那么当 X 取 [-1, 0, 1, 2, 3, 4] 时，
    // y 为 [-3, -1, 1, 3, 5, 7]，
    async run() {
      console.log("run begins. ");
      // 建立模型
      // Define a model for linear regression.
      // Create a simple model.
      const model = tf.sequential();
      model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
      // 接着定义 loss 为 MSE 和 optimizer 为 SGD
      // 损失函数为均方差，优化器为sgd（梯度下降）
      // Prepare the model for training: Specify the loss and the optimizer.
      model.compile({ loss: "meanSquaredError", optimizer: "sgd" });
      // 同时需要定义 input 的 tensor，X 和 y，以及它们的维度都是 [6, 1]
      // 待拟合的点序列为(-1,-3)(0,-1)(1,1),(2,3),(3,5),(4,7)
      // Train the model using the data.
      // Generate some synthetic data for training. (y = 2x - 1)
      const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4], [6, 1]);
      const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1]);

      // 然后用 fit 来训练模型，因为要等模型训练完才能预测，所以要用 await
      // 训练500次。
      // Train the model using the data.
      await model.fit(xs, ys, { epochs: 500 });
      // 调用存储在indexedDB中的训练好的模型。  下次用时直接引用。
      // model = tf.loadModel("indexeddb://linearRegression");
      // 保存model
      model.save("indexeddb://linearRegression");
      // 训练结束后，用 predict 进行预测，输入的是 [1, 1] 维的 值为 10 的tensor
      // 训练模型，输入x=10。
      // Use the model to do inference on a data point the model hasn't seen.
      // Open the browser devtools to see the output
      // Should print approximately 39.
      this.outPut = model.predict(tf.tensor2d([20], [1, 1])).dataSync();
    }
  }
};
</script>

<style scoped>
</style>
