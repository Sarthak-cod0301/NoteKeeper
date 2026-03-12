import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaCalendar, FaStickyNote, FaThumbtack } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../config';
import './Profile.css';

const Profile = ({ user, updateNoteCount }) => {
  const [stats, setStats] = useState({
    totalNotes: 0,
    pinnedNotes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all notes
      const notesResponse = await axios.get(`${API_URL}/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allNotes = notesResponse.data;
      const pinnedCount = allNotes.filter(note => note.isPinned).length;
      
      setStats({
        totalNotes: allNotes.length,
        pinnedNotes: pinnedCount
      });

      // Update counts in sidebar
      if (updateNoteCount) {
        updateNoteCount('notes', allNotes.length);
        updateNoteCount('pinned', pinnedCount);
      }
      
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <h2 className="profile-name">{user?.username}</h2>
          <p className="profile-email">{user?.email}</p>
        </div>

        <div className="profile-stats-grid">
          <div className="profile-stat-item">
            <div className="stat-icon blue">
              <FaStickyNote />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalNotes}</span>
              <span className="stat-label">Total Notes</span>
            </div>
          </div>

          <div className="profile-stat-item">
            <div className="stat-icon yellow">
              <FaThumbtack />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.pinnedNotes}</span>
              <span className="stat-label">Pinned</span>
            </div>
          </div>
        </div>

        <div className="profile-info-section">
          <h3>Account Information</h3>
          <div className="profile-info-item">
            <FaUser className="info-icon" />
            <div className="info-content">
              <span className="info-label">Username</span>
              <span className="info-value">{user?.username}</span>
            </div>
          </div>
          <div className="profile-info-item">
            <FaEnvelope className="info-icon" />
            <div className="info-content">
              <span className="info-label">Email</span>
              <span className="info-value">{user?.email}</span>
            </div>
          </div>
          <div className="profile-info-item">
            <FaCalendar className="info-icon" />
            <div className="info-content">
              <span className="info-label">Member Since</span>
              <span className="info-value">{formatDate()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;