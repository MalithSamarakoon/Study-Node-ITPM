package org.practicals.backend.service.quizManagement;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import org.practicals.backend.dto.quizManagement.AttemptHistoryResponse;
import org.practicals.backend.dto.quizManagement.AttemptQuestionReviewResponse;
import org.practicals.backend.dto.quizManagement.AttemptResultResponse;
import org.practicals.backend.dto.quizManagement.LeaderboardEntryResponse;
import org.practicals.backend.dto.quizManagement.ModuleRequest;
import org.practicals.backend.dto.quizManagement.ModuleResponse;
import org.practicals.backend.dto.quizManagement.QuestionOptionRequest;
import org.practicals.backend.dto.quizManagement.QuestionRequest;
import org.practicals.backend.dto.quizManagement.QuizAttemptSubmitRequest;
import org.practicals.backend.dto.quizManagement.QuizDetailResponse;
import org.practicals.backend.dto.quizManagement.QuizOptionResponse;
import org.practicals.backend.dto.quizManagement.QuizQuestionResponse;
import org.practicals.backend.dto.quizManagement.QuizRequest;
import org.practicals.backend.dto.quizManagement.QuizSummaryResponse;
import org.practicals.backend.dto.quizManagement.StudentAnswerRequest;
import org.practicals.backend.exception.ResourceNotFoundException;
import org.practicals.backend.model.quizManagement.Module;
import org.practicals.backend.model.quizManagement.Question;
import org.practicals.backend.model.quizManagement.QuestionOption;
import org.practicals.backend.model.quizManagement.Quiz;
import org.practicals.backend.model.quizManagement.QuizAttempt;
import org.practicals.backend.model.quizManagement.StudentAnswer;
import org.practicals.backend.model.userManagement.User;
import org.practicals.backend.repository.quizManagement.ModuleRepository;
import org.practicals.backend.repository.quizManagement.QuestionOptionRepository;
import org.practicals.backend.repository.quizManagement.QuestionRepository;
import org.practicals.backend.repository.quizManagement.QuizAttemptRepository;
import org.practicals.backend.repository.quizManagement.QuizRepository;
import org.practicals.backend.repository.quizManagement.StudentAnswerRepository;
import org.practicals.backend.repository.userManagement.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@SuppressWarnings("null")
public class QuizService {

    private final ModuleRepository moduleRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final UserRepository userRepository;

