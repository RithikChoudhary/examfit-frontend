import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { boardsAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import SEO, { getOrganizationSchema, getWebsiteSchema } from '../../components/SEO';
import './Home.css';

const boardIcons = ['🎓', '📚', '🏛️', '🎯', '💡', '🔬', '📊', '🌍', '⚡', '🧪'];

const StudentHome = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const getFirstName = () => {
    if (user && user.name) {
      return user.name.split(' ')[0];
    }
    return 'Student';
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await boardsAPI.getAll();
      setBoards(response.data.boards || []);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBoardClick = (board) => {
    navigate(`/exams?board=${board._id}`);
  };

  const getBoardIcon = (index) => boardIcons[index % boardIcons.length];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="loading-spinner mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Enhanced structured data for home page
  const homeStructuredData = [
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
          "url": `https://examfit.com/exams?board=${board._id}`,
          "description": `Prepare for ${board.name} competitive exam with free practice tests and study materials`
        }
      }))
    }
  ];

  return (
    <main className="home-page-split" role="main">
      <SEO 
        title="ExamFit - Free Online Exam Preparation | UPSC, SSC, Banking & More"
        description="Prepare for competitive exams like UPSC, SSC, Banking, Railways with free practice tests, study materials, current affairs & expert explanations. Start your success journey today!"
        keywords="exam preparation, UPSC preparation, SSC exam, competitive exams, free mock tests, study material, current affairs, online learning, government exams, bank exam preparation, IAS preparation, civil services exam, railway exam, defense exam"
        canonicalUrl="https://examfit.com/"
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
                        <div className="board-item-icon" aria-hidden="true">{getBoardIcon(idx)}</div>
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
                    <h1 className="first-name">{getFirstName()}</h1>
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
