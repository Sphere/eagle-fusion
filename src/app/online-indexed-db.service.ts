// indexeddb.service.ts
import { Injectable } from '@angular/core'
import { Observable, Observer } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  private readonly dbName = 'optimistic-ui-online-store';
  private readonly dbVersion = 1;
  private db: IDBDatabase | undefined

  constructor() { }

  isIndexedDBSupported(): boolean {
    return 'indexedDB' in window
  }

  openOrCreateDatabase(): Observable<IDBDatabase> {
    return new Observable((observer: Observer<IDBDatabase>) => {
      if (!this.isIndexedDBSupported()) {
        // console.warn('IndexedDB is not supported. Falling back to localStorage.')
        observer.error('IndexedDB is not supported')
        observer.complete()
        return
      }
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result as IDBDatabase

        // Check if the required object stores exist, if not create them
        if (!db.objectStoreNames.contains('onlineCourseProgress')) {
          const objectStore1 = db.createObjectStore('onlineCourseProgress', { keyPath: 'courseId', autoIncrement: true })
          objectStore1.createIndex('courseIdIndex', 'courseId', { unique: false })
          // Create more indexes if needed for objectStore1
        }

        if (!db.objectStoreNames.contains('userEnrollCourse')) {
          const objectStore2 = db.createObjectStore('userEnrollCourse', { keyPath: 'courseId', autoIncrement: true })
          objectStore2.createIndex('courseIdIndex', 'courseId', { unique: false })
          // Create more indexes if needed for objectStore2
        }
      }

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result as IDBDatabase
        // Check if the required tables exist
        const transaction = db.transaction(['onlineCourseProgress', 'userEnrollCourse'], 'readonly')
        const objectStore1 = transaction.objectStore('onlineCourseProgress')
        const objectStore2 = transaction.objectStore('userEnrollCourse')
        const table1Exists = objectStore1 != null
        const table2Exists = objectStore2 != null

        if (table1Exists && table2Exists) {
          // Both tables exist, emit the database
          observer.next(db)
          observer.complete()
        } else {
          // One or both tables don't exist, emit an error
          observer.error('One or both required tables do not exist')
        }
      }

      request.onerror = (_event: any) => {
        // console.error('Failed to open or create IndexedDB:', event.target.error)
        // observer.error('Failed to open or create IndexedDB')
      }
    })
  }



  getRecordFromTable(tableName: string, userID: string, key: any): Observable<any> {
    console.log(userID, key)
    return new Observable<any>((observer: Observer<any>) => {
      this.openOrCreateDatabase().subscribe((db: IDBDatabase) => {
        const transaction = db.transaction(tableName, 'readonly')
        const objectStore = transaction.objectStore(tableName)
        const request = objectStore.get(key)

        request.onsuccess = () => {
          const record = request.result
          console.log(record, 'record')
          if (record && record.userID === userID) {
            observer.next(record)
          } else {
            observer.error(`Record with key ${key} not found in ${tableName}`)
          }
          observer.complete()
        }

        request.onerror = (event: any) => {
          console.error(`Failed to retrieve record with key ${key} from ${tableName}:`, event.target.error)
          observer.error(`Failed to retrieve record with key ${key} from ${tableName}`)
        }
      }, (error) => {
        alert(error)
        console.error('Error opening database:', error)
        observer.error('Error opening database')
      })
    })
  }

  async openDatabase(): Promise<IDBDatabase> {
    const request = indexedDB.open(this.dbName, this.dbVersion)

    return new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = (event: any) => {
        console.log('IndexedDB opened successfully:', event.target.result)
        resolve(request.result)
      }

      request.onerror = (event: any) => {
        console.error('Failed to open IndexedDB:', event.target.error)
        reject('Failed to open IndexedDB')
      }

      request.onupgradeneeded = () => {
        console.log('IndexedDB upgrade needed')
        const db = request.result

        // Create or upgrade object stores here
        if (!db.objectStoreNames.contains('onlineCourseProgress')) {
          const store1 = db.createObjectStore('onlineCourseProgress', { keyPath: 'courseId', autoIncrement: true })
          store1.createIndex('courseIdIndex', 'courseId', { unique: false })
          //store1.createIndex('contentIdIndex', 'contentId', { unique: true })
          // Add more indexes as needed
        }
        if (!db.objectStoreNames.contains('userEnrollCourse')) {
          const objectStore2 = db.createObjectStore('userEnrollCourse', { keyPath: 'courseId', autoIncrement: true })
          objectStore2.createIndex('courseIdIndex', 'courseId', { unique: false })
          // Create more indexes if needed for objectStore2
        }
        // Add more object stores as needed
        resolve(db)
      }
    })
  }


  async checkDatabaseTablesExists(): Promise<boolean> {
    try {
      const db = await this.openDatabase()
      const table1Exists = db.objectStoreNames.contains('onlineCourseProgress')
      const table2Exists = db.objectStoreNames.contains('userEnrollCourse')
      // const dataExistsInTable1 = await this.checkDataExists('onlineCourseProgress', db)
      // const dataExistsInTable2 = await this.checkDataExists('userEnrollCourse', db)
      return table1Exists && table2Exists
    } catch (error) {
      throw new Error('Error checking database, tables, and data in IndexedDB: ' + error)
    }
  }


  async checkDatabaseTablesAndDataExists(): Promise<boolean> {
    try {
      const db = await this.openDatabase()
      const dataExistsInTable1 = await this.checkDataExists('onlineCourseProgress', db)
      const dataExistsInTable2 = await this.checkDataExists('userEnrollCourse', db)
      return dataExistsInTable1 && dataExistsInTable2
    } catch (error) {
      throw new Error('Error checking database, tables, and data in IndexedDB: ' + error)
    }
  }

  // async checkProgressDatabaseTablesAndDataExists(dbName: string, tableName: string, recordKey: string) {
  //   return new Promise((resolve, reject) => {
  //     const request = indexedDB.open(dbName)
  //     request.onsuccess = (event: any) => {
  //       const db = event.target.result as IDBDatabase
  //       const transaction = db.transaction(tableName, 'readonly')
  //       const objectStore = transaction.objectStore(tableName)

  //       const getRequest = objectStore.get(recordKey)
  //       getRequest.onsuccess = (event: any) => {
  //         const record = event.target.result
  //         resolve(record !== undefined && record !== null)
  //       }
  //       getRequest.onerror = (event: any) => {
  //         reject(event.target.error)
  //       }
  //     }
  //     request.onerror = (event: any) => {
  //       reject(event.target.error)
  //     }
  //   })
  // }

  async checkProgressDatabaseTablesAndDataExists(): Promise<boolean> {
    try {
      const db = await this.openDatabase()
      const dataExistsInTable1 = await this.checkDataExists('onlineCourseProgress', db)
      return dataExistsInTable1
    } catch (error) {
      throw new Error('Error checking database, tables, and data in IndexedDB: ' + error)
    }
  }

  private async checkDataExists(tableName: string, db: IDBDatabase): Promise<boolean> {
    const transaction = db.transaction(tableName, 'readonly')
    const objectStore = transaction.objectStore(tableName)
    const request = objectStore.openCursor()

    return new Promise<boolean>((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = request.result
        console.log(event, 'a', cursor)
        if (cursor) {
          resolve(true) // Data found
        } else {
          resolve(false) // No data found
        }
      }

      request.onerror = (event) => {
        console.log(event)
        reject('Error checking data in IndexedDB')
      }
    })
  }

  deleteRecordByKey(storeName: string, key: any): Observable<string> {
    return new Observable((observer: Observer<string>) => {
      this.openOrCreateDatabase().subscribe({
        next: (db) => {
          const transaction = db.transaction(storeName, 'readwrite')
          const objectStore = transaction.objectStore(storeName)
          const request = objectStore.delete(key)

          request.onsuccess = () => {
            observer.next('string')
            observer.complete()
          }

          request.onerror = (event: any) => {
            observer.error(event)
          }
        },
        error: (err) => observer.error(err)
      })
    })
  }

  deleteRecordByKeyValue(storeName: string, key: string): Observable<string> {
    return new Observable<string>((observer) => {
      this.openOrCreateDatabase().subscribe(
        (db) => {
          const transaction = db.transaction(storeName, 'readwrite')
          const objectStore = transaction.objectStore(storeName)
          console.log(key)
          //const index = objectStore.index(key)
          //const request = objectStore.delete(key)
          const request = objectStore.get(key)
          console.log(request)

          request.onsuccess = () => {
            if (request.result === undefined) {
              console.log(`No record found with key: ${key}`)
              observer.error('Record not found')
            } else {
              observer.next()
              observer.complete()
            }
          }

          request.onerror = () => {
            observer.error('Failed to retrieve record for deletion')
          }
        },
        (error: any) => {
          observer.error(error)
        }
      )
    })
  }

  insertProgressData(userID: string, courseId: string, contentId: string, tableName: string, url: string, dataArray?: any): Observable<string> {
    return new Observable((observer) => {
      this.openOrCreateDatabase().subscribe(
        (db) => {
          try {
            const transaction = db.transaction(tableName, 'readwrite')
            const objectStore = transaction.objectStore(tableName)

            // Serialize the dataArray to JSON before storing it
            const dataToStore = JSON.stringify(dataArray)
            const request = objectStore.put({ userID, courseId, contentId, url, data: dataToStore }) // Store the JSON string

            request.onsuccess = () => {
              console.log('Data stored successfully for courseId:', userID, courseId)
              observer.next('Data inserted successfully')
              observer.complete()
            }

            request.onerror = (event: any) => {
              console.error('Error storing data for courseId:', courseId, event.target.error)
              observer.error('Error storing data')
            }

            // Commit the transaction
            transaction.oncomplete = () => {
              console.log('Transaction completed')
            }
          } catch (error) {
            console.error('Error:', error)
            observer.error(error)
          }
        },
        (error: any) => {
          observer.error(error)
        }
      )
    })
  }
  insertData(userID: string, courseId: string, tableName: string, dataArray?: any): Observable<string> {
    return new Observable((observer) => {
      this.openOrCreateDatabase().subscribe(
        (db) => {
          try {
            const transaction = db.transaction(tableName, 'readwrite')
            const objectStore = transaction.objectStore(tableName)

            // Serialize the dataArray to JSON before storing it
            const dataToStore = JSON.stringify(dataArray)
            const request = objectStore.put({ userID, courseId, data: dataToStore }) // Store the JSON string

            request.onsuccess = () => {
              console.log('Data stored successfully for courseId:', userID, courseId)
              observer.next('Data inserted successfully')
              observer.complete()
            }

            request.onerror = (event: any) => {
              console.error('Error storing data for courseId:', courseId, event.target.error)
              observer.error('Error storing data')
            }

            // Commit the transaction
            transaction.oncomplete = () => {
              console.log('Transaction completed')
            }
          } catch (error) {
            console.error('Error:', error)
            observer.error(error)
          }
        },
        (error: any) => {
          observer.error(error)
        }
      )
    })
  }

  async getData(tableName: string): Promise<any[]> {
    try {
      const db = await this.openDatabase()
      const transaction = db.transaction(tableName, 'readonly')
      const objectStore = transaction.objectStore(tableName)
      const request = objectStore.getAll()

      return new Promise<any[]>((resolve, reject) => {
        request.onsuccess = (event: any) => {
          console.log(event)
          const data = request.result
          resolve(data)
        }

        request.onerror = (event: any) => {
          reject('Error fetching data from IndexedDB: ' + event.target.error)
        }
      })
    } catch (error) {
      throw new Error('Error fetching data from IndexedDB: ' + error)
    }
  }
  async updateValue(objectStoreName: string, key: any, newValue: any): Promise<void> {
    try {
      const db = await this.openDatabase()
      const transaction = db.transaction(objectStoreName, 'readwrite')
      const objectStore = transaction.objectStore(objectStoreName)
      const request = objectStore.get(key)

      request.onsuccess = (event) => {
        console.log(event)
        const data = request.result
        if (data) {
          // Update the value with newValue
          data.valueToUpdate = newValue
          const updateRequest = objectStore.put(data)

          updateRequest.onsuccess = () => {
            console.log('Value updated successfully')
          }

          updateRequest.onerror = (event: any) => {
            throw new Error('Error updating value in IndexedDB: ' + event.target.error)
          }
        } else {
          throw new Error('No data found with the specified key')
        }
      }

      request.onerror = (event: any) => {
        throw new Error('Error retrieving data from IndexedDB: ' + event.target.error)
      }
    } catch (error) {
      throw new Error('Error updating value in IndexedDB: ' + error)
    }
  }

  getDataByCourseIdFromIndexedDB(tableName: string, courseId: string): Observable<any> {
    return new Observable<any>((observer) => {
      const transaction = this.db!.transaction(tableName, 'readonly')
      const objectStore = transaction.objectStore(tableName)
      const index = objectStore.index('courseIdIndex')
      const request = index.openCursor(IDBKeyRange.only(courseId))

      request.onsuccess = (event: any) => {
        const cursor = event.target.result
        if (cursor) {
          const data = cursor.value
          observer.next(data)
          cursor.continue()
        } else {
          observer.complete()
        }
      }

      request.onerror = (event: any) => {
        console.error('Error retrieving data for courseId:', courseId, event.target.error)
        observer.error(event.target.error)
      }
    })
  }

  async getRowByCourseId(objectStoreName: string, courseId: string): Promise<any | undefined> {
    try {
      const db = await this.openDatabase()
      const transaction = db.transaction(objectStoreName, 'readonly')
      const objectStore = transaction.objectStore(objectStoreName)
      const index = objectStore.index('courseIdIndex') // Assuming 'courseIdIndex' is the index name for courseId

      const request = index.get(courseId)

      return new Promise<any | undefined>((resolve, reject) => {
        request.onsuccess = (event) => {
          console.log(event)
          const row = request.result
          resolve(row)
        }

        request.onerror = (event: any) => {
          reject('Error fetching row details from IndexedDB: ' + event.target.error)
        }
      })
    } catch (error) {
      throw new Error('Error fetching row details from IndexedDB: ' + error)
    }
  }
  async updateRowField(objectStoreName: string, key: any, fieldToUpdate: string, newValue: any): Promise<void> {
    try {
      console.log('Update operation initiated:')
      console.log('Object Store Name:', objectStoreName)
      console.log('Key to Update:', key)

      const db = await this.openDatabase()
      const transaction = db.transaction(objectStoreName, 'readwrite')
      const objectStore = transaction.objectStore(objectStoreName)
      const index = objectStore.index('courseIdIndex') // Assuming 'courseIdIndex' is the index name for courseId

      const request = index.get(key)

      // const request = objectStore.get(key)
      console.log(request)
      request.onsuccess = (event) => {
        console.log(event)
        const row = request.result
        if (row && row[fieldToUpdate]) {
          console.log('Row found:', row, row[fieldToUpdate], newValue)
          row[fieldToUpdate] = newValue // Update the field with the new value
          console.log(row, 'rororo')
          const updateRequest = objectStore.put(row)

          updateRequest.onsuccess = () => {
            console.log('Field updated successfully')
          }

          updateRequest.onerror = (event: any) => {
            console.error('Error updating field in IndexedDB:', event.target.error)
          }
        } else {
          console.error('No row found with the specified key')
        }
      }

      request.onerror = (event: any) => {
        console.error('Error retrieving data from IndexedDB:', event.target.error)
      }
    } catch (error) {
      console.error('Error updating field in IndexedDB:', error)
    }
  }
}