    public QuizService(
            ModuleRepository moduleRepository,
            QuizRepository quizRepository,
            QuestionRepository questionRepository,
            QuestionOptionRepository questionOptionRepository,
            QuizAttemptRepository quizAttemptRepository,
            StudentAnswerRepository studentAnswerRepository,
            UserRepository userRepository
    ) {
        this.moduleRepository = moduleRepository;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.questionOptionRepository = questionOptionRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.studentAnswerRepository = studentAnswerRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ModuleResponse> getAllModules() {
        return moduleRepository.findAll().stream()
                .map(module -> new ModuleResponse(
                        module.getId(),
                        module.getTitle(),
                        module.getDescription(),
                        module.getCreatedBy(),
                        (long) quizRepository.findByModule(module).size()
                ))
                .toList();
    }

    @Transactional
    public ModuleResponse createModule(ModuleRequest request) {
        Module module = new Module();
        module.setTitle(request.getTitle());
        module.setDescription(request.getDescription());
        module.setCreatedBy(request.getCreatedBy());

        Module saved = moduleRepository.save(module);
        return new ModuleResponse(saved.getId(), saved.getTitle(), saved.getDescription(), saved.getCreatedBy(), 0L);
    }

    @Transactional
    public ModuleResponse updateModule(Long moduleId, ModuleRequest request) {
        Module module = moduleRepository.findById(required(moduleId, "moduleId is required"))
                .orElseThrow(() -> new ResourceNotFoundException("Module not found: " + moduleId));

        module.setTitle(request.getTitle());
        module.setDescription(request.getDescription());
        module.setCreatedBy(request.getCreatedBy());

        Module saved = moduleRepository.save(module);
        return new ModuleResponse(
                saved.getId(),
                saved.getTitle(),
                saved.getDescription(),
                saved.getCreatedBy(),
                (long) quizRepository.findByModule(saved).size()
        );
    }

    @Transactional
    public void deleteModule(Long moduleId) {
        Module module = moduleRepository.findById(required(moduleId, "moduleId is required"))
                .orElseThrow(() -> new ResourceNotFoundException("Module not found: " + moduleId));

        List<Quiz> quizzes = quizRepository.findByModule(module);
        quizzes.forEach(this::deleteQuizGraph);
        moduleRepository.delete(required(module, "module cannot be null"));
    }

    @Transactional(readOnly = true)
    public List<QuizSummaryResponse> getQuizzesByModule(Long moduleId, String studentId) {
        Module module = moduleRepository.findById(required(moduleId, "moduleId is required"))
                .orElseThrow(() -> new ResourceNotFoundException("Module not found: " + moduleId));

        User student = null;
        if (studentId != null && !studentId.isBlank()) {
            student = userRepository.findByStudentId(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
        }

        User finalStudent = student;
        return quizRepository.findByModule(module).stream()
                .map(quiz -> {
                    Long latestAttemptId = null;
                    boolean attempted = false;

                    if (finalStudent != null) {
                        Optional<QuizAttempt> attempt = quizAttemptRepository.findTopByQuizAndStudentOrderByAttemptDateDesc(quiz, finalStudent);
                        attempted = attempt.isPresent();
                        latestAttemptId = attempt.map(QuizAttempt::getId).orElse(null);
                    }

                    return new QuizSummaryResponse(
                            quiz.getId(),
                            quiz.getTitle(),
                            quiz.getDuration(),
                            quiz.getTotalMarks(),
                            quiz.getStatus().name(),
                            attempted,
                            latestAttemptId
                    );
                })
                .toList();
    }

    @Transactional
    public QuizDetailResponse createQuiz(Long moduleId, QuizRequest request) {
        Module module = moduleRepository.findById(required(moduleId, "moduleId is required"))
                .orElseThrow(() -> new ResourceNotFoundException("Module not found: " + moduleId));

        Quiz quiz = new Quiz();
        quiz.setModule(module);
        quiz.setTitle(request.getTitle());
        quiz.setDuration(request.getDuration());
        quiz.setTotalMarks(request.getTotalMarks());
        quiz.setCreatedBy(request.getCreatedBy());
        quiz.setStatus(request.getStatus());

        Quiz savedQuiz = quizRepository.save(quiz);
        saveQuestionGraph(savedQuiz, request.getQuestions());

        return getQuizById(savedQuiz.getId());
    }

    @Transactional
    public QuizDetailResponse updateQuiz(Long quizId, QuizRequest request) {
        Quiz quiz = quizRepository.findById(required(quizId, "quizId is required"))
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + quizId));

        quiz.setTitle(request.getTitle());
        quiz.setDuration(request.getDuration());
        quiz.setTotalMarks(request.getTotalMarks());
        quiz.setCreatedBy(request.getCreatedBy());
        quiz.setStatus(request.getStatus());
        Quiz savedQuiz = quizRepository.save(quiz);

        List<Question> oldQuestions = questionRepository.findByQuiz(savedQuiz);
        for (Question question : oldQuestions) {
            List<StudentAnswer> studentAnswers = studentAnswerRepository.findByQuestion(question);
            if (!studentAnswers.isEmpty()) {
                studentAnswerRepository.deleteAll(studentAnswers);
            }
        }
        for (Question question : oldQuestions) {
            questionOptionRepository.deleteByQuestion(question);
        }
        questionRepository.deleteAll(required(oldQuestions, "oldQuestions cannot be null"));

        saveQuestionGraph(savedQuiz, request.getQuestions());
        return getQuizById(savedQuiz.getId());
    }

