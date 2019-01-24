<template>
    <div></div>
</template>

<script>
import * as tf from "@tensorflow/tfjs";
export default {
  name: "Conception",
  data() {
    return {};
  },
  mounted() {
    this.func1();
    this.func2();
    this.func3();
  },
  methods: {
    // 最主要的 Tensor 构造函数是 tf.tensor 函数
    func1() {
      console.log("func1 begins. ");
      // 2x3 Tensor
      const shape = [2, 3]; // 可以看做是两行三列组成
      const a = tf.tensor([1.0, 2.0, 3.0, 10.0, 20.0, 30.0], shape);
      a.print();
      // Output: [[1 , 2 , 3 ],
      //          [10, 20, 30]]

      // The shape can also be inferred:
      const b = tf.tensor([[1.0, 2.0, 3.0], [10.0, 20.0, 30.0]]);
      b.print();
      // Output: [[1 , 2 , 3 ],
      //          [10, 20, 30]]
    },
    // 在构建低阶张量时，为了提高代码的可读性，我们推荐使用下列的函数：
    func2() {
      console.log("func2 begins. ");
      // 0阶张量，即标量
      tf.scalar(3.14).print(); // 3.140000104904175， 默认dtype 是 float32
      tf.scalar(3.14, "float32").print(); // 3.140000104904175
      tf.scalar(3.14, "int32").print(); // 3
      tf.scalar(3.14, "bool").print(); // 1

      // 1阶张量
      tf.tensor1d([1, 2, 3]).print(); // [1, 2, 3]

      // 2阶张量
      // Pass a nested array.
      tf.tensor2d([[1, 2], [3, 4]]).print();
      // Pass a flat array and specify a shape.
      tf.tensor2d([1, 2, 3, 4], [2, 2]).print();
      // ouput
      //    [[1, 2],
      //   [3, 4]]

      // 3阶张量
      // Pass a nested array.
      tf.tensor3d([[[1], [2]], [[3], [4]]]).print();
      // Pass a flat array and specify a shape.
      tf.tensor3d([1, 2, 3, 4], [2, 2, 1]).print();
      // output
      //    [[[1],
      //      [2]],

      //     [[3],
      //      [4]]]

      // 4阶张量
      // Pass a nested array.
      tf.tensor4d([[[[1], [2]], [[3], [4]]]]).print();
      // Pass a flat array and specify a shape.
      tf.tensor4d([1, 2, 3, 4], [1, 2, 2, 1]).print();
      // output
      //    [[[[1],
      //       [2]],

      //      [[3],
      //       [4]]]]
    },
    func3() {
      // 所有元素的值重置为 0 和 1 方法：
      // 3x5 Tensor with all values set to 0
      const zeros = tf.zeros([3, 5]);
      zeros.print();
      // Output: [[0, 0, 0, 0, 0],
      //          [0, 0, 0, 0, 0],
      //          [0, 0, 0, 0, 0]]

      // 2X2 Tensor with all values set to 1
      tf.ones([2, 2]).print();
      // output
      //     [[1, 1],
      //     [1, 1]]
    }
  }
};
</script>

<style scoped>
</style>
