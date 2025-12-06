import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-inner">
          {/* Logo */}
          <Link to="/" className="header-logo" aria-label="ExamFit Home">
            <div className="logo-icon">
              <span>🎓</span>
            </div>
            <span className="logo-text">
              <span className="logo-text-blue">Exam</span>
              <span className="logo-text-orange">Fit</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop" aria-label="Main navigation">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              <span className="nav-link-icon">🏠</span>
              <span>Home</span>
            </Link>

            <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
              <span className="nav-link-icon">ℹ️</span>
              <span>About</span>
            </Link>

            {/* Resources Dropdown */}
            <div className="nav-dropdown">
              <button className="dropdown-trigger" aria-haspopup="true" aria-expanded="false">
                <span className="nav-link-icon">📖</span>
                <span>Resources</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="dropdown-menu" role="menu">
                <Link to="/current-affairs" className="dropdown-item" role="menuitem">
                  <div className="dropdown-item-icon orange">📰</div>
                  <div>
                    <div className="font-semibold">Current Affairs</div>
                    <div className="text-xs text-gray-500">Daily updates</div>
                  </div>
                </Link>
                <Link to="/blog" className="dropdown-item" role="menuitem">
                  <div className="dropdown-item-icon purple">✍️</div>
                  <div>
                    <div className="font-semibold">Blog</div>
                    <div className="text-xs text-gray-500">Tips & strategies</div>
                  </div>
                </Link>
                <div className="dropdown-divider"></div>
                <Link to="/study-material" className="dropdown-item" role="menuitem">
                  <div className="dropdown-item-icon green">📕</div>
                  <div>
                    <div className="font-semibold">Study Material</div>
                    <div className="text-xs text-gray-500">Notes & guides</div>
                  </div>
                </Link>
                <Link to="/syllabus" className="dropdown-item" role="menuitem">
                  <div className="dropdown-item-icon orange">📋</div>
                  <div>
                    <div className="font-semibold">Syllabus</div>
                    <div className="text-xs text-gray-500">Exam patterns</div>
                  </div>
                </Link>
              </div>
            </div>

            <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
              <span className="nav-link-icon">📧</span>
              <span>Contact</span>
            </Link>

            {/* Admin Dashboard Link */}
            {user?.role === 'admin' && (
              <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                <span className="nav-link-icon">📊</span>
                <span>Dashboard</span>
              </Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="user-section">
            {user ? (
              <>
                <div className="user-avatar hidden lg:flex">
                  <div className="avatar-circle">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{user.name}</span>
                </div>
                <button onClick={handleLogout} className="btn-logout hidden lg:block">
                  Logout
                </button>
              </>
            ) : (
              <div className="auth-buttons hidden lg:flex">
                <Link to="/login" className="btn-login">
                  Login
                </Link>
                <Link to="/register" className="btn-get-started">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-btn"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <nav className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`} aria-label="Mobile navigation">
          {user && (
            <div className="mobile-user-card">
              <div className="mobile-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="mobile-user-info">
                <h4>{user.name}</h4>
                <p>{user.role}</p>
              </div>
            </div>
          )}

          <div className="mobile-nav-section">Navigation</div>
          
          <Link to="/" className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`} onClick={closeMobileMenu}>
            <span>🏠</span>
            <span>Home</span>
          </Link>

          <Link to="/about" className={`mobile-nav-link ${isActive('/about') ? 'active' : ''}`} onClick={closeMobileMenu}>
            <span>ℹ️</span>
            <span>About Us</span>
          </Link>

          <div className="mobile-nav-section">Resources</div>
          
          <Link to="/current-affairs" className="mobile-nav-link" onClick={closeMobileMenu}>
            <span>📰</span>
            <span>Current Affairs</span>
          </Link>
          <Link to="/blog" className="mobile-nav-link" onClick={closeMobileMenu}>
            <span>✍️</span>
            <span>Blog</span>
          </Link>
          <Link to="/study-material" className="mobile-nav-link" onClick={closeMobileMenu}>
            <span>📕</span>
            <span>Study Material</span>
          </Link>
          <Link to="/syllabus" className="mobile-nav-link" onClick={closeMobileMenu}>
            <span>📋</span>
            <span>Syllabus</span>
          </Link>

          <div className="mobile-nav-section">Contact</div>
          
          <Link to="/contact" className={`mobile-nav-link ${isActive('/contact') ? 'active' : ''}`} onClick={closeMobileMenu}>
            <span>📧</span>
            <span>Contact Us</span>
          </Link>

          {user?.role === 'admin' && (
            <>
              <div className="mobile-nav-section">Admin</div>
              <Link to="/admin" className={`mobile-nav-link ${isActive('/admin') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <span>📊</span>
                <span>Dashboard</span>
              </Link>
            </>
          )}

          {user ? (
            <button onClick={handleLogout} className="mobile-btn-logout">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="mobile-nav-link" onClick={closeMobileMenu}>
                <span>🔐</span>
                <span>Login</span>
              </Link>
              <Link to="/register" className="mobile-btn-get-started" onClick={closeMobileMenu}>
                Get Started Free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
