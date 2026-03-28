/**
 * Display Order Validation Middleware
 * Validates and handles display_order conflicts before operations
 */

const {
  validateDisplayOrder,
  checkDisplayOrderConflict,
} = require('../utils/displayOrderValidator');

/**
 * Middleware to validate display order on add/edit requests
 * Usage: router.post('/add', displayOrderMiddleware('table_name', 'table_id'), controller.add);
 */
const displayOrderMiddleware = (tableName, idColumnName = 'id') => {
  return async (req, res, next) => {
    try {
      const { display_order, id } = req.body;

      // If no display_order provided, assign automatically
      if (!display_order) {
        return next();
      }

      // Validate the display order
      const validation = await validateDisplayOrder(
        tableName,
        display_order,
        id || null,
        idColumnName
      );

      // Attach validation result to request
      req.displayOrderValidation = validation;

      // If there's a conflict, return warning but continue
      if (!validation.isValid) {
        res.locals.displayOrderWarning = {
          warning: validation.warning,
          suggestion: validation.suggestion,
          nextAvailable: validation.displayOrder,
        };
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error validating display order',
        error: error.message,
      });
    }
  };
};

/**
 * Middleware to strictly validate display order (reject on conflict)
 * Usage: router.post('/add', strictDisplayOrderMiddleware('table_name'), controller.add);
 */
const strictDisplayOrderMiddleware = (tableName, idColumnName = 'id') => {
  return async (req, res, next) => {
    try {
      const { display_order, id } = req.body;

      if (!display_order || display_order < 0) {
        return next();
      }

      const conflict = await checkDisplayOrderConflict(
        tableName,
        display_order,
        id || null,
        idColumnName
      );

      if (conflict.isTaken) {
        return res.status(409).json({
          success: false,
          message: conflict.message,
          error: 'DISPLAY_ORDER_CONFLICT',
          conflictId: conflict.conflict?.[idColumnName],
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error validating display order',
        error: error.message,
      });
    }
  };
};

module.exports = {
  displayOrderMiddleware,
  strictDisplayOrderMiddleware,
};
