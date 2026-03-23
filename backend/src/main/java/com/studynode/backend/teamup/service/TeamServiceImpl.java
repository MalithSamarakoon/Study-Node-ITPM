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
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TeamServiceImpl implements TeamService {

    private static final Map<TeamStatus, EnumSet<TeamStatus>> ALLOWED_TRANSITIONS = Map.of(
            TeamStatus.PENDING, EnumSet.of(TeamStatus.APPROVED, TeamStatus.REJECTED),
            TeamStatus.APPROVED, EnumSet.of(TeamStatus.ACTIVE, TeamStatus.CLOSED),
            TeamStatus.ACTIVE, EnumSet.of(TeamStatus.CLOSED),
            TeamStatus.REJECTED, EnumSet.noneOf(TeamStatus.class),
            TeamStatus.CLOSED, EnumSet.noneOf(TeamStatus.class)
    );

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

        if (creator.getName() == null || creator.getName().isBlank()) {
            throw new BadRequestException("Creator user is invalid");
        }

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

        if (team.getStatus() == TeamStatus.CLOSED) {
            throw new BadRequestException("Cannot join a closed team");
        }

        if (team.getStatus() != TeamStatus.APPROVED && team.getStatus() != TeamStatus.ACTIVE) {
            throw new BadRequestException("Join requests are allowed only for approved or active teams");
        }

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
        if (team.getStatus() != TeamStatus.PENDING) {
            throw new BadRequestException("Only pending teams can be approved");
        }
        team.setStatus(TeamStatus.APPROVED);
        return toTeamResponse(teamRepository.save(team));
    }

    @Override
    public TeamResponse rejectTeam(Long teamId) {
        Team team = findTeamOrThrow(teamId);
        if (team.getStatus() != TeamStatus.PENDING) {
            throw new BadRequestException("Only pending teams can be rejected");
        }
        team.setStatus(TeamStatus.REJECTED);
        return toTeamResponse(teamRepository.save(team));
    }

    @Override
    public TeamResponse updateTeamStatus(Long teamId, UpdateTeamStatusRequest request) {
        Team team = findTeamOrThrow(teamId);

        TeamStatus current = team.getStatus();
        TeamStatus target = request.status();

        if (current == target) {
            throw new BadRequestException("Team is already in the requested status");
        }

        EnumSet<TeamStatus> allowedTargets = ALLOWED_TRANSITIONS.get(current);
        if (allowedTargets == null || !allowedTargets.contains(target)) {
            throw new BadRequestException(
                    "Invalid team status transition from " + current + " to " + target);
        }

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

    @Override
    public TeamMemberResponse approveMembershipRequest(Long teamId, Long memberId) {
        Team team = findTeamOrThrow(teamId);

        TeamMember member = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Membership request not found"));

        if (!member.getTeam().getId().equals(team.getId())) {
            throw new BadRequestException("Membership request does not belong to this team");
        }

        if (member.getStatus() != MembershipStatus.PENDING) {
            throw new BadRequestException("Only pending membership requests can be approved");
        }

        member.setStatus(MembershipStatus.APPROVED);
        TeamMember saved = teamMemberRepository.save(member);

        return new TeamMemberResponse(
                saved.getId(),
                saved.getUser().getId(),
                saved.getUser().getName(),
                saved.getRoleInTeam(),
                saved.getStatus());
    }

    private Team findTeamOrThrow(Long teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
    }

    private TeamResponse toTeamResponse(Team team) {
        long memberCount = teamMemberRepository.countByTeamIdAndStatus(team.getId(), MembershipStatus.APPROVED);

        return new TeamResponse(
                team.getId(),
                team.getTitle(),
                team.getDescription(),
                team.getRequiredSkills(),
                team.getStatus(),
                team.getCreatedBy().getId(),
            team.getCreatedBy().getName(),
            memberCount,
                team.getCreatedAt());
    }
}
