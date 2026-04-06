import { useState } from 'react';
import { createPoll } from '../../services/qaService';
import '../../styles/qa/CreatePollModal.css';

const DEFAULT_FORM = {
  title: '',
  options: ['', '', '', ''],
  expiresInDays: 7
};

function CreatePollModal({ onClose, onSuccess }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleOptionChange = (index, value) => {
    setForm((prev) => {
      const nextOptions = [...prev.options];
      nextOptions[index] = value;
      return { ...prev, options: nextOptions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanedOptions = form.options
      .map((opt) => opt.trim())
      .filter(Boolean);

    if (!form.title.trim()) {
      setError('Poll question is required.');
      return;
    }

    if (cleanedOptions.length < 2) {
      setError('At least 2 choices are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPoll({
        title: form.title.trim(),
        options: cleanedOptions,
        expiresInDays: Number(form.expiresInDays) || 7
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create poll.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-poll-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Poll</h2>
          <button type="button" className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="poll-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="poll-title">Question *</label>
            <input
              id="poll-title"
              type="text"
              placeholder="What are we doing on Friday?"
              maxLength={200}
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label>Enter choices</label>
            {form.options.map((option, index) => (
              <input
                key={`poll-option-${index}`}
                type="text"
                placeholder={index < 2 ? `Choice ${index + 1} (required)` : `Choice ${index + 1}`}
                value={option}
                maxLength={120}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required={index < 2}
                className="poll-choice-input"
              />
            ))}
            <small>Minimum 2 and maximum 4 choices.</small>
          </div>

          <div className="form-group">
            <label htmlFor="poll-expire-days">Poll expires in (days)</label>
            <select
              id="poll-expire-days"
              value={form.expiresInDays}
              onChange={(e) => setForm((prev) => ({ ...prev, expiresInDays: Number(e.target.value) }))}
            >
              <option value={1}>1 day</option>
              <option value={3}>3 days</option>
              <option value={5}>5 days</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePollModal;
