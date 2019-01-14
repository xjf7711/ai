<template>
    <van-cell-group>
        <van-field label="文字内容" required clearable
                   v-model='words' placeholder="请输入要合成的文字"/>
        <!--<button @click='tts'>合成</button>-->
        <!--<button @click='play' id='playBtn'>准备中</button>-->
        <!--<button @click='pause'>暂停</button>-->
        <!--<button @click='cancel'>取消</button>-->
        <br>
        <van-button type="primary" @click='getAudio'>播放声音</van-button>
        <br>
        <audio display="block" autoplay controls :src=audioUrl></audio>
        <br>
        <van-uploader accept="file" :after-read="getFile">
            <van-button text="上传文件" type="primary" />
        </van-uploader>
        <van-tag type="danger" v-if="audioText">
            {{audioText}}
        </van-tag>
    </van-cell-group>
</template>

<script>
import { Toast } from "vant";
import AIClass from "@/api/ai";
export default {
  name: "speech",
  data() {
    return {
      audio: null,
      audioText: "",
      playBtn: null,
      token: "",
      words: "开锁成功。",
      audioUrl: "",
      fileInfo: null
    };
  },
  created() {
    // const AI = new AIClass();
    AIClass.getToken();
  },
  methods: {
    getAudio() {
      AIClass.getAudio(this.words, this.token)
        .then(res => {
          console.log("getAudio res is ", res);
          this.audioUrl = res;
        })
        .catch(err => {
          console.log("err is ", err);
          Toast(err);
        });
    },
    getFile(fileObj) {
      console.log("getFile begins. file is ", fileObj);
      // const file = this.$refs.inputFile.files[0];
      const size = fileObj.file.size;
      // // console.log(
      // //   "this.$refs.inputFile.files[0] is ",
      // //   this.$refs.inputFile.files[0]
      // // );
      // const reader = new FileReader();
      // reader.onload = () => {
      //   // console.log("reader.onload begins. reader is ", reader);
      //   // console.log("reader.onload reader.result is ", reader.result); //或者 e.target.result都是一样的，都是base64码
      //   // console.log(e.target.result);
      //   // this.audioUrl = reader.result;
      //   // const audioStr = reader.result;
      //   //需要去掉base64格式的头部。data:audio/wav;base64,
      //   const audioStr = reader.result.split(",")[1];
      //   // console.log("audioArr is ", audioArr);
      //   AIClass.getText(audioStr, size).then(res => {
      //     console.log("TTS.vue getText res is ", res);
      //     this.audioText = res.result[0];
      //   });
      // };
      // // console.log("this.$refs.inputFile.files is ", this.$refs.inputFile.files)
      // reader.readAsDataURL(file);
      // AIClass.getText(this.$refs.inputFile.files[0]).then(res => {
      //   console.log("getFile AIClass.getText res is ", res);
      const audioStr = fileObj.content.split(",")[1];
      // console.log("audioArr is ", audioArr);
      AIClass.getText(audioStr, size).then(res => {
        console.log("TTS.vue getText res is ", res);
        this.audioText = res.result[0];
      });
      // });
    }
  }
};
</script>

<style lang="scss" scoped>
.speech {
  margin: 40px 0 55px 0;
}
</style>
