# README for ThreadCity Frontend

## Project Overview

ThreadCity is a social media application that allows users to connect, share posts, and interact with each other in real-time. This frontend project is built using React and TypeScript, and it communicates with a backend server to handle user authentication, post management, and real-time notifications.

## Features

- User authentication (login, registration, password reset)
- User profiles with follow/unfollow functionality
- Real-time notifications for user interactions
- Post creation and management
- Responsive design with a modern user interface

## Project Structure

The project is organized into several directories:

- **public/**: Contains static assets such as images and the favicon.
- **src/**: The main source code for the application.
  - **components/**: Reusable components for various parts of the application.
  - **pages/**: Components representing different pages in the application.
  - **context/**: Context providers for managing global state.
  - **hooks/**: Custom hooks for encapsulating logic.
  - **services/**: Functions for making API calls and handling business logic.
  - **utils/**: Utility functions for various purposes.
  - **types/**: TypeScript types for type safety.
  - **assets/**: Contains styles and icons used in the application.

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd threadcity-frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables.

## Running the Application

To start the development server, run:
```
npm run dev
```
The application will be available at `http://localhost:5173`.

## Building for Production

To build the application for production, run:
```
npm run build
```
The production files will be generated in the `dist` directory.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.