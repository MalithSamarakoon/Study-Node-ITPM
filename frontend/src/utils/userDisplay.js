export const getUserDisplayName = (userLike) => {
    if (!userLike) return 'Anonymous'
    if (typeof userLike === 'string') return userLike

    if (userLike.fullName) return userLike.fullName
    if (userLike.name) return userLike.name
    if (userLike.username) return userLike.username
    if (userLike.email) return userLike.email
    if (userLike.id) return String(userLike.id)

    return 'Anonymous'
}

export default { getUserDisplayName }
