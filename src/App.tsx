// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import './App.css';
import { ReactNode } from 'react';

// Layout component with vertical navbar
const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <AppLayout>
            <Home />
          </AppLayout>
        } />
        <Route path="/search" element={
          <AppLayout>
            <div className="home-container">
              <h2>Trang tìm kiếm (Đang phát triển)</h2>
            </div>
          </AppLayout>
        } />
        <Route path="/create" element={
          <AppLayout>
            <div className="home-container">
              <h2>Tạo bài viết mới (Đang phát triển)</h2>
            </div>
          </AppLayout>
        } />
        <Route path="/favorites" element={
          <AppLayout>
            <div className="home-container">
              <h2>Bài viết yêu thích (Đang phát triển)</h2>
            </div>
          </AppLayout>
        } />
        <Route path="/profile" element={
          <AppLayout>
            <div className="home-container">
              <h2>Hồ sơ cá nhân (Đang phát triển)</h2>
            </div>
          </AppLayout>
        } />
        <Route path="/pins" element={
          <AppLayout>
            <div className="home-container">
              <h2>Bài viết đã ghim (Đang phát triển)</h2>
            </div>
          </AppLayout>
        } />
        <Route path="/settings" element={
          <AppLayout>
            <div className="home-container">
              <h2>Cài đặt (Đang phát triển)</h2>
            </div>
          </AppLayout>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={
          <AppLayout>
            <div className="home-container">
              <h2>404 - Không tìm thấy trang</h2>
            </div>
          </AppLayout>
        } />
      </Routes>
    </Router>
  );
}
