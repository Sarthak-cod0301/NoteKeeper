import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../../config';

const Register = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting registration with:', formData.email); // Debug log
      
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      console.log('Registration response:', response.data); // Debug log
      
      onLogin(response.data.token, response.data.user);
      toast.success('Registration successful!');
      navigate('/notes');
    } catch (error) {
      console.error('Registration error:', error); // Debug log
      
      if (error.code === 'ECONNREFUSED') {
        toast.error('❌ Cannot connect to server. Please make sure the backend is running on port 5000');
      } else if (error.response) {
        // The request was made and the server responded with a status code
        toast.error(error.response.data.error || 'Registration failed');
      } else if (error.request) {
        // The request was made but no response was received
        toast.error('❌ No response from server. Check if backend is running and MongoDB Atlas is connected');
      } else {
        // Something happened in setting up the request
        toast.error('❌ Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength="3"
              placeholder="Choose a username"
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="Create a password (min 6 characters)"
            />
          </div>
          
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        
        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
