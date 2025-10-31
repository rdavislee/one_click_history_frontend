<template>
  <div class="chat-view">
    <header class="header">
      <h1>{{ context ? context.mainLocation : 'Historical Chat' }}</h1>
      <RouterLink to="/" class="back-btn">← Back to Home</RouterLink>
    </header>

    <main class="main-content">
      <div v-if="initializing" class="loading-state">
        <div class="spinner"></div>
        <p>Loading chat...</p>
      </div>

      <div v-else-if="initError" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Failed to Load Chat</h3>
        <p>{{ initError }}</p>
        <RouterLink to="/" class="home-btn">Return Home</RouterLink>
      </div>

      <div v-else class="chat-container">
        <!-- Initial context or generating state -->
        <div v-if="!context && !loading" class="generating-placeholder">
          <p>Click "Generate Context" to start exploring this location's history.</p>
        </div>

        <div v-if="loading" class="generating-state">
          <div class="spinner"></div>
          <p>Generating historical context...</p>
        </div>

        <!-- Context display -->
        <div v-if="context" class="context-section">
          <div class="message context-message">
            <div class="message-label">Historical Context</div>
            <div class="message-content markdown-content" v-html="renderMarkdown(context.context)"></div>
          </div>

          <!-- Q&A History -->
          <div v-for="(qa, index) in answers" :key="index" class="qa-pair">
            <div class="message question-message">
              <div class="message-label">Your Question</div>
              <div class="message-content">{{ qa.question }}</div>
            </div>
            <div class="message answer-message">
              <div class="message-label">Answer</div>
              <div class="message-content markdown-content" v-html="renderMarkdown(qa.answer)"></div>
            </div>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- Question input -->
        <div v-if="context" class="question-input-section">
          <form @submit.prevent="handleQuestion" class="question-form">
            <input
              v-model="question"
              type="text"
              placeholder="Ask a follow-up question..."
              :disabled="answerLoading"
              class="question-input"
            />
            <button type="submit" :disabled="answerLoading || !question" class="ask-btn">
              {{ answerLoading ? 'Asking...' : 'Ask' }}
            </button>
          </form>
        </div>

        <!-- Generate button for new chats -->
        <div v-if="!context && !loading" class="generate-section">
          <button @click="handleGenerate" class="generate-btn">
            Generate Historical Context
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { historyService } from '@/services/history.service'
import { chatService } from '@/services/chat.service'
import type { HistoricalContext } from '@/types'
import { marked } from 'marked'

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true
})

const route = useRoute()
const authStore = useAuthStore()

// Chat state
const context = ref<HistoricalContext | null>(null)
const answers = ref<Array<{ question: string; answer: string }>>([])
const question = ref('')

// Loading states
const initializing = ref(false)
const loading = ref(false)
const answerLoading = ref(false)

// Error states
const initError = ref('')
const error = ref('')

// Location data
const latitude = ref<number>(0)
const longitude = ref<number>(0)
const radius = ref<number>(0)

onMounted(async () => {
  await initializeChat()
})

const initializeChat = async () => {
  const sessionId = route.params.sessionId as string | undefined

  if (sessionId) {
    // Load existing chat
    await loadExistingChat(sessionId)
  } else {
    // New chat from coordinates
    const lat = parseFloat(route.query.lat as string)
    const lng = parseFloat(route.query.lng as string)
    const rad = parseInt(route.query.radius as string)

    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
      initError.value = 'Invalid coordinates or radius provided'
      return
    }

    latitude.value = lat
    longitude.value = lng
    radius.value = rad

    // Auto-generate context for new chats
    await handleGenerate()
  }
}

const loadExistingChat = async (sessionId: string) => {
  if (!authStore.userId) return

  initializing.value = true
  initError.value = ''

  try {
    // First, get the chat metadata from the ledger
    const chatSession = await chatService.getChat(sessionId, authStore.userId)
    
    // Set the location data
    latitude.value = chatSession.location.lat
    longitude.value = chatSession.location.lng
    radius.value = chatSession.radius

    // Then, get the full conversation history from the AI agent
    // According to the API docs, we need to use _getChat with locationName
    const chatData = await historyService.getChat(chatSession.mainLocation)
    
    // Parse the chat history (structure depends on backend implementation)
    // For now, we'll set up the basic context
    context.value = {
      context: '', // Will be populated from chat history
      mainLocation: chatSession.mainLocation,
      sessionId: sessionId
    }

    // Note: The actual implementation of loading full chat history depends on
    // what the backend returns. We may need to adjust this based on the actual response.
    console.log('Loaded chat data:', chatData)
    
    // TODO: Parse chatData to populate context.value.context and answers.value
    // This will depend on the backend's response format
    
  } catch (err) {
    initError.value = err instanceof Error ? err.message : 'Failed to load chat session'
    console.error('Error loading chat:', err)
  } finally {
    initializing.value = false
  }
}

