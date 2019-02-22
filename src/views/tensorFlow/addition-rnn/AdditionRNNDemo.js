import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
class CharacterTable {
  /**
   * Constructor of CharacterTable.
   * @param chars A string that contains the characters that can appear
   *   in the input.
   */
  constructor(chars) {
    this.chars = chars;
    this.charIndices = {};
    this.indicesChar = {};
    this.size = this.chars.length;
    for (let i = 0; i < this.size; ++i) {
      const char = this.chars[i];
      if (this.charIndices[char] != null) {
        throw new Error(`Duplicate character '${char}'`);
      }
      this.charIndices[this.chars[i]] = i;
      this.indicesChar[i] = this.chars[i];
    }
  }

  /**
   * Convert a string into a one-hot encoded tensor.
   *
   * @param str The input string.
   * @param numRows Number of rows of the output tensor.
   * @returns The one-hot encoded 2D tensor.
   * @throws If `str` contains any characters outside the `CharacterTable`'s
   *   vocabulary.
   */
  encode(str, numRows) {
    const buf = tf.buffer([numRows, this.size]);
    for (let i = 0; i < str.length; ++i) {
      const char = str[i];
      if (this.charIndices[char] == null) {
        throw new Error(`Unknown character: '${char}'`);
      }
      buf.set(1, i, this.charIndices[char]);
    }
    return buf.toTensor().as2D(numRows, this.size);
  }

  encodeBatch(strings, numRows) {
    const numExamples = strings.length;
    const buf = tf.buffer([numExamples, numRows, this.size]);
    for (let n = 0; n < numExamples; ++n) {
      const str = strings[n];
      for (let i = 0; i < str.length; ++i) {
        const char = str[i];
        if (this.charIndices[char] == null) {
          throw new Error(`Unknown character: '${char}'`);
        }
        buf.set(1, n, i, this.charIndices[char]);
      }
    }
    return buf.toTensor().as3D(numExamples, numRows, this.size);
  }

  /**
   * Convert a 2D tensor into a string with the CharacterTable's vocabulary.
   *
   * @param x Input 2D tensor.
   * @param calcArgmax Whether to perform `argMax` operation on `x` before
   *   indexing into the `CharacterTable`'s vocabulary.
   * @returns The decoded string.
   */
  decode(x, calcArgmax = true) {
    return tf.tidy(() => {
      if (calcArgmax) {
        x = x.argMax(1);
      }
      const xData = x.dataSync(); // TODO(cais): Performance implication?
      let output = "";
      for (const index of Array.from(xData)) {
        output += this.indicesChar[index];
      }
      return output;
    });
  }
}
function generateData(digits, numExamples, invert) {
  const digitArray = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const arraySize = digitArray.length;

  const output = [];
  const maxLen = digits + 1 + digits;

  const f = () => {
    let str = "";
    while (str.length < digits) {
      const index = Math.floor(Math.random() * arraySize);
      str += digitArray[index];
    }
    return Number.parseInt(str);
  };

  const seen = new Set();
  while (output.length < numExamples) {
    const a = f();
    const b = f();
    const sorted = b > a ? [a, b] : [b, a];
    const key = sorted[0] + "`" + sorted[1];
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    // Pad the data with spaces such that it is always maxLen.
    const q = `${a}+${b}`;
    const query = q + " ".repeat(maxLen - q.length);
    let ans = (a + b).toString();
    // Answer can be of maximum size `digits + 1`.
    ans += " ".repeat(digits + 1 - ans.length);

    if (invert) {
      throw new Error("invert is not implemented yet");
    }
    output.push([query, ans]);
  }
  return output;
}

export function convertDataToTensors(data, charTable, digits) {
  const maxLen = digits + 1 + digits;
  const questions = data.map(datum => datum[0]);
  const answers = data.map(datum => datum[1]);
  return [
    charTable.encodeBatch(questions, maxLen),
    charTable.encodeBatch(answers, digits + 1)
  ];
}

