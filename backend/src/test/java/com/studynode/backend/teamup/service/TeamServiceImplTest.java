package com.studynode.backend.teamup.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.studynode.backend.common.exception.BadRequestException;
import com.studynode.backend.common.exception.ResourceNotFoundException;
import com.studynode.backend.teamup.dto.CreateTeamRequest;
import com.studynode.backend.teamup.dto.JoinTeamRequest;
import com.studynode.backend.teamup.dto.TeamMemberResponse;
import com.studynode.backend.teamup.dto.TeamResponse;
import com.studynode.backend.teamup.entity.Team;
import com.studynode.backend.teamup.entity.TeamMember;
import com.studynode.backend.teamup.entity.User;
import com.studynode.backend.teamup.enums.MembershipStatus;
import com.studynode.backend.teamup.enums.TeamStatus;
import com.studynode.backend.teamup.enums.UserRole;
import com.studynode.backend.teamup.repository.TeamMemberRepository;
import com.studynode.backend.teamup.repository.TeamRepository;
import com.studynode.backend.teamup.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TeamServiceImplTest {

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private TeamMemberRepository teamMemberRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TeamServiceImpl teamService;

    @Test
    void createTeamSuccessfully() {
        User creator = buildUser(1L, "Ayu", UserRole.STUDENT);

        Team savedTeam = new Team();
        savedTeam.setId(10L);
        savedTeam.setTitle("AI Study Group");
        savedTeam.setDescription("Prepare together");
        savedTeam.setRequiredSkills("Java, Spring");
        savedTeam.setStatus(TeamStatus.PENDING);
        savedTeam.setCreatedBy(creator);
        savedTeam.setCreatedAt(LocalDateTime.now());

        when(userRepository.findFirstByRoleOrderByIdAsc(UserRole.STUDENT)).thenReturn(Optional.of(creator));
        when(teamRepository.save(any(Team.class))).thenReturn(savedTeam);
        when(teamMemberRepository.countByTeamIdAndStatus(10L, MembershipStatus.APPROVED)).thenReturn(1L);

        TeamResponse response = teamService.createTeam(
            new CreateTeamRequest("AI Study Group", "Prepare together", "Java, Spring", null));

        assertEquals(10L, response.id());
        assertEquals("AI Study Group", response.title());
        assertEquals(TeamStatus.PENDING, response.status());
        assertEquals("Ayu", response.createdByName());
        assertEquals(1L, response.memberCount());
    }

    @Test
    void joinTeamSuccessfully() {
        Team team = buildTeam(7L, TeamStatus.APPROVED, buildUser(1L, "Owner", UserRole.STUDENT));
        User member = buildUser(2L, "Member", UserRole.STUDENT);

        when(teamRepository.findById(7L)).thenReturn(Optional.of(team));
        when(userRepository.findById(2L)).thenReturn(Optional.of(member));
        when(teamMemberRepository.findByTeamIdAndUserId(7L, 2L)).thenReturn(Optional.empty());

        String result = teamService.requestToJoin(7L, new JoinTeamRequest(2L, "Backend Developer"));

        assertEquals("Join request submitted successfully", result);
        verify(teamMemberRepository).save(any(TeamMember.class));
    }

    @Test
    void rejectDuplicateJoin() {
        Team team = buildTeam(7L, TeamStatus.APPROVED, buildUser(1L, "Owner", UserRole.STUDENT));
        User member = buildUser(2L, "Member", UserRole.STUDENT);

        when(teamRepository.findById(7L)).thenReturn(Optional.of(team));
        when(userRepository.findById(2L)).thenReturn(Optional.of(member));
        when(teamMemberRepository.findByTeamIdAndUserId(7L, 2L)).thenReturn(Optional.of(new TeamMember()));

        assertThrows(BadRequestException.class,
                () -> teamService.requestToJoin(7L, new JoinTeamRequest(2L, "Backend Developer")));
    }

    @Test
    void approveMembershipRequest() {
        User owner = buildUser(1L, "Owner", UserRole.STUDENT);
        Team team = buildTeam(7L, TeamStatus.APPROVED, owner);
        User memberUser = buildUser(2L, "Member", UserRole.STUDENT);

        TeamMember member = new TeamMember();
        member.setId(22L);
        member.setTeam(team);
        member.setUser(memberUser);
        member.setRoleInTeam("Frontend Developer");
        member.setStatus(MembershipStatus.PENDING);

        when(teamRepository.findById(7L)).thenReturn(Optional.of(team));
        when(teamMemberRepository.findById(22L)).thenReturn(Optional.of(member));
        when(teamMemberRepository.save(any(TeamMember.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TeamMemberResponse response = teamService.approveMembershipRequest(7L, 22L);

        assertEquals(22L, response.id());
        assertEquals(MembershipStatus.APPROVED, response.status());
    }

    @Test
    void teamNotFound() {
        when(teamRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> teamService.getTeamById(999L));
    }

    @Test
    void invalidUserNotFound() {
        Team team = buildTeam(7L, TeamStatus.APPROVED, buildUser(1L, "Owner", UserRole.STUDENT));

        when(teamRepository.findById(7L)).thenReturn(Optional.of(team));
        when(userRepository.findById(404L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> teamService.requestToJoin(7L, new JoinTeamRequest(404L, "UI Designer")));
    }

    private User buildUser(Long id, String name, UserRole role) {
        User user = new User();
        user.setId(id);
        user.setName(name);
        user.setRole(role);
        user.setEmail(name.toLowerCase() + "@test.com");
        user.setPassword("password123");
        return user;
    }

    private Team buildTeam(Long id, TeamStatus status, User owner) {
        Team team = new Team();
        team.setId(id);
        team.setTitle("Team " + id);
        team.setDescription("Description");
        team.setRequiredSkills("Java");
        team.setStatus(status);
        team.setCreatedBy(owner);
        team.setCreatedAt(LocalDateTime.now());
        return team;
    }
}
