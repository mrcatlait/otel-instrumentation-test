import { Subject } from 'rxjs'

export abstract class AbstractTelemetryCollector<T> {
  private readonly updateSubject = new Subject()
  private telemetryData: T[] = []

  collect(data: T[]): void {
    this.telemetryData.push(...data)
    this.updateSubject.next(null)
  }

  retrieve(): T[] {
    return this.telemetryData
  }

  clear(): void {
    this.telemetryData = []
  }

  waitForUpdate(): Promise<T[]> {
    return new Promise((resolve) => {
      this.updateSubject.subscribe(() => {
        resolve(this.telemetryData)
      })
    })
  }
}
