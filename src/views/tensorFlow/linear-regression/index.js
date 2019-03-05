/**
 * TensorFlow.js Linear Regression Test
 *
 * Background: linear regression is a liner approach to modeling hte relationship between a dependent variables and one or more independent variables.
 * Linear regression is perhaps one of the most well known and well understood algorithms in statistics and machine learning.
 * AKA linear model
 *
 * y = m + bx
 *
 *
 * We're using p5 (Processing library for Javascript) and of course, Tensorflow.js
 *
 *
 */
import * as tf from "@tensorflow/tfjs";
//define x and y value arrays and m and b
let x_vals = [];
let y_vals = [];

let m, b;

/**
 * Setting up the optimizer and learning rate.
 * An optimizer is a method used to select the best elements from some set of alternatives.
 * Optimizers take advantage of a loss function, which determines how well your algorithm models your dataset.
 *
 * For a loss function, the lower the number, the better your model is.
 *
 * Optimizers use the loss function and the model's parameters to
 * mold your model into its most accurate possible form by messing with the weights.
 * The loss function tells the optimizer whether or not its moving in the right/wrong direction.
 *
 * We're using a schocastic gradient descent and we gonna minimize dat loss function.
 */
const learningRate = 0.5;

const optimizer = tf.train.sgd(learningRate);

/**
 * Function to create a black background using Processing functions
 * We're also placing a random line off of two scalar values placed on the map
 */
function setup() {
  createCanvas(400, 400);
  background(0);

  m = tf.variable(tf.scalar(random(1)));
  b = tf.variable(tf.scalar(random(1)));
}

/**
 * Mean Squared Error
 *
 * A basic loss function. Take the difference between your predictions
 * and the actual values. Then square it and average it.
 *
 * Squared error = Predicted (predicted y values - y values) ** 2
 * Sum all of the squared errors
 * Divide the sum by the size of the values (take the mean)
 *
 * @param {*} pred Prediction y values received from the predict function
 * @param {*} labels The actual y values (y_vals)
 */
const MSE_Loss = (pred, labels) =>
  pred
    .sub(labels)
    .square()
    .mean();

/**
 * Prediction Function
 *
 * Converts the array into a 1d tensor and then multiplies and
 * performs the y = mx + b equation
 *
 * @param {*} x an array of x values (numbers)
 */
const predict = x => {
  const xs = tf.tensor1d(x);

  // y = mx + b
  const ys = xs.mul(m).add(b);
  return ys;
};

/**
 * mousePressed()
 *
 * Whenever the mouse is pressed, add a point to the map and push it to the arrays
 */
function mousePressed() {
  let x = map(mouseX, 0, width, 0, 1);
  let y = map(mouseY, 0, height, 1, 0);
  x_vals.push(x);
  y_vals.push(y);
}

/**
 * draw()
 *
 * Draw the line on the map given the x values and y values.
 * Optimize using the loss function afterwards.
 */
function draw() {
  /**
   * tf.tidy is an important tool for memory management. Because tensors
   * take up a lot of memory, tidy cleans up all allocated tensors
   */
  tf.tidy(() => {
    if (x_vals.length > 0) {
      const ys = tf.tensor1d(y_vals);
      optimizer.minimize(() => MSE_Loss(predict(x_vals), ys));
    }
  });

  // Stuff for the line
  background(0);
  stroke(255);
  strokeWeight(5);
  for (let i = 0; i < x_vals.length; i++) {
    let px = map(x_vals[i], 0, 1, 0, width);
    let py = map(y_vals[i], 0, 1, height, 0);
    point(px, py);
  }

  // x values will be from the left to the right side of the screen
  const xs = [0, 1];

  // Predict the y values
  const ys = tf.tidy(() => predict(xs));
  const yLine = ys.dataSync();
  ys.dispose();

  // Get two points on the line (x1,y1) and (x2,y2) and draw a line between them

  let x1 = map(xs[0], 0, 1, 0, width);
  let x2 = map(xs[1], 0, 1, 0, width);

  let y1 = map(yLine[0], 0, 1, height, 0);
  let y2 = map(yLine[1], 0, 1, height, 0);

  // create the line

  line(x1, y1, x2, y2);
}
