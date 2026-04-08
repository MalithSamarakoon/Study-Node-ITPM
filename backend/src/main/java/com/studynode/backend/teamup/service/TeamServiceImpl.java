package com.studynode.backend.teamup.service;

import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.studynode.backend.common.exception.BadRequestException;
import com.studynode.backend.common.exception.ResourceNotFoundException;
import com.studynode.backend.teamup.dto.CreateTeamRequest;
import com.studynode.backend.teamup.dto.JoinTeamRequest;
import com.studynode.backend.teamup.dto.TeamMemberResponse;
import com.studynode.backend.teamup.dto.TeamMembershipStatusResponse;
import com.studynode.backend.teamup.dto.TeamResponse;
import com.studynode.backend.teamup.dto.UpdateTeamRequest;
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

import jakarta.persistence.EntityNotFoundException;

@Service
@Transactional
public class TeamServiceImpl implements TeamService {

    private static final Map<TeamStatus, EnumSet<TeamStatus>> ALLOWED_TRANSITIONS = Map.of(
            TeamStatus.PENDING, EnumSet.of(TeamStatus.APPROVED, TeamStatus.REJECTED, TeamStatus.CLOSED),
            TeamStatus.APPROVED, EnumSet.of(TeamStatus.ACTIVE, TeamStatus.CLOSED),
            TeamStatus.ACTIVE, EnumSet.of(TeamStatus.CLOSED),
            TeamStatus.REJECTED, EnumSet.noneOf(TeamStatus.class),
            TeamStatus.CLOSED, EnumSet.of(TeamStatus.ACTIVE)
    );

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final org.practicals.backend.repository.userManagement.UserRepository appUserRepository;

    public TeamServiceImpl(TeamRepository teamRepository, TeamMemberRepository teamMemberRepository,
                           UserRepository userRepository,
                           org.practicals.backend.repository.userManagement.UserRepository appUserRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
        this.appUserRepository = appUserRepository;
    }

