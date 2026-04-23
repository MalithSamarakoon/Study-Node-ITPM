export function parseTeamMeta(description = "") {
  const meta = {
    type: "PROJECT",
    maxMembers: 5,
    deadline: "",
    cleanDescription: description || "",
  };

  if (!description) {
    return meta;
  }

  const tokenRegex = /\[(type|maxmembers|deadline):([^\]]+)\]/gi;
  let match = tokenRegex.exec(description);
  while (match) {
    const key = match[1].toLowerCase();
    const value = match[2].trim();

    if (key === "type") {
      meta.type = value.toUpperCase() === "EVENT" ? "EVENT" : "PROJECT";
    }

    if (key === "maxmembers") {
      const parsed = Number(value);
      if (!Number.isNaN(parsed) && parsed > 0) {
        meta.maxMembers = parsed;
      }
    }

    if (key === "deadline") {
      meta.deadline = value;
    }

    match = tokenRegex.exec(description);
  }

  meta.cleanDescription = description.replace(tokenRegex, "").trim();
  return meta;
}

export function formatTeamStatus(teamStatus, memberCount, maxMembers) {
  if (teamStatus === "CLOSED") {
    return "CLOSED";
  }

  if (memberCount >= maxMembers) {
    return "FULL";
  }

  return "OPEN";
}

export function splitSkills(requiredSkills = "") {
  return requiredSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function buildDescriptionWithMeta(description, type, maxMembers, deadline) {
  const tokens = [
    `[type:${type}]`,
    `[maxmembers:${maxMembers}]`,
  ];

  if (deadline) {
    tokens.push(`[deadline:${deadline}]`);
  }

  return `${tokens.join(" ")} ${description.trim()}`.trim();
}
