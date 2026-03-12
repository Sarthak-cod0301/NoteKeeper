import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import NoteList from './components/Notes/NoteList';
import Sidebar from './components/Layout/Sidebar';
import Profile from './components/Profile/Profile';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('notes');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counts, setCounts] = useState({
    notes: 0,
    trash: 0,
    pinned: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setIsAuthenticated(true);
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setActiveTab('notes');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const updateNoteCount = (type, count) => {
    setCounts(prev => ({
      ...prev,
      [type]: count
    }));
  };

  return (
    <Router>
      <div className="App">
        {isAuthenticated ? (
          <div className="app-container">
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
              user={user}
              onLogout={handleLogout}
              isOpen={sidebarOpen}
              toggleSidebar={toggleSidebar}
              counts={counts}
            />
            <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
              {activeTab === 'notes' && <NoteList user={user} updateNoteCount={updateNoteCount} showCreateForm={false} />}
              {activeTab === 'create' && <NoteList user={user} updateNoteCount={updateNoteCount} showCreateForm={true} />}
              {activeTab === 'profile' && <Profile user={user} updateNoteCount={updateNoteCount} />}
            </main>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
        
        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    </Router>
  );
}

export default App;