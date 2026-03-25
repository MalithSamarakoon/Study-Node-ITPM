package com.studynode.backend.teamup.dto;

import com.studynode.backend.teamup.enums.MembershipStatus;
import java.time.LocalDateTime;

public record TeamMembershipStatusResponse(
        Long teamId,
        String teamTitle,
        String roleInTeam,
        MembershipStatus membershipStatus,
        LocalDateTime updatedAt
) {
}
