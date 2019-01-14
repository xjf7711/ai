<template>
    <div>
        {{outData}}
    </div>
</template>

<script>
// 引用 TensorFlow.js
import * as tf from "@tensorflow/tfjs";
export default {
  name: "regression",
  data() {
    return {
      outData: null
    };
  },
  created() {},
  mounted() {
    this.learnLinear();
  },
  methods: {
    // 回归预测，数据集为：
    // 构造符合 Y=2X-1 的几个点，
    // 那么当 X 取 [-1, 0, 1, 2, 3, 4] 时，
    // y 为 [-3, -1, 1, 3, 5, 7]，
    async learnLinear() {
      console.log("learnLinear begins. ");
      // 建立模型
      // Define a model for linear regression.
      const model = tf.sequential();
      model.add(
        tf.layers.dense({
          units: 1,
          inputShape: [1]
        })
      );
      // 接着定义 loss 为 MSE 和 optimizer 为 SGD
      // 损失函数为均方差，优化器为sgd（梯度下降）
      // Prepare the model for training: Specify the loss and the optimizer.
      model.compile({
        loss: "meanSquaredError",
        optimizer: "sgd"
      });
      // 同时需要定义 input 的 tensor，X 和 y，以及它们的维度都是 [6, 1]
      // 待拟合的点序列为(-1,-3)(0,-1)(1,1),(2,3),(3,5),(4,7)
      // Train the model using the data.
      // Generate some synthetic data for training.
      const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4], [6, 1]);
      const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1]);
      // 然后用 fit 来训练模型，因为要等模型训练完才能预测，所以要用 await
      await model.fit(xs, ys, { epochs: 500 });
      // 训练结束后，用 predict 进行预测，输入的是 [1, 1] 维的 值为 10 的tensor
      // 训练模型，输入x=10。
      // Use the model to do inference on a data point the model hasn't seen before:
      // Open the browser devtools to see the output
      // this.outData = model.predict(tf.tensor2d([10], [1, 1]))[0];
      const predicts = model.predict(tf.tensor2d([10], [1, 1]));
      // console.log(predicts.get(0)); error
      model.predict(tf.tensor2d([10], [1, 1])).print();
      predicts.data().then(res => {
        console.log("res is ", res);
        this.outData = res[0];
      });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
