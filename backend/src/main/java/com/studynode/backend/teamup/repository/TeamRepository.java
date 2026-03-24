package com.studynode.backend.teamup.repository;

import com.studynode.backend.teamup.entity.Team;
import com.studynode.backend.teamup.enums.TeamStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByStatus(TeamStatus status);

    List<Team> findByStatusAndRequiredSkillsContainingIgnoreCase(TeamStatus status, String requiredSkills);

    List<Team> findByCreatedById(Long createdById);

    List<Team> findByCreatedByIdAndRequiredSkillsContainingIgnoreCase(Long createdById, String requiredSkills);
}
