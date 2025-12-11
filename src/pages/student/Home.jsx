import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { boardsAPI } from '../../services/api';
import SEO, { getOrganizationSchema, getWebsiteSchema } from '../../components/SEO';
import './Home.css';

const boardIcons = ['🎓', '📚', '🏛️', '🎯', '💡', '🔬', '📊', '🌍', '⚡', '🧪'];

const StudentHome = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
    // Scroll after a small delay to avoid blocking render
    setTimeout(() => window.scrollTo(0, 0), 0);
  }, []);

  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true);
      const response = await boardsAPI.getAll();
      setBoards(response.data.boards || []);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBoardClick = useCallback((board) => {
    navigate(`/exams?board=${board._id}`);
  }, [navigate]);

  const getBoardIcon = useCallback((index) => boardIcons[index % boardIcons.length], []);

  // Memoize structured data to avoid recalculating on every render
  // MUST be called before any early returns (Rules of Hooks)
  const homeStructuredData = useMemo(() => [
    getOrganizationSchema(),
    getWebsiteSchema(),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Competitive Exam Preparation Boards",
      "description": "Choose from various exam boards including UPSC, SSC, Banking, Railways and more",
      "itemListElement": boards.slice(0, 10).map((board, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Course",
          "name": `${board.name} Exam Preparation`,
          "url": `https://examfit.in/exams?board=${board._id}`,
          "description": `Prepare for ${board.name} competitive exam with free practice tests and study materials`
        }
      }))
    }
  ], [boards]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="loading-spinner mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <main className="home-page-split" role="main">
      <SEO 
        title="ExamFit - Free Online Exam Preparation | UPSC, SSC, Banking & More"
        description="Prepare for competitive exams like UPSC, SSC, Banking, Railways with free practice tests, study materials, current affairs & expert explanations. Start your success journey today!"
        keywords="exam preparation, UPSC preparation, SSC exam, competitive exams, free mock tests, study material, current affairs, online learning, government exams, bank exam preparation, IAS preparation, civil services exam, railway exam, defense exam"
        canonicalUrl="https://examfit.in/"
        structuredData={homeStructuredData}
      />
      
      {/* Main Split Layout */}
      <section className="split-layout-section" aria-label="Exam preparation dashboard">
        <div className="split-section-container">
          <div className="split-container">
            
            {/* LEFT SIDE - Stats, Quick Actions, and Boards */}
            <aside className="split-left" aria-label="Quick access and exam boards">
              
              {/* Stats Section */}
              <section className="stats-container" aria-label="Platform statistics">
                <div className="stats-row" role="list">
                  <div className="stat-item" role="listitem">
                    <div className="stat-value" aria-label="Over 10,000 questions">10K+</div>
                    <div className="stat-label">Questions</div>
                  </div>
                  <div className="stat-item" role="listitem">
                    <div className="stat-value" aria-label="Over 50 exams">50+</div>
                    <div className="stat-label">Exams</div>
                  </div>
                  <div className="stat-item" role="listitem">
                    <div className="stat-value" aria-label="100 percent free">100%</div>
                    <div className="stat-label">Free</div>
                  </div>
                </div>
              </section>

              {/* Quick Action Boxes */}
              <nav className="quick-actions-grid" aria-label="Quick navigation">
                <Link to="/current-affairs" className="quick-action-item" aria-label="View current affairs">
                  <div className="quick-action-icon" aria-hidden="true">📰</div>
                  <div className="quick-action-content">
                    <h3>Current Affairs</h3>
                    <p>Daily news & events</p>
                  </div>
                </Link>
                
                <Link to="/syllabus" className="quick-action-item" aria-label="View exam syllabus">
                  <div className="quick-action-icon" aria-hidden="true">📋</div>
                  <div className="quick-action-content">
                    <h3>Exam Syllabus</h3>
                    <p>Complete syllabus</p>
                  </div>
                </Link>
              </nav>

              {/* Boards Section */}
              <section className="boards-container" aria-labelledby="boards-heading">
                <h2 id="boards-heading" className="boards-title">Choose Your Exam Board</h2>
                {boards.length > 0 ? (
                  <div className="boards-grid" role="list">
                    {boards.map((board, idx) => (
                      <article
                        key={board._id}
                        className="board-item-card"
                        onClick={() => handleBoardClick(board)}
                        role="listitem"
                        aria-label={`Select ${board.name} exam board`}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleBoardClick(board);
                          }
                        }}
                      >
                        {board.name.toLowerCase() === 'upsc' ? (
                          <div className="board-icon-wrapper">
                            <img 
                              src="/upsc.webp" 
                              alt="UPSC Logo" 
                              className="board-item-logo"
                              fetchPriority="high"
                              width="48"
                              height="48"
                            />
                          </div>
                        ) : (
                          <div className="board-icon-wrapper">
                            <span className="board-item-icon" aria-hidden="true">{getBoardIcon(idx)}</span>
                          </div>
                        )}
                        <h3 className="board-item-name">{board.name}</h3>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No boards available</p>
                )}
              </section>
            </aside>

            {/* RIGHT SIDE - Unique Content */}
            <aside className="split-right" aria-label="Welcome section">
              <div className="unique-card">
                <div className="unique-card-header">
                  <div className="welcome-badge" aria-label="Welcome message">👋 Welcome back!</div>
                </div>
                
                <div className="unique-card-content">
                  <div className="name-display">
                    <h1 className="first-name">Student</h1>
                    <p className="motivation-text">Start preparing now</p>
                  </div>

                  <div className="features-mini" role="list">
                    <div className="feature-mini-item" role="listitem">
                      <span className="feature-mini-icon" aria-hidden="true">⚡</span>
                      <span>Instant Feedback</span>
                    </div>
                    <div className="feature-mini-item" role="listitem">
                      <span className="feature-mini-icon" aria-hidden="true">💡</span>
                      <span>Expert Solutions</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </section>
    </main>
  );
};

export default StudentHome;
