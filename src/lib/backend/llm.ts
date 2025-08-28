export interface LLMResponse {
  explanation: string
  mermaid: string
  trace: {
    input: string
    steps: Array<{ line: number; vars: Record<string, any> }>
  }
  quizzes: Array<{
    question: string
    choices: string[]
    answer: string
    hint: string
    difficulty: string
  }>
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'mock'
  apiKey?: string
  model?: string
}

export class LLMProvider {
  private config: LLMConfig

  constructor(config: LLMConfig) {
    this.config = config
  }

  async explain(
    code: string, 
    language: string, 
    readingLevel: '12' | '15' | 'cs1' | 'pro' = 'cs1'
  ): Promise<LLMResponse> {
    switch (this.config.provider) {
      case 'openai':
        return this.callOpenAI(code, language, readingLevel)
      case 'anthropic':
        return this.callAnthropic(code, language, readingLevel)
      case 'mock':
      default:
        return this.mockResponse(language)
    }
  }

  private getSystemPrompt(readingLevel: string): string {
    let explanationStyle: string

    switch (readingLevel) {
      case '12':
        explanationStyle = 'simple, analogical explanation for 12-year-olds using everyday comparisons'
        break
      case '15':
        explanationStyle = 'clear explanation for teenagers with basic technical terms'
        break
      case 'cs1':
        explanationStyle = 'technical but beginner-friendly explanation for CS students'
        break
      case 'pro':
        explanationStyle = 'professional, concise explanation for experienced developers'
        break
      default:
        explanationStyle = 'technical but beginner-friendly explanation'
    }

    return `You are a patient coding teacher. Output JSON only. Given code, produce:
{
  "explanation": "<${explanationStyle}>",
  "mermaid": "graph TD\\n    A[Start] --> B[...]",
  "trace": { "input": "sample", "steps": [{ "line": 1, "vars": {...} }] },
  "quizzes": [{ "question": "", "choices": [".."], "answer": "...", "hint": "...", "difficulty": "easy|medium|hard" }]
}
Limit explanation to 6 short paragraphs. Provide exactly 3 quizzes (2 MCQ, 1 predict output).`
  }

  private async callOpenAI(
    code: string, 
    language: string, 
    readingLevel: string
  ): Promise<LLMResponse> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not provided')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: this.getSystemPrompt(readingLevel) },
          { role: 'user', content: `Language: ${language}\nCode:\n${code}` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    
    try {
      return JSON.parse(content)
    } catch (parseError) {
      throw new Error(`Failed to parse LLM response: ${parseError}`)
    }
  }

  private async callAnthropic(
    code: string, 
    language: string, 
    readingLevel: string
  ): Promise<LLMResponse> {
    if (!this.config.apiKey) {
      throw new Error('Anthropic API key not provided')
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-haiku-20240307',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `${this.getSystemPrompt(readingLevel)}\n\nLanguage: ${language}\nCode:\n${code}`
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Anthropic API error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    const content = data.content[0].text
    
    try {
      return JSON.parse(content)
    } catch (parseError) {
      throw new Error(`Failed to parse LLM response: ${parseError}`)
    }
  }

  private mockResponse(language: string): LLMResponse {
    return {
      explanation: `This ${language} code demonstrates key programming concepts. It uses variables to store data and control structures to manage program flow. The logic is structured to handle the main use case efficiently. The implementation follows best practices for readability and maintainability. Each step builds upon the previous one to achieve the desired outcome. This pattern is commonly used in real-world applications.`,
      mermaid: `graph TD
    A[Start] --> B[Initialize Variables]
    B --> C[Process Input]
    C --> D{Check Condition}
    D -->|True| E[Execute Path A]
    D -->|False| F[Execute Path B]
    E --> G[Generate Output]
    F --> G
    G --> H[End]`,
      trace: {
        input: "sample input",
        steps: [
          { line: 1, vars: { input: "sample input" } },
          { line: 2, vars: { input: "sample input", processed: true } },
          { line: 3, vars: { input: "sample input", processed: true, result: "sample output" } }
        ]
      },
      quizzes: [
        {
          question: "What is the main purpose of this code?",
          choices: ["Process data according to specific logic", "Create a graphical user interface", "Manage database connections", "Handle file system operations"],
          answer: "Process data according to specific logic",
          hint: "Look at the overall structure and main operations",
          difficulty: "easy"
        },
        {
          question: "Which programming concept is most important here?",
          choices: ["Variables and control flow", "Network protocols", "Database schemas", "UI frameworks"],
          answer: "Variables and control flow",
          hint: "Think about the fundamental building blocks used",
          difficulty: "medium"
        },
        {
          question: "What would this code output with typical input?",
          choices: ["Processed result", "Error message", "Empty string", "Undefined"],
          answer: "Processed result",
          hint: "Trace through the logic step by step",
          difficulty: "hard"
        }
      ]
    }
  }
}

// Factory function for creating LLM providers
export function createLLMProvider(
  provider: 'openai' | 'anthropic' | 'mock' = 'mock',
  apiKey?: string,
  model?: string
): LLMProvider {
  return new LLMProvider({ provider, apiKey, model })
}