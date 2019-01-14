/**
 * 浏览器调用语音合成接口
 * @param {Object} param 百度语音合成接口参数
 * 请参考 https://ai.baidu.com/docs#/TTS-API/41ac79a6
 * @param {Object} options 跨域调用api参数
 *           timeout {number} 超时时间 默认不设置为60秒
 *           volume {number} audio控件音量，范围 0-1
 *           hidden {boolean} 是否隐藏audio控件
 *           autoDestory {boolean} 播放音频完毕后是否自动删除控件
 *           onInit {Function} 创建完audio控件后调用
 *           onSuccess {Function} 远程语音合成完成，并且返回音频文件后调用
 *           onError {Function}  远程语音合成完成，并且返回错误字符串后调用
 *           onTimeout {Function} 超时后调用，默认超时时间为60秒
 */
function btts(param, options) {
  const url = "http://tsn.baidu.com/text2audio";
  let opt = options || {};
  // let p = param || {};

  // 如果浏览器支持，可以设置autoplay，但是不能兼容所有浏览器
  let audio = document.createElement("audio");
  if (opt.autoplay) {
    audio.setAttribute("autoplay", "autoplay");
  }

  // 隐藏控制栏
  if (!opt.hidden) {
    audio.setAttribute("controls", "controls");
  } else {
    audio.style.display = "none";
  }

  // 设置音量
  if (typeof opt.volume !== "undefined") {
    audio.volume = opt.volume;
  }

  // 调用onInit回调
  isFunction(opt.onInit) && opt.onInit(audio);

  // 默认超时时间60秒
  let DEFAULT_TIMEOUT = 60000;
  let timeout = opt.timeout || DEFAULT_TIMEOUT;

  // 创建XMLHttpRequest对象
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url);

  // 创建form参数
  let data = {};
  for (let p in param) {
    data[p] = param[p];
  }

  // 赋值预定义参数
  data.cuid = data.cuid || data.tok;
  data.ctp = 1;
  data.lan = data.lan || "zh";

  // 序列化参数列表
  let fd = [];
  for (let k in data) {
    fd.push(k + "=" + encodeURIComponent(data[k]));
  }

  // 用来处理blob数据
  let frd = new FileReader();
  xhr.responseType = "blob";
  xhr.send(fd.join("&"));

  // 用timeout可以更兼容的处理兼容超时
  let timer = setTimeout(function() {
    xhr.abort();
    isFunction(opt.onTimeout) && opt.onTimeout();
  }, timeout);

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      clearTimeout(timer);
      if (xhr.status === 200) {
        console.log("xhr.status===200 xhr is ", xhr);
        if (xhr.response.type === "audio/mp3") {
          // 在body元素下apppend音频控件
          document.body.append(audio);

          console.log("xhr.response is ", xhr.response);
          audio.setAttribute("src", URL.createObjectURL(xhr.response));
          console.log(
            "URL.createObjectURL(xhr.response) is ",
            URL.createObjectURL(xhr.response)
          );

          // autoDestory设置则播放完后移除audio的dom对象
          if (opt.autoDestory) {
            audio.onended = function() {
              document.body.removeChild(audio);
            };
          }

          isFunction(opt.onSuccess) && opt.onSuccess(audio);
        }

        // 用来处理错误
        if (xhr.response.type === "application/json") {
          frd.onload = function() {
            let text = frd.result;
            isFunction(opt.onError) && opt.onError(text);
          };
          frd.readAsText(xhr.response);
        }
      }
    }
  };

  // 判断是否是函数
  function isFunction(obj) {
    return Object.prototype.toString.call(obj) === "[object Function]";
  }
}

export default btts;
