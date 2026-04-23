export const mockTeams = [
  {
    id: 1001,
    title: "AI Research Project",
    description:
      "[type:PROJECT] [maxmembers:5] [deadline:2026-03-15] We are building an AI LMS chatbot and looking for backend and ML teammates.",
    requiredSkills: "Java, Spring Boot, Machine Learning",
    status: "APPROVED",
    createdByUserId: 1,
    createdByName: "Yasira",
    memberCount: 2,
    createdAt: "2026-03-01T10:30:00",
  },
  {
    id: 1002,
    title: "Hackathon 2026 Team",
    description:
      "[type:EVENT] [maxmembers:4] [deadline:2026-04-10] Join our UI and React squad for the upcoming hackathon.",
    requiredSkills: "UI/UX, React",
    status: "ACTIVE",
    createdByUserId: 2,
    createdByName: "Kasun",
    memberCount: 3,
    createdAt: "2026-03-05T09:00:00",
  },
];

export const mockMembersByTeamId = {
  1001: [
    {
      id: 5001,
      userId: 1,
      userName: "Yasira",
      roleInTeam: "Leader",
      status: "APPROVED",
    },
    {
      id: 5002,
      userId: 8,
      userName: "Nimal",
      roleInTeam: "Backend",
      status: "APPROVED",
    },
    {
      id: 5003,
      userId: 11,
      userName: "Kasun",
      roleInTeam: "I have backend experience",
      status: "PENDING",
    },
  ],
  1002: [
    {
      id: 5101,
      userId: 2,
      userName: "Kasun",
      roleInTeam: "Leader",
      status: "APPROVED",
    },
    {
      id: 5102,
      userId: 14,
      userName: "Aimy",
      roleInTeam: "UI/UX",
      status: "APPROVED",
    },
  ],
};

export const mockPendingRequests = [
  {
    id: 5003,
    userId: 11,
    userName: "Kasun",
    roleInTeam: "I have backend experience",
    status: "PENDING",
    teamId: 1001,
    teamTitle: "AI Research Project",
  },
  {
    id: 5004,
    userId: 12,
    userName: "Saman",
    roleInTeam: "UI developer",
    status: "PENDING",
    teamId: 1001,
    teamTitle: "AI Research Project",
  },
];
