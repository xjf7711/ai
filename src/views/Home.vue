<template>
  <div class="home">
    <!--<img alt="Vue logo" src="../assets/logo.png">-->
    <!--<HelloWorld msg="Welcome to Your Vue.js App"/>-->
    <canvas id="jpx-jp2"></canvas>
    <van-cell-group v-for="(item, index) in list" :key="index">
      <van-cell
        :title="item.meta.title"
        @click="$router.push(item.path)"
      ></van-cell>
      <van-cell
        class="child"
        v-for="(child, j) in item.children"
        :key="j"
        :title="child.meta.title"
        @click="$router.push(item.path + '/' + child.path)"
      ></van-cell>
    </van-cell-group>
  </div>
</template>

<script>
import { JpxImage } from "assets/js/jpx/JpxImage";
import { Font } from "assets/js/type-font/fonts";
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";
import { routeMap } from "../router";
import { CMapFactory } from "assets/js/type-font/cmap";
import { Name } from "assets/js/primitives";
import { Stream } from "assets/js/stream";
import { ToUnicodeMap } from "assets/js/type-font/to_unicode_map";
import { openFont } from "assets/js/open-font/open-font";

export default {
  name: "home",
  data() {
    return {
      list: null
    };
  },
  // components: {
  //   HelloWorld
  // },
  mounted() {
    console.log('mounted . ');
    // console.log(routeMap);
    this.list = routeMap;
    this.parseOpenFont();
    // this.parseTypeFonts();
  },
  methods: {
    async parseOpenFont() {
      console.log('parseOpenFont . ')
      const filename = "./fonts/font_13_13";
      // let filename = "./fonts/font_616_616"; // font_200_200
      let extension = "ttf";
      let src = filename + "." + extension;
      fetch(src)
        .then(response => {
          console.log("fetch response is ", response);
          // response.status表示响应的http状态码
          if (response.status === 200) {
            return response.arrayBuffer();
          } else {
            console.log("response error .");
          }
        })
        .then(async buffer => {
          if (buffer === undefined) {
            throw Error("buffer is undefined . ");
          }
          // const data = new Uint8Array(buffer);
          const font = openFont.parse(buffer);
          console.log("font is ", font);
        });
    },
    async parseTypeFonts() {
      let filename = "./fonts/font_616_616";
      let extension = "otf";
      let src = filename + "." + extension;
      fetch(src)
        .then(response => {
          console.log("fetch response is ", response);
          // response.status表示响应的http状态码
          if (response.status === 200) {
            return response.arrayBuffer();
          } else {
            console.log("response error .");
          }
        })
        .then(async buffer => {
          if (buffer === undefined) {
            throw Error("buffer is undefined . ");
          }
          const data = new Uint8Array(buffer);
          const cMap = await CMapFactory.create({
            encoding: Name.get("Identity-H")
          });
          const font = new Font("font", new Stream(data), {
            loadedName: "font",
            type: "CIDFontType2",
            // // type: 'CIDFontType0',
            // // subtype: 'Type1C',
            // // type: 'OpenType',

            subtype: "CIDFontType0C",
            differences: [],
            defaultEncoding: [],
            gIds: [],
            cMap,
            toUnicode: new ToUnicodeMap(),
            xHeight: 0,
            capHeight: 0,
            italicAngle: 0
            // type: "CIDFontType2",
            // differences: [],
            // defaultEncoding: [],
            // cMap,
            // toUnicode: new ToUnicodeMap([]),
            // xHeight: 0,
            // capHeight: 0,
            // italicAngle: 0
            // ------
            // type: 'TrueType', type和subtype有对应关系
            // subtype: 'Unicode',
            // fallbackName: 'Helvetica',
          });
          console.log("font is ", font);
          // const str = bytesToString(font.data!);
          // console.log(btoa(str));
          // console.log(font.renderer);
          // const cmap = font.cMap;
          // const glyphCodePoint = 1;
          // const glyphUnicode = font.cMap.lookup(glyphCodePoint);
          // console.log("glyphUnicode is ", glyphUnicode);
          // let charCode = font.cMap.lookup(glyphCodePoint); // 要获取的字符的 Unicode 码点
          // let unicode = cmap.glyphIdToUnicode(glyphId);
          // 获取编码表对象
          // let toUnicode = font.toFontChar;
          // // 根据字符编码获取字形编号
          // // let glyphId = toUnicode[glyphCodePoint];
          // // let glyph = font.cMap?.lookup(glyphId);
          // const glyphId = font.toFontChar[glyphCodePoint];
          // const charCode = "A".charCodeAt(0);
          // console.log("charCode is ", charCode);
          // const charts = font.charsToGlyphs(String(charCode));
          // console.log("charts is ", charts);
          // // let glyphWidth = glyph.width * font.fontMatrix[0];
          // // 请注意，如果字体字符串编码方式是Identity-H（也就是说，CID码直接表示Unicode编码），则我们不需要使用CMap对象进行映射，而可以直接使用CID码作为字形的Unicode编码，如下所示：
          // let unicode = String.fromCodePoint(glyphId);
          // console.log("unicode is ", unicode);
          // 获取字形信息
          // const glyph = await font.loadChar('A');

          // 获取字形路径
          // const path = glyph.getPath(0, 0, 72);

          // 打印路径
          // console.log(path);
          // 获取字形对象
          // let glyphName = font.charToGlyph(charCode).name;
          // 获取字形对象
          // let glyph = font._charToGlyph(char);
          // 获取字形路径数据
          // let path = glyph.getPath(0, 0, 72);
          // let svgData = path.toSVG();
          // console.log(glyphUnicode.codePointAt(0));
          // const glyphIndex = font.charToGlyph(glyphUnicode.codePointAt(0));
          // const glyphPath = font.getPath(glyphUnicode);
          // const svgPathData = glyphPath.toPathData(5);
          // console.log(svgPathData);
          // const glyphIndex = font.getGlyphId(glyphUnicode);
          // const glyphPath = font.getPathForGlyph(glyphIndex);
          // const svgPathData = glyphPath.toPathData(5);
          // console.log(svgPathData);
          // const glyphs = font.unicodeCharsToGlyphs(text);
          // // 渲染每个Glyph对象
          // for (const glyph of glyphs) {
          //   const glyphPath = glyph.getPath(x, y, fontSize);
          //   // perform rendering operations on the resulting path data
          //   // ...
          //   x += glyph.advanceWidth * fontSize;
          // }
        });
    },
    loadJp2() {
      let filename = "./images/image_155"; // '8975';
      let extension = "jp2";
      let src = filename + "." + extension;
      fetch(src)
        .then(response => {
          console.log("fetch response is ", response);
          // response.status表示响应的http状态码
          if (response.status === 200) {
            return response.arrayBuffer();
          } else {
            console.log("response error .");
          }
        })
        .then(buffer => {
          console.log("response.arrayBuffer() buffer is ", buffer);
          if (buffer === undefined) {
            throw Error("buffer is undefined . ");
          }
          let bytes = new Uint8Array(buffer);
          // console.log('bytes is ', bytes);
          let t0 = new Date().getTime();
          const jpx = new JpxImage();
          jpx.parse(bytes);
          console.log("jpx is ", jpx);
          console.log("width: %d", jpx.width);
          console.log("height: %d", jpx.height);
          console.log("components: %d", jpx.componentsCount);
          console.log("tiles:", jpx.tiles);
          console.log(
            "---> jxp.parse time: ",
            new Date().getTime() - t0 + "ms"
          );
          // let rgbImage = openjpeg(bytes, extension);
          // console.log('rgbImage is ', rgbImage);
          // console.log('---> openjpeg() total time: ', ((new Date().getTime()) - t0) + 'ms');
          const width = jpx.width;
          const height = jpx.height;
          const numComponents = jpx.componentsCount;
          const decoded = this.mergeTiles(jpx);
          console.log("jpxBuffer is ", decoded);
          let canvas = document.getElementById("jpx-jp2");
          canvas.width = width;
          canvas.height = height;
          let ctx = canvas.getContext("2d");
          let imageData = ctx.createImageData(width, height);
          let imageBytes = imageData.data;
          for (let i = 0, j = 0, ii = width * height * 4; i < ii; ) {
            imageBytes[i++] = decoded[j++];
            imageBytes[i++] =
              numComponents === 3 ? decoded[j++] : decoded[j - 1];
            imageBytes[i++] =
              numComponents === 3 ? decoded[j++] : decoded[j - 1];
            imageBytes[i++] = 255;
          }
          ctx.putImageData(imageData, 0, 0);
        });
    },
    mergeTiles(jpxImage) {
      let buffer;
      const width = jpxImage.width;
      const height = jpxImage.height;
      const componentsCount = jpxImage.componentsCount;
      const tileCount = jpxImage.tiles.length;
      if (tileCount === 1) {
        buffer = jpxImage.tiles[0].items;
      } else {
        const data = new Uint8ClampedArray(width * height * componentsCount);

        for (let k = 0; k < tileCount; k++) {
          const tileComponents = jpxImage.tiles[k];
          const tileWidth = tileComponents.width;
          const tileHeight = tileComponents.height;
          const tileLeft = tileComponents.left;
          const tileTop = tileComponents.top;

          const src = tileComponents.items;
          let srcPosition = 0;
          let dataPosition = (width * tileTop + tileLeft) * componentsCount;
          const imgRowSize = width * componentsCount;
          const tileRowSize = tileWidth * componentsCount;

          for (let j = 0; j < tileHeight; j++) {
            const rowBytes = src.subarray(
              srcPosition,
              srcPosition + tileRowSize
            );
            data.set(rowBytes, dataPosition);
            srcPosition += tileRowSize;
            dataPosition += imgRowSize;
          }
        }
        buffer = data;
      }
      return buffer;
    }
  }
};
</script>
<style lang="scss" scoped>
.child {
  padding-left: 50px;
  text-underline: #d9d9d9;
}
</style>
