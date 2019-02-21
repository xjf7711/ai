import Vue from "vue";
import Router from "vue-router";
import Home from "src/views/Home.vue";
import Layout from "src/views/layout/Layout";

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
        import(/* webpackChunkName: "about" */ "src/views/About.vue")
    },
    {
      path: "/gdMap",
      name: "GDMap",
      meta: { title: "高德地图" },
      component: () => import("src/views/GDMap")
    },
    {
      path: "/speech",
      name: "speech",
      component: Layout,
      children: [
        {
          path: "tts",
          name: "SpeechTTS",
          meta: { title: "语音合成" },
          component: () => import("src/views/speech/TTS")
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
          component: () => import("src/views/face/Detect")
        },
        {
          path: "match",
          name: "FaceMatch",
          meta: { title: "人脸对比" },
          component: () => import("src/views/face/Match")
        }
      ]
    },
    {
      path: "/fingerprint",
      name: "fingerprint",
      component: Layout,
      children: [
        {
          path: "index",
          name: "fingerprintIndex",
          meta: { title: "指纹" },
          component: () => import("./views/fingerprint/Index")
        },
        {
          path: "dense-net",
          name: "denseNet",
          meta: { title: "深度神经网络" },
          component: () => import("./views/fingerprint/DenseNet")
        }
      ]
    },
    {
      path: "/tensorFlow",
      name: "tensorFlow",
      component: Layout,
      children: [
        {
          path: "addition-rnn",
          name: "additionRnn",
          meta: { title: "additionRnn" },
          component: () => import("./views/tensorFlow/addition-rnn/Index.vue")
        },
        {
          path: "boston-housing",
          name: "bostonHousing",
          meta: { title: "bostonHousing" },
          component: () => import("./views/tensorFlow/boston-housing/Index.vue")
        },
        {
          path: "cart-pole",
          name: "cartPole",
          meta: { title: "cartPole" },
          component: () => import("./views/tensorFlow/cart-pole/Index.vue")
        },
        {
          path: "mnist",
          name: "mnist",
          meta: { title: "Mnist" },
          component: () => import("./views/tensorFlow/mnist/Index.vue")
        },
        {
          path: "mobile-net",
          name: "mobileNet",
          meta: { title: "mobile-net" },
          component: () => import("./views/tensorFlow/MobileNet")
        },
        {
          path: "start",
          name: "start",
          meta: { title: "开始" },
          component: () => import("./views/tensorFlow/Start")
        },
        {
          path: "polynomial",
          name: "polynomial",
          meta: { title: "多项式" },
          component: () => import("./views/tensorFlow/Polynomial")
        },
        {
          path: "conception",
          name: "conception",
          meta: { title: "核心概念" },
          component: () => import("src/views/tensorFlow/Conception")
        },
        {
          path: "operation",
          name: "operation",
          meta: { title: "向量运算" },
          component: () => import("src/views/tensorFlow/Operation")
        },
        {
          path: "fittingCurve",
          name: "fittingCurve",
          meta: { title: "曲线拟合" },
          component: () => import("src/views/tensorFlow/FittingCurve")
        },
        {
          path: "poseNet",
          name: "poseNet",
          meta: { title: "姿势分析" },
          component: () => import("src/views/tensorFlow/PoseNet")
        },
        {
          path: "guide",
          name: "guide",
          meta: { title: "入门指南" },
          component: () => import("src/views/tensorFlow/Guide")
        }
      ]
    }
  ]
});
