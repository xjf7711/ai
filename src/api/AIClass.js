/**
 * 百度AI接口
 * */

import qs from "qs";
import fetch from "../assets/js/fetch";

export default class AIClass {
  constructor() {
    // 可以验证全局token是否过期。
    this.token = "";
  }
  /**
   * 获取token
   * 鉴权认证机制
   * 需要检查token是否过期。如果过期则重新请求。如果没有则使用原来的token。
   * token的存储问题：单机可以用localStorage,但多机请求时，需要用Redis或MySQL等数据库。
   * 这里暂时直接请求。后面要添加时间验证。
   * */
  static getToken() {
    const tokenObj = JSON.parse(localStorage.getItem("baidu_ai_token"));
    console.log("tokenObj is ", tokenObj);
    if (tokenObj && new Date().getTime() < tokenObj["expire_time"]) {
      this.token = tokenObj["access_token"];
      return;
    }
    // 暂时只有getToken用到configs。
    const configs = {
      appKey: "XAWM18vZbOGQPyfUGc3KTNGR",
      appSecret: "2Pc5B4L52Fqr0YuuBfKiTdGydAG6xImI"
    };
    const params = {
      grant_type: "client_credentials",
      client_id: configs.appKey,
      client_secret: configs.appSecret
    };
    return fetch({
      method: "get",
      baseURL:
        process.env.NODE_ENV === "production"
          ? "https://openapi.baidu.com"
          : "", // 不支持跨域
      url:
        process.env.NODE_ENV === "production"
          ? "/oauth/2.0/token"
          : "/api/getToken",
      params
    })
      .then(res => {
        // console.log("api getToken res is ", res);
        this.token = res.data["access_token"];
        res.data["expire_time"] = new Date().getTime() + res.data["expires_in"];
        console.log('res.data["expire_time"] is ', res.data["expire_time"]);
        localStorage.setItem("baidu_ai_token", JSON.stringify(res.data));
        // return Promise.resolve(res.data);
      })
      .catch(err => {
        console.log("error is ", err);
        // return Promise.reject(err);
      });
  }

