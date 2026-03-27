import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuestions, getAnswers } from '../services/qaService';
import QuestionCard from '../components/qa/QuestionCard';
import AskQuestionModal from '../components/qa/AskQuestionModal';
import { getUserDisplayName } from '../utils/userDisplay';
import { getAnswerCount } from '../utils/qaCounts';
import { getUser } from '../utils/auth';
import '../styles/qa/QAPage.css';

function QAPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('RECENT');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [resolvedAnswerCounts, setResolvedAnswerCounts] = useState({});
  const [recentQuestions, setRecentQuestions] = useState([]);

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
    loadRecentActivity();
  }, [statusFilter, searchQuery]);

  const loadRecentActivity = async () => {
    try {
      const response = await getQuestions({ page: 0, size: 5 });
      const recent = response.content || [];
      setRecentQuestions(recent);
      // Optional: resolving answer counts for recent activity
      resolveAnswerCounts(recent); 
    } catch (err) {
      console.error('Failed to load recent activity:', err);
    }
  };

  useEffect(() => {
    resolveAnswerCounts(questions);
  }, [questions]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await getQuestions({
        status: statusFilter,
        search: searchQuery,
        page: 0,
        size: 20
      });
      setQuestions(response.content || []);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resolveAnswerCounts = async (questionList) => {
    if (!Array.isArray(questionList) || questionList.length === 0) {
      setResolvedAnswerCounts({});
      return;
    }

    const counts = await Promise.all(
      questionList.map(async (q) => {
        try {
          const answers = await getAnswers(q.id);
          return [q.id, Array.isArray(answers) ? answers.length : getAnswerCount(q)];
        } catch (err) {
          return [q.id, getAnswerCount(q)];
        }
      })
    );

    setResolvedAnswerCounts(Object.fromEntries(counts));
  };

  const getResolvedAnswerCount = (question) => {
    if (!question) return 0;
    const count = resolvedAnswerCounts[question.id];
    return Number.isFinite(count) ? count : getAnswerCount(question);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Future: Add sorting logic
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status === statusFilter ? '' : status);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleBack = () => {
    navigate('/modules');
  };

  const stats = {
    questions: questions.length,
    answers: questions.reduce((sum, q) => sum + getResolvedAnswerCount(q), 0)
  };

  return (
    <div className="qa-page">
      {/* Header */}
      <header className="qa-header">
        <div className="header-content">
          <button className="back-btn" onClick={handleBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Back
          </button>
          <h1>Questions & Answers</h1>
          {user && (
            <div className="user-profile-header">
              <span>{getUserDisplayName(user)}</span>
            </div>
          )}
        </div>
      </header>

      <div className="qa-container">
        {/* Sidebar */}
        <aside className="qa-sidebar">
          <div className="sidebar-section">
            <button className="ask-question-btn" onClick={() => setShowModal(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Ask A Question
            </button>
          </div>

          <div className="sidebar-section">
            <div className="stats-card">
              <div className="stat-item">
                <span className="stat-value">{stats.questions}</span>
                <span className="stat-label">Questions</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.answers}</span>
                <span className="stat-label">Answers</span>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Filter by Status</h3>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${statusFilter === '' ? 'active' : ''}`}
                onClick={() => setStatusFilter('')}
              >
                All Questions
              </button>
              <button
                className={`filter-btn ${statusFilter === 'OPEN' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('OPEN')}
              >
                Open
              </button>
              <button
                className={`filter-btn ${statusFilter === 'ANSWERED' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('ANSWERED')}
              >
                Answered
              </button>
              <button
                className={`filter-btn ${statusFilter === 'SOLVED' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('SOLVED')}
              >
                Solved
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {recentQuestions.length === 0 ? (
                <div className="activity-empty">No recent activity</div>
              ) : (
                recentQuestions.map((q) => (
                  <div 
                    key={`recent-${q.id}`} 
                    className="activity-item"
                    onClick={() => navigate(`/qa/${q.id}`)}
                  >
                    <span className="activity-title" title={q.title}>
                      {q.title.length > 40 ? `${q.title.substring(0, 37)}...` : q.title}
                    </span>
                    <span className="activity-count">
                      {getResolvedAnswerCount(q)} {getResolvedAnswerCount(q) === 1 ? 'answer' : 'answers'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="qa-main">
          <div className="search-section">
            <div className="search-bar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="questions-header">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'RECENT' ? 'active' : ''}`}
                onClick={() => handleTabChange('RECENT')}
              >
                Recent
              </button>
            </div>
          </div>

          <div className="questions-list">
            {isLoading ? (
              <div className="loading">Loading questions...</div>
            ) : questions.length === 0 ? (
              <div className="no-questions">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                  <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
                </svg>
                <p>No questions found. Be the first to ask!</p>
                <button className="ask-btn" onClick={() => setShowModal(true)}>
                  Ask a Question
                </button>
              </div>
            ) : (
              questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  answerCountOverride={resolvedAnswerCounts[question.id]}
                />
              ))
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <AskQuestionModal
          onClose={() => setShowModal(false)}
          onSuccess={loadQuestions}
        />
      )}
    </div>
  );
}

export default QAPage;
