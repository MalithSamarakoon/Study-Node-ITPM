package com.studynode.backend.teamup.dto;

import com.studynode.backend.teamup.enums.MembershipStatus;

public record TeamMemberResponse(
        Long id,
        Long userId,
        String userName,
        String roleInTeam,
        MembershipStatus status
) {
}
