// 16进制组成的字符串，将每一位转为16进制的数字后，再转换为数组
export function strToHexToArray(str) {
  // let arr = [];
  // for (let i = 0; i < str.length; i++) {
  //   if (arr === []) {
  //     arr = [str.charCodeAt(i).toString(16)];
  //   } else {
  //     arr.push(str.charCodeAt(i).toString(16));
  //   }
  // }
  const arr = Array.from(str);
  arr.forEach((item, index) => {
    arr[index] = parseInt(item, 16);
  });
  return arr;
}
// 字符串转16进制
export function stringToHex(str) {
  let val = "";
  for (let i = 0; i < str.length; i++) {
    if (val === "") val = str.charCodeAt(i).toString(16);
    else val += "," + str.charCodeAt(i).toString(16);
  }
  return val;
}
// 16进制转字符串
export function hexToString(str) {
  let val = "";
  const arr = str.split(",");
  for (let i = 0; i < arr.length; i++) {
    val += arr[i].fromCharCode(i);
  }
  return val;
}

// parseInt()方法转换
// parseInt("bc",16); //表示把字符串bc转换为16进制，结果：188
//
// parseInt("10",8); //表示把字符串10转换为8进制，结果：8
//
// parseInt("10",2); //表示把字符串10转换为2进制，结果：2
