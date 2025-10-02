import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Request from '#models/request'
import Complaint from '#models/complaint'
import Resource from '#models/resource'
import db from '@adonisjs/lucid/services/db'

type Period = 'daily' | 'weekly' | 'monthly' | 'custom'

function normalizeRange(period: Period, start?: string, end?: string) {
  let rangeStart: DateTime
  let rangeEnd: DateTime

  if (start && end) {
    rangeStart = DateTime.fromISO(start).startOf('day')
    rangeEnd = DateTime.fromISO(end).endOf('day')
  } else {
    const now = DateTime.now()
    if (period === 'weekly') {
      rangeStart = now.minus({ days: 6 }).startOf('day')
      rangeEnd = now.endOf('day')
    } else if (period === 'monthly') {
      rangeStart = now.startOf('month')
      rangeEnd = now.endOf('day')
    } else {
      // daily (default)
      rangeStart = now.startOf('day')
      rangeEnd = now.endOf('day')
    }
  }

  const durationDays = Math.max(1, Math.ceil(rangeEnd.diff(rangeStart, 'days').days))
  const prevEnd = rangeStart.minus({ days: 1 }).endOf('day')
  const prevStart = prevEnd.minus({ days: durationDays - 1 }).startOf('day')

  return { period, rangeStart, rangeEnd, prevStart, prevEnd }
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100
  }
  return Number((((current - previous) / previous) * 100).toFixed(2))
}

async function countBetween(
  model: typeof Request | typeof Complaint | typeof Resource,
  start: DateTime,
  end: DateTime
) {
  const row = await model
    .query()
    .whereBetween('created_at', [start.toSQL()!, end.toSQL()!])
    .count('* as total')
  return Number(row[0].$extras.total)
}

async function seriesByDay(table: string, start: DateTime, end: DateTime) {
  // Returns [{ date: 'YYYY-MM-DD', count: number }, ...]
  const rows = await db
    .from(table)
    .select(db.raw('DATE(`created_at`) as d'))
    .select(db.raw('COUNT(*) as c'))
    .whereBetween('created_at', [start.toSQLDate()!, end.toSQLDate()!])
    .groupBy('d')
    .orderBy('d', 'asc')

  const map = new Map<string, number>()
  for (const r of rows as Array<{ d: string; c: number }>) {
    map.set(r.d, Number(r.c))
  }
  const days: Array<{ date: string; count: number }> = []
  for (
    let cursor = start.startOf('day');
    cursor <= end.endOf('day');
    cursor = cursor.plus({ days: 1 })
  ) {
    const key = cursor.toISODate()!
    days.push({ date: key, count: map.get(key) || 0 })
  }
  return days
}

export default class DashboardController {
  async index({ request }: HttpContext) {
    const periodParam = (request.input('period') as Period) || 'daily'
    const start = request.input('start') as string | undefined
    const end = request.input('end') as string | undefined

    const { period, rangeStart, rangeEnd, prevStart, prevEnd } = normalizeRange(
      periodParam,
      start,
      end
    )

    // Current counts
    const [requestsNow, complaintsNow, documentsNow] = await Promise.all([
      countBetween(Request, rangeStart, rangeEnd),
      countBetween(Complaint, rangeStart, rangeEnd),
      countBetween(Resource, rangeStart, rangeEnd),
    ])

    // Previous period counts
    const [requestsPrev, complaintsPrev, documentsPrev] = await Promise.all([
      countBetween(Request, prevStart, prevEnd),
      countBetween(Complaint, prevStart, prevEnd),
      countBetween(Resource, prevStart, prevEnd),
    ])

    // Recent complaints (last 5 overall, not limited to range)
    const recentComplaints = await Complaint.query()
      .select(['id', 'uuid', 'full_name', 'email', 'type', 'status', 'created_at'])
      .orderBy('created_at', 'desc')
      .limit(5)

    // Series for charts
    const [requestsSeries, complaintsSeries, documentsSeries] = await Promise.all([
      seriesByDay('requests', rangeStart, rangeEnd),
      seriesByDay('complaints', rangeStart, rangeEnd),
      seriesByDay('resources', rangeStart, rangeEnd),
    ])

    return {
      meta: {
        period,
        start: rangeStart.toISO(),
        end: rangeEnd.toISO(),
        prev_start: prevStart.toISO(),
        prev_end: prevEnd.toISO(),
      },
      totals: {
        requests: requestsNow,
        complaints: complaintsNow,
        documents: documentsNow,
      },
      deltas: {
        requests_pct: percentageChange(requestsNow, requestsPrev),
        complaints_pct: percentageChange(complaintsNow, complaintsPrev),
        documents_pct: percentageChange(documentsNow, documentsPrev),
      },
      recent_complaints: recentComplaints,
      series: {
        requests: requestsSeries,
        complaints: complaintsSeries,
        documents: documentsSeries,
      },
    }
  }
}