function createAndCompileModel(
  layers,
  hiddenSize,
  rnnType,
  digits,
  vocabularySize
) {
  const maxLen = digits + 1 + digits;

  const model = tf.sequential();
  switch (rnnType) {
    case "SimpleRNN":
      model.add(
        tf.layers.simpleRNN({
          units: hiddenSize,
          recurrentInitializer: "glorotNormal",
          inputShape: [maxLen, vocabularySize]
        })
      );
      break;
    case "GRU":
      model.add(
        tf.layers.gru({
          units: hiddenSize,
          recurrentInitializer: "glorotNormal",
          inputShape: [maxLen, vocabularySize]
        })
      );
      break;
    case "LSTM":
      model.add(
        tf.layers.lstm({
          units: hiddenSize,
          recurrentInitializer: "glorotNormal",
          inputShape: [maxLen, vocabularySize]
        })
      );
      break;
    default:
      throw new Error(`Unsupported RNN type: '${rnnType}'`);
  }
  model.add(tf.layers.repeatVector({ n: digits + 1 }));
  switch (rnnType) {
    case "SimpleRNN":
      model.add(
        tf.layers.simpleRNN({
          units: hiddenSize,
          recurrentInitializer: "glorotNormal",
          returnSequences: true
        })
      );
      break;
    case "GRU":
      model.add(
        tf.layers.gru({
          units: hiddenSize,
          recurrentInitializer: "glorotNormal",
          returnSequences: true
        })
      );
      break;
    case "LSTM":
      model.add(
        tf.layers.lstm({
          units: hiddenSize,
          recurrentInitializer: "glorotNormal",
          returnSequences: true
        })
      );
      break;
    default:
      throw new Error(`Unsupported RNN type: '${rnnType}'`);
  }
  model.add(
    tf.layers.timeDistributed({
      layer: tf.layers.dense({ units: vocabularySize })
    })
  );
  model.add(tf.layers.activation({ activation: "softmax" }));
  model.compile({
    loss: "categoricalCrossentropy",
    optimizer: "adam",
    metrics: ["accuracy"]
  });
  return model;
}

export default class AdditionRNNDemo {
  constructor(digits, trainingSize, rnnType, layers, hiddenSize) {
    // Prepare training data.
    const chars = "0123456789+ ";
    this.charTable = new CharacterTable(chars);
    console.log("Generating training data");
    const data = generateData(digits, trainingSize, false);
    const split = Math.floor(trainingSize * 0.9);
    this.trainData = data.slice(0, split);
    this.testData = data.slice(split);
    [this.trainXs, this.trainYs] = convertDataToTensors(
      this.trainData,
      this.charTable,
      digits
    );
    [this.testXs, this.testYs] = convertDataToTensors(
      this.testData,
      this.charTable,
      digits
    );
    this.model = createAndCompileModel(
      layers,
      hiddenSize,
      rnnType,
      digits,
      chars.length
    );
  }

  async train(iterations, batchSize, numTestExamples) {
    const lossValues = [[], []];
    const accuracyValues = [[], []];
    for (let i = 0; i < iterations; ++i) {
      const beginMs = performance.now();
      const history = await this.model.fit(this.trainXs, this.trainYs, {
        epochs: 1,
        batchSize,
        validationData: [this.testXs, this.testYs],
        yieldEvery: "epoch"
      });

      const elapsedMs = performance.now() - beginMs;
      const modelFitTime = elapsedMs / 1000;

      const trainLoss = history.history["loss"][0];
      const trainAccuracy = history.history["acc"][0];
      const valLoss = history.history["val_loss"][0];
      const valAccuracy = history.history["val_acc"][0];

      lossValues[0].push({ x: i, y: trainLoss });
      lossValues[1].push({ x: i, y: valLoss });

      accuracyValues[0].push({ x: i, y: trainAccuracy });
      accuracyValues[1].push({ x: i, y: valAccuracy });

      document.getElementById(
        "trainStatus"
      ).textContent = `Iteration ${i} of ${iterations}: Model fit time ${modelFitTime.toFixed(
        6
      )} (seconds)`;
      const lossContainer = document.getElementById("lossChart");
      tfvis.render.linechart(
        { values: lossValues, series: ["train", "validation"] },
        lossContainer,
        {
          width: 420,
          height: 300,
          xLabel: "epoch",
          yLabel: "loss"
        }
      );

      const accuracyContainer = document.getElementById("accuracyChart");
      tfvis.render.linechart(
        { values: accuracyValues, series: ["train", "validation"] },
        accuracyContainer,
        {
          width: 420,
          height: 300,
          xLabel: "epoch",
          yLabel: "accuracy"
        }
      );

      if (
        this.testXsForDisplay == null ||
        this.testXsForDisplay.shape[0] !== numTestExamples
      ) {
        if (this.textXsForDisplay) {
          this.textXsForDisplay.dispose();
        }
        this.testXsForDisplay = this.testXs.slice(
          [0, 0, 0],
          [numTestExamples, this.testXs.shape[1], this.testXs.shape[2]]
        );
      }

      const examples = [];
      const isCorrect = [];
      tf.tidy(() => {
        const predictOut = this.model.predict(this.testXsForDisplay);
        for (let k = 0; k < numTestExamples; ++k) {
          const scores = predictOut
            .slice([k, 0, 0], [1, predictOut.shape[1], predictOut.shape[2]])
            .as2D(predictOut.shape[1], predictOut.shape[2]);
          const decoded = this.charTable.decode(scores);
          examples.push(this.testData[k][0] + " = " + decoded);
          isCorrect.push(this.testData[k][1].trim() === decoded.trim());
        }
      });

      const examplesDiv = document.getElementById("testExamples");
      const examplesContent = examples.map(
        (example, i) =>
          `<div class="${isCorrect[i] ? "answer-correct" : "answer-wrong"}">` +
          `${example}` +
          `</div>`
      );

      examplesDiv.innerHTML = examplesContent.join("\n");
    }
  }
}