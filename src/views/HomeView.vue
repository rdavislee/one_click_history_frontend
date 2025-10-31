<template>
  <div class="home">
    <header class="header">
      <h1>One Click History</h1>
      <div class="user-info">
        <span>{{ authStore.username }}</span>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </header>

    <div class="main-container">
      <!-- Sidebar with previous chats -->
      <aside class="sidebar">
        <h2>Previous Chats</h2>
        
        <div v-if="loadingChats" class="sidebar-loading">
          Loading...
        </div>
        
        <div v-else-if="chatError" class="sidebar-error">
          {{ chatError }}
        </div>
        
        <div v-else-if="!chats.length" class="sidebar-empty">
          <p>No previous chats yet. Start exploring!</p>
        </div>
        
        <div v-else class="chats-list">
          <div
            v-for="chat in chats"
            :key="chat.sessionId"
            class="chat-item"
            @click="loadChat(chat.sessionId)"
          >
            <div class="chat-item-title">{{ chat.mainLocation }}</div>
            <div class="chat-item-date">{{ formatDate(chat.timestamp) }}</div>
          </div>
        </div>
      </aside>

      <!-- Main content area -->
      <main class="main-content">
        <div class="explore-section">
          <h2>Explore a New Location</h2>
          <p class="subtitle">Enter coordinates and radius to discover historical context</p>
          
          <form @submit.prevent="handleStartChat" class="location-form">
            <div class="location-actions">
              <button 
                type="button" 
                @click="requestCurrentLocation" 
                class="location-btn"
                :disabled="gettingLocation"
              >
                <span class="location-icon">📍</span>
                {{ gettingLocation ? 'Getting location...' : 'Use My Location' }}
              </button>
              <div v-if="locationError" class="location-error">
                {{ locationError }}
              </div>
            </div>

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
              <label for="radius">Search Radius: {{ formatRadius(radius) }}</label>
              <input
                id="radius"
                v-model.number="radiusIndex"
                type="range"
                min="0"
                max="4"
                step="1"
                class="radius-slider"
              />
              <div class="radius-labels">
                <span>100m</span>
                <span>1km</span>
                <span>10km</span>
                <span>100km</span>
                <span>1000km</span>
              </div>
            </div>

            <button type="submit" class="start-chat-btn">
              Start Chat
            </button>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { chatService } from '@/services/chat.service'
import type { ChatSession } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

// Form fields
const latitude = ref<number>()
const longitude = ref<number>()
const radiusIndex = ref<number>(1) // Default to 1km (index 1)

// Radius options in meters
const radiusOptions = [100, 1000, 10000, 100000, 1000000]

// Computed radius value in meters
const radius = computed(() => radiusOptions[radiusIndex.value])

// Geolocation
const gettingLocation = ref(false)
const locationError = ref('')

// Chat history
const chats = ref<ChatSession[]>([])
const loadingChats = ref(true)
const chatError = ref('')

onMounted(async () => {
  await loadChats()
})

const loadChats = async () => {
  if (!authStore.userId) return

  loadingChats.value = true
  chatError.value = ''

  try {
    const result = await chatService.getUserChats(authStore.userId)
    // Filter out any invalid chats and sort by timestamp, most recent first
    chats.value = result
      .filter(chat => chat.sessionId && chat.timestamp && chat.mainLocation)
      .sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
  } catch (err) {
    chatError.value = 'Failed to load chats'
    console.error(err)
  } finally {
    loadingChats.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Recent'
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const requestCurrentLocation = () => {
  // Check if geolocation is supported
  if (!navigator.geolocation) {
    locationError.value = 'Geolocation is not supported by your browser'
    return
  }

  gettingLocation.value = true
  locationError.value = ''

  navigator.geolocation.getCurrentPosition(
    // Success callback
    (position) => {
      latitude.value = position.coords.latitude
      longitude.value = position.coords.longitude
      gettingLocation.value = false
      locationError.value = ''
    },
    // Error callback
    (error) => {
      gettingLocation.value = false
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          // User denied - silently do nothing, leave fields empty
          locationError.value = ''
          break
        case error.POSITION_UNAVAILABLE:
          locationError.value = 'Location information is unavailable'
          break
        case error.TIMEOUT:
          locationError.value = 'Location request timed out'
          break
        default:
          locationError.value = 'An unknown error occurred'
          break
      }
    },
    // Options
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}

const handleStartChat = () => {
  // Navigate to chat view with coordinates and radius as query params
  router.push({
    name: 'chat',
    query: {
      lat: latitude.value,
      lng: longitude.value,
      radius: radius.value // radius is a computed value
    }
  })
}

const loadChat = (sessionId: string) => {
  // Navigate to chat view with session ID
  router.push({
    name: 'chat',
    params: { sessionId }
  })
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const formatRadius = (meters: number): string => {
  if (meters < 1000) {
    return `${meters}m`
  } else {
    return `${meters / 1000}km`
  }
}
</script>

<style scoped>
.home {
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

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background 0.2s;
  cursor: pointer;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar styles */
.sidebar {
  width: 280px;
  background: var(--card-background);
  border-right: 2px solid var(--border-color);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 72px); /* Account for header height */
  overflow: hidden;
}

.sidebar h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
  flex-shrink: 0;
}

.sidebar-loading,
.sidebar-error,
.sidebar-empty {
  padding: 1rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
  flex-shrink: 0;
}

.sidebar-error {
  color: var(--error-color);
}

.chats-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  flex: 1;
  padding-right: 0.25rem;
}

/* Scrollbar styling for sidebar */
.chats-list::-webkit-scrollbar {
  width: 6px;
}

.chats-list::-webkit-scrollbar-track {
  background: transparent;
}

.chats-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.chats-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

.chat-item {
  padding: 0.875rem;
  background: var(--background);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.chat-item:hover {
  border-color: var(--secondary-color);
  background: linear-gradient(to right, rgba(33, 150, 243, 0.05), white);
  transform: translateX(4px);
  box-shadow: -2px 0 0 var(--secondary-color);
}

.chat-item-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-item-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* Main content styles */
.main-content {
  flex: 1;
  padding: 3rem;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.explore-section {
  background: var(--card-background);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(33, 150, 243, 0.15);
  border-top: 4px solid var(--secondary-color);
  max-width: 600px;
  width: 100%;
}

.explore-section h2 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  text-align: center;
}

.subtitle {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.location-form {
  display: flex;
  flex-direction: column;
}

.location-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--border-color);
}

.location-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--secondary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.location-btn:hover:not(:disabled) {
  background: #1976D2;
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(33, 150, 243, 0.3);
}

.location-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.location-icon {
  font-size: 1.2em;
}

.location-error {
  font-size: 0.875rem;
  color: var(--error-color);
  text-align: center;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input[type="number"] {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input[type="number"]:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* Radius slider styling */
.radius-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.radius-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 3px solid var(--secondary-color);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.radius-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 3px 8px rgba(33, 150, 243, 0.4);
}

.radius-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 3px solid var(--secondary-color);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.radius-slider::-moz-range-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 3px 8px rgba(33, 150, 243, 0.4);
}

.radius-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  padding: 0 2px;
}

.radius-labels span {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.start-chat-btn {
  width: 100%;
  padding: 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
}

.start-chat-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}
</style>

