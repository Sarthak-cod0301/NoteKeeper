import React, { useState } from 'react';
import { 
  FaStickyNote, 
  FaPlusCircle, 
  FaUserCircle,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import '../../styles/Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, user, onLogout, counts = {} }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { 
      id: 'notes', 
      label: 'Notes', 
      icon: <FaStickyNote />,
      count: counts.notes || 0
    },
    { 
      id: 'create', 
      label: 'Create Note', 
      icon: <FaPlusCircle />,
      count: null
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: <FaUserCircle />,
      count: null
    },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (id) => {
    setActiveTab(id);
    setIsOpen(false); // Close sidebar on mobile after clicking
  };

  return (
    <>
      {/* Menu Button */}
      <button className="sidebar-menu-btn" onClick={toggleSidebar}>
        <FaBars />
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>NoteKeeper</h2>
          <button className="sidebar-close-btn" onClick={toggleSidebar}>
            <FaTimes />
          </button>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.username}</span>
            <span className="user-email">{user?.email}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleMenuItemClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.count !== null && item.count > 0 && (
                <span className="nav-count">{item.count}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;