const handleGenerate = async () => {
  if (!authStore.userId) return

  error.value = ''
  loading.value = true

  try {
    const result = await historyService.generateContext(
      authStore.userId,
      { lat: latitude.value, lng: longitude.value },
      radius.value
    )

    context.value = result
    answers.value = []

    // Record the chat session
    await chatService.recordChat(
      result.sessionId,
      authStore.userId,
      { lat: latitude.value, lng: longitude.value },
      radius.value,
      result.mainLocation
    )
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to generate context'
  } finally {
    loading.value = false
  }
}

const handleQuestion = async () => {
  if (!authStore.userId || !context.value || !question.value) return

  answerLoading.value = true
  error.value = ''

  try {
    const answer = await historyService.answerQuestion(
      context.value.sessionId,
      authStore.userId,
      question.value
    )

    answers.value.push({
      question: question.value,
      answer
    })

    question.value = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to get answer'
  } finally {
    answerLoading.value = false
  }
}

// Function to render markdown content
const renderMarkdown = (text: string): string => {
  return marked.parse(text) as string
}
</script>

<style scoped>
.chat-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #f0f9ff 0%, var(--background) 100%);
}

.header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.back-btn {
  color: white;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background 0.2s;
  cursor: pointer;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
}

/* Loading and error states */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top-color: var(--secondary-color);
  border-right-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.error-state p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.home-btn {
  background: var(--primary-color);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  font-weight: 600;
  transition: background 0.2s;
}

.home-btn:hover {
  background: var(--primary-dark);
}

/* Chat container */
.chat-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
}

.generating-placeholder,
.generating-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.generating-state {
  background: var(--card-background);
  border-radius: 8px;
}

/* Context and messages */
.context-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.message {
  background: var(--card-background);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.context-message {
  border-left: 4px solid var(--primary-color);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.1);
}

.question-message {
  border-left: 4px solid var(--secondary-color);
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.1);
}

.answer-message {
  border-left: 4px solid #00BCD4;
  background: linear-gradient(to right, #E0F7FA, var(--card-background));
  box-shadow: 0 2px 8px rgba(0, 188, 212, 0.1);
}

.message-label {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.message-content {
  color: var(--text-primary);
  line-height: 1.7;
  white-space: pre-wrap;
}

/* Markdown content styling */
.markdown-content {
  white-space: normal;
}

.markdown-content :deep(p) {
  margin: 0.5em 0;
}

.markdown-content :deep(p:first-child) {
  margin-top: 0;
}

.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-content :deep(strong) {
  font-weight: 700;
  color: var(--text-primary);
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.markdown-content :deep(li) {
  margin: 0.25em 0;
}

.markdown-content :deep(code) {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.15em 0.4em;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background: rgba(0, 0, 0, 0.05);
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5em 0;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4) {
  margin: 1em 0 0.5em 0;
  font-weight: 600;
}

.markdown-content :deep(h1) {
  font-size: 1.5em;
}

.markdown-content :deep(h2) {
  font-size: 1.3em;
}

.markdown-content :deep(h3) {
  font-size: 1.15em;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid var(--border-color);
  padding-left: 1em;
  margin: 0.5em 0;
  color: var(--text-secondary);
}

.markdown-content :deep(a) {
  color: var(--secondary-color);
  text-decoration: underline;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 2px solid var(--border-color);
  margin: 1em 0;
}

.qa-pair {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Error message */
.error-message {
  background: #ffebee;
  color: var(--error-color);
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid var(--error-color);
}

/* Question input */
.question-input-section {
  position: sticky;
  bottom: 0;
  background: var(--background);
  padding: 1rem 0;
  border-top: 2px solid var(--border-color);
  margin-top: auto;
}

.question-form {
  display: flex;
  gap: 1rem;
  background: var(--card-background);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
  border: 2px solid transparent;
  transition: border-color 0.3s;
}

.question-form:focus-within {
  border-color: var(--secondary-color);
}

.question-input {
  flex: 1;
  padding: 0.875rem;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.question-input:focus {
  outline: none;
  border-color: var(--secondary-color);
}

.ask-btn {
  background: var(--secondary-color);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.ask-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.ask-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Generate button */
.generate-section {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.generate-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 1rem 3rem;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.generate-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}
</style>

