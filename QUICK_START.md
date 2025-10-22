# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will be available at **http://localhost:3000**

### 3. Make Sure Backend is Running
The backend API should be running at **http://localhost:8000**

```bash
# In the backend repository
deno task concepts
```

---

## 📝 First Time Setup

1. Open http://localhost:3000 in your browser
2. Click "Register here" to create an account
3. After registration, you'll be automatically logged in
4. Explore the application:
   - **Explore Location** - Generate historical context for any coordinates
   - **View History** - See your past explorations

---

## 🎯 Features

### ✅ User Authentication
- Register new accounts
- Login with username/password
- Persistent sessions (localStorage)

### ✅ Location Exploration
- Enter geographic coordinates
- Set search radius
- Generate AI-powered historical narratives
- Ask follow-up questions about locations

### ✅ History Management
- View all past explorations
- See exploration timestamps
- Track visited locations

---

## 🛠 Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe development
- **Vue Router** - Client-side routing
- **Pinia** - State management
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client

---

## 📚 Documentation

- [README.md](./README.md) - Project overview
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Comprehensive development guide
- [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) - Backend API reference

---

## 🐛 Troubleshooting

**Issue: Frontend can't connect to backend**
- Ensure backend is running on http://localhost:8000
- Check browser console for errors

**Issue: Login fails**
- Verify backend database is connected
- Check backend console for errors
- Try registering a new account

**Issue: TypeScript errors in IDE**
- Run `npm run type-check` to verify types
- Ensure Vue language features extension is installed (Volar)

---

## 📦 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint and fix code |
| `npm run type-check` | Type check TypeScript |

---

## 🎨 Project Structure

```
one_click_history_frontend/
├── src/
│   ├── assets/         # Styles
│   ├── router/         # Routes
│   ├── services/       # API services
│   ├── stores/         # State management
│   ├── types/          # TypeScript types
│   ├── views/          # Pages
│   ├── App.vue
│   └── main.ts
├── public/             # Static assets
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🔄 Development Workflow

1. Make changes to source files
2. See instant updates with Hot Module Replacement (HMR)
3. Check for TypeScript errors: `npm run type-check`
4. Fix linting issues: `npm run lint`
5. Build for production: `npm run build`

---

## 🌐 Environment Configuration

The Vite development server automatically proxies API requests:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api`

No additional configuration needed for local development!

---

## 💡 Tips

- Use Vue DevTools browser extension for debugging
- All API requests to `/api/*` are proxied to backend
- Authentication state persists in localStorage
- TypeScript provides autocomplete and type checking
- Vite provides instant hot reload for fast development

---

## 🚀 Ready to Deploy?

See [DEVELOPMENT.md](./DEVELOPMENT.md) for production deployment instructions.

