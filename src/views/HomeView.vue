<template>
  <div class="home">
    <header class="header">
      <h1>One Click History</h1>
      <div class="user-info">
        <span>{{ authStore.username }}</span>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </header>

    <main class="main-content">
      <div class="welcome">
        <h2>Welcome to One Click History</h2>
        <p>Explore the historical context of any location with AI-powered narratives.</p>
      </div>

      <div class="actions">
        <RouterLink to="/explore" class="action-card">
          <div class="icon">📍</div>
          <h3>Explore Location</h3>
          <p>Discover historical stories about a specific place</p>
        </RouterLink>

        <RouterLink to="/history" class="action-card">
          <div class="icon">📚</div>
          <h3>View History</h3>
          <p>Browse your past explorations</p>
        </RouterLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.welcome {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.welcome p {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

.actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.action-card {
  background: var(--card-background);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
}

.action-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.action-card .icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.action-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.action-card p {
  color: var(--text-secondary);
  line-height: 1.5;
}
</style>

