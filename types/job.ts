export abstract class BaseJob {
  abstract run(params?: Record<any, any>): any
}

export interface JobConfig {
  key: string
  cronExpression: string
  job: BaseJob
  params?: Record<any, any>
}
