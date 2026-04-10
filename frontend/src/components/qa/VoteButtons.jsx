import { useState } from 'react';
import '../../styles/qa/VoteButtons.css';

function VoteButtons({ voteCount, onVote, userVote }) {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteType) => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      await onVote(voteType);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="vote-buttons">
      <button
        className={`vote-btn vote-up ${userVote === 'UP' ? 'active' : ''}`}
        onClick={() => handleVote('UP')}
        disabled={isVoting}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4l-8 8h5v8h6v-8h5z"/>
        </svg>
      </button>
      <span className="vote-count">{voteCount || 0}</span>
      <button
        className={`vote-btn vote-down ${userVote === 'DOWN' ? 'active' : ''}`}
        onClick={() => handleVote('DOWN')}
        disabled={isVoting}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 20l8-8h-5V4H9v8H4z"/>
        </svg>
      </button>
    </div>
  );
}

export default VoteButtons;
