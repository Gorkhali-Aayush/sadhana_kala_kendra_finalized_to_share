/**
 * Display Order Validator Utility (ES6 Module)
 * Handles validation and conflict detection for display_order fields across tables
 * Works with async/await and modern database connections
 */

import db from "../config/db.js";

// Allowlist of valid table names to prevent SQL injection
const VALID_TABLES = {
  'about_us': 'about_us',
  'Teachers': 'Teachers',
  'Courses': 'Courses',
  'Artists': 'Artists',
  'Events': 'Events',
  'activities': 'activities',
  'news': 'news',
  'offers': 'offers',
  'programs': 'programs',
  'Gallery': 'Gallery'
};

// Allowlist of valid ID column names
const VALID_ID_COLUMNS = {
  'teacher_id': 'teacher_id',
  'course_id': 'course_id',
  'artist_id': 'artist_id',
  'event_id': 'event_id',
  'activity_id': 'activity_id',
  'news_id': 'news_id',
  'offer_id': 'offer_id',
  'program_id': 'program_id',
  'media_id': 'media_id',
  'about_id': 'about_id',
  'id': 'id'
};

/**
 * Validate table and column names against allowlist
 * @param {string} tableName - Table name to validate
 * @param {string} idColumn - ID column name to validate
 * @throws {Error} If table or column not in allowlist
 */
function validateTableAndColumn(tableName, idColumn) {
  if (!VALID_TABLES[tableName]) {
    throw new Error(`Invalid table name: ${tableName}`);
  }
  if (!VALID_ID_COLUMNS[idColumn]) {
    throw new Error(`Invalid ID column: ${idColumn}`);
  }
}

/**
 * Check if a display order is already taken in a table
 * @param {string} tableName - Table name to check
 * @param {number} displayOrder - Display order to check
 * @param {number} excludeId - ID to exclude from check (for edit operations)
 * @param {string} idColumn - Primary key column name
 * @returns {Promise<Object>} - Result object with taken status and conflicting record info
 */
export async function checkDisplayOrderConflict(
  tableName,
  displayOrder,
  excludeId = null,
  idColumn = 'id'
) {
  try {
    validateTableAndColumn(tableName, idColumn);
    
    const table = VALID_TABLES[tableName];
    let query = `SELECT * FROM ${table} WHERE display_order = ?`;
    const params = [displayOrder];

    // If editing, exclude current record
    if (excludeId) {
      query += ` AND ${VALID_ID_COLUMNS[idColumn]} != ?`;
      params.push(excludeId);
    }

    const [results] = await db.query(query, params);

    return {
      isTaken: results.length > 0,
      conflict: results.length > 0 ? results[0] : null,
      message:
        results.length > 0
          ? `Display order ${displayOrder} is already in use`
          : null,
    };
  } catch (error) {
    throw new Error(`Error checking display order conflict: ${error.message}`);
  }
}

/**
 * Get the next available display order
 * @param {string} tableName - Table name
 * @returns {Promise<number>} - Next available display order
 */
export async function getNextDisplayOrder(tableName) {
  try {
    validateTableAndColumn(tableName, 'id');
    
    const table = VALID_TABLES[tableName];
    const [results] = await db.query(
      `SELECT MAX(display_order) as maxOrder FROM ${table}`
    );
    const maxOrder = results[0]?.maxOrder || 0;
    return maxOrder + 1;
  } catch (error) {
    throw new Error(`Error getting next display order: ${error.message}`);
  }
}

/**
 * Validate and return display order (handle conflicts)
 * Returns validation result with original order, next available, and warnings
 * @param {string} tableName - Table name
 * @param {number} desiredOrder - Desired display order
 * @param {number} excludeId - ID to exclude from check (for edit operations)
 * @param {string} idColumn - Primary key column name
 * @returns {Promise<Object>} - Result with valid order and warnings
 */
export async function validateDisplayOrder(
  tableName,
  desiredOrder,
  excludeId = null,
  idColumn = 'id'
) {
  try {
    validateTableAndColumn(tableName, idColumn);
    
    if (!desiredOrder || desiredOrder < 0) {
      const nextOrder = await getNextDisplayOrder(tableName);
      return {
        isValid: true,
        displayOrder: nextOrder,
        warning: null,
        message: `No order provided, assigned next available: ${nextOrder}`,
      };
    }

    const conflict = await checkDisplayOrderConflict(
      tableName,
      desiredOrder,
      excludeId,
      idColumn
    );

    if (conflict.isTaken) {
      const nextOrder = await getNextDisplayOrder(tableName);
      return {
        isValid: false,
        displayOrder: desiredOrder,
        nextAvailable: nextOrder,
        warning: conflict.message,
        suggestion: `Display order ${desiredOrder} is already taken. Use ${nextOrder} instead, or manually specify another order.`,
        conflictData: conflict.conflict,
      };
    }

    return {
      isValid: true,
      displayOrder: desiredOrder,
      warning: null,
      message: 'Display order is available',
    };
  } catch (error) {
    throw new Error(`Error validating display order: ${error.message}`);
  }
}

/**
 * Get all records sorted by display order
 * @param {string} tableName - Table name
 * @param {Array} columns - Columns to select (default: all)
 * @returns {Promise<Array>} - Records sorted by display_order
 */
export async function getByDisplayOrder(tableName, columns = ['*']) {
  try {
    validateTableAndColumn(tableName, 'id');
    
    const table = VALID_TABLES[tableName];
    const columnStr = columns.join(', ');
    const [results] = await db.query(
      `SELECT ${columnStr} FROM ${table} ORDER BY display_order ASC`
    );
    return results;
  } catch (error) {
    throw new Error(`Error getting records by display order: ${error.message}`);
  }
}

/**
 * Reorder items (bulk update)
 * @param {string} tableName - Table name
 * @param {Array} items - Array of {id, display_order}
 * @param {string} idColumn - Primary key column name
 * @returns {Promise<Object>} - Result of update operations
 */
export async function reorderItems(tableName, items, idColumn = 'id') {
  try {
    validateTableAndColumn(tableName, idColumn);
    
    const table = VALID_TABLES[tableName];
    const column = VALID_ID_COLUMNS[idColumn];
    
    const results = [];
    for (const item of items) {
      const [result] = await db.query(
        `UPDATE ${table} SET display_order = ? WHERE ${column} = ?`,
        [item.display_order, item.id]
      );

      results.push({
        id: item.id,
        displayOrder: item.display_order,
        status: result.affectedRows > 0 ? 'success' : 'failed',
      });
    }
    return {
      success: true,
      updated: results.filter((r) => r.status === 'success').length,
      results,
    };
  } catch (error) {
    throw new Error(`Error reordering items: ${error.message}`);
  }
}

/**
 * Auto-shift display orders if needed
 * This will increment the conflicting order and cascade changes
 * @param {string} tableName - Table name
 * @param {number} displayOrder - Display order to insert
 * @param {string} idColumn - Primary key column name
 * @returns {Promise<void>}
 */
export async function autoShiftDisplayOrder(tableName, displayOrder, idColumn = 'id') {
  try {
    // Get current max order
    const [maxResults] = await db.query(
      `SELECT MAX(display_order) as maxOrder FROM ${tableName} WHERE display_order >= ?`,
      [displayOrder]
    );

    if (maxResults.length > 0 && maxResults[0].maxOrder !== null) {
      // Increment all conflicting orders
      await db.query(
        `UPDATE ${tableName} SET display_order = display_order + 1 WHERE display_order >= ?`,
        [displayOrder]
      );
    }
  } catch (error) {
    throw new Error(`Error auto-shifting display order: ${error.message}`);
  }
}
