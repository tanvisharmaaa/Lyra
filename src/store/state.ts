import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types
export interface Dataset {
  data: Record<string, string | number>[];
  features: string[];
  target: string;
  targetType: 'classification' | 'regression';
  numSamples: number;
  numFeatures: number;
  numClasses?: number;
  // Metadata about ingestion
  skipRows?: number; // number of initial rows skipped before header
  headerRow?: number; // index (after skipping) of header row in original file
}

export interface ModelConfig {
  taskType: 'classification' | 'regression';
  hiddenLayers: number;
  neuronsPerLayer: number;
  activationFunction: 'relu' | 'sigmoid' | 'tanh';
  learningRate: number;
  epochs: number;
  batchSize: number;
}

export interface TrainingState {
  isTraining: boolean;
  isPaused: boolean;
  currentEpoch: number;
  totalEpochs: number;
  currentLoss: number;
  currentAccuracy: number;
  trainingHistory: {
    epoch: number;
    loss: number;
    accuracy: number;
    valLoss?: number;
    valAccuracy?: number;
  }[];
}

export interface VisualizationState {
  showForwardPass: boolean;
  showBackwardPass: boolean;
  animationSpeed: number;
  highlightLayer: number | null;
  highlightNeuron: { layer: number; neuron: number } | null;
}

// Store interface
interface NeuralNetworkStore {
  // Dataset state
  dataset: Dataset | null;
  setDataset: (dataset: Dataset | null) => void;

  // Model configuration
  modelConfig: ModelConfig;
  updateModelConfig: (config: Partial<ModelConfig>) => void;

  // Training state
  trainingState: TrainingState;
  startTraining: () => void;
  pauseTraining: () => void;
  resumeTraining: () => void;
  stopTraining: () => void;
  updateTrainingProgress: (progress: Partial<TrainingState>) => void;
  addTrainingHistory: (entry: TrainingState['trainingHistory'][0]) => void;

  // Visualization state
  visualizationState: VisualizationState;
  updateVisualizationState: (state: Partial<VisualizationState>) => void;

  // UI state
  sidebarCollapsed: boolean;
  rightPanelCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setRightPanelCollapsed: (collapsed: boolean) => void;

  // Reset all state
  reset: () => void;
}

// Default values
const defaultModelConfig: ModelConfig = {
  taskType: 'classification',
  hiddenLayers: 2,
  neuronsPerLayer: 32,
  activationFunction: 'relu',
  learningRate: 0.001,
  epochs: 100,
  batchSize: 32,
};

const defaultTrainingState: TrainingState = {
  isTraining: false,
  isPaused: false,
  currentEpoch: 0,
  totalEpochs: 100,
  currentLoss: 0,
  currentAccuracy: 0,
  trainingHistory: [],
};

const defaultVisualizationState: VisualizationState = {
  showForwardPass: true,
  showBackwardPass: false,
  animationSpeed: 1,
  highlightLayer: null,
  highlightNeuron: null,
};

// Create store
export const useNeuralNetworkStore = create<NeuralNetworkStore>()(
  devtools(
    (set, _get) => ({
      // Dataset state
      dataset: null,
      setDataset: dataset => set({ dataset }),

      // Model configuration
      modelConfig: defaultModelConfig,
      updateModelConfig: config =>
        set(state => ({
          modelConfig: { ...state.modelConfig, ...config },
        })),

      // Training state
      trainingState: defaultTrainingState,
      startTraining: () =>
        set(state => ({
          trainingState: {
            ...state.trainingState,
            isTraining: true,
            isPaused: false,
          },
        })),
      pauseTraining: () =>
        set(state => ({
          trainingState: {
            ...state.trainingState,
            isPaused: true,
          },
        })),
      resumeTraining: () =>
        set(state => ({
          trainingState: {
            ...state.trainingState,
            isPaused: false,
          },
        })),
      stopTraining: () =>
        set(state => ({
          trainingState: {
            ...state.trainingState,
            isTraining: false,
            isPaused: false,
          },
        })),
      updateTrainingProgress: progress =>
        set(state => ({
          trainingState: {
            ...state.trainingState,
            ...progress,
          },
        })),
      addTrainingHistory: entry =>
        set(state => ({
          trainingState: {
            ...state.trainingState,
            trainingHistory: [...state.trainingState.trainingHistory, entry],
          },
        })),

      // Visualization state
      visualizationState: defaultVisualizationState,
      updateVisualizationState: state =>
        set(currentState => ({
          visualizationState: {
            ...currentState.visualizationState,
            ...state,
          },
        })),

      // UI state
      sidebarCollapsed: false,
      rightPanelCollapsed: false,
      setSidebarCollapsed: collapsed => set({ sidebarCollapsed: collapsed }),
      setRightPanelCollapsed: collapsed =>
        set({ rightPanelCollapsed: collapsed }),

      // Reset all state
      reset: () =>
        set({
          dataset: null,
          modelConfig: defaultModelConfig,
          trainingState: defaultTrainingState,
          visualizationState: defaultVisualizationState,
          sidebarCollapsed: false,
          rightPanelCollapsed: false,
        }),
    }),
    {
      name: 'neural-network-store',
    }
  )
);
