import { CronJob } from 'cron'
import logger from '@adonisjs/core/services/logger'
import { JobConfig } from '#types/job'

export default class SchedulerService {
  private jobs: JobConfig[] = []

  addJob(jobConfig: JobConfig) {
    this.jobs.push(jobConfig)
  }

  scheduleSingleJob(jobConfig: JobConfig) {
    const cronJob = new CronJob(jobConfig.cronExpression, async () => {
      try {
        await jobConfig.job.run(jobConfig.params)
      } catch (e) {
        logger.error(`[Scheduler] - An error occurred during the execution of job ${jobConfig.key}`)
      }
    })

    cronJob.start()
  }

  scheduleAllJobs() {
    this.jobs.forEach((jobConfig) => {
      this.scheduleSingleJob(jobConfig)
    })
    logger.info(
      `[Scheduler] - ${this.jobs.length} registered ${this.jobs.length === 1 ? 'job has' : 'jobs have'} been scheduled`
    )
  }
}
