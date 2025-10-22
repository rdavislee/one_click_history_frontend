# Development Guide

## Getting Started

### Prerequisites
- Node.js v18+ 
- npm or yarn
- Backend API running on http://localhost:8000

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Project Structure

```
src/
├── assets/           # Global styles and static assets
├── components/       # Reusable Vue components (to be added)
├── router/           # Vue Router configuration
├── services/         # API service layer
│   ├── api.ts            # Base API client
│   ├── auth.service.ts   # Authentication endpoints
│   ├── chat.service.ts   # Chat ledger endpoints
│   └── history.service.ts # Historical context endpoints
├── stores/           # Pinia state management
│   └── auth.store.ts     # Authentication state
├── types/            # TypeScript type definitions
│   └── index.ts          # API types
├── views/            # Page components
│   ├── HomeView.vue
│   ├── LoginView.vue
│   ├── RegisterView.vue
│   ├── ExploreView.vue
│   └── HistoryView.vue
├── App.vue           # Root component
└── main.ts           # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Lint and fix code
- `npm run type-check` - Run TypeScript type checking

## API Integration

The application is configured to proxy API requests to the backend server:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000/api

All API requests to `/api/*` are automatically proxied to the backend server (configured in `vite.config.ts`).

### API Services

#### Authentication Service
- `register(username, password)` - Create new user account
- `login(username, password)` - Authenticate user
- `changePassword(username, oldPassword, newPassword)` - Update password

#### History Service
- `generateContext(userId, location, radius)` - Generate historical context
- `answerQuestion(sessionId, userId, question)` - Ask follow-up questions
- `clearSession(sessionId, userId)` - Delete context session

#### Chat Service
- `recordChat(sessionId, userId, location, radius, mainLocation)` - Save chat session
- `getUserChats(userId)` - Get all user chat sessions
- `getChat(sessionId, userId)` - Get specific chat session

## State Management

The application uses Pinia for state management:

### Auth Store
- `userId` - Current user's ID
- `username` - Current user's username
- `isAuthenticated` - Authentication status
- `login(username, password)` - Login action
- `register(username, password)` - Registration action
- `logout()` - Logout action

Authentication state is persisted to localStorage.

## Routing

The application uses Vue Router with the following routes:

- `/` - Home page (requires auth)
- `/login` - Login page
- `/register` - Registration page
- `/explore` - Explore locations (requires auth)
- `/history` - View exploration history (requires auth)

Protected routes automatically redirect to `/login` if not authenticated.

## Styling

The application uses CSS custom properties (CSS variables) defined in `src/assets/main.css`:

```css
--primary-color: #4CAF50
--secondary-color: #2196F3
--text-primary: #212121
--text-secondary: #757575
--background: #FAFAFA
--card-background: #FFFFFF
--border-color: #E0E0E0
```

## TypeScript

The project is fully typed with TypeScript. Type definitions are located in `src/types/index.ts`.

### Key Types
- `Coordinates` - Geographic coordinates
- `ChatSession` - Chat session data
- `HistoricalContext` - Generated historical context
- `User` - User information

## Development Tips

1. **Hot Module Replacement**: Vite provides fast HMR. Save your changes and see them instantly.

2. **Vue DevTools**: Install the Vue DevTools browser extension for debugging.

3. **TypeScript**: Use TypeScript for better type safety and IDE support.

4. **API Errors**: All API errors are handled by the axios interceptor and thrown as Error objects.

5. **Authentication**: User authentication is handled via localStorage. The auth store automatically loads saved credentials on initialization.

## Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

To preview the production build:

```bash
npm run preview
```

## Troubleshooting

### Backend Connection Issues
- Ensure the backend API is running on http://localhost:8000
- Check the proxy configuration in `vite.config.ts`

### TypeScript Errors
Run type checking:
```bash
npm run type-check
```

### Linting Issues
Fix linting errors:
```bash
npm run lint
```

## Future Enhancements

Potential features to add:
- Map integration (Google Maps, Leaflet)
- Current location detection using browser Geolocation API
- Search locations by name
- Save favorite locations
- Share exploration sessions
- Export chat history
- Dark mode theme
- Mobile responsive improvements
- Progressive Web App (PWA) features