  /**
   * 合成语音
   * 推荐使用post方法请求。
   * 但是post方法请求时data的参数需要用qs.stringify转换。
   * 另外，需要设置responseType为blob。
   * {Objdec} data
   * tex	必填	合成的文本，使用UTF-8编码。小于2048个中文字或者英文数字。
   *      由于urlencode有两个标准 RFC 1738和RFC 3986. 百度为了更好地兼容，
   *      支持1次及2次urlencode， 其中2次urlencode可以覆盖全部的特殊字符。
   *      因而推荐传递tex 参数时做2次urlencode编码。（文本在百度服务器内转换为GBK后，长度必须小于4096字节）
   * tok	必填	开放平台获取到的开发者access_token（见上面的“鉴权认证机制”段落）
   * cuid	必填	用户唯一标识，用来计算UV值。建议填写能区分用户的机器 MAC 地址或 IMEI 码，长度为60字符以内
   * ctp	必填	客户端类型选择，web端填写固定值1
   * lan	必填	固定值zh。语言选择,目前只有中英文混合模式，填写固定值zh
   * spd	选填	语速，取值0-15，默认为5中语速
   * pit	选填	音调，取值0-15，默认为5中语调
   * vol	选填	音量，取值0-15，默认为5中音量
   * per	选填	发音人选择, 0为普通女声，1为普通男生，3为情感合成-度逍遥，4为情感合成-度丫丫，默认为普通女声
   * aue	选填	3为mp3格式(默认)； 4为pcm-16k；5为pcm-8k；6为wav（内容同pcm-16k）; 注意aue=4或者6是语音识别要求的格式，但是音频内容不是语音识别要求的自然人发音，所以识别效果会受影响。
   * */
  static getAudio(words) {
    const data = {
      tex: encodeURIComponent(words),
      // 请参照上一章节说明获取的access_token
      tok: this.token,
      cuid: this.token, // 暂时用token替代。
      ctp: 1,
      lan: "zh",
      spd: 5,
      pit: 5,
      vol: 15,
      per: 4
    };
    return fetch({
      method: "post",
      //返回数据的格式，可选值为arraybuffer,blob,document,json,text,stream，默认值为json
      responseType: "blob",
      baseURL:
        process.env.NODE_ENV === "production" ? "http://tsn.baidu.com" : "",
      url:
        process.env.NODE_ENV === "production" ? "/text2audio" : "/api/getAudio",
      data: qs.stringify(data)
    }).then(res => {
      // console.log("api getAudio res is ", res);
      // console.log("res.type is ", res.type);
      if ("audio/mp3" === res.data.type) {
        // console.log("URL.creatObjectURL is ", URL.createObjectURL(res.data));
        // this.audioUrl = URL.createObjectURL(res.data);
        return Promise.resolve(URL.createObjectURL(res.data));
      } else if ("application/json" === res.data.type) {
        // 用来处理blob数据
        const frd = new FileReader();
        frd.readAsText(res.data);
        frd.onload = () => {
          const errMsg = JSON.parse(frd.result); // string
          // console.error("error is ", errMsg);
          // Toast(errMsg["err_msg"]);
          return Promise.reject(errMsg);
        };
      }
    });
  }
  /**
   * 语音识别 asr
   * format	string	必填	语音文件的格式，pcm 或者 wav 或者 amr。不区分大小写。推荐pcm文件
   * rate	int	必填	采样率，16000，固定值
   * channel	string	必填	声道数，仅支持单声道，请填写固定值 1
   * cuid	string	必填	用户唯一标识，用来区分用户，计算UV值。建议填写能区分用户的机器 MAC 地址或 IMEI 码，长度为60字符以内。
   * token	string	必填	开放平台获取到的开发者[access_token]获取 Access Token "access_token")
   * dev_pid	int	选填	不填写lan参数生效，都不填写，默认1537（普通话 输入法模型），dev_pid参数见本节开头的表格
   * lan	string	选填，废弃参数	历史兼容参数，请使用dev_pid。如果dev_pid填写，该参数会被覆盖。语种选择,输入法模型，默认中文（zh）。 中文=zh、粤语=ct、英文=en，不区分大小写。
   * speech	string	选填	本地语音文件的的二进制语音数据 ，需要进行base64 编码。与len参数连一起使用。
   * len	int	选填	本地语音文件的的字节数，单位字节
   * */
  static getText(audio, size) {
    // console.log("audio type is ", typeof audio);
    // const size = file.size;
    // const reader = new FileReader();
    // reader.onload = () => {
    //   // console.log("reader.onload begins. reader is ", reader);
    //   console.log("reader.onload reader.result is ", reader.result); //或者 e.target.result都是一样的，都是base64码
    //   // console.log(e.target.result);
    //   // AIClass.getText(reader.result, size);
    const data = {
      format: "pcm",
      rate: 16000, //前方有坑，请绕行：此处文档参数16000，达不到这种高保真音频，则使用8000
      dev_pid: 1536, //普通话
      channel: 1, //固定写法（声道）
      token: this.token, //获取到的token值
      cuid: "00:05:5D:0E:C7:FA", // "862245234377502,862989243244150",//设备的唯一id 纯数字好像有问题。
      len: size, // 文件的大小，字节数
      speech: audio // xxx为 base64（FILE_CONTENT）需要去掉头部 data:audio/wav;base64,
    };
    return fetch({
      method: "post",
      baseURL:
        process.env.NODE_ENV === "production"
          ? "http://vop.baidu.com/server_api"
          : "",
      url:
        process.env.NODE_ENV === "production" ? "/text2audio" : "/api/getText",
      data // qs.stringify(data) 错误
    })
      .then(res => {
        console.log("api getText res is ", res);
        return Promise.resolve(res.data);
      })
      .catch(err => {
        return Promise.reject(err);
      });
    // };
    // // console.log("this.$refs.inputFile.files is ", this.$refs.inputFile.files)
    // reader.readAsDataURL(file);
  }

  /**
   * 人脸识别
   * 图片中包含人脸数： 1
   * 图片中包含人物年龄： 22
   * 图片中包含人物颜值评分： 77.99679565
   * 图片中包含人物性别： female
   * 图片中包含人物种族： yellow
   * 图片中包含人物表情： smile
   * @param img_base64
   */
  static detectFace(img_base64) {
    const data = {
      image: img_base64, //"027d8308a2ec665acb1bdf63e513bcb9",
      image_type: "BASE64", //"FACE_TOKEN",
      face_field: "gender,age,beauty,race,expression", // "faceshape,facetype"
      face_type: "LIVE"
    };
    return fetch({
      method: "post",
      baseURL:
        process.env.NODE_ENV === "production"
          ? "https://aip.baidubce.com/rest/2.0/face/v3"
          : "",
      url:
        process.env.NODE_ENV === "production"
          ? "/detect"
          : "/api/detectFace" + "?access_token=" + this.token,
      // params: {
      //   access_token: this.token
      // },
      data
    });
  }

  /**
   * 人脸匹配
   * @param imgList
   */
  static matchFace(imgList) {
    const data = [
      {
        image: imgList[0],
        image_type: "BASE64",
        face_type: "LIVE",
        quality_control: "LOW"
      },
      {
        image: imgList[1],
        image_type: "BASE64",
        face_type: "LIVE",
        quality_control: "LOW"
      }
    ];
    return fetch({
      method: "post",
      baseURL:
        process.env.NODE_ENV === "production"
          ? "https://aip.baidubce.com/rest/2.0/face/v3"
          : "",
      url:
        process.env.NODE_ENV === "production"
          ? "/match"
          : "/api/matchFace" + "?access_token=" + this.token,
      // params: {
      //   access_token: this.token
      // },
      data
    });
  }
}