    @Override
    public TeamResponse createTeam(CreateTeamRequest request) {
        User creator = resolveCreatorUser(request.createdByUserId());

        Team team = new Team();
        team.setTitle(request.title());
        team.setDescription(request.description());
        team.setRequiredSkills(request.requiredSkills());
        team.setStatus(TeamStatus.PENDING);
        team.setCreatedBy(creator);

        Team saved = teamRepository.save(team);

        TeamMember ownerMembership = new TeamMember();
        ownerMembership.setTeam(saved);
        ownerMembership.setUser(creator);
        ownerMembership.setRoleInTeam("Owner");
        ownerMembership.setStatus(MembershipStatus.APPROVED);
        teamMemberRepository.save(ownerMembership);

        return toTeamResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamResponse> getJoinedTeams(Long userId) {
        User currentUser = resolveExistingUser(userId);
        if (currentUser == null) {
            return List.of();
        }

        List<TeamMember> memberships = teamMemberRepository.findByUserIdAndStatusIn(
                currentUser.getId(),
                List.of(MembershipStatus.PENDING, MembershipStatus.APPROVED));

        Map<Long, TeamResponse> uniqueTeams = new LinkedHashMap<>();
        for (TeamMember membership : memberships) {
            Team team = membership.getTeam();
            uniqueTeams.putIfAbsent(team.getId(), toTeamResponse(team));
        }

        return uniqueTeams.values().stream().toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamMembershipStatusResponse> getMembershipStatuses(Long userId) {
        User currentUser = resolveExistingUser(userId);
        if (currentUser == null) {
            return List.of();
        }

        return teamMemberRepository.findByUserIdOrderByUpdatedAtDesc(currentUser.getId())
                .stream()
                .map(member -> new TeamMembershipStatusResponse(
                        member.getTeam().getId(),
                        member.getTeam().getTitle(),
                        member.getRoleInTeam(),
                        member.getStatus(),
                        member.getUpdatedAt()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamResponse> getTeams(String skill) {
        List<Team> teams;
        if (skill != null && !skill.isBlank()) {
            teams = teamRepository.findByRequiredSkillsContainingIgnoreCase(skill.trim());
        } else {
            teams = teamRepository.findAll();
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
    @Transactional(readOnly = true)
    public List<TeamResponse> getCreatedTeams(Long userId, String skill) {
        User currentUser = resolveExistingUser(userId);
        if (currentUser == null) {
            return List.of();
        }

        List<Team> teams;
        if (skill != null && !skill.isBlank()) {
            teams = teamRepository.findByCreatedByIdAndRequiredSkillsContainingIgnoreCase(currentUser.getId(), skill.trim());
        } else {
            teams = teamRepository.findByCreatedById(currentUser.getId());
        }

        return teams.stream().map(this::toTeamResponse).toList();
    }

    @Override
    public String requestToJoin(Long teamId, JoinTeamRequest request) {
        Team team = findTeamOrThrow(teamId);

        User user = resolveUserOrFallback(request.userId(), "TeamUp Member");

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
            .map(this::toTeamMemberResponseSafe)
            .filter(response -> response != null)
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

    @Override
    public TeamMemberResponse rejectMembershipRequest(Long teamId, Long memberId) {
        Team team = findTeamOrThrow(teamId);

        TeamMember member = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Membership request not found"));

        if (!member.getTeam().getId().equals(team.getId())) {
            throw new BadRequestException("Membership request does not belong to this team");
        }

        if (member.getStatus() != MembershipStatus.PENDING) {
            throw new BadRequestException("Only pending membership requests can be rejected");
        }

        member.setStatus(MembershipStatus.REJECTED);
        TeamMember saved = teamMemberRepository.save(member);

        return new TeamMemberResponse(
                saved.getId(),
                saved.getUser().getId(),
                saved.getUser().getName(),
                saved.getRoleInTeam(),
                saved.getStatus());
    }

    @Override
    public void deleteTeam(Long teamId) {
        Team team = findTeamOrThrow(teamId);
        teamMemberRepository.deleteByTeamId(teamId);
        teamRepository.delete(team);
    }

    @Override
    public TeamResponse updateTeam(Long teamId, UpdateTeamRequest request) {
        Team team = findTeamOrThrow(teamId);
        team.setTitle(request.title());
        team.setDescription(request.description());
        team.setRequiredSkills(request.requiredSkills());
        Team updated = teamRepository.save(team);
        return toTeamResponse(updated);
    }

    private Team findTeamOrThrow(Long teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
    }

    private User resolveCreatorUser(Long creatorUserId) {
        return resolveUserOrFallback(creatorUserId, "TeamUp Creator");
    }

    private User resolveUserOrFallback(Long preferredUserId, String fallbackName) {
        User existing = resolveExistingUser(preferredUserId);
        if (existing != null) {
            return existing;
        }

        User firstStudent = userRepository.findFirstByRoleOrderByIdAsc(UserRole.STUDENT).orElse(null);
        if (firstStudent != null) {
            return firstStudent;
        }

        User fallback = new User();
        fallback.setName(fallbackName);
        fallback.setEmail("teamup-" + System.currentTimeMillis() + "@local");
        fallback.setPassword("fallback-user");
        fallback.setRole(UserRole.STUDENT);
        return userRepository.save(fallback);
    }

    private User resolveExistingUser(Long preferredUserId) {
        if (preferredUserId == null) {
            return null;
        }

        User byId = userRepository.findById(preferredUserId).orElse(null);
        if (byId != null) {
            return byId;
        }

        String mappedEmail = "mapped-user-" + preferredUserId + "@local";
        User mapped = userRepository.findByEmailIgnoreCase(mappedEmail).orElse(null);
        if (mapped != null) {
            return mapped;
        }

        org.practicals.backend.model.userManagement.User appUser = appUserRepository.findById(preferredUserId).orElse(null);
        if (appUser != null) {
            User byRealEmail = userRepository.findByEmailIgnoreCase(appUser.getEmail()).orElse(null);
            if (byRealEmail != null) {
                return byRealEmail;
            }

            User fromAppUser = new User();
            fromAppUser.setName(appUser.getUsername());
            fromAppUser.setEmail(appUser.getEmail());
            fromAppUser.setPassword("mapped-user");
            fromAppUser.setRole(UserRole.STUDENT);
            return userRepository.save(fromAppUser);
        }

        User created = new User();
        created.setName("User " + preferredUserId);
        created.setEmail(mappedEmail);
        created.setPassword("mapped-user");
        created.setRole(UserRole.STUDENT);
        return userRepository.save(created);
    }

    private TeamResponse toTeamResponse(Team team) {
        long memberCount = teamMemberRepository.countByTeamIdAndStatus(team.getId(), MembershipStatus.APPROVED);

        Long createdByUserId = null;
        String createdByName = "Unknown";
        try {
            if (team.getCreatedBy() != null) {
                createdByUserId = team.getCreatedBy().getId();
                createdByName = team.getCreatedBy().getName();
            }
        } catch (EntityNotFoundException ignored) {
            // Keep fallback values for orphaned legacy rows.
        }

        return new TeamResponse(
                team.getId(),
                team.getTitle(),
                team.getDescription(),
                team.getRequiredSkills(),
                team.getStatus(),
                createdByUserId,
                createdByName,
                memberCount,
                team.getCreatedAt());
    }

    private TeamMemberResponse toTeamMemberResponseSafe(TeamMember member) {
        try {
            if (member.getUser() == null) {
                return null;
            }

            return new TeamMemberResponse(
                    member.getId(),
                    member.getUser().getId(),
                    member.getUser().getName(),
                    member.getRoleInTeam(),
                    member.getStatus());
        } catch (EntityNotFoundException ignored) {
            return null;
        }
    }
}
