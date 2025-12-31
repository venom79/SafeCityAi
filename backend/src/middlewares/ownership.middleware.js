import prisma from "../db/prisma.js";
import { ROLES } from "../constants/roles.js";

/**
 * @param {Object} options
 * @param {string} options.model - Prisma model name (e.g. "cases")
 * @param {string} options.param - Request param containing resource ID (e.g. "id")
 * @param {string} options.ownerField - Field on model that stores owner user id
 */
const requireOwnership = ({ model, param, ownerField }) => {
  return async (req, res, next) => {
    try {
      // Admins bypass ownership checks
      if (
        req.user.role === ROLES.ADMIN ||
        req.user.role === ROLES.SUPER_ADMIN
      ) {
        return next();
      }

      const resourceId = req.params[param];

      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: "Missing resource identifier",
        });
      }

      const record = await prisma[model].findUnique({
        where: { id: resourceId },
        select: { [ownerField]: true },
      });

      if (!record) {
        return res.status(404).json({
          success: false,
          message: "Resource not found",
        });
      }

      if (record[ownerField] !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      next();
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};

export default requireOwnership;
