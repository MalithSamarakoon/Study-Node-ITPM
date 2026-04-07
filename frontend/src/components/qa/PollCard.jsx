import { useEffect, useMemo, useState } from 'react';
import '../../styles/qa/PollCard.css';

function PollCard({ poll, canManage = false, onVote, onDelete }) {
  const [selectedOptionId, setSelectedOptionId] = useState(poll.votedOptionId || null);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    setSelectedOptionId(poll.votedOptionId || null);
  }, [poll.votedOptionId]);

  const hasVoted = Boolean(poll.votedOptionId);
  const totalVotes = Number(poll.totalVotes || 0);

  const sortedOptions = useMemo(() => {
    const list = Array.isArray(poll.pollOptions) ? [...poll.pollOptions] : [];
    return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [poll.pollOptions]);

  const getInitials = (username) => {
    if (!username) return '?';
    return username.charAt(0).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const pollTimeLeft = useMemo(() => {
    if (!poll.pollExpiresAt) return 'No end date';
    const expireAt = new Date(poll.pollExpiresAt).getTime();
    const now = Date.now();
    const diff = expireAt - now;

    if (diff <= 0) return 'Poll closed';

    const daysLeft = Math.ceil(diff / (24 * 60 * 60 * 1000));
    return `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;
  }, [poll.pollExpiresAt]);

  const handleVote = async () => {
    if (!selectedOptionId) return;

    setIsVoting(true);
    try {
      await onVote?.(poll.id, selectedOptionId);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <article className="poll-card">
      <header className="poll-header">
        <div className="user-info">
          <div className="user-avatar">{getInitials(poll.username)}</div>
          <div className="user-details">
            <span className="username">{poll.username}</span>
            <span className="timestamp">{formatDate(poll.createdAt)}</span>
          </div>
        </div>
        {canManage && (
          <div className="poll-actions">
            <button
              type="button"
              className="question-icon-btn danger"
              title="Delete poll"
              aria-label="Delete poll"
              onClick={() => onDelete?.(poll)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm3.46-7.12 1.41-1.41L12 11.59l1.12-1.12 1.41 1.41L13.41 13l1.12 1.12-1.41 1.41L12 14.41l-1.12 1.12-1.41-1.41L10.59 13l-1.13-1.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>
        )}
      </header>

      <h3 className="poll-title">{poll.title}</h3>

      <div className="poll-options-list">
        {sortedOptions.map((option) => (
          <label key={option.id} className="poll-option-row">
            <input
              type="radio"
              name={`poll-${poll.id}`}
              value={option.id}
              checked={Number(selectedOptionId) === Number(option.id)}
              onChange={() => setSelectedOptionId(option.id)}
              disabled={isVoting}
            />
            <span>{option.text}</span>
          </label>
        ))}
      </div>

      <div className="poll-footer-row">
        <div className="poll-meta">
          <span>Total Votes: {totalVotes}</span>
          <span>&bull;</span>
          <span>{pollTimeLeft}</span>
        </div>
        <button
          type="button"
          className="btn-primary poll-vote-btn"
          disabled={isVoting || !selectedOptionId}
          onClick={handleVote}
        >
          {isVoting ? 'Voting...' : 'Vote'}
        </button>
      </div>

      {hasVoted && (
        <section className="poll-results-card">
          <h4>Poll Result</h4>
          {sortedOptions.map((option) => {
            const voteCount = Number(option.voteCount || 0);
            const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
            const isMine = Number(poll.votedOptionId) === Number(option.id);

            return (
              <div key={`result-${option.id}`} className="poll-result-item">
                <div className="poll-result-label-row">
                  <span>{percent}%</span>
                  <span className="poll-result-text">
                    {option.text}
                    {isMine && <strong> (Your vote)</strong>}
                  </span>
                </div>
                <div className="poll-result-track">
                  <div className="poll-result-fill" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </section>
      )}
    </article>
  );
}

export default PollCard;
