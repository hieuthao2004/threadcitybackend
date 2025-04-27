import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AppRoutes from './router';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import './assets/styles/global.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <div className="app-container">
              <Header />
              <main className="main-content">
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;