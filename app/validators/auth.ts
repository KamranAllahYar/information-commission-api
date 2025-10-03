import vine from '@vinejs/vine'

/**
 * Validates the post's creation action
 */
export const loginValidator = vine.compile(
  vine.object({
    user_id: vine.string().trim(),
    password: vine.string(),
  })
)

/**
 * Validates the post's update action
 */
export const signupValidator = vine.compile(
  vine.object({
    user: vine.object({
      full_name: vine.string().trim(),
      email: vine.string().trim(),
      password: vine.string().trim().minLength(8),
      gender: vine.enum(['Male', 'Female']),
      postal_code: vine.string().trim().optional(),
    }),
  })
)

export const otpVerificationValidator = vine.compile(
  vine.object({
    otp: vine.string().trim().minLength(6),
  })
)

export const sendResetPasswordOtpValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
  })
)

export const verifyResetPasswordOtpValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    otp: vine.string().trim().minLength(6),
  })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    otp: vine.string().trim().minLength(6),
    password: vine.string().trim().minLength(8),
  })
)
