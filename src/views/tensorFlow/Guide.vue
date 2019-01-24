<template>
    <div>

    </div>
</template>

<script>
import * as tf from "@tensorflow/tfjs";
export default {
  name: "Guide",
  data() {
    return {};
  },
  created() {
    console.log("Guide created begins. ");
  },
  mounted() {
    // 学习速率为 0.9 时，迭代 200 次之后找到最小值 -0.16092407703399658。
    // -0.16092410683631897
    // -0.16092410683631897
    // this.minimize(200, 0.9).data().then(res => {
    //   console.log("mini is ", res[0]);
    // });
    this.tensor();
    this.minimize(200, 0.9).print();
    this.modelRun();
  },
  methods: {
    tensor() {
      // 1.张量（Tensor）
      // 创建一个张量：
      const tensor = tf.scalar(2);
      tensor.print();
      // 将数组转换为张量：
      const input = tf.tensor([2, 2]); // 这会创建一个恒定的数组张量 [2,2]
      input.print();
      // 使用 input.shape 获取张量大小
      const tensor_shape = tf.tensor([2, 2]).shape;
      console.log("tensor_shape is ", tensor_shape);
      // 创建具有特定大小的张量：
      const input1 = tf.zeros([2, 2]);
      input1.print();
      // 2.操作（Operators）
      // 获取到张量的平方：
      const a = tf.tensor([1, 2, 3]);
      a.square().print();
      // TensorFlow.js 还允许链接操作。例如，要评估我们使用的张量的二次幂：
      const x = tf.tensor([1, 2, 3]);
      const x2 = x.square().square();
      x2.print();

      // Tensor Disposal
      // 通常我们会生成大量的中间张量。例如，在前面的例子中，我们不需要生成 const x。为了做到这一点，我们可以调用 dispose()：
      const x1 = tf.tensor([1, 2, 3]);
      x1.dispose();
    },
    // TensorFlow.js 提供了一个特殊的操作 tidy() 来自动处理中间张量：
    f(x) {
      // 请注意，张量 y 的值将被处理，因为我们在评估 z 的值之后不再需要它。
      return tf.tidy(() => {
        const y = x.square();
        const z = x.mul(y);
        return z;
      });
    },
    fun(x) {
      const f1 = x.pow(tf.scalar(6, "int32")); // x^6
      const f2 = x.pow(tf.scalar(4, "int32")).mul(tf.scalar(2)); // 2x^4
      const f3 = x.pow(tf.scalar(2, "int32")).mul(tf.scalar(3)); // 3x^2
      const f4 = tf.scalar(1); // 1
      return f1
        .add(f2)
        .add(f3)
        .add(x)
        .add(f4);
    },
    minimize(epochs, lr) {
      let y = tf.variable(tf.scalar(2)); // initial value 以 a = 2 的初始值开始。
      const optim = tf.train.adam(lr); // gadient descent algorithm 使用 Adam 优化器
      for (let i = 0; i < epochs; i++) {
        // start minimiziation
        optim.minimize(() => this.fun(y));
      }
      return y;
    },
    // 一个简单的神经网络
    // 创建一个神经网络来学习 XOR，这是一个非线性操作。代码类似于 keras 实现。我们首先创建了两个输入和一个输出的训练集。

    createModel() {
      const model = tf.sequential();
      model.add(
        tf.layers.dense({ units: 8, inputShape: 2, activation: "tanh" })
      );
      model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));
      // 使用具有交叉熵损失的随机梯度下降。学习速率是 0.1
      model.compile({ optimizer: "sgd", loss: "binaryCrossentropy", lr: 0.1 });
      return model;
    },
    async modelRun() {
      console.log("modelRun begins.  ");
      // 创建两个具有不同非线性激活函数的密集层。
      const xs = tf.tensor2d([[0, 0], [0, 1], [1, 0], [1, 1]]);
      const ys = tf.tensor2d([[0], [1], [1], [0]]);
      const model = this.createModel();
      // 对模型进行 5000 次迭代
      await model.fit(xs, ys, {
        batchSize: 1,
        epochs: 5000
      });
      const saveResult = await model.save("indexeddb://my-model-1");
      console.log("saveResult is ", saveResult);
      model.predict(xs).print();
    }
  }
};
</script>

<style scoped lang="scss">
</style>
