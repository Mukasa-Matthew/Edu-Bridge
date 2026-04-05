/**
 * @param {...string} allowedRoles
 */
export function authorize(...allowedRoles) {
  return async function authorizeHook(request, reply) {
    const role = request.user?.role
    if (!role || !allowedRoles.includes(role)) {
      request.log.warn({ role, allowedRoles }, 'authorize: forbidden')
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource.',
      })
    }
  }
}
