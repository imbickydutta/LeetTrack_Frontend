# LeetTrack Frontend

A modern React frontend for tracking LeetCode progress, built with Vite, React, and TailwindCSS.

## Features

- User authentication (login/signup)
- Dashboard with day-wise and topic-wise question views
- Code editor with syntax highlighting
- Progress tracking
- Filter questions by status (solved/unsolved)
- Responsive design

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd leettrack-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Project Structure

```
src/
  ├── api/          # API configuration and services
  ├── components/   # Reusable components
  ├── context/      # React context providers
  ├── pages/        # Page components
  ├── utils/        # Utility functions
  ├── App.jsx       # Main application component
  └── main.jsx      # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Technologies Used

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
