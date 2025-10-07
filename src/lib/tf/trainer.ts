import { ModelConfig } from '@/store/state';
import * as tf from '@tensorflow/tfjs';

export interface TrainingProgress {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss?: number;
  valAccuracy?: number;
}

export interface TrainingOptions {
  model: tf.Sequential;
  xTrain: tf.Tensor;
  yTrain: tf.Tensor;
  xVal?: tf.Tensor;
  yVal?: tf.Tensor;
  config: ModelConfig;
  onProgress?: (progress: TrainingProgress) => void;
  onEpochEnd?: (epoch: number, logs: tf.Logs) => void;
}

export interface TrainingResult {
  success: boolean;
  history?: tf.History;
  error?: string;
}

/**
 * Train a neural network model
 */
export async function trainModel(
  options: TrainingOptions
): Promise<TrainingResult> {
  try {
    const {
      model,
      xTrain,
      yTrain,
      xVal,
      yVal,
      config,
      onProgress,
      onEpochEnd,
    } = options;

    // Prepare validation data
    const validationData: [tf.Tensor, tf.Tensor] | undefined =
      xVal && yVal ? [xVal, yVal] : undefined;

    // Training callbacks
    const callbacks: tf.Callback[] = [];

    // Progress callback
    if (onProgress) {
      callbacks.push(
        tf.callbacks.earlyStopping({
          monitor: 'loss',
          patience: 10,
          restoreBestWeights: true,
        })
      );
    }

    // Custom epoch end callback
    if (onEpochEnd) {
      callbacks.push({
        onEpochEnd,
      } as tf.Callback);
    }

    // Progress tracking callback
    if (onProgress) {
      callbacks.push({
        onEpochEnd: async (epoch: number, logs: tf.Logs) => {
          const progress: TrainingProgress = {
            epoch: epoch + 1,
            loss: logs.loss || 0,
            accuracy: logs.acc || logs.accuracy || 0,
            valLoss: logs.val_loss,
            valAccuracy: logs.val_acc || logs.val_accuracy,
          };
          onProgress(progress);
        },
      } as tf.Callback);
    }

    // Train the model
    const history = await model.fit(xTrain, yTrain, {
      epochs: config.epochs,
      batchSize: config.batchSize,
      validationData,
      validationSplit: validationData ? undefined : 0.2,
      callbacks,
      verbose: 0, // Suppress console output
    });

    return {
      success: true,
      history,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown training error',
    };
  }
}

/**
 * Create training data from arrays
 */
export function createTrainingData(
  features: number[][],
  targets: number[][]
): { xTrain: tf.Tensor; yTrain: tf.Tensor } {
  const xTrain = tf.tensor2d(features);
  const yTrain = tf.tensor2d(targets);

  return { xTrain, yTrain };
}

/**
 * Split data into training and validation sets
 */
export function splitData(
  x: tf.Tensor,
  y: tf.Tensor,
  validationSplit: number = 0.2
): { xTrain: tf.Tensor; yTrain: tf.Tensor; xVal: tf.Tensor; yVal: tf.Tensor } {
  const numSamples = x.shape[0];
  const numTrainSamples = Math.floor(numSamples * (1 - validationSplit));

  const xTrain = x.slice([0, 0], [numTrainSamples, -1]);
  const yTrain = y.slice([0, 0], [numTrainSamples, -1]);
  const xVal = x.slice([numTrainSamples, 0], [-1, -1]);
  const yVal = y.slice([numTrainSamples, 0], [-1, -1]);

  return { xTrain, yTrain, xVal, yVal };
}

/**
 * Evaluate model performance
 */
export function evaluateModel(
  model: tf.Sequential,
  xTest: tf.Tensor,
  yTest: tf.Tensor
): { loss: number; accuracy: number } {
  const result = model.evaluate(xTest, yTest, { verbose: 0 });

  if (Array.isArray(result)) {
    return {
      loss: result[0].dataSync()[0],
      accuracy: result[1] ? result[1].dataSync()[0] : 0,
    };
  } else {
    return {
      loss: result.dataSync()[0],
      accuracy: 0,
    };
  }
}

/**
 * Make predictions with the model
 */
export function predict(model: tf.Sequential, x: tf.Tensor): tf.Tensor {
  return model.predict(x) as tf.Tensor;
}

/**
 * Get model predictions as arrays
 */
export function predictArray(model: tf.Sequential, x: tf.Tensor): number[][] {
  const predictions = predict(model, x);
  const result = predictions.arraySync() as number[][];
  predictions.dispose();
  return result;
}

/**
 * Calculate accuracy for classification
 */
export function calculateAccuracy(
  predictions: number[][],
  trueLabels: number[][]
): number {
  if (predictions.length !== trueLabels.length) {
    throw new Error('Predictions and true labels must have the same length');
  }

  let correct = 0;
  for (let i = 0; i < predictions.length; i++) {
    const predClass = predictions[i].indexOf(Math.max(...predictions[i]));
    const trueClass = trueLabels[i].indexOf(Math.max(...trueLabels[i]));
    if (predClass === trueClass) {
      correct++;
    }
  }

  return correct / predictions.length;
}

/**
 * Calculate R² score for regression
 */
export function calculateRSquared(
  predictions: number[][],
  trueValues: number[][]
): number {
  if (predictions.length !== trueValues.length) {
    throw new Error('Predictions and true values must have the same length');
  }

  const yTrue = trueValues.map(row => row[0]);
  const yPred = predictions.map(row => row[0]);

  const yTrueMean = yTrue.reduce((sum, val) => sum + val, 0) / yTrue.length;

  const ssRes = yTrue.reduce(
    (sum, val, i) => sum + Math.pow(val - yPred[i], 2),
    0
  );
  const ssTot = yTrue.reduce(
    (sum, val) => sum + Math.pow(val - yTrueMean, 2),
    0
  );

  return 1 - ssRes / ssTot;
}

/**
 * Dispose training tensors to free memory
 */
export function disposeTrainingTensors(tensors: tf.Tensor[]): void {
  tensors.forEach(tensor => tensor.dispose());
}
