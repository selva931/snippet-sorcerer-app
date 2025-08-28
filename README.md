# Snippet Sorcerer Backend

Production-ready backend system for Snippet Sorcerer - an AI-powered code explanation platform with Supabase integration.

## Features

- **🤖 AI-Powered Explanations**: Get plain-English explanations of any code
- **📊 Visual Flow Charts**: Auto-generated Mermaid diagrams showing code flow
- **🧠 Interactive Quizzes**: Test understanding with contextual questions
- **📝 Multi-Language Support**: JavaScript, TypeScript, Python, Java, C++, Go, SQL, HTML, CSS
- **🎯 Adaptive Learning Levels**: From beginner to professional explanations
- **♿ Accessibility First**: WCAG 2.1 AA compliant with keyboard navigation
- **🎨 Beautiful UI**: Modern design with dark/light mode support

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd codequest
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Open [http://localhost:8080](http://localhost:8080) in your browser

### Environment Setup

Create a `.env.local` file with your preferred LLM provider:

```bash
# Choose one or more providers
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
DEEPSEEK_API_KEY=your_deepseek_key

# Optional: Enable logging (development only)
ALLOW_LOGGING=false
```

## Usage

1. **Paste Code**: Enter or upload your code in the editor
2. **Select Language**: Auto-detect or manually choose the programming language
3. **Choose Level**: Pick explanation complexity (12-year-old to professional)
4. **Get Explanation**: View AI-generated explanations, diagrams, and quizzes
5. **Take Quiz**: Test your understanding with interactive questions

### Sample Codes

Try these built-in examples:
- FizzBuzz (Python)
- Binary Search (JavaScript)
- More samples in `/public/samples/`

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Diagrams**: Mermaid
- **State Management**: React Query
- **Code Analysis**: Tree-sitter parsers
- **AI Providers**: OpenAI, Anthropic, Google, DeepSeek

## Architecture

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── CodeInput.tsx   # Code editor component
│   ├── ExplanationResults.tsx
│   └── MermaidDiagram.tsx
├── pages/              # Page components
│   └── Index.tsx       # Main application page
├── lib/                # Utility libraries
│   ├── analysis/       # Code analysis utilities
│   ├── llm/           # LLM provider abstraction
│   └── quiz/          # Quiz generation
└── styles/            # Global styles
```

## API Endpoints

### POST /api/explain
Analyzes code and returns explanation, diagram, and quiz.

**Request:**
```json
{
  "code": "function example() { return 'hello'; }",
  "language": "javascript",
  "level": "15"
}
```

**Response:**
```json
{
  "summary": ["Function that returns hello"],
  "walkthrough": "Step-by-step explanation...",
  "mermaidDiagram": "graph TD...",
  "quiz": {
    "questions": [...],
    "answers": [...],
    "hints": [...]
  }
}
```

### POST /api/run
Executes JavaScript/Python code in sandboxed environment.

**Security Features:**
- 2-second CPU timeout
- 128MB memory limit
- No file/network access
- Safe execution environment

## Development

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Docker Development

```bash
# Start with Docker Compose
docker-compose up -dev

# Build production image
docker build -t codequest .
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Add environment variables
3. Deploy automatically

### Manual Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Security

- Input sanitization for all code inputs
- Sandboxed code execution
- Rate limiting (basic in-memory)
- No server-side code storage by default
- Privacy-first design

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus management

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- Write TypeScript with strict mode
- Follow component patterns
- Add tests for new features
- Update documentation
- Ensure accessibility compliance

## Future Enhancements

- 📁 Multi-file project analysis
- 🔗 GitHub repository import
- 🏫 Classroom mode for educators
- 📄 Export explanations to PDF
- 🌍 Multi-language interface
- 📊 Advanced analytics dashboard
- 🎮 Gamification system
- 🔌 VS Code extension

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@codequest.dev
- 🐛 Issues: [GitHub Issues](https://github.com/codequest/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/codequest/discussions)

---

Made with ❤️ for coding beginners everywhere