# 🧠 Neural Network Visualizer

A modern, interactive neural network visualization and training tool built with Next.js 15, TensorFlow.js, and shadcn/ui.

## ✨ Features

- **Interactive Neural Network Visualization**: Real-time visualization of neural network architecture with animated forward and backward passes
- **Dataset Upload & Processing**: CSV file upload with automatic preprocessing and feature detection
- **Model Configuration**: Intuitive interface for configuring neural network architecture
- **Real-time Training**: Live training with animated activations and gradient flow
- **Performance Monitoring**: Real-time loss curves, accuracy metrics, and training logs
- **Modern UI**: Built with shadcn/ui components and Framer Motion animations
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Built-in theme switching

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Lyra
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with theme provider
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── Canvas/           # Neural network visualization
│   ├── Charts/           # Recharts components
│   ├── Controls/         # UI controls and toolbars
│   ├── Panels/           # Sidebar and right panel
│   ├── Sidebar/          # Configuration sidebar
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility libraries
│   ├── data/            # CSV parsing and preprocessing
│   ├── tf/              # TensorFlow.js utilities
│   └── utils.ts         # General utilities
├── store/               # Zustand state management
└── workers/             # Web Workers for training
```

## 🎯 Usage

### 1. Upload Dataset

- Click on the "Dataset" tab in the left sidebar
- Upload a CSV file with your data
- The system will auto-detect features and target columns

### 2. Configure Model

- Switch to the "Model" tab
- Adjust the number of hidden layers and neurons
- Select activation function and task type (classification/regression)

### 3. Set Training Parameters

- Go to the "Training" tab
- Configure learning rate, epochs, and batch size

### 4. Start Training

- Click "Start Training" in the canvas area
- Watch the neural network animate during training
- Monitor progress in the right panel

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Machine Learning**: TensorFlow.js
- **Visualization**: Canvas API (PixiJS ready)
- **Charts**: Recharts
- **Data Processing**: PapaParse
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📊 Supported Features

### Dataset Types

- CSV files with automatic parsing
- Classification and regression tasks
- Automatic feature detection
- Data preprocessing and normalization

### Model Architecture

- Multi-layer perceptron (MLP)
- Configurable hidden layers (1-5)
- Adjustable neurons per layer (8-128)
- Multiple activation functions (ReLU, Sigmoid, Tanh)

### Training Features

- Real-time loss and accuracy tracking
- Animated forward and backward passes
- Pause/resume training
- Training history visualization

## 🎨 UI/UX Features

- **Three-panel layout**: Sidebar, Canvas, Right Panel
- **Collapsible panels**: Maximize canvas space when needed
- **Theme switching**: Light, dark, and system themes
- **Responsive design**: Works on all screen sizes
- **Smooth animations**: Framer Motion transitions
- **Real-time updates**: Live metrics and visualizations

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Components

1. Create component in appropriate directory
2. Use shadcn/ui components when possible
3. Follow TypeScript best practices
4. Add proper error handling

### State Management

The application uses Zustand for state management. Key stores:

- `useNeuralNetworkStore` - Main application state
- Dataset, model config, training state, and UI state

## 🚧 Roadmap

- [ ] PixiJS integration for advanced visualization
- [ ] Web Workers for training optimization
- [ ] Model export/import functionality
- [ ] Advanced visualization modes
- [ ] Real-time collaboration features
- [ ] Model comparison tools

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or support, please open an issue on GitHub.

---

Built with ❤️ using Next.js, TensorFlow.js, and modern web technologies.
