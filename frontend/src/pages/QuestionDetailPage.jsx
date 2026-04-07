import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getQuestionById,
  getAnswers,
  getComments,
  createAnswer,
  voteAnswer,
  acceptAnswer
} from '../services/qaService';
import StatusBadge from '../components/qa/StatusBadge';
import TagBadge from '../components/qa/TagBadge';
import AnswerCard from '../components/qa/AnswerCard';
import { getUser } from '../utils/auth';
import { resolveApiUrl } from '../utils/qaApi';
import '../styles/qa/QuestionDetailPage.css';

function QuestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [resolvedCommentCounts, setResolvedCommentCounts] = useState({});

  useEffect(() => {
    const user = getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  }, []);

  useEffect(() => {
    loadQuestionData();
  }, [id]);

  const loadQuestionData = async () => {
    try {
      setIsLoading(true);
      const [questionData, answersData] = await Promise.all([
        getQuestionById(id),
        getAnswers(id)
      ]);
      setQuestion(questionData);
      const normalizedAnswers = answersData || [];
      setAnswers(normalizedAnswers);

      const commentCounts = await Promise.all(
        normalizedAnswers.map(async (answer) => {
          try {
            const comments = await getComments(answer.id);
            return [answer.id, Array.isArray(comments) ? comments.length : 0];
          } catch (commentErr) {
            return [answer.id, 0];
          }
        })
      );
      setResolvedCommentCounts(Object.fromEntries(commentCounts));
    } catch (err) {
      console.error('Failed to load question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;

    setIsSubmitting(true);
    try {
      await createAnswer(id, newAnswer.trim());
      setNewAnswer('');
      await loadQuestionData();
    } catch (err) {
      console.error('Failed to post answer:', err);
      alert('Failed to post answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (answerId, voteType) => {
    try {
      await voteAnswer(answerId, voteType);
      await loadQuestionData();
    } catch (err) {
      console.error('Failed to vote:', err);
      alert('Failed to vote. Please try again.');
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      await acceptAnswer(answerId);
      await loadQuestionData();
    } catch (err) {
      console.error('Failed to accept answer:', err);
      alert('Failed to accept answer. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (username) => {
    if (!username) return '?';
    return username.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="question-detail-page">
        <div className="loading-container">Loading question...</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="question-detail-page">
        <div className="error-container">Question not found</div>
      </div>
    );
  }

  const isQuestionOwner = question.userId === currentUserId;
  const questionImageUrl = resolveApiUrl(question.imageUrl);

  return (
    <div className="question-detail-page">
      <header className="detail-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => navigate('/qa')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Back to Q&A
          </button>
        </div>
      </header>

      <div className="detail-container">
        <div className="question-section">
          <div className="question-header-detail">
            <div className="header-top">
              <StatusBadge status={question.status} />
            </div>
            <h1 className="question-title-detail">{question.title}</h1>
          </div>

          <div className="question-meta">
            <div className="meta-left">
              <div className="user-avatar-large">
                {getInitials(question.username)}
              </div>
              <div className="user-details-large">
                <span className="username">{question.username}</span>
                <span className="timestamp">Asked {formatDate(question.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="question-content-detail">
            {question.description}
          </div>

          {questionImageUrl && (
            <div className="question-image-detail-wrap">
              <img src={questionImageUrl} alt="Question attachment" className="question-image-detail" />
            </div>
          )}

          {question.tags && question.tags.length > 0 && (
            <div className="question-tags-detail">
              {question.tags.map((tag, index) => (
                <TagBadge key={index} tag={tag} />
              ))}
            </div>
          )}

          <div className="question-stats-detail">
            <div className="stat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
              </svg>
              <span><strong>{answers.length}</strong> Answers</span>
            </div>
          </div>
        </div>

        <div className="answers-section">
          <h2 className="answers-heading">
            {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
          </h2>

          <div className="answers-list">
            {answers.map((answer) => (
              <AnswerCard
                key={answer.id}
                answer={answer}
                commentCountOverride={resolvedCommentCounts[answer.id]}
                onVote={handleVote}
                onAccept={handleAcceptAnswer}
                isQuestionOwner={isQuestionOwner}
              />
            ))}
          </div>

          {answers.length === 0 && (
            <div className="no-answers">
              <p>No answers yet. Be the first to answer!</p>
            </div>
          )}
        </div>

        <div className="answer-form-section">
          <h3>Your Answer</h3>
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              className="answer-textarea"
              placeholder="Write your answer here... (Minimum 10 characters)"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              rows={8}
              minLength={10}
              required
            />
            <div className="form-footer">
              <small>{newAnswer.length} characters</small>
              <button
                type="submit"
                className="submit-answer-btn"
                disabled={isSubmitting || newAnswer.length < 10}
              >
                {isSubmitting ? 'Posting...' : 'Post Your Answer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default QuestionDetailPage;
