import SchedulerService from '#services/scheduler_service'
// import SyncPaymentStatuses from '#jobs/sync_payment_statuses'
// import { DateTime } from 'luxon'

const scheduler = new SchedulerService()

// Add all jobs that should be run while the server is up
// once on boot

// code for every minute
// scheduler.addJob({
//   key: 'sync-payment-statuses-every-minute',
//   cronExpression: '* * * * *',
//   job: new SyncPaymentStatuses(),
//   params: {
//     dateOnwards: DateTime.now().minus({ minutes: 5 }),
//   },
// })
// every 30 minutes
// scheduler.addJob({
//   key: 'sync-payment-statuses-every-30-minutes',
//   cronExpression: '*/30 * * * *',
//   job: new SyncPaymentStatuses(),
//   params: {
//     dateOnwards: DateTime.now().minus({ minutes: 35 }),
//   },
// })

// every day
// scheduler.addJob({
//   key: 'sync-payment-statuses-every-day',
//   cronExpression: '0 0 * * *',
//   job: new SyncPaymentStatuses(),
//   params: {
//     dateOnwards: DateTime.now().minus({ day: 1 }),
//   },
// })

//TODO: need add job to clear pending enrollments
//TODO: need add job to clear pending payments
//TODO: need add job to expiry enrollments on expiry date
//TODO: need add job to send email for certificate renewal

// Actually start a scheduler for all jobs
scheduler.scheduleAllJobs()
