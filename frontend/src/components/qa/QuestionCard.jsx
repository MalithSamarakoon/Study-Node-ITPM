import { useNavigate } from 'react-router-dom';
import TagBadge from './TagBadge';
import StatusBadge from './StatusBadge';
import { getAnswerCount } from '../../utils/qaCounts';
import '../../styles/qa/QuestionCard.css';

function QuestionCard({ question, answerCountOverride }) {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} mins ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  const getInitials = (username) => {
    if (!username) return '?';
    return username.charAt(0).toUpperCase();
  };

  const answerCount = Number.isFinite(answerCountOverride)
    ? answerCountOverride
    : getAnswerCount(question);

  return (
    <div className="question-card" onClick={() => navigate(`/qa/question/${question.id}`)}>
      <div className="question-header">
        <div className="user-info">
          <div className="user-avatar">
            {getInitials(question.username)}
          </div>
          <div className="user-details">
            <span className="username">{question.username}</span>
            <span className="timestamp">{formatDate(question.createdAt)}</span>
          </div>
        </div>
        <StatusBadge status={question.status} />
      </div>

      <h3 className="question-title">{question.title}</h3>

      <p className="question-content">
        {question.description?.substring(0, 200)}
        {question.description?.length > 200 && '...'}
      </p>

      <div className="question-footer">
        <div className="question-stats">
          <span className="stat">
            {/* Answer count icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
            </svg>
            {answerCount} answers
          </span>
        </div>

        {question.tags && question.tags.length > 0 && (
          <div className="question-tags">
            {question.tags.slice(0, 3).map((tag, index) => (
              <TagBadge key={index} tag={tag} />
            ))}
            {question.tags.length > 3 && (
              <span className="more-tags">+{question.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionCard;
