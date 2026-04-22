package org.practicals.backend.service.qa;

import org.practicals.backend.dto.qa.*;
import org.practicals.backend.model.notificationManagement.NotificationType;
import org.practicals.backend.model.qa.*;
import org.practicals.backend.model.userManagement.User;
import org.practicals.backend.repository.qa.*;
import org.practicals.backend.repository.userManagement.UserRepository;
import org.practicals.backend.security.services.UserDetailsImpl;
import org.practicals.backend.service.notificationManagement.NotificationService;
import org.practicals.backend.service.storageManagement.FileStorageService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class QaService {

    private static final long MAX_QUESTION_IMAGE_SIZE_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_IMAGE_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final QaQuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final TagRepository tagRepository;
    private final VoteRepository voteRepository;
    private final PollOptionRepository pollOptionRepository;
    private final PollVoteRepository pollVoteRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;

    public QaService(
            QaQuestionRepository questionRepository,
            AnswerRepository answerRepository,
            TagRepository tagRepository,
            VoteRepository voteRepository,
            PollOptionRepository pollOptionRepository,
            PollVoteRepository pollVoteRepository,
            CommentRepository commentRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            FileStorageService fileStorageService
    ) {
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.tagRepository = tagRepository;
        this.voteRepository = voteRepository;
        this.pollOptionRepository = pollOptionRepository;
        this.pollVoteRepository = pollVoteRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public QuestionResponse createQuestion(QuestionCreateRequest req) {
        return createQuestion(req, null);
    }

    @Transactional
    public QuestionResponse createQuestion(QuestionCreateRequest req, MultipartFile image) {
        Long me = getCurrentUserId();
        User meUser = userRepository.findById(me).orElseThrow();

        if (questionRepository.existsByUserIdAndTitleIgnoreCase(me, req.title().trim())) {
            throw new IllegalArgumentException("You already posted a question with the same title.");
        }

        Set<Tag> tags = normalizeAndUpsertTags(req.tags());
    String imageUrl = null;

    if (image != null && !image.isEmpty()) {
        validateQuestionImage(image);
        var storedImage = fileStorageService.store(image, "qa-questions");
        imageUrl = "/files/qa-questions/" + storedImage.storedName();
    }

        Question q = Question.builder()
                .user(meUser)
                .title(req.title().trim())
                .description(req.description())
                .imageUrl(imageUrl)
                .questionType(QuestionType.STANDARD)
                .status(QuestionStatus.OPEN)
                .tags(tags)
                .build();

        Question saved = questionRepository.save(q);
        return toResponse(saved, me);
    }

    @Transactional
    public QuestionResponse createPoll(PollCreateRequest req) {
        Long me = getCurrentUserId();
        User meUser = userRepository.findById(me).orElseThrow();

        String trimmedTitle = req.title().trim();
        if (questionRepository.existsByUserIdAndTitleIgnoreCase(me, trimmedTitle)) {
            throw new IllegalArgumentException("You already posted a question with the same title.");
        }

        List<String> normalizedOptions = normalizePollOptions(req.options());
        if (normalizedOptions.size() < 2) {
            throw new IllegalArgumentException("A poll must have at least 2 unique options.");
        }

        int expireDays = req.expiresInDays() == null ? 7 : req.expiresInDays();

        Question poll = Question.builder()
                .user(meUser)
                .title(trimmedTitle)
                .description("Poll")
                .questionType(QuestionType.POLL)
                .status(QuestionStatus.OPEN)
                .pollExpiresAt(java.time.Instant.now().plus(java.time.Duration.ofDays(expireDays)))
                .build();

        for (int i = 0; i < normalizedOptions.size(); i++) {
            PollOption option = PollOption.builder()
                    .question(poll)
                    .text(normalizedOptions.get(i))
                    .sortOrder(i)
                    .voteCount(0)
                    .build();
            poll.getPollOptions().add(option);
        }

        Question saved = questionRepository.save(poll);
        return toResponse(saved, me);
    }

    public Page<QuestionResponse> listQuestions(QuestionStatus status, String search, Pageable pageable) {
        Long me = getCurrentUserId();
        Page<Question> page;
        if (status != null) {
            page = questionRepository.findByStatus(status, pageable);
        } else if (search != null && !search.isBlank()) {
            page = questionRepository.findByTitleContainingIgnoreCase(search.trim(), pageable);
        } else {
            page = questionRepository.findAll(pageable);
        }
        return page.map(q -> toResponse(q, me));
    }

    public QuestionResponse getQuestion(Long id) {
        Long me = getCurrentUserId();
        return toResponse(questionRepository.findById(id).orElseThrow(), me);
    }

    @Transactional
    public QuestionResponse updateQuestion(Long questionId, QuestionUpdateRequest req) {
        Long me = getCurrentUserId();

        Question existing = questionRepository.findById(questionId).orElseThrow();
        if (existing.getQuestionType() != QuestionType.STANDARD) {
            throw new IllegalArgumentException("Poll posts cannot be edited with question update.");
        }
        if (!Objects.equals(existing.getUser().getId(), me)) {
            throw new IllegalArgumentException("You can only update your own questions.");
        }

        String trimmedTitle = req.title().trim();
        if (questionRepository.existsByUserIdAndTitleIgnoreCaseAndIdNot(me, trimmedTitle, questionId)) {
            throw new IllegalArgumentException("You already posted another question with the same title.");
        }

        existing.setTitle(trimmedTitle);
        existing.setDescription(req.description().trim());
        existing.setTags(normalizeAndUpsertTags(req.tags()));

        Question saved = questionRepository.save(existing);
        return toResponse(saved, me);
    }

    @Transactional
    public void deleteQuestion(Long questionId) {
        Long me = getCurrentUserId();

        Question existing = questionRepository.findById(questionId).orElseThrow();
        if (!Objects.equals(existing.getUser().getId(), me)) {
            throw new IllegalArgumentException("You can only delete your own questions.");
        }

        if (existing.getQuestionType() == QuestionType.POLL) {
            pollVoteRepository.deleteByQuestionId(questionId);
            pollOptionRepository.deleteByQuestionId(questionId);
            questionRepository.delete(existing);
            return;
        }

        if (answerRepository.countByQuestionId(questionId) > 0) {
            throw new IllegalArgumentException("Cannot delete a question that already has answers.");
        }

        questionRepository.delete(existing);
    }

    @Transactional
    public QuestionResponse votePoll(Long questionId, PollVoteRequest req) {
        Long me = getCurrentUserId();
        User meUser = userRepository.findById(me).orElseThrow();

        Question question = questionRepository.findById(questionId).orElseThrow();
        if (question.getQuestionType() != QuestionType.POLL) {
            throw new IllegalArgumentException("This question is not a poll.");
        }

        if (question.getPollExpiresAt() != null && question.getPollExpiresAt().isBefore(java.time.Instant.now())) {
            throw new IllegalArgumentException("This poll is already closed.");
        }

        PollOption selectedOption = pollOptionRepository.findById(req.optionId()).orElseThrow();
        if (!Objects.equals(selectedOption.getQuestion().getId(), questionId)) {
            throw new IllegalArgumentException("Selected option does not belong to this poll.");
        }

        PollVote existingVote = pollVoteRepository.findByQuestionIdAndUserId(questionId, me).orElse(null);

        if (existingVote == null) {
            selectedOption.setVoteCount(selectedOption.getVoteCount() + 1);
            pollOptionRepository.save(selectedOption);

            PollVote vote = PollVote.builder()
                    .question(question)
                    .option(selectedOption)
                    .user(meUser)
                    .build();
            pollVoteRepository.save(vote);
        } else if (!Objects.equals(existingVote.getOption().getId(), selectedOption.getId())) {
            PollOption previousOption = existingVote.getOption();
            previousOption.setVoteCount(Math.max(0, previousOption.getVoteCount() - 1));
            selectedOption.setVoteCount(selectedOption.getVoteCount() + 1);
            pollOptionRepository.save(previousOption);
            pollOptionRepository.save(selectedOption);

            existingVote.setOption(selectedOption);
            pollVoteRepository.save(existingVote);
        }

        Question refreshed = questionRepository.findById(questionId).orElseThrow();
        return toResponse(refreshed, me);
    }

    public java.util.List<AnswerResponse> listAnswers(Long questionId) {
        return answerRepository.findByQuestionIdOrderByCreatedAtAsc(questionId)
                .stream().map(this::toResponse)
                .toList();
    }

    @Transactional
    public AnswerResponse addAnswer(Long questionId, AnswerCreateRequest req) {
        Long me = getCurrentUserId();
        User meUser = userRepository.findById(me).orElseThrow();

        Question q = questionRepository.findById(questionId).orElseThrow();
        if (q.getQuestionType() != QuestionType.STANDARD) {
            throw new IllegalArgumentException("Answers are only supported for standard questions.");
        }

        Answer a = Answer.builder()
                .question(q)
                .user(meUser)
                .content(req.content())
                .voteCount(0)
                .accepted(false)
                .build();

        Answer saved = answerRepository.save(a);

        if (q.getStatus() == QuestionStatus.OPEN) {
            q.setStatus(QuestionStatus.ANSWERED);
            questionRepository.save(q);
        }

        // Notify question owner (not for self-answer)
        if (!Objects.equals(q.getUser().getId(), me)) {
            try {
                User recipient = userRepository.findById(q.getUser().getId()).orElseThrow();
                notificationService.notify(
                        recipient,
                        "New answer",
                        "Your question received a new answer.",
                        NotificationType.QA_NEW_ANSWER
                );
            } catch (Exception e) {
                System.err.println("QA Notification failed (addAnswer): " + e.getMessage());
            }
        }

        return toResponse(saved);
    }

    @Transactional
    public AnswerResponse vote(Long answerId, VoteRequest req) {
        Long me = getCurrentUserId();
        User meUser = userRepository.findById(me).orElseThrow();

        Answer answer = answerRepository.findById(answerId).orElseThrow();

        VoteType newType = req.voteType();

        Vote existing = voteRepository.findByAnswerIdAndUserId(answerId, me).orElse(null);

        int delta;
        if (existing == null) {
            Vote v = Vote.builder().answer(answer).user(meUser).voteType(newType).build();
            voteRepository.save(v);
            delta = (newType == VoteType.UP) ? 1 : -1;
        } else {
            if (existing.getVoteType() == newType) {
                // toggle off
                voteRepository.delete(existing);
                delta = (newType == VoteType.UP) ? -1 : 1;
            } else {
                existing.setVoteType(newType);
                voteRepository.save(existing);
                delta = (newType == VoteType.UP) ? 2 : -2;
            }
        }

        answer.setVoteCount(answer.getVoteCount() + delta);
        Answer saved = answerRepository.save(answer);

        // Notify answer owner (not for self-vote)
        if (!Objects.equals(answer.getUser().getId(), me)) {
            try {
                User recipient = userRepository.findById(answer.getUser().getId()).orElseThrow();
                notificationService.notify(
                        recipient,
                        "Vote on your answer",
                        "Your answer received a vote.",
                        NotificationType.QA_VOTE
                );
            } catch (Exception e) {
                System.err.println("QA Notification failed (vote): " + e.getMessage());
            }
        }

        return toResponse(saved);
    }

    @Transactional
    public AnswerResponse acceptAnswer(Long answerId) {
        Long me = getCurrentUserId();

        Answer answer = answerRepository.findById(answerId).orElseThrow();
        Question q = answer.getQuestion();

        if (!Objects.equals(q.getUser().getId(), me)) {
            throw new IllegalArgumentException("Only the question owner can accept an answer.");
        }

        if (!answer.isAccepted() && answerRepository.existsByQuestionIdAndAcceptedTrue(q.getId())) {
            answerRepository.findByQuestionIdOrderByCreatedAtAsc(q.getId())
                    .stream()
                    .filter(Answer::isAccepted)
                    .forEach(a -> {
                        a.setAccepted(false);
                        answerRepository.save(a);
                    });
        }

        answer.setAccepted(true);
        Answer saved = answerRepository.save(answer);

        q.setStatus(QuestionStatus.SOLVED);
        questionRepository.save(q);

        // Notify answer owner
        if (!Objects.equals(saved.getUser().getId(), me)) {
            try {
                User recipient = userRepository.findById(saved.getUser().getId()).orElseThrow();
                notificationService.notify(
                        recipient,
                        "Accepted answer",
                        "Your answer was marked as the accepted solution.",
                        NotificationType.QA_ACCEPTED
                );
            } catch (Exception e) {
                System.err.println("QA Notification failed (acceptAnswer): " + e.getMessage());
            }
        }

        return toResponse(saved);
    }

    public java.util.List<CommentResponse> listComments(Long answerId) {
        return commentRepository.findByAnswerIdOrderByCreatedAtAsc(answerId)
                .stream().map(this::toResponse)
                .toList();
    }

    @Transactional
    public CommentResponse addComment(Long answerId, CommentCreateRequest req) {
        Long me = getCurrentUserId();
        User meUser = userRepository.findById(me).orElseThrow();

        Answer a = answerRepository.findById(answerId).orElseThrow();

        Comment c = Comment.builder()
                .answer(a)
                .user(meUser)
                .content(req.content())
                .build();

        Comment saved = commentRepository.save(c);

        // Notify answer owner (not for self-comment)
        if (!Objects.equals(a.getUser().getId(), me)) {
            try {
                User recipient = userRepository.findById(a.getUser().getId()).orElseThrow();
                notificationService.notify(
                        recipient,
                        "New comment",
                        "Someone commented on your answer.",
                        NotificationType.QA_NEW_COMMENT
                );
            } catch (Exception e) {
                System.err.println("QA Notification failed (addComment): " + e.getMessage());
            }
        }

        return toResponse(saved);
    }

    public java.util.List<String> suggestQuestionsByTitle(String title, Pageable pageable) {
        if (title == null || title.isBlank()) return java.util.List.of();
        return questionRepository.findByTitleContainingIgnoreCase(title.trim(), pageable)
                .stream()
                .map(Question::getTitle)
                .distinct()
                .toList();
    }

    public java.util.List<String> suggestTags(String prefix) {
        if (prefix == null || prefix.isBlank()) return java.util.List.of();
        return tagRepository.findTop10ByNameStartingWithIgnoreCase(prefix.trim())
                .stream()
                .map(Tag::getName)
                .toList();
    }

    private Set<Tag> normalizeAndUpsertTags(Set<String> raw) {
        if (raw == null || raw.isEmpty()) return Set.of();
        return raw.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(String::toLowerCase)
                .distinct()
                .limit(10)
                .map(name -> tagRepository.findByNameIgnoreCase(name)
                        .orElseGet(() -> tagRepository.save(Tag.builder().name(name).build())))
                .collect(Collectors.toSet());
    }

    private static String displayName(User user) {
        if (user == null) return "Unknown User";
        return user.getUsername(); // Adapted: target project User lacks fullName
    }

        private QuestionResponse toResponse(Question q, Long currentUserId) {
        Set<String> tags = (q.getTags() == null) ? Set.of() : q.getTags().stream().map(Tag::getName).collect(Collectors.toSet());

        List<PollOptionResponse> pollOptions = q.getQuestionType() == QuestionType.POLL
            ? pollOptionRepository.findByQuestionIdOrderBySortOrderAsc(q.getId())
            .stream()
            .map(option -> new PollOptionResponse(
                option.getId(),
                option.getText(),
                option.getVoteCount(),
                option.getSortOrder()
            ))
            .toList()
            : List.of();

        Long votedOptionId = null;
        if (q.getQuestionType() == QuestionType.POLL && currentUserId != null) {
            votedOptionId = pollVoteRepository.findByQuestionIdAndUserId(q.getId(), currentUserId)
                .map(vote -> vote.getOption().getId())
                .orElse(null);
        }

        long totalVotes = q.getQuestionType() == QuestionType.POLL
            ? pollVoteRepository.countByQuestionId(q.getId())
            : 0L;

        return new QuestionResponse(
                q.getId(),
                q.getUser().getId(),
                displayName(q.getUser()),
                q.getTitle(),
                q.getDescription(),
                q.getImageUrl(),
            q.getQuestionType(),
            pollOptions,
            votedOptionId,
            totalVotes,
            q.getPollExpiresAt(),
                q.getStatus(),
                tags,
                q.getCreatedAt(),
                q.getUpdatedAt()
        );
    }

        private List<String> normalizePollOptions(List<String> options) {
        if (options == null) {
            return List.of();
        }

        return options.stream()
            .filter(Objects::nonNull)
            .map(String::trim)
            .filter(text -> !text.isBlank())
            .distinct()
            .limit(4)
            .toList();
        }

    private void validateQuestionImage(MultipartFile image) {
        if (image.getSize() > MAX_QUESTION_IMAGE_SIZE_BYTES) {
            throw new IllegalArgumentException("Question image must be 5MB or smaller.");
        }

        String contentType = image.getContentType();
        String normalizedContentType = contentType == null ? "" : contentType.toLowerCase(Locale.ROOT);
        String originalName = image.getOriginalFilename();
        String normalizedName = originalName == null ? "" : originalName.toLowerCase(Locale.ROOT);

        boolean validByContentType = ALLOWED_IMAGE_CONTENT_TYPES.contains(normalizedContentType);
        boolean validByFileName = normalizedName.endsWith(".jpg") || normalizedName.endsWith(".jpeg")
                || normalizedName.endsWith(".png") || normalizedName.endsWith(".webp");

        if (!validByContentType && !validByFileName) {
            throw new IllegalArgumentException("Only JPG, PNG, and WEBP images are allowed for questions.");
        }
    }

    private AnswerResponse toResponse(Answer a) {
        return new AnswerResponse(
                a.getId(),
                a.getQuestion().getId(),
                a.getUser().getId(),
                displayName(a.getUser()),
                a.getContent(),
                a.getVoteCount(),
                a.isAccepted(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }

    private CommentResponse toResponse(Comment c) {
        return new CommentResponse(
                c.getId(),
                c.getAnswer().getId(),
                c.getUser().getId(),
                displayName(c.getUser()),
                c.getContent(),
                c.getCreatedAt()
        );
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        Object principal = auth.getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) principal).getId();
        }
        return null;
    }
}
