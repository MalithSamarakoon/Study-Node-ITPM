import { useState, useEffect } from 'react';
import { createQuestion, getSimilarQuestions } from '../../services/qaService';
import TagBadge from './TagBadge';
import '../../styles/qa/AskQuestionModal.css';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function AskQuestionModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    image: null
  });
  const [tagInput, setTagInput] = useState('');
  const [similarQuestions, setSimilarQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');

  useEffect(() => {
    if (formData.title.length > 10) {
      const timer = setTimeout(async () => {
        try {
          const response = await getSimilarQuestions(formData.title, 0, 3);
          // Backend returns List<String> of similar titles
          setSimilarQuestions(Array.isArray(response) ? response : []);
        } catch (err) {
          console.error('Failed to fetch similar questions:', err);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSimilarQuestions([]);
    }
  }, [formData.title]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const clearSelectedImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl('');
    setFormData(prev => ({ ...prev, image: null }));
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      clearSelectedImage();
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
      setError('Only JPG, PNG, and WEBP images are allowed.');
      e.target.value = '';
      return;
    }

    if (selectedFile.size > MAX_IMAGE_BYTES) {
      setError('Image size must be 5MB or smaller.');
      e.target.value = '';
      return;
    }

    setError('');

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setFormData(prev => ({ ...prev, image: selectedFile }));
    setImagePreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const pendingTag = tagInput.trim().toLowerCase();
    const mergedTags = pendingTag
      ? Array.from(new Set([...formData.tags, pendingTag])).slice(0, 5)
      : formData.tags;

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: mergedTags
      };

      console.log('Submitting question:', payload);
      const response = await createQuestion(payload);
      console.log('Question created successfully:', response);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error creating question:', err);
      setError(err.message || 'Failed to create question. Please check your permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ask-question-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ask a Question</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="question-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="title">Question Title *</label>
            <input
              id="title"
              type="text"
              placeholder="Be specific and imagine you're asking another person"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              maxLength={200}
              required
            />
            <small>{formData.title.length}/200 characters</small>
          </div>

          {similarQuestions.length > 0 && (
            <div className="similar-questions-box">
              <p><strong>Similar questions found:</strong></p>
              <ul>
                {similarQuestions.map((title, index) => (
                  <li key={index}>{title}</li>
                ))}
              </ul>
              <small>Consider checking these before posting a duplicate.</small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="description">Details *</label>
            <textarea
              id="description"
              placeholder="Include all the information someone would need to answer your question"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={8}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (up to 5)</label>
            <div className="tags-container">
              {formData.tags.map((tag) => (
                <div key={tag} className="tag-item">
                  <TagBadge tag={tag} />
                  <button
                    type="button"
                    className="remove-tag"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <input
              id="tags"
              type="text"
              placeholder="Press Enter or comma to add tags (e.g., java, spring-boot)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              disabled={formData.tags.length >= 5}
            />
            <small>Add up to 5 tags to help others find your question</small>
          </div>

          <div className="form-group">
            <label htmlFor="question-image">Question Image (optional)</label>
            <input
              id="question-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
            />
            <small>Supported: JPG, PNG, WEBP. Maximum size: 5MB.</small>

            {imagePreviewUrl && (
              <div className="question-image-preview-wrap">
                <img src={imagePreviewUrl} alt="Selected question" className="question-image-preview" />
                <button type="button" className="btn-secondary image-remove-btn" onClick={clearSelectedImage}>
                  Remove Image
                </button>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AskQuestionModal;
