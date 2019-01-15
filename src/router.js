import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Layout from "./views/layout/Layout";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "./views/About.vue")
    },
    {
      path: "/speech",
      name: "AI",
      component: Layout,
      children: [
        {
          path: "tts",
          name: "SpeechTTS",
          meta: { title: "语音合成" },
          component: () => import("@/views/speech/TTS")
        }
      ]
    },
    {
      path: "/face",
      name: "face",
      component: Layout,
      children: [
        {
          path: "detect",
          name: "FaceDetect",
          meta: { title: "人脸识别" },
          component: () => import("@/views/face/Detect")
        },
        {
          path: "match",
          name: "FaceMatch",
          meta: { title: "人脸对比" },
          component: () => import("@/views/face/Match")
        }
      ]
    },
    {
      path: "/tensorFlow",
      name: "tensorFlow",
      component: Layout,
      children: [
        {
          path: "regression",
          name: "regression",
          meta: { title: "回归分析" },
          component: () => import("@/views/tensorflow/Regression")
        },
        {
          path: "operation",
          name: "operation",
          meta: { title: "向量运算" },
          component: () => import("@/views/tensorflow/Operation")
        },
        {
          path: "fittingCurve",
          name: "fittingCurve",
          meta: { title: "曲线拟合" },
          component: () => import("@/views/tensorflow/FittingCurve")
        },
        {
          path: "poseNet",
          name: "poseNet",
          meta: { title: "姿势分析" },
          component: () => import("@/views/tensorflow/PoseNet")
        },
        {
          path: "guide",
          name: "guide",
          meta: { title: "入门指南" },
          component: () => import("@/views/tensorflow/Guide")
        }
      ]
    }
  ]
});
