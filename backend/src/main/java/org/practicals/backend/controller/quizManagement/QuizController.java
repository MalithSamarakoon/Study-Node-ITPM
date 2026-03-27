package org.practicals.backend.controller.quizManagement;

import java.util.List;

import org.practicals.backend.dto.quizManagement.AttemptHistoryResponse;
import org.practicals.backend.dto.quizManagement.AttemptResultResponse;
import org.practicals.backend.dto.quizManagement.ModuleRequest;
import org.practicals.backend.dto.quizManagement.ModuleResponse;
import org.practicals.backend.dto.quizManagement.QuizAttemptSubmitRequest;
import org.practicals.backend.dto.quizManagement.QuizDetailResponse;
import org.practicals.backend.dto.quizManagement.QuizRequest;
import org.practicals.backend.dto.quizManagement.QuizSummaryResponse;
import org.practicals.backend.service.quizManagement.QuizService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowedHeaders = "*")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/modules")
    public ResponseEntity<List<ModuleResponse>> getModules() {
        return ResponseEntity.ok(quizService.getAllModules());
    }

    @PostMapping("/modules")
    public ResponseEntity<ModuleResponse> createModule(@Valid @RequestBody ModuleRequest request) {
        return new ResponseEntity<>(quizService.createModule(request), HttpStatus.CREATED);
    }

    @PutMapping("/modules/{moduleId}")
    public ResponseEntity<ModuleResponse> updateModule(@PathVariable Long moduleId, @Valid @RequestBody ModuleRequest request) {
        return ResponseEntity.ok(quizService.updateModule(moduleId, request));
    }

    @DeleteMapping("/modules/{moduleId}")
    public ResponseEntity<Void> deleteModule(@PathVariable Long moduleId) {
        quizService.deleteModule(moduleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/modules/{moduleId}/quizzes")
    public ResponseEntity<List<QuizSummaryResponse>> getQuizzesByModule(
            @PathVariable Long moduleId,
            @RequestParam(required = false) String studentId
    ) {
        return ResponseEntity.ok(quizService.getQuizzesByModule(moduleId, studentId));
    }

    @PostMapping("/modules/{moduleId}/quizzes")
    public ResponseEntity<QuizDetailResponse> createQuiz(@PathVariable Long moduleId, @Valid @RequestBody QuizRequest request) {
        return new ResponseEntity<>(quizService.createQuiz(moduleId, request), HttpStatus.CREATED);
    }

    @PutMapping("/quizzes/{quizId}")
    public ResponseEntity<QuizDetailResponse> updateQuiz(@PathVariable Long quizId, @Valid @RequestBody QuizRequest request) {
        return ResponseEntity.ok(quizService.updateQuiz(quizId, request));
    }

    @GetMapping("/quizzes/{quizId}")
    public ResponseEntity<QuizDetailResponse> getQuizById(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizService.getQuizById(quizId));
    }

    @DeleteMapping("/quizzes/{quizId}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long quizId) {
        quizService.deleteQuiz(quizId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/quizzes/{quizId}/attempts")
    public ResponseEntity<AttemptResultResponse> submitQuiz(
            @PathVariable Long quizId,
            @Valid @RequestBody QuizAttemptSubmitRequest request
    ) {
        return new ResponseEntity<>(quizService.submitQuiz(quizId, request), HttpStatus.CREATED);
    }

    @GetMapping("/attempts/{attemptId}")
    public ResponseEntity<AttemptResultResponse> getAttemptResult(@PathVariable Long attemptId) {
        return ResponseEntity.ok(quizService.getAttemptResult(attemptId));
    }

    @GetMapping("/students/{studentId}/attempts")
    public ResponseEntity<List<AttemptHistoryResponse>> getAttemptHistory(@PathVariable String studentId) {
        return ResponseEntity.ok(quizService.getAttemptHistory(studentId));
    }
}
