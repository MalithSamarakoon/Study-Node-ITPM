import { useState, useEffect } from 'react';
import { getComments, createComment } from '../../services/qaService';
import '../../styles/qa/CommentSection.css';

function CommentSection({ answerId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [answerId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const response = await getComments(answerId);
      setComments(response || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await createComment(answerId, newComment.trim());
      setNewComment('');
      await loadComments();
    } catch (err) {
      console.error('Failed to post comment:', err);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="comment-section">
      {isLoading ? (
        <p className="loading-text">Loading comments...</p>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <p className="comment-content">{comment.content}</p>
              <div className="comment-meta">
                <span className="comment-author">{comment.username}</span>
                <span className="comment-divider">•</span>
                <span className="comment-time">{formatDate(comment.createdAt)}</span>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="no-comments">No comments yet. Be the first to comment!</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="comment-form">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={isSubmitting}
          maxLength={500}
        />
        <button type="submit" disabled={isSubmitting || !newComment.trim()}>
          {isSubmitting ? 'Posting...' : 'Comment'}
        </button>
      </form>
    </div>
  );
}

export default CommentSection;
