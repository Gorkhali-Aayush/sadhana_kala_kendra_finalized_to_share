/**
 * Storage Manager - Prevents browser storage from consuming excessive memory
 * Implements size limits, TTL (Time To Live), and automatic cleanup
 */

const STORAGE_CONFIG = {
  // Maximum size per item in KB
  MAX_ITEM_SIZE_KB: 1024, // 1MB per item
  
  // Maximum total localStorage size in KB
  MAX_STORAGE_SIZE_KB: 5120, // 5MB total
  
  // TTL for cached data in milliseconds
  CACHE_TTL_MS: 60 * 60 * 1000, // 1 hour
  
  // Cleanup threshold (cleanup when 80% full)
  CLEANUP_THRESHOLD: 0.8,
};

interface StorageItem<T> {
  data: T;
  timestamp: number;
  ttl?: number;
}

/**
 * Check if an item has expired
 */
function isExpired(item: StorageItem<any>): boolean {
  if (!item.ttl) return false;
  return Date.now() - item.timestamp > item.ttl;
}

/**
 * Calculate storage usage in KB
 */
function getStorageUsageKB(): number {
  let totalSize = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length;
    }
  }
  return totalSize / 1024;
}

/**
 * Cleanup expired and old items
 */
function cleanupStorage(): void {
  const now = Date.now();
  const itemsToDelete: string[] = [];
  const itemsWithAge: Array<{ key: string; age: number }> = [];

  for (const key in localStorage) {
    if (!localStorage.hasOwnProperty(key)) continue;

    try {
      const stored = JSON.parse(localStorage[key]);
      
      // Mark expired items for deletion
      if (stored.timestamp && stored.ttl) {
        if (now - stored.timestamp > stored.ttl) {
          itemsToDelete.push(key);
          continue;
        }
      }

      // Track item age for LRU cleanup if needed
      if (stored.timestamp) {
        itemsWithAge.push({
          key,
          age: now - stored.timestamp,
        });
      }
    } catch {
      // Skip non-JSON items
    }
  }

  // Delete expired items
  itemsToDelete.forEach(key => localStorage.removeItem(key));

  // If still over threshold, delete oldest items (LRU strategy)
  const usage = getStorageUsageKB();
  if (usage > STORAGE_CONFIG.MAX_STORAGE_SIZE_KB * STORAGE_CONFIG.CLEANUP_THRESHOLD) {
    // Sort by age (oldest first)
    itemsWithAge.sort((a, b) => b.age - a.age);

    // Delete oldest items until below 70% threshold
    for (const item of itemsWithAge) {
      if (getStorageUsageKB() < STORAGE_CONFIG.MAX_STORAGE_SIZE_KB * 0.7) {
        break;
      }
      localStorage.removeItem(item.key);
    }
  }

  console.log(`[Storage] Cleanup completed. Current usage: ${getStorageUsageKB().toFixed(2)}KB`);
}

/**
 * Safe set item with size checks and TTL
 */
export function setStorageItem<T>(
  key: string,
  data: T,
  ttlMs: number = STORAGE_CONFIG.CACHE_TTL_MS
): boolean {
  try {
    // Cleanup if needed before adding
    if (getStorageUsageKB() > STORAGE_CONFIG.MAX_STORAGE_SIZE_KB * STORAGE_CONFIG.CLEANUP_THRESHOLD) {
      cleanupStorage();
    }

    const item: StorageItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };

    const serialized = JSON.stringify(item);
    const sizeKB = serialized.length / 1024;

    // Check individual item size
    if (sizeKB > STORAGE_CONFIG.MAX_ITEM_SIZE_KB) {
      console.warn(`[Storage] Item too large: ${key} (${sizeKB.toFixed(2)}KB), not storing`);
      return false;
    }

    localStorage.setItem(key, serialized);
    console.log(`[Storage] Stored ${key} (${sizeKB.toFixed(2)}KB)`);
    return true;
  } catch (error) {
    console.error(`[Storage] Failed to set ${key}:`, error);
    // If quota exceeded, try cleanup and retry once
    if ((error as DOMException).code === 22) {
      cleanupStorage();
      try {
        const item: StorageItem<T> = {
          data,
          timestamp: Date.now(),
          ttl: ttlMs,
        };
        localStorage.setItem(key, JSON.stringify(item));
        return true;
      } catch {
        console.error(`[Storage] Failed to store even after cleanup`);
        return false;
      }
    }
    return false;
  }
}

/**
 * Safe get item with expiry check
 */
export function getStorageItem<T>(key: string): T | null {
  try {
    const serialized = localStorage.getItem(key);
    if (!serialized) return null;

    const item: StorageItem<T> = JSON.parse(serialized);

    // Check expiry
    if (isExpired(item)) {
      localStorage.removeItem(key);
      return null;
    }

    return item.data;
  } catch (error) {
    console.error(`[Storage] Failed to get ${key}:`, error);
    return null;
  }
}

/**
 * Safe remove item
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`[Storage] Failed to remove ${key}:`, error);
  }
}

/**
 * Get current storage statistics
 */
export function getStorageStats(): {
  usageKB: number;
  maxKB: number;
  usagePercent: number;
  itemCount: number;
} {
  const usageKB = getStorageUsageKB();
  const maxKB = STORAGE_CONFIG.MAX_STORAGE_SIZE_KB;
  
  let itemCount = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      itemCount++;
    }
  }

  return {
    usageKB,
    maxKB,
    usagePercent: (usageKB / maxKB) * 100,
    itemCount,
  };
}

/**
 * Clear all storage (use with caution)
 */
export function clearAllStorage(): void {
  localStorage.clear();
  sessionStorage.clear();
  console.log('[Storage] All storage cleared');
}

/**
 * Print storage diagnostics to console
 */
export function printStorageDiagnostics(): void {
  const stats = getStorageStats();
  console.group('[Storage Diagnostics]');
  console.log(`Usage: ${stats.usageKB.toFixed(2)}KB / ${stats.maxKB}KB (${stats.usagePercent.toFixed(1)}%)`);
  console.log(`Items: ${stats.itemCount}`);
  console.log('---');
  
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      try {
        const item = JSON.parse(localStorage[key]);
        const size = localStorage[key].length / 1024;
        const expired = item.ttl && isExpired(item) ? ' [EXPIRED]' : '';
        console.log(`  ${key}: ${size.toFixed(2)}KB${expired}`);
      } catch {
        const size = localStorage[key].length / 1024;
        console.log(`  ${key}: ${size.toFixed(2)}KB (raw)`);
      }
    }
  }
  
  console.groupEnd();
}

/**
 * Initialize storage monitoring
 */
export function initializeStorageMonitoring(): void {
  // Clean up on page load
  cleanupStorage();

  // Periodic cleanup (every 5 minutes)
  setInterval(() => {
    cleanupStorage();
  }, 5 * 60 * 1000);

  // Log warning if storage gets high
  setInterval(() => {
    const stats = getStorageStats();
    if (stats.usagePercent > 80) {
      console.warn(
        `[Storage] WARNING: Storage usage is high (${stats.usagePercent.toFixed(1)}%). ` +
        `Cleaning up...`
      );
      cleanupStorage();
    }
  }, 30 * 1000); // Every 30 seconds

  console.log('[Storage] Monitoring initialized');
}
