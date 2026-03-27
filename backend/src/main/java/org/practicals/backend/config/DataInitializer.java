package org.practicals.backend.config;

import java.time.LocalDateTime;
import java.util.List;

import org.practicals.backend.model.quizManagement.Module;
import org.practicals.backend.model.quizManagement.Question;
import org.practicals.backend.model.quizManagement.QuestionOption;
import org.practicals.backend.model.quizManagement.Quiz;
import org.practicals.backend.model.quizManagement.QuizAttempt;
import org.practicals.backend.model.quizManagement.QuizStatus;
import org.practicals.backend.model.quizManagement.StudentAnswer;
import org.practicals.backend.model.userManagement.Role;
import org.practicals.backend.model.userManagement.User;
import org.practicals.backend.repository.quizManagement.ModuleRepository;
import org.practicals.backend.repository.quizManagement.QuestionOptionRepository;
import org.practicals.backend.repository.quizManagement.QuestionRepository;
import org.practicals.backend.repository.quizManagement.QuizAttemptRepository;
import org.practicals.backend.repository.quizManagement.QuizRepository;
import org.practicals.backend.repository.quizManagement.StudentAnswerRepository;
import org.practicals.backend.repository.userManagement.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;
    private final ModuleRepository moduleRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final StudentAnswerRepository studentAnswerRepository;

    public DataInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate,
            ModuleRepository moduleRepository,
            QuizRepository quizRepository,
            QuestionRepository questionRepository,
                QuestionOptionRepository questionOptionRepository,
                QuizAttemptRepository quizAttemptRepository,
                StudentAnswerRepository studentAnswerRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
        this.moduleRepository = moduleRepository;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.questionOptionRepository = questionOptionRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.studentAnswerRepository = studentAnswerRepository;
    }

    @Override
    public void run(String... args) {
        normalizeUsersRoleColumn();

        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("Admin@StudyNode2026")); // Your secure password
            admin.setStudentId("ADMIN_001");
            admin.setEmail("admin@studynode.com");
            admin.setRole(Role.ROLE_ADMIN);

            try {
                userRepository.save(admin);
            } catch (Exception ex) {
                logger.warn("Skipping default admin seed due to schema/data issue: {}", ex.getMessage());
            }
        }

        seedQuizData();
    }

    private void normalizeUsersRoleColumn() {
        applySchemaPatch("ALTER TABLE users MODIFY COLUMN role VARCHAR(32)");
        applySchemaPatch("ALTER TABLE users MODIFY COLUMN name VARCHAR(255) NULL");
    }

    private void applySchemaPatch(String sql) {
        try {
            jdbcTemplate.execute(sql);
        } catch (DataAccessException ex) {
            // Ignore if users table/column does not exist yet or is already compatible.
            logger.debug("Schema patch skipped for '{}': {}", sql, ex.getMessage());
        }
    }

    private void seedQuizData() {
        Module paf = getOrCreateModule("PAF", "Programming Applications and Frameworks module.", "lecturer.paf");
        Module esd = getOrCreateModule("ESD", "Enterprise Software Development module.", "lecturer.esd");
        Module ndm = getOrCreateModule("NDM", "Network Design and Management module.", "lecturer.ndm");
        Module ds = getOrCreateModule("DS", "Data Structures module.", "lecturer.ds");
        Module itpm = getOrCreateModule("ITPM", "IT Project Management module.", "lecturer.itpm");

        Quiz pafMid = createQuizIfMissing(paf, "PAF - Mid Quiz", 20, 20, "lecturer.paf");
        Quiz pafPractice = createQuizIfMissing(paf, "PAF - Practice Quiz", 15, 15, "lecturer.paf");

        Quiz esdMid = createQuizIfMissing(esd, "ESD - Mid Quiz", 20, 20, "lecturer.esd");
        Quiz esdPractice = createQuizIfMissing(esd, "ESD - Practice Quiz", 15, 15, "lecturer.esd");

        Quiz ndmMid = createQuizIfMissing(ndm, "NDM - Mid Quiz", 20, 20, "lecturer.ndm");
        Quiz ndmPractice = createQuizIfMissing(ndm, "NDM - Practice Quiz", 15, 15, "lecturer.ndm");

        Quiz dsMid = createQuizIfMissing(ds, "DS - Mid Quiz", 20, 20, "lecturer.ds");
        Quiz dsPractice = createQuizIfMissing(ds, "DS - Practice Quiz", 15, 15, "lecturer.ds");

        Quiz itpmMid = createQuizIfMissing(itpm, "ITPM - Mid Quiz", 20, 20, "lecturer.itpm");
        Quiz itpmPractice = createQuizIfMissing(itpm, "ITPM - Practice Quiz", 15, 15, "lecturer.itpm");

        ensureQuestions(pafMid, "PAF", "REST API", "Dependency Injection");
        ensureQuestions(pafPractice, "PAF", "Spring Boot", "ORM Mapping");
        ensureQuestions(esdMid, "ESD", "Monolith", "Microservices");
        ensureQuestions(esdPractice, "ESD", "CI/CD", "Scalability");
        ensureQuestions(ndmMid, "NDM", "OSI Model", "Routing");
        ensureQuestions(ndmPractice, "NDM", "Subnetting", "Network Security");
        ensureQuestions(dsMid, "DS", "Stack", "Queue");
        ensureQuestions(dsPractice, "DS", "Binary Tree", "Time Complexity");
        ensureQuestions(itpmMid, "ITPM", "Scrum", "Risk Register");
        ensureQuestions(itpmPractice, "ITPM", "Gantt Chart", "Project Scope");

        User demoStudent = ensureDemoStudent();
        seedAttemptIfMissing(pafMid, demoStudent, 2);
        seedAttemptIfMissing(esdPractice, demoStudent, 1);
    }

    private Module getOrCreateModule(String title, String description, String createdBy) {
        return moduleRepository.findAll().stream()
                .filter(module -> title.equalsIgnoreCase(module.getTitle()))
                .findFirst()
                .orElseGet(() -> {
                    Module module = new Module();
                    module.setTitle(title);
                    module.setDescription(description);
                    module.setCreatedBy(createdBy);
                    return moduleRepository.save(module);
                });
    }

    private Quiz createQuizIfMissing(Module module, String title, int duration, int totalMarks, String createdBy) {
        return quizRepository.findByModule(module).stream()
                .filter(quiz -> title.equalsIgnoreCase(quiz.getTitle()))
                .findFirst()
                .orElseGet(() -> createQuiz(module, title, duration, totalMarks, createdBy));
    }

    private void ensureQuestions(Quiz quiz, String moduleCode, String topicA, String topicB) {
        if (!questionRepository.findByQuiz(quiz).isEmpty()) {
            return;
        }

        addQuestion(
                quiz,
                "In " + moduleCode + ", what best describes " + topicA + "?",
                10,
                "It is a core concept used in software engineering",
                "It is a type of hardware peripheral",
                "It is only used for UI styling",
                "It is unrelated to development",
                0
        );

        addQuestion(
                quiz,
                "Which statement is true about " + topicB + "?",
                10,
                "It improves design and maintainability when used properly",
                "It is deprecated in all modern systems",
                "It only applies to database backup",
                "It is never used in production",
                0
        );
    }

    private User ensureDemoStudent() {
        return userRepository.findByStudentId("IT20260001")
                .orElseGet(() -> {
                    User student = new User();
                    student.setUsername("demo.student");
                    student.setPassword(passwordEncoder.encode("Demo@1234"));
                    student.setStudentId("IT20260001");
                    student.setEmail("demo.student@studynode.com");
                    student.setPhoneNumber("0712345678");
                    student.setRole(Role.ROLE_STUDENT);
                    return userRepository.save(student);
                });
    }

    private void seedAttemptIfMissing(Quiz quiz, User student, int correctAnswersToMark) {
        if (quizAttemptRepository.findTopByQuizAndStudentOrderByAttemptDateDesc(quiz, student).isPresent()) {
            return;
        }

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setStudent(student);
        attempt.setAttemptDate(LocalDateTime.now().minusDays(1));
        attempt.setScore(0);
        attempt = quizAttemptRepository.save(attempt);

        int score = 0;
        int remainingCorrect = correctAnswersToMark;

        List<Question> questions = questionRepository.findByQuiz(quiz);
        for (Question question : questions) {
            List<QuestionOption> options = questionOptionRepository.findByQuestion(question);
            QuestionOption correct = options.stream().filter(QuestionOption::getIsCorrect).findFirst().orElse(null);
            QuestionOption wrong = options.stream().filter(option -> !option.getIsCorrect()).findFirst().orElse(null);

            QuestionOption selected = remainingCorrect > 0 ? correct : wrong;
            if (selected != null && selected.getIsCorrect()) {
                score += question.getMarks();
                remainingCorrect--;
            }

            StudentAnswer answer = new StudentAnswer();
            answer.setAttempt(attempt);
            answer.setQuestion(question);
            answer.setSelectedOption(selected);
            studentAnswerRepository.save(answer);
        }

        attempt.setScore(score);
        quizAttemptRepository.save(attempt);
    }

    private Quiz createQuiz(Module module, String title, int duration, int totalMarks, String createdBy) {
        Quiz quiz = new Quiz();
        quiz.setModule(module);
        quiz.setTitle(title);
        quiz.setDuration(duration);
        quiz.setTotalMarks(totalMarks);
        quiz.setCreatedBy(createdBy);
        quiz.setStatus(QuizStatus.ACTIVE);
        return quizRepository.save(quiz);
    }

    private void addQuestion(
            Quiz quiz,
            String questionText,
            int marks,
            String optionA,
            String optionB,
            String optionC,
            String optionD,
            int correctIndex
    ) {
        Question question = new Question();
        question.setQuiz(quiz);
        question.setQuestionText(questionText);
        question.setMarks(marks);
        question = questionRepository.save(question);

        saveOption(question, optionA, correctIndex == 0);
        saveOption(question, optionB, correctIndex == 1);
        saveOption(question, optionC, correctIndex == 2);
        saveOption(question, optionD, correctIndex == 3);
    }

    private void saveOption(Question question, String text, boolean isCorrect) {
        QuestionOption option = new QuestionOption();
        option.setQuestion(question);
        option.setOptionText(text);
        option.setIsCorrect(isCorrect);
        questionOptionRepository.save(option);
    }
}
