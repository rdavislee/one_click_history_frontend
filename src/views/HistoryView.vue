<template>
  <div class="history-view">
    <header class="header">
      <h1>Your Exploration History</h1>
      <RouterLink to="/" class="back-btn">← Back to Home</RouterLink>
    </header>

    <main class="main-content">
      <div v-if="loading" class="loading">
        Loading your exploration history...
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-else-if="!chats.length" class="empty-state">
        <div class="empty-icon">📚</div>
        <h2>No explorations yet</h2>
        <p>Start exploring locations to build your history</p>
        <RouterLink to="/explore" class="explore-btn">
          Explore Now
        </RouterLink>
      </div>

      <div v-else class="chats-list">
        <div v-for="chat in chats" :key="chat.sessionId" class="chat-card">
          <div class="chat-header">
            <h3>{{ chat.mainLocation }}</h3>
            <span class="timestamp">{{ formatDate(chat.timestamp) }}</span>
          </div>
          
          <div class="chat-details">
            <div class="detail">
              <strong>Coordinates:</strong>
              {{ chat.location.lat.toFixed(4) }}, {{ chat.location.lng.toFixed(4) }}
            </div>
            <div class="detail">
              <strong>Radius:</strong> {{ chat.radius }}m
            </div>
          </div>

          <div class="chat-actions">
            <button @click="viewChat(chat.sessionId)" class="view-btn">
              View Details
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { chatService } from '@/services/chat.service'
import type { ChatSession } from '@/types'

const authStore = useAuthStore()

const chats = ref<ChatSession[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  await loadChats()
})

const loadChats = async () => {
  if (!authStore.userId) return

  loading.value = true
  error.value = ''

  try {
    const result = await chatService.getUserChats(authStore.userId)
    // Sort by timestamp, most recent first
    chats.value = result.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load chat history'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const viewChat = (sessionId: string) => {
  // For now, just show an alert. In a full implementation,
  // this would navigate to a detailed view of the chat session
  alert(`View chat session: ${sessionId}\n\nThis feature could be expanded to show the full conversation history.`)
}
</script>

<style scoped>
.history-view {
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
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
  font-size: 1.125rem;
}

.error-message {
  background: #ffebee;
  color: var(--error-color);
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.explore-btn {
  display: inline-block;
  background: var(--primary-color);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 4px;
  font-weight: 600;
  transition: background 0.2s;
}

.explore-btn:hover {
  background: var(--primary-dark);
}

.chats-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chat-card {
  background: var(--card-background);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s;
}

.chat-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.chat-header h3 {
  color: var(--text-primary);
  font-size: 1.25rem;
}

.timestamp {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.chat-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail {
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.detail strong {
  color: var(--text-primary);
}

.chat-actions {
  display: flex;
  justify-content: flex-end;
}

.view-btn {
  background: var(--secondary-color);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  transition: opacity 0.2s;
}

.view-btn:hover {
  opacity: 0.9;
}
</style>

