import { get, post } from '../utils/qaApi';

/**
 * Q&A Service - handles all Q&A API calls
 */

// Questions
export const getQuestions = (params = {}) => {
  const { status, search, page = 0, size = 10 } = params;
  const queryParams = new URLSearchParams();
  queryParams.append('page', page);
  queryParams.append('size', size);
  if (status) queryParams.append('status', status);
  if (search) queryParams.append('search', search);
  
  return get(`/api/qa/questions?${queryParams.toString()}`);
};

export const getQuestionById = (id) => {
  return get(`/api/qa/questions/${id}`);
};

export const createQuestion = (questionData) => {
  return post('/api/qa/questions', questionData);
};

export const getSimilarQuestions = (title, page = 0, size = 5) => {
  const queryParams = new URLSearchParams({ title, page, size });
  return get(`/api/qa/questions/similar?${queryParams}`);
};

// Answers
export const getAnswers = (questionId) => {
  return get(`/api/qa/questions/${questionId}/answers`);
};

export const createAnswer = (questionId, content) => {
  return post(`/api/qa/questions/${questionId}/answers`, { content });
};

export const voteAnswer = (answerId, voteType) => {
  return post(`/api/qa/answers/${answerId}/vote`, { voteType });
};

export const acceptAnswer = (answerId) => {
  return post(`/api/qa/answers/${answerId}/accept`, {});
};

// Comments
export const getComments = (answerId) => {
  return get(`/api/qa/answers/${answerId}/comments`);
};

export const createComment = (answerId, content) => {
  return post(`/api/qa/answers/${answerId}/comments`, { content });
};

// Tags
export const suggestTags = (prefix) => {
  return get(`/api/qa/tags/suggest?prefix=${prefix}`);
};
