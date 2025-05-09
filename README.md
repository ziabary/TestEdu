# Targoman Education Platform

An interactive learning platform for mathematics and physics using AI.

## Features

- Interactive learning through AI-powered conversations
- Smart guidance based on individual learning styles
- 24/7 availability for learning
- Progress tracking
- Question-based learning system
- Real-time chat with AI tutor

## Tech Stack

### Frontend
- Vue 3 with Composition API
- TypeScript
- Tailwind CSS
- Vue Router
- Pinia for state management
- Vue I18n for internationalization
- MathJax for mathematical expressions
- Moment.js for date handling

### Backend
- Node.js with Express
- TypeScript
- WebSocket for real-time communication
- JWT for authentication
- PostgreSQL for database
- Swagger for API documentation

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Yarn package manager
- PostgreSQL

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/targoman-education.git
cd targoman-education
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
yarn install

# Install frontend dependencies
cd ../frontend
yarn install
```

3. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your configuration
```

4. Start the development servers:
```bash
# Start backend server
cd backend
yarn dev

# Start frontend server
cd ../frontend
yarn dev
```

## Development

### Backend Development
- API documentation is available at `/api-docs` when the server is running
- WebSocket server runs on port 3000
- REST API runs on port 3001

### Frontend Development
- Development server runs on port 5173
- Uses Vite for fast development
- Supports hot module replacement

## Testing

```bash
# Run backend tests
cd backend
yarn test

# Run frontend tests
cd frontend
yarn test
```

## Deployment

1. Build the frontend:
```bash
cd frontend
yarn build
```

2. Build the backend:
```bash
cd backend
yarn build
```

3. Start the production server:
```bash
cd backend
yarn start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Vue.js](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/) 