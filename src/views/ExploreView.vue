<template>
  <div class="explore-view">
    <header class="header">
      <h1>Explore Location</h1>
      <RouterLink to="/" class="back-btn">← Back to Home</RouterLink>
    </header>

    <main class="main-content">
      <div class="search-section">
        <h2>Enter Location Details</h2>
        
        <form @submit.prevent="handleGenerate" class="location-form">
          <div class="form-row">
            <div class="form-group">
              <label for="latitude">Latitude</label>
              <input
                id="latitude"
                v-model.number="latitude"
                type="number"
                step="any"
                placeholder="e.g., 42.3601"
                required
              />
            </div>

            <div class="form-group">
              <label for="longitude">Longitude</label>
              <input
                id="longitude"
                v-model.number="longitude"
                type="number"
                step="any"
                placeholder="e.g., -71.0589"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="radius">Radius (meters)</label>
            <input
              id="radius"
              v-model.number="radius"
              type="number"
              placeholder="e.g., 1000"
              required
            />
          </div>

          <button type="submit" class="generate-btn" :disabled="loading">
            {{ loading ? 'Generating...' : 'Generate Historical Context' }}
          </button>
        </form>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>

      <div v-if="context" class="context-section">
        <div class="context-header">
          <h3>{{ context.mainLocation }}</h3>
          <button @click="clearContext" class="clear-btn">Clear</button>
        </div>
        
        <div class="context-content">
          <p>{{ context.context }}</p>
        </div>

        <div class="question-section">
          <h4>Ask a Follow-up Question</h4>
          <form @submit.prevent="handleQuestion" class="question-form">
            <input
              v-model="question"
              type="text"
              placeholder="e.g., What events happened here during the American Revolution?"
              :disabled="answerLoading"
            />
            <button type="submit" :disabled="answerLoading || !question">
              {{ answerLoading ? 'Asking...' : 'Ask' }}
            </button>
          </form>

          <div v-if="answers.length" class="answers">
            <div v-for="(qa, index) in answers" :key="index" class="qa-item">
              <div class="question-text">
                <strong>Q:</strong> {{ qa.question }}
              </div>
              <div class="answer-text">
                <strong>A:</strong> {{ qa.answer }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { historyService } from '@/services/history.service'
import { chatService } from '@/services/chat.service'
import type { HistoricalContext } from '@/types'

const authStore = useAuthStore()

const latitude = ref<number>(42.3601)
const longitude = ref<number>(-71.0589)
const radius = ref<number>(1000)
const loading = ref(false)
const error = ref('')

const context = ref<HistoricalContext | null>(null)
const question = ref('')
const answerLoading = ref(false)
const answers = ref<Array<{ question: string; answer: string }>>([])

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

const clearContext = () => {
  context.value = null
  answers.value = []
  error.value = ''
}
</script>

<style scoped>
.explore-view {
  min-height: 100vh;
  background: var(--background);
}

.header {
  background: var(--primary-color);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.search-section {
  background: var(--card-background);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.search-section h2 {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.location-form .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.generate-btn {
  width: 100%;
  padding: 0.875rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.2s;
}

.generate-btn:hover:not(:disabled) {
  background: var(--primary-dark);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #ffebee;
  color: var(--error-color);
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.context-section {
  background: var(--card-background);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.context-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
}

.context-header h3 {
  color: var(--text-primary);
  font-size: 1.5rem;
}

.clear-btn {
  background: var(--error-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.context-content {
  margin-bottom: 2rem;
  line-height: 1.6;
  color: var(--text-primary);
}

.question-section {
  border-top: 2px solid var(--border-color);
  padding-top: 2rem;
}

.question-section h4 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.question-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.question-form input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

.question-form input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.question-form button {
  background: var(--secondary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.question-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.answers {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.qa-item {
  background: var(--background);
  padding: 1rem;
  border-radius: 4px;
}

.question-text {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.answer-text {
  color: var(--text-secondary);
  line-height: 1.6;
}
</style>

