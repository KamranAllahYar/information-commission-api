import env from '#start/env'
import User from '#models/user'
import { DateTime } from 'luxon'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { cuid } from '@adonisjs/core/helpers'

export const generateToken = ({
  length = 6,
  numbersOnly = false,
  capsOnly = false,
}: {
  length: number
  numbersOnly?: boolean
  capsOnly?: boolean
}): string => {
  let characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  if (numbersOnly) {
    characters = '0123456789'
  }
  if (capsOnly) {
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  }
  const charactersLength = characters.length
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export const getMediaUrl = (path: string | null | undefined): string => {
  if (path) {
    return env.get('APP_URL') + `/storage/${path}`
  }
  return ''
}
export const getAppUrl = (path: string | null | undefined): string => {
  if (path) {
    return env.get('APP_URL') + `${path}`
  }
  return ''
}

export const getWebUrl = (path: string | null | undefined): string => {
  if (path) {
    return env.get('WEB_URL') + `${path}`
  }
  return ''
}

export const getAdminUrl = (path: string | null | undefined): string => {
  if (path) {
    return env.get('ADMIN_URL') + `${path}`
  }
  return ''
}

// Add this helper function inside HcpController or as a utility
export const fetchWithRetry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> => {
  let lastError
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt < retries) {
        console.warn(`Retrying lineItems fetch (attempt ${attempt})...`)
        await new Promise((res) => setTimeout(res, delayMs))
      }
    }
  }
  throw lastError
}

export const isJsonString = (str: string): boolean => {
  try {
    const parsed = JSON.parse(str)
    return typeof parsed === 'object' && parsed !== null
  } catch {
    return false
  }
}

export const toJson = (str: string): boolean => {
  return JSON.parse(str)
}

export const tryJson = (str: string): any => {
  if (isJsonString(str)) {
    return toJson(str)
  }
  return str
}

export const joinArrayWithCommasAnd = (items: string[]) => {
  const quotedItems = items.map((item) => `\`${item}\``)
  if (quotedItems.length === 1) return quotedItems[0]
  if (quotedItems.length === 2) return `${quotedItems[0]} and ${quotedItems[1]}`
  return `${quotedItems.slice(0, -1).join(', ')} and ${quotedItems[quotedItems.length - 1]}`
}

// need to update this function to check all roles
export const isAdmin = (user: User): boolean => {
  return user.full_name === 'Staff User'
}
// need to update this function to check all roles
export const isStaff = (user: User): boolean => {
  return user.full_name === 'Staff User'
}

export const saveFile = async (file: MultipartFile, directory: string = '') => {
  if (!directory) {
    directory = `/media`
  } else {
    directory = directory.replace(/\/$/, '')
  }
  directory += `/${DateTime.now().toFormat('dd-MM-yyyy')}`
  const key = `${directory}/${cuid()}.${file.extname}`
  await file.moveToDisk(key)
  return {
    key,
    file,
  }
}

export const getInitials = (name: string) => {
  if (!name) return ''

  // If it's short (like H2S), just return it uppercased
  if (name.length <= 3) return name.toUpperCase()

  return name
    .replace(/[()]/g, '') // remove parentheses
    .split(/\s+/) // split on spaces (handles multiple spaces)
    .map((word) => word[0]?.toUpperCase())
    .join('')
}

export const formatDateTime = (isoString: string | DateTime | null | undefined): string => {
  if (!isoString) return '-'
  const dateTime = DateTime.fromISO(isoString as unknown as string)
  return dateTime.isValid ? dateTime.toLocal().toFormat('dd MMM yyyy, hh:mm a') : '-'
}
