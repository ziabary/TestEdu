# Targoman Education Frontend

Frontend application for the Targoman Education platform.

## Features

- Vue 3 with Composition API
- TypeScript support
- Tailwind CSS for styling
- Vue Router for navigation
- Pinia for state management
- Vue I18n for internationalization
- MathJax for mathematical expressions
- Moment.js for date handling

## Development

### Prerequisites

- Node.js (v16 or higher)
- Yarn package manager

### Installation

1. Install dependencies:
```bash
yarn install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start development server:
```bash
yarn dev
```

### Building for Production

```bash
yarn build
```

### Testing

```bash
yarn test
```

## Project Structure

```
src/
├── assets/        # Static assets
├── components/    # Vue components
├── i18n/         # Internationalization
├── router/       # Vue Router configuration
├── stores/       # Pinia stores
├── views/        # Page components
├── App.vue       # Root component
└── main.ts       # Application entry point
```

## Environment Variables

- `VITE_API_URL`: Backend API URL
- `VITE_WS_URL`: WebSocket server URL

## License

This project is licensed under the MIT License.
