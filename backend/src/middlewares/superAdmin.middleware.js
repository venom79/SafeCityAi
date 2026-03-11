import { ROLES } from "../constants/roles.js"

export default function superAdminMiddleware(req, res, next) {

  if (req.user.role !== ROLES.SUPER_ADMIN) {
    return res.status(403).json({
      success: false,
      message: "Super admin access required"
    })
  }

  next()

}