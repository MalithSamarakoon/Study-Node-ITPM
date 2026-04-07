const isValidNumber = (value) => Number.isFinite(value) && value >= 0;

const firstValidNumber = (...values) => {
  for (const value of values) {
    if (isValidNumber(value)) return value;
  }
  return null;
};

export const getAnswerCount = (question) => {
  if (!question) return 0;

  const directCount = firstValidNumber(
    question.answerCount,
    question.answersCount,
    question.totalAnswers,
    question.totalAnswerCount
  );

  if (directCount !== null) return directCount;
  if (Array.isArray(question.answers)) return question.answers.length;

  return 0;
};

export const getCommentCount = (answer) => {
  if (!answer) return 0;

  const directCount = firstValidNumber(
    answer.commentCount,
    answer.commentsCount,
    answer.totalComments,
    answer.totalCommentCount
  );

  if (directCount !== null) return directCount;
  if (Array.isArray(answer.comments)) return answer.comments.length;

  return 0;
};
