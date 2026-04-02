package org.practicals.backend.controller.qa;

import org.practicals.backend.dto.qa.*;
import org.practicals.backend.model.qa.QuestionStatus;
import org.practicals.backend.service.qa.QaService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/qa")
public class QaController {

    private final QaService qaService;

    public QaController(QaService qaService) {
        this.qaService = qaService;
    }

    @PostMapping(value = "/questions", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<QuestionResponse> createQuestion(@Validated @RequestBody QuestionCreateRequest req) {
        return ResponseEntity.ok(qaService.createQuestion(req));
    }

    @PostMapping(value = "/questions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<QuestionResponse> createQuestionWithImage(
            @Validated @RequestPart("meta") QuestionCreateRequest req,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        return ResponseEntity.ok(qaService.createQuestion(req, image));
    }

    @GetMapping("/questions")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<Page<QuestionResponse>> listQuestions(
            @RequestParam(required = false) QuestionStatus status,
            @RequestParam(required = false) String search,
            Pageable pageable
    ) {
        return ResponseEntity.ok(qaService.listQuestions(status, search, pageable));
    }

    @GetMapping("/questions/{id}")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<QuestionResponse> getQuestion(@PathVariable Long id) {
        return ResponseEntity.ok(qaService.getQuestion(id));
    }

    @PutMapping("/questions/{id}")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<QuestionResponse> updateQuestion(@PathVariable Long id, @Validated @RequestBody QuestionUpdateRequest req) {
        return ResponseEntity.ok(qaService.updateQuestion(id, req));
    }

    @PostMapping("/questions/{id}/update")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<QuestionResponse> updateQuestionFallback(@PathVariable Long id, @Validated @RequestBody QuestionUpdateRequest req) {
        return ResponseEntity.ok(qaService.updateQuestion(id, req));
    }

    @DeleteMapping("/questions/{id}")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        qaService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/questions/{id}/answers")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<List<AnswerResponse>> listAnswers(@PathVariable Long id) {
        return ResponseEntity.ok(qaService.listAnswers(id));
    }

    @PostMapping("/questions/{id}/answers")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<AnswerResponse> addAnswer(@PathVariable Long id, @Validated @RequestBody AnswerCreateRequest req) {
        return ResponseEntity.ok(qaService.addAnswer(id, req));
    }

    @PostMapping("/answers/{answerId}/vote")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<AnswerResponse> vote(@PathVariable Long answerId, @Validated @RequestBody VoteRequest req) {
        return ResponseEntity.ok(qaService.vote(answerId, req));
    }

    @PostMapping("/answers/{answerId}/accept")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<AnswerResponse> accept(@PathVariable Long answerId) {
        return ResponseEntity.ok(qaService.acceptAnswer(answerId));
    }

    @GetMapping("/answers/{answerId}/comments")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<List<CommentResponse>> listComments(@PathVariable Long answerId) {
        return ResponseEntity.ok(qaService.listComments(answerId));
    }

    @PostMapping("/answers/{answerId}/comments")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long answerId, @Validated @RequestBody CommentCreateRequest req) {
        return ResponseEntity.ok(qaService.addComment(answerId, req));
    }

    @GetMapping("/questions/similar")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<List<String>> similar(@RequestParam String title,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "5") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(qaService.suggestQuestionsByTitle(title, pageable));
    }

    @GetMapping("/tags/suggest")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<List<String>> suggestTags(@RequestParam String prefix) {
        return ResponseEntity.ok(qaService.suggestTags(prefix));
    }
}
