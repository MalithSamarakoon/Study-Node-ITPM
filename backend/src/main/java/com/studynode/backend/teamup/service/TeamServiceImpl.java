package com.studynode.backend.teamup.service;

import com.studynode.backend.common.exception.BadRequestException;
import com.studynode.backend.common.exception.ResourceNotFoundException;
import com.studynode.backend.teamup.dto.CreateTeamRequest;
import com.studynode.backend.teamup.dto.JoinTeamRequest;
import com.studynode.backend.teamup.dto.TeamMemberResponse;
import com.studynode.backend.teamup.dto.TeamResponse;
import com.studynode.backend.teamup.dto.UpdateTeamStatusRequest;
import com.studynode.backend.teamup.entity.Team;
import com.studynode.backend.teamup.entity.TeamMember;
import com.studynode.backend.teamup.entity.User;
import com.studynode.backend.teamup.enums.MembershipStatus;
import com.studynode.backend.teamup.enums.TeamStatus;
import com.studynode.backend.teamup.enums.UserRole;
import com.studynode.backend.teamup.repository.TeamMemberRepository;
import com.studynode.backend.teamup.repository.TeamRepository;
import com.studynode.backend.teamup.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    public TeamServiceImpl(TeamRepository teamRepository, TeamMemberRepository teamMemberRepository,
                           UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
    }

    @Override
    public TeamResponse createTeam(CreateTeamRequest request) {
        User creator = userRepository.findById(request.createdByUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Creator user not found"));

        if (creator.getRole() != UserRole.STUDENT) {
            throw new BadRequestException("Only students can create teams");
        }

        Team team = new Team();
        team.setTitle(request.title());
        team.setDescription(request.description());
        team.setRequiredSkills(request.requiredSkills());
        team.setStatus(TeamStatus.PENDING);
        team.setCreatedBy(creator);

        Team saved = teamRepository.save(team);
        return toTeamResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamResponse> getTeams(String skill) {
        List<Team> teams;
        if (skill != null && !skill.isBlank()) {
            teams = teamRepository.findByStatusAndRequiredSkillsContainingIgnoreCase(TeamStatus.APPROVED, skill.trim());
        } else {
            teams = teamRepository.findByStatus(TeamStatus.APPROVED);
        }

        return teams.stream().map(this::toTeamResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TeamResponse getTeamById(Long teamId) {
        Team team = findTeamOrThrow(teamId);
        return toTeamResponse(team);
    }

    @Override
    public String requestToJoin(Long teamId, JoinTeamRequest request) {
        Team team = findTeamOrThrow(teamId);
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != UserRole.STUDENT) {
            throw new BadRequestException("Only students can request to join teams");
        }

        if (teamMemberRepository.findByTeamIdAndUserId(teamId, user.getId()).isPresent()) {
            throw new BadRequestException("Join request already exists for this user");
        }

        TeamMember member = new TeamMember();
        member.setTeam(team);
        member.setUser(user);
        member.setRoleInTeam(request.roleInTeam());
        member.setStatus(MembershipStatus.PENDING);

        teamMemberRepository.save(member);
        return "Join request submitted successfully";
    }

    @Override
    public TeamResponse approveTeam(Long teamId) {
        Team team = findTeamOrThrow(teamId);
        team.setStatus(TeamStatus.APPROVED);
        return toTeamResponse(teamRepository.save(team));
    }

    @Override
    public TeamResponse rejectTeam(Long teamId) {
        Team team = findTeamOrThrow(teamId);
        team.setStatus(TeamStatus.REJECTED);
        return toTeamResponse(teamRepository.save(team));
    }

    @Override
    public TeamResponse updateTeamStatus(Long teamId, UpdateTeamStatusRequest request) {
        Team team = findTeamOrThrow(teamId);
        team.setStatus(request.status());
        return toTeamResponse(teamRepository.save(team));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamMemberResponse> getTeamMembers(Long teamId) {
        findTeamOrThrow(teamId);

        return teamMemberRepository.findByTeamId(teamId)
                .stream()
                .map(member -> new TeamMemberResponse(
                        member.getId(),
                        member.getUser().getId(),
                        member.getUser().getName(),
                        member.getRoleInTeam(),
                        member.getStatus()))
                .toList();
    }

    private Team findTeamOrThrow(Long teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
    }

    private TeamResponse toTeamResponse(Team team) {
        return new TeamResponse(
                team.getId(),
                team.getTitle(),
                team.getDescription(),
                team.getRequiredSkills(),
                team.getStatus(),
                team.getCreatedBy().getId(),
                team.getCreatedAt());
    }
}
