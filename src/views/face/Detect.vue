<template>
    <van-cell-group>
        <!--<van-button type="primary" text="人脸检测" @click="detectFace"></van-button>-->
        <!--<van-tag v-if="imageInfo">{{imageInfo}}</van-tag>-->
        <van-uploader :after-read="detectFace">
            <van-button type="danger">上传图片</van-button>
        </van-uploader>
        <img :src="imagePath" width="100%">
        <van-cell v-if="errorMsg" :title="errorMsg"></van-cell>
        <van-cell-group class="infos" v-if="imageInfo">
            <van-cell title="年龄" :value="imageInfo.age"/>
            <van-cell title="美丽程度" :value="imageInfo.beauty"/>
            <van-cell title="表情" :value="imageInfo.expression.type"/>
            <van-cell title="性别" :value="imageInfo.gender.type"/>
            <van-cell title="种族" :value="imageInfo.race.type"/>
        </van-cell-group>
    </van-cell-group>
</template>

<script>
import AIClass from "../../api/AIClass.js";
export default {
  name: "FaceDetect",
  data() {
    return {
      errorMsg: "",
      imagePath: "",
      imageInfo: {
        age: 0,
        beauty: 0,
        expression: {
          type: "无"
        },
        gender: {
          type: "无"
        },
        race: {
          type: "无"
        }
      }
    };
  },
  created() {
    AIClass.getToken();
  },
  methods: {
    detectFace(fileObj) {
      this.imagePath = fileObj.content;
      const imgBase64 = fileObj.content.split(",")[1];
      AIClass.detectFace(imgBase64).then(res => {
        console.log("detectFace res is ", res);
        if (0 === res.data["error_code"]) {
          this.imageInfo = res.data.result["face_list"][0];
        } else {
          this.errorMsg = res.data["error_msg"];
        }
      });
    },
    matchFace(fileObj) {
      this.imagePath = fileObj.content;
      const imgBase64 = fileObj.content.split(",")[1];
      AIClass.matchFace(imgBase64).then(res => {
        console.log("detectFace res is ", res);
        if (0 === res.data["error_code"]) {
          this.imageInfo = res.data.result["face_list"][0];
        } else {
          this.errorMsg = res.data["error_msg"];
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.infos {
  margin-bottom: 55px;
}
</style>
