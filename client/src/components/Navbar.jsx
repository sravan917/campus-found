import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, PlusSquare, User, PackageSearch, LogOut, LogIn, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith('/chats');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="brand">
          <PackageSearch size={28} color="var(--primary)" />
          <span>ReclaimX</span>
        </Link>
        
        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <Search size={18} /> Browse
          </Link>
          <Link to="/post" className={`nav-link ${location.pathname === '/post' ? 'active' : ''}`}>
            <PlusSquare size={18} /> Post Item
          </Link>
          
          {currentUser ? (
            <>
              <Link to="/my-posts" className={`nav-link ${location.pathname === '/my-posts' ? 'active' : ''}`}>
                <User size={18} /> My Posts
              </Link>
              <Link to="/chats" className={`nav-link ${location.pathname.startsWith('/chats') ? 'active' : ''}`}>
                <MessageCircle size={18} /> Messages
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {currentUser.email}
                </span>
                <button 
                  onClick={handleLogout}
                  className="btn btn-outline" 
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </>
          ) : (
            <Link to="/auth" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
              <LogIn size={16} /> Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
