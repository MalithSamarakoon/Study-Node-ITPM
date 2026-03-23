package com.studynode.backend.teamup.service;

import com.studynode.backend.teamup.dto.CreateTeamRequest;
import com.studynode.backend.teamup.dto.JoinTeamRequest;
import com.studynode.backend.teamup.dto.TeamMemberResponse;
import com.studynode.backend.teamup.dto.TeamResponse;
import com.studynode.backend.teamup.dto.UpdateTeamStatusRequest;
import java.util.List;

public interface TeamService {

    TeamResponse createTeam(CreateTeamRequest request);

    List<TeamResponse> getTeams(String skill);

    TeamResponse getTeamById(Long teamId);

    String requestToJoin(Long teamId, JoinTeamRequest request);

    TeamResponse approveTeam(Long teamId);

    TeamResponse rejectTeam(Long teamId);

    TeamResponse updateTeamStatus(Long teamId, UpdateTeamStatusRequest request);

    List<TeamMemberResponse> getTeamMembers(Long teamId);
}
