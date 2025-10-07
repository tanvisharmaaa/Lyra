# 🛠️ Development Guide

This guide covers the development setup, coding standards, and workflow for the Neural Network Visualizer project.

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Git
- VS Code (recommended)

## 🚀 Getting Started

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd Lyra
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Open in VS Code:**
   ```bash
   code .
   ```

## 🎯 Available Scripts

| Script                 | Description                                  |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Start development server with Turbopack      |
| `npm run build`        | Build for production                         |
| `npm run start`        | Start production server                      |
| `npm run lint`         | Run ESLint                                   |
| `npm run lint:fix`     | Run ESLint with auto-fix                     |
| `npm run format`       | Format code with Prettier                    |
| `npm run format:check` | Check code formatting                        |
| `npm run type-check`   | Run TypeScript type checking                 |
| `npm run commit`       | Interactive commit with conventional commits |

## 📝 Code Standards

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

**Examples:**

```bash
feat: add neural network visualization component
fix: resolve hydration error in theme selector
docs: update README with installation instructions
refactor: extract data parsing logic into separate utility
```

### Code Formatting

- **Prettier**: Automatic code formatting on save
- **ESLint**: Code linting with auto-fix capabilities
- **EditorConfig**: Consistent editor settings across team

### TypeScript Guidelines

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use proper typing for all function parameters and return values
- Avoid `any` type unless absolutely necessary
- Use proper generic constraints

### React Best Practices

- Use functional components with hooks
- Prefer `const` over `let` and `var`
- Use proper dependency arrays in `useEffect`
- Implement proper error boundaries
- Use TypeScript for all component props

## 🔧 Development Tools

### Pre-commit Hooks

Husky automatically runs the following on every commit:

1. **Lint-staged**: Runs ESLint and Prettier on staged files
2. **Commitlint**: Validates commit message format

### VS Code Extensions

Recommended extensions (auto-installed via `.vscode/extensions.json`):

- **Prettier**: Code formatter
- **ESLint**: JavaScript/TypeScript linter
- **Tailwind CSS IntelliSense**: Tailwind CSS support
- **TypeScript Importer**: Auto-import TypeScript modules
- **GitLens**: Enhanced Git capabilities
- **Auto Rename Tag**: Automatically rename paired HTML/JSX tags

### Editor Configuration

The project includes:

- `.editorconfig`: Consistent editor settings
- `.vscode/settings.json`: VS Code workspace settings
- `.vscode/extensions.json`: Recommended extensions

## 🧪 Testing Workflow

### Before Committing

1. **Run linting:**

   ```bash
   npm run lint
   ```

2. **Check formatting:**

   ```bash
   npm run format:check
   ```

3. **Type checking:**
   ```bash
   npm run type-check
   ```

### Pre-commit Automation

The following happens automatically when you commit:

1. **Lint-staged** runs ESLint and Prettier on staged files
2. **Commitlint** validates your commit message format
3. If any checks fail, the commit is blocked

### Manual Commit Process

1. **Stage your changes:**

   ```bash
   git add .
   ```

2. **Use conventional commits:**

   ```bash
   npm run commit
   ```

   This opens an interactive prompt to create properly formatted commit messages.

3. **Or commit manually:**
   ```bash
   git commit -m "feat: add new feature"
   ```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── Canvas/           # Neural network visualization
│   ├── Charts/           # Chart components
│   ├── Controls/         # UI controls
│   ├── Panels/           # Sidebar and panels
│   ├── Sidebar/          # Configuration sidebar
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility libraries
│   ├── data/            # Data processing
│   ├── tf/              # TensorFlow.js utilities
│   └── utils.ts         # General utilities
├── store/               # Zustand state management
└── workers/             # Web Workers
```

## 🐛 Troubleshooting

### Common Issues

1. **ESLint errors**: Run `npm run lint:fix` to auto-fix
2. **Prettier formatting**: Run `npm run format` to format all files
3. **Type errors**: Run `npm run type-check` to see TypeScript errors
4. **Commit rejected**: Check your commit message format

### Reset Development Environment

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Reset Husky hooks
npx husky install
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)

## 🤝 Contributing

1. Follow the coding standards outlined above
2. Use conventional commits for all commits
3. Ensure all pre-commit hooks pass
4. Write clear, descriptive commit messages
5. Test your changes thoroughly before committing

---

Happy coding! 🚀
