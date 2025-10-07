import { ModelConfig } from '@/store/state';
import * as tf from '@tensorflow/tfjs';

export interface ModelBuilderOptions {
  inputShape: number[];
  outputShape: number[];
  config: ModelConfig;
}

/**
 * Build a neural network model using TensorFlow.js
 */
export function buildModel(options: ModelBuilderOptions): tf.Sequential {
  const { inputShape, outputShape, config } = options;
  const model = tf.sequential();

  // Input layer
  model.add(
    tf.layers.dense({
      units: config.neuronsPerLayer,
      activation: config.activationFunction,
      inputShape: inputShape,
      name: 'input_layer',
    })
  );

  // Hidden layers
  for (let i = 0; i < config.hiddenLayers; i++) {
    model.add(
      tf.layers.dense({
        units: config.neuronsPerLayer,
        activation: config.activationFunction,
        name: `hidden_layer_${i + 1}`,
      })
    );
  }

  // Output layer
  const outputUnits = config.taskType === 'classification' ? outputShape[0] : 1;
  const outputActivation =
    config.taskType === 'classification' ? 'softmax' : 'linear';

  model.add(
    tf.layers.dense({
      units: outputUnits,
      activation: outputActivation,
      name: 'output_layer',
    })
  );

  // Compile model
  const optimizer = tf.train.adam(config.learningRate);
  const loss =
    config.taskType === 'classification'
      ? 'categoricalCrossentropy'
      : 'meanSquaredError';
  const metrics = config.taskType === 'classification' ? ['accuracy'] : ['mse'];

  model.compile({
    optimizer,
    loss,
    metrics,
  });

  return model;
}

/**
 * Get model summary information
 */
export function getModelSummary(model: tf.Sequential): {
  totalParams: number;
  trainableParams: number;
  layers: Array<{
    name: string;
    type: string;
    outputShape: number[];
    params: number;
  }>;
} {
  const layers = model.layers.map(layer => ({
    name: layer.name,
    type: layer.constructor.name,
    outputShape: layer.outputShape as number[],
    params: layer.countParams(),
  }));

  const totalParams = layers.reduce((sum, layer) => sum + layer.params, 0);
  const trainableParams = model.trainableWeights.reduce((sum, weight) => {
    const shape = weight.shape;
    if (!shape) return sum;
    return sum + (shape as number[]).reduce((a, b) => a * b, 1);
  }, 0);

  return {
    totalParams,
    trainableParams,
    layers,
  };
}

/**
 * Create a simple model for testing
 */
export function createTestModel(): tf.Sequential {
  const model = tf.sequential();

  model.add(
    tf.layers.dense({
      units: 4,
      activation: 'relu',
      inputShape: [2],
    })
  );

  model.add(
    tf.layers.dense({
      units: 2,
      activation: 'softmax',
    })
  );

  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  return model;
}

/**
 * Get layer weights and biases for visualization
 */
export function getLayerWeights(model: tf.Sequential): Array<{
  layerIndex: number;
  layerName: string;
  weights: tf.Tensor;
  biases: tf.Tensor;
}> {
  return model.layers.map((layer, index) => {
    const weights = layer.getWeights();
    return {
      layerIndex: index,
      layerName: layer.name,
      weights: weights[0], // Weight matrix
      biases: weights[1] || tf.zeros([weights[0].shape[1] || 1]), // Bias vector
    };
  });
}

/**
 * Get activations for a given input
 */
export function getActivations(
  model: tf.Sequential,
  input: tf.Tensor
): tf.Tensor[] {
  const activations: tf.Tensor[] = [];

  // Get activations from each layer
  for (let i = 0; i < model.layers.length; i++) {
    const layer = model.layers[i];
    const layerInput = i === 0 ? input : activations[i - 1];
    const activation = layer.apply(layerInput) as tf.Tensor;
    activations.push(activation);
  }

  return activations;
}

/**
 * Dispose model and clean up memory
 */
export function disposeModel(model: tf.Sequential): void {
  model.dispose();
}
