<template>
    <div>
        <van-cell-group>
            <van-cell title="TensorFlow向量（一维）学习"></van-cell>
        </van-cell-group>
        <van-panel title="向量运算" desc="tensorflow的向量运算的示例" status="示例">
            <van-radio-group v-model="radio">
                <van-row>
                    <van-col span="6">
                        <van-radio name="add">加</van-radio>
                    </van-col>
                    <van-col span="6">
                        <van-radio name="sub">减</van-radio>
                    </van-col>
                    <van-col span="6">
                        <van-radio name="mul">乘</van-radio>
                    </van-col>
                    <van-col span="6">
                        <van-radio name="div">除</van-radio>
                    </van-col>
                    <van-col span="6">
                        <van-radio name="max">max</van-radio>
                    </van-col>
                    <van-col span="6">
                        <van-radio name="min">min</van-radio>
                    </van-col>
                    <van-col span="6">
                        <van-radio name="sin">sin</van-radio>
                    </van-col>
                    <van-col span="6">
                        <van-radio name="abs">abs</van-radio>
                    </van-col>
                    <van-col span="6">
                        <van-radio name="cos">cos</van-radio>
                    </van-col>
                    <van-col span="6">
                        <van-radio name="tan">tan</van-radio>
                    </van-col>
                    <van-col span="6">
                        <van-radio name="exp">exp</van-radio>
                    </van-col>
                    <van-col span="6">
                        <van-radio name="log">log</van-radio>
                    </van-col>
                    <van-col span="8">
                        <van-radio name="sqrt">sqrt</van-radio>
                    </van-col>
                    <van-col span="8">
                        <van-radio name="square">square</van-radio>
                    </van-col>
                    <van-col span="8">
                        <van-radio name="cubic">cubic</van-radio>
                    </van-col>
                    </van-row>
                </van-radio-group>
            <van-field
                    v-model="vector1"
                    type="text"
                    label="向量1"
                    placeholder="请输入向量"
                    required></van-field>
            <van-field
                    v-model="vector2"
                    type="text"
                    label="向量2"
                    placeholder="请输入向量"
                    :disabled="rec2Disabled"
                    required></van-field>

            <div slot="footer">
                <van-button type="primary" :disabled="resultDisabled" @click="showResult">显示结果</van-button>
                <van-button type="danger" @click="clearResult">清 空</van-button>
            </div>
        </van-panel>
        <van-cell-group>
            <van-cell title="运行结果"></van-cell>
            <van-cell v-for="(item,index) in results" :key="index" :title="index+1" :value="item"></van-cell>
        </van-cell-group>

    </div>
</template>

<script>
import { Toast } from "vant";
import * as tf from "@tensorflow/tfjs";
export default {
  name: "operation",
  data() {
    return {
      radio: "",
      vector1: "",
      vector2: "",
      rec2Disabled: true,
      results: []
    };
  },
  computed: {
    resultDisabled() {
      console.log("this.vector1 is " + this.vector1);
      return !this.radio || this.vector1.length === 0;
    },
    flag() {
      const ops = ["add", "sub", "mul", "div", "max", "min"];
      // 1表示一元运算 2表示二元运算
      if (ops.indexOf(this.radio) === -1) {
        return 1;
      } else {
        return 2;
      }
    }
  },
  watch: {
    flag(newVal) {
      console.log("this.flag is " + this.flag);
      this.rec2Disabled = newVal !== 2;
    }
  },
  methods: {
    // 清空两个输入框的输入
    clearResult() {
      this.vector1 = "";
      this.vector2 = "";
    },
    // 利用tensorflow.js的运算函数，输出计算结果
    showResult() {
      let vector1;
      let vector2;

      if (this.flag === 1) {
        vector1 = this.vector1.split(",").map(Number);
        console.log("vector1 is ", vector1);
      }
      if (this.flag === 2) {
        vector1 = this.vector1.split(",").map(Number);
        vector2 = this.vector2.split(",").map(Number);
        if (vector1.length !== vector2.length) {
          Toast("输入的两个向量长度不一样");
        }
      }

      // 利用tensorflow.js的运算函数
      if (
        this.flag === 1 ||
        (this.flag === 2 && vector1.length === vector2.length)
      ) {
        const op = this.radio;
        const pow2 = tf.tensor(2).toInt(); // 计算平方
        const pow3 = tf.tensor(3).toInt(); // 计算三次方
        let res;
        // JavaScript的switch结构
        switch (op) {
          case "add": // 加法
            console.log(vector2);
            res = tf.tensor(vector1).add(tf.tensor(vector2));
            break;
          case "sub": // 减法
            res = tf.tensor(vector1).sub(tf.tensor(vector2));
            break;
          case "mul": // 乘法
            res = tf.tensor(vector1).mul(tf.tensor(vector2));
            break;
          case "div": // 除法
            res = tf.tensor(vector1).div(tf.tensor(vector2));
            break;
          case "max": // 两个向量中的最大值，element-wise
            res = tf.tensor(vector1).maximum(tf.tensor(vector2));
            break;
          case "min": // 两个向量中的最小值，element-wise
            res = tf.tensor(vector1).minimum(tf.tensor(vector2));
            break;
          case "abs": // 绝对值
            res = tf.tensor(vector1).abs();
            break;
          case "sin": // 正弦函数
            res = tf.tensor(vector1).sin();
            break;
          case "cos": // 余弦函数
            res = tf.tensor(vector1).cos();
            break;
          case "tan": // 正切函数
            res = tf.tensor(vector1).tan();
            break;
          case "exp": // 指数函数，以e为底
            res = tf.tensor(vector1).exp();
            break;
          case "log": // 对数函数，以e为底
            res = tf.tensor(vector1).log();
            break;
          case "sqrt": // 平方根
            res = tf.tensor(vector1).sqrt();
            break;
          case "square": // 平方
            res = tf.tensor(vector1).pow(pow2);
            break;
          case "cubic": // 三次方
            res = tf.tensor(vector1).pow(pow3);
            break;
          default:
            res = tf.tensor([]);
        }

        this.results = []; // 清空原有的数据
        // 输入计算结果
        for (let i = 0; i < res.shape; i++) {
          // $("tr").append("<td>" + res.get(i) + "</td>;");
          console.log("res.get(i) is ", res.get(i));
          this.results.push(res.get(i));
        }
        // this.result = result.join(",");
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../styles/grid.scss";
</style>
