Here’s a **design document (MVP version)** for your upgraded Neural Network Visualizer — focused specifically on **frontend/UI excellence**, **Next.js architecture**, and **interactive DNN visualization** for classification and regression tasks.

---

# 🧠 Neural Network Visualizer — MVP Design Document

**Version:** 1.0
**Owner:** Tanvi Sharma
**Tech Stack:** Next.js 15 (App Router), shadcn/ui, TensorFlow.js, React Flow, PixiJS, Framer Motion, Zustand

---

## 1. 🎯 Project Overview

### **Goal**

Build a **modern, visually rich, and reliable neural network visualizer** that allows users to:

- Upload datasets (CSV)
- Configure simple DNN architectures (MLP)
- Visualize and **animate forward & backward passes**
- Track **loss/accuracy metrics**
- Use an **intuitive, modern UI** optimized for clarity, stability, and ease of exploration

This version focuses **only** on frontend and visualization polish — not on large-scale data or model persistence.

---

## 2. 🧩 Core Features (MVP Scope)

### **A. Model Visualization**

- Interactive, animated view of DNN layers and connections
- Distinct color schemes for:
  - **Forward pass activations** (pulses, intensity)
  - **Backprop gradients** (reverse pulses, color-coded magnitude)

- Toggle between **classification** (softmax output) and **regression** (single linear output)
- Adjustable number of layers and neurons

### **B. Dataset Handling (basic)**

- CSV upload using PapaParse
- Auto-detection of target column
- Classification: one-hot encoding; Regression: normalization
- Simple preprocessing summary shown in UI

### **C. Training & Simulation**

- Train a TensorFlow.js MLP model
- Animate activations per epoch
- Display real-time:
  - Loss curve (Recharts)
  - Accuracy or R² (depending on task)

- Pause/Resume training
- Adjustable hyperparameters (learning rate, epochs)

### **D. UI & UX**

- Built on **Next.js + shadcn/ui**
- Smooth **Framer Motion** transitions
- Fully **responsive design**
- Built-in light/dark mode
- Toasts for errors, progress, and saves
- Docked layout: sidebar, canvas, right info panel

---

## 3. 🧱 Architectural Overview

### **Frontend-only Architecture**

```
Next.js App Router
│
├── app/
│   ├── layout.tsx (Shell + ThemeProvider)
│   ├── page.tsx (Main visualizer entry)
│   └── api/ (placeholder for future backends)
│
├── components/
│   ├── Sidebar/            ← dataset + model config
│   ├── Canvas/             ← network visualization (PixiJS)
│   ├── Charts/             ← Recharts for metrics
│   ├── Controls/           ← start/pause/reset buttons
│   ├── Panels/             ← logs, metrics, console
│
├── lib/
│   ├── tf/modelBuilder.ts  ← TensorFlow.js model generation
│   ├── tf/trainer.ts       ← training loop, progress events
│   ├── data/parser.ts      ← CSV parsing, type inference
│
├── store/
│   ├── state.ts            ← Zustand global state
│   ├── machine.ts          ← XState training flow
│
├── workers/
│   ├── train.worker.ts     ← offloads training from UI
│
└── styles/
    ├── globals.css
    ├── shadcn.css
```

---

## 4. ⚙️ Technology Breakdown

| Area                   | Library                     | Reason                                                 |
| ---------------------- | --------------------------- | ------------------------------------------------------ |
| UI Framework           | **Next.js 15 (App Router)** | Server Components, client modularity, SEO, performance |
| Component System       | **shadcn/ui**               | Pre-styled, composable, accessible React components    |
| State Management       | **Zustand**                 | Lightweight, reactive, ideal for simulation state      |
| Animation              | **PixiJS + @pixi/react**    | High-performance WebGL rendering for large networks    |
| Graph Editing (future) | **React Flow**              | Optional for editable layer layout                     |
| Motion Transitions     | **Framer Motion**           | For UI panels, tooltips, popups                        |
| Charts                 | **Recharts**                | Real-time loss/metric plotting                         |
| Model Training         | **TensorFlow.js**           | On-device model building and training                  |
| Data Parsing           | **PapaParse**               | Client-side CSV reading                                |

---

## 5. 🎨 UI/UX Design Principles

### **Design Philosophy**

> “Science made visual, interactivity made intuitive.”
> Goal: Make complex neural processes feel alive, approachable, and easy to follow.

### **Layout**

| Region                 | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| **Left Sidebar**       | Dataset upload, preprocessing summary, layer control       |
| **Center Canvas**      | Animated neural network (PixiJS)                           |
| **Right Panel (Tabs)** | Loss chart, metrics, training logs                         |
| **Top Toolbar**        | Task selection (classification/regression), backend, theme |
| **Bottom Status Bar**  | Epoch, loss, accuracy, FPS indicators                      |

### **Visual Language**

- **Colors:** Gradient-coded by magnitude (blues for weights, reds for activations)
- **Neurons:** Circular nodes with dynamic glow (pulse = activation intensity)
- **Connections:** Thin Bezier lines; animated pulse for signal flow
- **Font:** Inter / JetBrains Mono (for clarity + tech aesthetic)

---

## 6. 🧠 User Flow

### **Step 1 — Upload Dataset**

User uploads CSV → auto-detects features/target → summary rendered in Sidebar.

### **Step 2 — Configure Network**

Adjust:

- Hidden layers (slider)
- Neurons per layer
- Activation function
- Task type (classification/regression)

### **Step 3 — Train & Visualize**

- Click “Start Training”
- Canvas animates forward pass per batch
- Recharts update loss/accuracy
- Pause/Resume or Reset training anytime

### **Step 4 — Analyze Metrics**

- Right panel → Charts tab for visual metrics
- Logs tab for training events/errors

---

## 7. 🔁 System States (XState-based)

| State           | Description                 |
| --------------- | --------------------------- |
| `idle`          | No model loaded             |
| `preprocessing` | Dataset being parsed        |
| `compiled`      | Model ready to train        |
| `training`      | Training loop running       |
| `paused`        | Training halted             |
| `completed`     | Training done               |
| `error`         | Exception or invalid config |

---

## 8. 🚀 MVP Milestones

| Phase       | Focus                 | Deliverables                                          |
| ----------- | --------------------- | ----------------------------------------------------- |
| **Phase 1** | UI Layout & State     | Layout (sidebar, canvas, panels), Zustand store       |
| **Phase 2** | Data + Model Pipeline | CSV upload, TF.js model build, compile                |
| **Phase 3** | Visualization Layer   | PixiJS neurons, connections, pulses                   |
| **Phase 4** | Animation + Charts    | Forward/backprop animation, live loss plot            |
| **Phase 5** | UX Polish             | shadcn/ui integration, toasts, transitions            |
| **Phase 6** | Testing & Stability   | Worker thread for training, FPS + memory optimization |

---

## 9. 📈 Success Metrics

- <100 ms latency between training update and visualization frame
- Maintain ≥ 50 FPS on 2–3 hidden layers, 50 neurons each
- Error-free pause/resume/reset transitions
- Mobile-friendly sidebar collapsing
- Visually smooth forward/backward pulse animation

---

## 10. 🧩 Future Extensions (Post-MVP)

- Drag-and-drop architecture editor (React Flow)
- Multiple network visual comparisons
- Attention and CNN layer visualization
- Explainability overlays (gradient visualization, SHAP)
- Model export/import
- Server sync and sharing

---

Would you like me to include a **UI wireframe mockup (layout + color scheme + interactions)** next — showing how each region (sidebar, canvas, right panel) will look in the Next.js + shadcn/ui system?
It will make this design doc visually complete and implementation-ready.
