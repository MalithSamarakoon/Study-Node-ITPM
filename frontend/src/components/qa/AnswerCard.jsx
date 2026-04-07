import { useState } from 'react';
import VoteButtons from './VoteButtons';
import CommentSection from './CommentSection';
import { getCommentCount } from '../../utils/qaCounts';
import '../../styles/qa/AnswerCard.css';

function AnswerCard({ answer, onVote, onAccept, isQuestionOwner, commentCountOverride }) {
  const [showComments, setShowComments] = useState(false);

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

  const commentCount = Number.isFinite(commentCountOverride)
    ? commentCountOverride
    : getCommentCount(answer);

  return (
    <div className={`answer-card ${answer.accepted ? 'accepted' : ''}`}>
      {answer.accepted && (
        <div className="best-answer-badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          Best Answer
        </div>
      )}

      <div className="answer-content-wrapper">
        <div className="answer-sidebar">
          <VoteButtons
            voteCount={answer.voteCount}
            onVote={(voteType) => onVote(answer.id, voteType)}
            userVote={answer.userVote}
          />
          {isQuestionOwner && !answer.accepted && (
            <button
              className="accept-btn"
              onClick={() => onAccept(answer.id)}
              title="Mark as best answer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </button>
          )}
        </div>

        <div className="answer-main">
          <div className="answer-header">
            <div className="user-info">
              <div className="user-avatar">
                {getInitials(answer.username)}
              </div>
              <div className="user-details">
                <span className="username">{answer.username}</span>
                <span className="timestamp">{formatDate(answer.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="answer-content">
            {answer.content}
          </div>

          <div className="answer-actions">
            <button
              className="action-btn"
              onClick={() => setShowComments(!showComments)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
              </svg>
              {showComments ? 'Hide' : 'Show'} Comments ({commentCount})
            </button>
          </div>

          {showComments && (
            <CommentSection answerId={answer.id} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AnswerCard;