    @Transactional
    public void deleteQuiz(Long quizId) {
        Quiz quiz = quizRepository.findById(required(quizId, "quizId is required"))
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + quizId));
        deleteQuizGraph(quiz);
    }

    @Transactional(readOnly = true)
    public QuizDetailResponse getQuizById(Long quizId) {
        Quiz quiz = quizRepository.findById(required(quizId, "quizId is required"))
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + quizId));

        List<QuizQuestionResponse> questions = questionRepository.findByQuiz(quiz).stream()
                .map(question -> new QuizQuestionResponse(
                        question.getId(),
                        question.getQuestionText(),
                        question.getMarks(),
                        questionOptionRepository.findByQuestion(question).stream()
                    .map(option -> new QuizOptionResponse(option.getId(), option.getOptionText(), Boolean.TRUE.equals(option.getIsCorrect())))
                                .toList()
                ))
                .toList();

        return new QuizDetailResponse(
                quiz.getId(),
                quiz.getModule().getId(),
                quiz.getTitle(),
                quiz.getDuration(),
                quiz.getTotalMarks(),
                quiz.getStatus().name(),
                questions
        );
    }

    @Transactional
    public AttemptResultResponse submitQuiz(Long quizId, QuizAttemptSubmitRequest request) {
        Quiz quiz = quizRepository.findById(required(quizId, "quizId is required"))
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + quizId));

        User student = userRepository.findByStudentId(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + request.getStudentId()));

        Map<Long, StudentAnswerRequest> answersByQuestion = new HashMap<>();
        for (StudentAnswerRequest answer : request.getAnswers()) {
            answersByQuestion.put(answer.getQuestionId(), answer);
        }

        int score = 0;
        int correctCount = 0;
        int wrongCount = 0;

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setStudent(student);
        attempt.setAttemptDate(java.time.LocalDateTime.now());
        attempt.setScore(0);
        attempt = quizAttemptRepository.save(attempt);

        List<Question> questions = questionRepository.findByQuiz(quiz);
        for (Question question : questions) {
            StudentAnswerRequest submittedAnswer = answersByQuestion.get(question.getId());
            List<QuestionOption> options = questionOptionRepository.findByQuestion(question);
            QuestionOption selectedOption = null;
            boolean correct = false;

            if (submittedAnswer != null) {
                selectedOption = options.stream()
                        .filter(option -> Objects.equals(option.getId(), submittedAnswer.getSelectedOptionId()))
                        .findFirst()
                        .orElse(null);
                correct = selectedOption != null && Boolean.TRUE.equals(selectedOption.getIsCorrect());
            }

            if (correct) {
                score += question.getMarks();
                correctCount++;
            } else {
                wrongCount++;
            }

            StudentAnswer answer = new StudentAnswer();
            answer.setAttempt(attempt);
            answer.setQuestion(question);
            answer.setSelectedOption(selectedOption);
            studentAnswerRepository.save(answer);
        }

        attempt.setScore(score);
        quizAttemptRepository.save(attempt);

        return buildAttemptResultResponse(attempt);
    }

    @Transactional(readOnly = true)
    public AttemptResultResponse getAttemptResult(Long attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findById(required(attemptId, "attemptId is required"))
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found: " + attemptId));

        return buildAttemptResultResponse(attempt);
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntryResponse> getModuleLeaderboard(Long moduleId) {
        Module module = moduleRepository.findById(required(moduleId, "moduleId is required"))
                .orElseThrow(() -> new ResourceNotFoundException("Module not found: " + moduleId));

        Map<String, QuizAttempt> bestAttemptsByStudent = new HashMap<>();
        for (QuizAttempt attempt : quizAttemptRepository.findAll()) {
            if (!Objects.equals(attempt.getQuiz().getModule().getId(), module.getId())) {
                continue;
            }

            String studentKey = attempt.getStudent().getStudentId();
            QuizAttempt currentBest = bestAttemptsByStudent.get(studentKey);
            if (currentBest == null || isBetterLeaderboardAttempt(attempt, currentBest)) {
                bestAttemptsByStudent.put(studentKey, attempt);
            }
        }

        List<LeaderboardEntryResponse> ranked = new ArrayList<>(bestAttemptsByStudent.values().stream()
                .map(this::toLeaderboardEntry)
                .sorted(Comparator.comparing(LeaderboardEntryResponse::getPercentage).reversed()
                        .thenComparing(LeaderboardEntryResponse::getScore, Comparator.reverseOrder())
                        .thenComparing(LeaderboardEntryResponse::getAttemptDate, Comparator.reverseOrder()))
                .toList());

        List<LeaderboardEntryResponse> withRanks = new ArrayList<>();
        for (int index = 0; index < ranked.size(); index++) {
            LeaderboardEntryResponse entry = ranked.get(index);
            withRanks.add(new LeaderboardEntryResponse(
                    index + 1,
                    entry.getStudentId(),
                    entry.getStudentName(),
                    entry.getQuizId(),
                    entry.getQuizTitle(),
                    entry.getScore(),
                    entry.getTotalMarks(),
                    entry.getPercentage(),
                    entry.getAttemptDate()
            ));
        }

        return withRanks;
    }

    private AttemptResultResponse buildAttemptResultResponse(QuizAttempt attempt) {
        List<StudentAnswer> answers = studentAnswerRepository.findByAttempt(attempt);
        List<Question> questions = questionRepository.findByQuiz(attempt.getQuiz());
        Map<Long, StudentAnswer> answersByQuestionId = new HashMap<>();
        for (StudentAnswer answer : answers) {
            answersByQuestionId.put(answer.getQuestion().getId(), answer);
        }

        List<AttemptQuestionReviewResponse> questionReviews = new ArrayList<>();
        int correctCount = 0;
        for (Question question : questions) {
            List<QuestionOption> options = questionOptionRepository.findByQuestion(question);
            QuestionOption correctOption = options.stream()
                    .filter(option -> Boolean.TRUE.equals(option.getIsCorrect()))
                    .findFirst()
                    .orElse(null);

            StudentAnswer answer = answersByQuestionId.get(question.getId());
            QuestionOption selectedOption = null;
            if (answer != null && answer.getSelectedOption() != null) {
                Long selectedOptionId = answer.getSelectedOption().getId();
                selectedOption = options.stream()
                        .filter(option -> Objects.equals(option.getId(), selectedOptionId))
                        .findFirst()
                        .orElse(answer.getSelectedOption());
            }
            boolean correct = selectedOption != null && Boolean.TRUE.equals(selectedOption.getIsCorrect());
            if (correct) {
                correctCount++;
            }

            questionReviews.add(new AttemptQuestionReviewResponse(
                    question.getId(),
                    question.getQuestionText(),
                    question.getMarks(),
                    selectedOption != null ? selectedOption.getOptionText() : null,
                    correctOption != null ? correctOption.getOptionText() : null,
                    correct
            ));
        }

        int wrongCount = questions.size() - correctCount;

        return new AttemptResultResponse(
                attempt.getId(),
                attempt.getQuiz().getId(),
                attempt.getQuiz().getTitle(),
                attempt.getScore(),
                attempt.getQuiz().getTotalMarks(),
                correctCount,
                wrongCount,
                attempt.getAttemptDate().format(DateTimeFormatter.ISO_LOCAL_DATE),
                questionReviews
        );
    }

    private LeaderboardEntryResponse toLeaderboardEntry(QuizAttempt attempt) {
        double percentage = calculatePercentage(attempt.getScore(), attempt.getQuiz().getTotalMarks());

        return new LeaderboardEntryResponse(
                0,
                attempt.getStudent().getStudentId(),
                attempt.getStudent().getUsername(),
                attempt.getQuiz().getId(),
                attempt.getQuiz().getTitle(),
                attempt.getScore(),
                attempt.getQuiz().getTotalMarks(),
                percentage,
                attempt.getAttemptDate().format(DateTimeFormatter.ISO_LOCAL_DATE)
        );
    }

    private boolean isBetterLeaderboardAttempt(QuizAttempt candidate, QuizAttempt currentBest) {
        double candidatePercentage = calculatePercentage(candidate.getScore(), candidate.getQuiz().getTotalMarks());
        double currentPercentage = calculatePercentage(currentBest.getScore(), currentBest.getQuiz().getTotalMarks());

        if (Double.compare(candidatePercentage, currentPercentage) != 0) {
            return candidatePercentage > currentPercentage;
        }

        if (!Objects.equals(candidate.getScore(), currentBest.getScore())) {
            return candidate.getScore() > currentBest.getScore();
        }

        return candidate.getAttemptDate().isAfter(currentBest.getAttemptDate());
    }

    private double calculatePercentage(Integer score, Integer totalMarks) {
        if (score == null || totalMarks == null || totalMarks == 0) {
            return 0;
        }
        return (score * 100.0) / totalMarks;
    }

    @Transactional(readOnly = true)
    public List<AttemptHistoryResponse> getAttemptHistory(String studentId) {
        User student = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        return quizAttemptRepository.findByStudentOrderByAttemptDateDesc(student).stream()
                .map(attempt -> new AttemptHistoryResponse(
                        attempt.getId(),
                        attempt.getQuiz().getId(),
                        attempt.getQuiz().getTitle(),
                        attempt.getScore(),
                        attempt.getQuiz().getTotalMarks(),
                        attempt.getAttemptDate().format(DateTimeFormatter.ISO_LOCAL_DATE)
                ))
                .toList();
    }

    private void saveQuestionGraph(Quiz quiz, List<QuestionRequest> questionRequests) {
        for (QuestionRequest questionRequest : questionRequests) {
            Question question = new Question();
            question.setQuiz(quiz);
            question.setQuestionText(questionRequest.getQuestionText());
            question.setMarks(questionRequest.getMarks());
            Question savedQuestion = questionRepository.save(question);

            for (QuestionOptionRequest optionRequest : questionRequest.getOptions()) {
                QuestionOption option = new QuestionOption();
                option.setQuestion(savedQuestion);
                option.setOptionText(optionRequest.getOptionText());
                option.setIsCorrect(optionRequest.isCorrect());
                questionOptionRepository.save(option);
            }
        }
    }

    private void deleteQuizGraph(Quiz quiz) {
        List<QuizAttempt> attempts = quizAttemptRepository.findAll().stream()
                .filter(attempt -> Objects.equals(attempt.getQuiz().getId(), quiz.getId()))
                .toList();

        for (QuizAttempt attempt : attempts) {
            List<StudentAnswer> answers = studentAnswerRepository.findByAttempt(attempt);
            studentAnswerRepository.deleteAll(required(answers, "answers cannot be null"));
        }
        quizAttemptRepository.deleteAll(required(attempts, "attempts cannot be null"));

        List<Question> questions = questionRepository.findByQuiz(quiz);
        for (Question question : questions) {
            questionOptionRepository.deleteByQuestion(question);
        }
        questionRepository.deleteAll(required(questions, "questions cannot be null"));

        quizRepository.delete(required(quiz, "quiz cannot be null"));
    }

    private <T> T required(T value, String message) {
        return Objects.requireNonNull(value, message);
    }
}
