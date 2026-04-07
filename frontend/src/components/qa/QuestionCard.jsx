import { useNavigate } from 'react-router-dom';
import TagBadge from './TagBadge';
import StatusBadge from './StatusBadge';
import { getAnswerCount } from '../../utils/qaCounts';
import { resolveApiUrl } from '../../utils/qaApi';
import '../../styles/qa/QuestionCard.css';

function QuestionCard({ question, answerCountOverride, canManage = false, onEdit, onDelete }) {
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

  const imageUrl = resolveApiUrl(question.imageUrl);

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
        <div className="question-header-actions">
          {canManage && (
            <div className="question-manage-actions" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="question-icon-btn"
                title="Edit question"
                aria-label="Edit question"
                onClick={() => onEdit?.(question)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm17.71-10.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.96 1.96 3.75 3.75 2.13-2.09z"/>
                </svg>
              </button>
              <button
                type="button"
                className="question-icon-btn danger"
                title="Delete question"
                aria-label="Delete question"
                onClick={() => onDelete?.(question)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm3.46-7.12 1.41-1.41L12 11.59l1.12-1.12 1.41 1.41L13.41 13l1.12 1.12-1.41 1.41L12 14.41l-1.12 1.12-1.41-1.41L10.59 13l-1.13-1.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          )}
          <StatusBadge status={question.status} />
        </div>
      </div>

      <h3 className="question-title">{question.title}</h3>

      <p className="question-content">
        {question.description?.substring(0, 200)}
        {question.description?.length > 200 && '...'}
      </p>

      {imageUrl && (
        <div className="question-image-thumb-wrap">
          <img src={imageUrl} alt="Question attachment" className="question-image-thumb" loading="lazy" />
        </div>
      )}

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
