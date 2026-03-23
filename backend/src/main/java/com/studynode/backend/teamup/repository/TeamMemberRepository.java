package com.studynode.backend.teamup.repository;

import com.studynode.backend.teamup.entity.TeamMember;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByTeamId(Long teamId);

    Optional<TeamMember> findByTeamIdAndUserId(Long teamId, Long userId);
}
