const express = require('express')
const cors = require('cors')
const { createClient } = require('@supabase/supabase-js')
const { LLMProvider } = require('../src/lib/backend/llm')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// LLM Provider
const llmProvider = new LLMProvider({
  provider: process.env.MODEL_PROVIDER || 'mock',
  apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
  model: process.env.MODEL_NAME
})

// Middleware to verify auth
async function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !userData.user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    req.userId = userData.user.id
    next()
  } catch (error) {
    console.error('Auth verification error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
}

// POST /api/explain
app.post('/api/explain', verifyAuth, async (req, res) => {
  try {
    const { snippet_id, title, language, code, reading_level } = req.body
    const userId = req.userId

    if (!code || !language) {
      return res.status(400).json({ error: 'Missing required fields: code, language' })
    }

    let snippetId = snippet_id

    // Create or update snippet
    if (snippetId) {
      const { error: updateError } = await supabase
        .from('snippets')
        .update({
          title,
          language,
          code,
          status: 'pending'
        })
        .eq('id', snippetId)
        .eq('owner', userId)

      if (updateError) {
        console.error('Update snippet error:', updateError)
        return res.status(500).json({ error: 'Failed to update snippet' })
      }
    } else {
      const { data: snippetData, error: insertError } = await supabase
        .from('snippets')
        .insert({
          owner: userId,
          title: title || 'Untitled',
          language,
          code,
          status: 'pending'
        })
        .select()
        .single()

      if (insertError || !snippetData) {
        console.error('Insert snippet error:', insertError)
        return res.status(500).json({ error: 'Failed to create snippet' })
      }

      snippetId = snippetData.id
    }

    // Call LLM
    const llmResponse = await llmProvider.explain(code, language, reading_level || 'cs1')

    // Update snippet with results
    const { data: updatedSnippet, error: snippetUpdateError } = await supabase
      .from('snippets')
      .update({
        explanation: llmResponse.explanation,
        mermaid_diagram: llmResponse.mermaid,
        trace_table: llmResponse.trace,
        status: 'ready'
      })
      .eq('id', snippetId)
      .select()
      .single()

    if (snippetUpdateError) {
      console.error('Update snippet with results error:', snippetUpdateError)
      return res.status(500).json({ error: 'Failed to save explanation' })
    }

    // Delete existing quizzes
    await supabase
      .from('quizzes')
      .delete()
      .eq('snippet_id', snippetId)

    // Insert new quizzes
    const quizInserts = llmResponse.quizzes.map(quiz => ({
      snippet_id: snippetId,
      question: quiz.question,
      choices: quiz.choices,
      answer: quiz.answer,
      hint: quiz.hint,
      difficulty: quiz.difficulty
    }))

    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert(quizInserts)
      .select()

    if (quizError) {
      console.error('Insert quizzes error:', quizError)
      return res.status(500).json({ error: 'Failed to save quizzes' })
    }

    res.json({
      snippet: updatedSnippet,
      quizzes: quizData
    })
  } catch (error) {
    console.error('Explain API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/snippet
app.get('/api/snippet', verifyAuth, async (req, res) => {
  try {
    const { id } = req.query
    const userId = req.userId

    if (!id) {
      return res.status(400).json({ error: 'Missing snippet ID' })
    }

    // Get snippet
    const { data: snippet, error: snippetError } = await supabase
      .from('snippets')
      .select('*')
      .eq('id', id)
      .eq('owner', userId)
      .single()

    if (snippetError || !snippet) {
      return res.status(404).json({ error: 'Snippet not found' })
    }

    // Get quizzes
    const { data: quizzes, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('snippet_id', id)
      .order('created_at', { ascending: true })

    if (quizError) {
      console.error('Get quizzes error:', quizError)
      return res.status(500).json({ error: 'Failed to get quizzes' })
    }

    res.json({
      snippet,
      quizzes: quizzes || []
    })
  } catch (error) {
    console.error('Get snippet API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/regenerate
app.post('/api/regenerate', verifyAuth, async (req, res) => {
  try {
    const { snippet_id, reading_level } = req.body
    const userId = req.userId

    if (!snippet_id) {
      return res.status(400).json({ error: 'Missing snippet_id' })
    }

    // Get existing snippet
    const { data: snippet, error: snippetError } = await supabase
      .from('snippets')
      .select('*')
      .eq('id', snippet_id)
      .eq('owner', userId)
      .single()

    if (snippetError || !snippet) {
      return res.status(404).json({ error: 'Snippet not found' })
    }

    // Set status to pending
    await supabase
      .from('snippets')
      .update({ status: 'pending' })
      .eq('id', snippet_id)

    // Call LLM
    const llmResponse = await llmProvider.explain(snippet.code, snippet.language, reading_level || 'cs1')

    // Update snippet with new results
    const { data: updatedSnippet, error: updateError } = await supabase
      .from('snippets')
      .update({
        explanation: llmResponse.explanation,
        mermaid_diagram: llmResponse.mermaid,
        trace_table: llmResponse.trace,
        status: 'ready'
      })
      .eq('id', snippet_id)
      .select()
      .single()

    if (updateError) {
      console.error('Update snippet error:', updateError)
      return res.status(500).json({ error: 'Failed to update snippet' })
    }

    // Delete existing quizzes
    await supabase
      .from('quizzes')
      .delete()
      .eq('snippet_id', snippet_id)

    // Insert new quizzes
    const quizInserts = llmResponse.quizzes.map(quiz => ({
      snippet_id: snippet_id,
      question: quiz.question,
      choices: quiz.choices,
      answer: quiz.answer,
      hint: quiz.hint,
      difficulty: quiz.difficulty
    }))

    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert(quizInserts)
      .select()

    if (quizError) {
      console.error('Insert quizzes error:', quizError)
      return res.status(500).json({ error: 'Failed to save quizzes' })
    }

    res.json({
      snippet: updatedSnippet,
      quizzes: quizData
    })
  } catch (error) {
    console.error('Regenerate API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(port, () => {
  console.log(`Snippet Sorcerer backend running on port ${port}`)
  console.log(`Health check: http://localhost:${port}/health`)
})