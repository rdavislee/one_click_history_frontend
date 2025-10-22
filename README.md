# One Click History - Frontend

A Vue.js application for exploring historical contexts of geographic locations.

## Features

- User authentication
- Location-based historical context exploration
- AI-powered historical narratives
- Chat history management

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running on http://localhost:8000

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint and fix files
- `npm run type-check` - Type check with TypeScript

## API Documentation

See [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) for details about the backend API.

## Project Structure

```
src/
├── assets/         # Static assets
├── components/     # Vue components
├── router/         # Vue Router configuration
├── stores/         # Pinia stores
├── services/       # API services
├── types/          # TypeScript types
├── views/          # Page components
├── App.vue         # Root component
└── main.ts         # Application entry point
```

