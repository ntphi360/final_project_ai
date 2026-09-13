function parseOfficerId(value, fallback) {
  const officerId = Number(value)
  return Number.isInteger(officerId) && officerId > 0 ? officerId : fallback
}

export const currentAssignerId = parseOfficerId(
  import.meta.env.VITE_CURRENT_ASSIGNER_ID,
  1,
)

export const currentAssigneeId = parseOfficerId(
  import.meta.env.VITE_CURRENT_ASSIGNEE_ID,
  2,
)
