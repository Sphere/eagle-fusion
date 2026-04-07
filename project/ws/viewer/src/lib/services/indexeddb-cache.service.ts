import { Injectable } from '@angular/core'

export interface IndexedDBCacheItem {
  courseId: string
  data: any
  timestamp: number
  version: string
}

@Injectable({
  providedIn: 'root',
})
export class IndexedDBCacheService {
  private dbName = 'EagleFusionCache'
  private storeName = 'courseHierarchy'
  private db: IDBDatabase | null = null
  private readonly INDEXED_DB_DURATION = 30 * 60 * 1000 // 30 minutes

  constructor() {
    this.initializeDB()
  }

  /**
   * Initialize IndexedDB connection
   */
  private initializeDB(): void {
    const request = indexedDB.open(this.dbName, 1)

    request.onerror = () => {
      console.error('[IndexedDB] Failed to initialize')
    }

    request.onsuccess = (event: any) => {
      this.db = event.target.result
      console.log('[IndexedDB] Initialized successfully')
    }

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName, { keyPath: 'courseId' })
        console.log('[IndexedDB] Object store created')
      }
    }
  }

  /**
   * Save course hierarchy to IndexedDB
   */
  async save(courseId: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        console.warn('[IndexedDB] DB not ready, skipping save')
        reject('Database not initialized')
        return
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)

      const item: IndexedDBCacheItem = {
        courseId,
        data,
        timestamp: Date.now(),
        version: data.pkgVersion || '1.0',
      }

      const request = store.put(item)

      request.onsuccess = () => {
        console.log(`[IndexedDB] Saved: ${courseId}`)
        resolve()
      }

      request.onerror = () => {
        console.error(`[IndexedDB] Save failed: ${courseId}`)
        reject(request.error)
      }
    })
  }

  /**
   * Get course hierarchy from IndexedDB
   */
  async get(courseId: string): Promise<any | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized')
        return
      }

      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(courseId)

      request.onsuccess = () => {
        const item = request.result as IndexedDBCacheItem | undefined

        if (!item) {
          resolve(null)
          return
        }

        // Check if expired (7 days for IndexedDB)
        if (Date.now() - item.timestamp > this.INDEXED_DB_DURATION) {
          console.log(`[IndexedDB] Expired: ${courseId}`)
          this.delete(courseId)
          resolve(null)
          return
        }

        console.log(`[IndexedDB] Hit: ${courseId}`)
        resolve(item.data)
      }

      request.onerror = () => {
        console.error(`[IndexedDB] Get failed: ${courseId}`)
        reject(request.error)
      }
    })
  }

  /**
   * Get all cached courses for initialization
   */
  async getAllCourses(): Promise<IndexedDBCacheItem[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve([])
        return
      }

      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        const items = request.result as IndexedDBCacheItem[]
        console.log(`[IndexedDB] Retrieved ${items.length} cached courses`)
        resolve(items)
      }

      request.onerror = () => {
        console.error('[IndexedDB] GetAll failed')
        reject(request.error)
      }
    })
  }

  /**
   * Delete specific course from IndexedDB
   */
  async delete(courseId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized')
        return
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(courseId)

      request.onsuccess = () => {
        console.log(`[IndexedDB] Deleted: ${courseId}`)
        resolve()
      }

      request.onerror = () => {
        console.error(`[IndexedDB] Delete failed: ${courseId}`)
        reject(request.error)
      }
    })
  }

  /**
   * Clear all cached data
   */
  async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized')
        return
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onsuccess = () => {
        console.log('[IndexedDB] Cleared all')
        resolve()
      }

      request.onerror = () => {
        console.error('[IndexedDB] Clear failed')
        reject(request.error)
      }
    })
  }

  /**
   * Get IndexedDB storage statistics
   */
  async getStorageStats(): Promise<{ count: number; oldestCourse: string }> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('Database not initialized')
        return
      }

      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        const items = request.result as IndexedDBCacheItem[]
        const oldest = items.reduce((prev, current) =>
          prev.timestamp < current.timestamp ? prev : current
        )

        resolve({
          count: items.length,
          oldestCourse: oldest?.courseId || 'none',
        })
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }
}
