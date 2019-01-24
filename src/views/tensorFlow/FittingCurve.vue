<template>
    <div id="chart"></div>
</template>

<script>
import * as tf from "@tensorflow/tfjs";
import echarts from "echarts";
const a = tf.variable(tf.scalar(Math.random()));
const b = tf.variable(tf.scalar(Math.random()));
const c = tf.variable(tf.scalar(Math.random()));
const d = tf.variable(tf.scalar(Math.random()));
export default {
  name: "FittingCurve",
  data() {
    return {};
  },
  mounted() {
    this.learnCoefficients();
  },
  methods: {
    async learnCoefficients() {
      const trueCoefficients = { a: -0.8, b: -0.2, c: 0.9, d: 0.5 };
      // 生成有误差的训练数据
      const trainingData = this.generateData(100, trueCoefficients);
      const numIterations = 75;
      // 训练模型
      await this.train(trainingData.xs, trainingData.ys, numIterations);
      // 预测数据
      const predictionsAfter = this.predict(trainingData.xs);
      // 绘制散点图及拟合曲线
      await this.plotData(trainingData.xs, trainingData.ys, predictionsAfter);
      predictionsAfter.dispose();
    },
    async train(xs, ys, numIterations) {
      const learningRate = 0.5;
      const optimizer = tf.train.sgd(learningRate);
      for (let iter = 0; iter < numIterations; iter++) {
        optimizer.minimize(() => {
          const pred = this.predict(xs);
          return this.loss(pred, ys);
        });
        await tf.nextFrame();
      }
    },
    predict(x) {
      return tf.tidy(() => {
        return a
          .mul(x.pow(tf.scalar(3, "int32")))
          .add(b.mul(x.square()))
          .add(c.mul(x))
          .add(d);
      });
    },
    loss(prediction, labels) {
      const error = prediction
        .sub(labels)
        .square()
        .mean();
      return error;
    },
    async plotData(xs, ys, preds) {
      const xvals = await xs.data();
      const yvals = await ys.data();
      const predVals = await preds.data();

      const valuesBefore = Array.from(xvals).map((x, i) => {
        return [xvals[i], yvals[i]];
      });
      const valuesAfter = Array.from(xvals).map((x, i) => {
        return [xvals[i], predVals[i]];
      });
      // 二维数组排序
      valuesAfter.sort(function(x, y) {
        return x[0] - y[0];
      });
      const curveChart = echarts.init(this.$el);
      curveChart.setOption({
        xAxis: {
          min: -1,
          max: 1
        },
        yAxis: {
          min: 0,
          max: 1
        },
        series: [
          {
            symbolSize: 12,
            data: valuesBefore,
            type: "scatter"
          },
          {
            data: valuesAfter,
            encode: {
              x: 0,
              y: 1
            },
            type: "line"
          }
        ]
      });
    },
    generateData(numPoints, coeff, sigma = 0.04) {
      return tf.tidy(() => {
        const [a, b, c, d] = [
          tf.scalar(coeff.a),
          tf.scalar(coeff.b),
          tf.scalar(coeff.c),
          tf.scalar(coeff.d)
        ];

        const xs = tf.randomUniform([numPoints], -1, 1);
        const ys = a
          .mul(xs.pow(tf.scalar(3, "int32")))
          .add(b.mul(xs.square()))
          .add(c.mul(xs))
          .add(d)
          .add(tf.randomNormal([numPoints], 0, sigma));

        const ymin = ys.min();
        const ymax = ys.max();
        const yrange = ymax.sub(ymin);
        const ysNormalized = ys.sub(ymin).div(yrange);

        return {
          xs,
          ys: ysNormalized
        };
      });
    }
  }
};
</script>

<style lang="scss" scoped>
#chart {
  width: 100%;
  height: 500px;
  background-color: #d9d9d9;
}
</style>
