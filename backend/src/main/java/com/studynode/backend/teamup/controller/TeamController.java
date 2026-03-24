package com.studynode.backend.teamup.controller;

import com.studynode.backend.teamup.dto.CreateTeamRequest;
import com.studynode.backend.teamup.dto.JoinTeamRequest;
import com.studynode.backend.teamup.dto.TeamMemberResponse;
import com.studynode.backend.teamup.dto.TeamResponse;
import com.studynode.backend.teamup.dto.UpdateTeamStatusRequest;
import com.studynode.backend.teamup.service.TeamService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/teams", "/teams"})
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(@Valid @RequestBody CreateTeamRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teamService.createTeam(request));
    }

    @GetMapping
    public ResponseEntity<List<TeamResponse>> getTeams(@RequestParam(required = false) String skill) {
        return ResponseEntity.ok(teamService.getTeams(skill));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamResponse> getTeamById(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.getTeamById(id));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Map<String, String>> joinTeam(@PathVariable Long id,
                                                         @Valid @RequestBody JoinTeamRequest request) {
        String message = teamService.requestToJoin(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", message));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<TeamResponse> approveTeam(@PathVariable Long id) {
        TeamResponse response = teamService.approveTeam(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<TeamResponse> rejectTeam(@PathVariable Long id) {
        TeamResponse response = teamService.rejectTeam(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TeamResponse> updateTeamStatus(@PathVariable Long id,
                                                         @Valid @RequestBody UpdateTeamStatusRequest request) {
        TeamResponse response = teamService.updateTeamStatus(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<TeamMemberResponse>> getTeamMembers(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.getTeamMembers(id));
    }

    @PutMapping("/{id}/members/{memberId}/approve")
    public ResponseEntity<TeamMemberResponse> approveMembershipRequest(@PathVariable Long id,
                                                                       @PathVariable Long memberId) {
        return ResponseEntity.ok(teamService.approveMembershipRequest(id, memberId));
    }

    @PutMapping("/{id}/members/{memberId}/reject")
    public ResponseEntity<TeamMemberResponse> rejectMembershipRequest(@PathVariable Long id,
                                                                      @PathVariable Long memberId) {
        return ResponseEntity.ok(teamService.rejectMembershipRequest(id, memberId));
    }
}
