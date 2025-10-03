import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import {
  loginValidator,
  otpVerificationValidator,
  resetPasswordValidator,
  sendResetPasswordOtpValidator,
  signupValidator,
  verifyResetPasswordOtpValidator,
} from '#validators/auth'
import hash from '@adonisjs/core/services/hash'
import { generateToken } from '#lib/helpers'
import { DateTime } from 'luxon'
import env from '#start/env'
import mail from '@adonisjs/mail/services/main'
import { Acl } from '@holoyan/adonisjs-permissions'
import MediaController from '#controllers/media_controller'

export default class AuthController {
  async authenticated({ auth }: HttpContext) {
    const user = auth.user!

    await user.load('user_roles', (q) => {
      q.select(['id', 'slug', 'title'])
    })

    // Then get permissions using Acl
    const permissions = await Acl.model(user).permissions()

    // Add permissions to the user object
    return {
      ...user.toJSON(),
      permissions: permissions.map(({ id, slug, title }) => {
        return { id, slug, title }
      }),
    }
  }

  async login({ request, response }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)
    const user = await User.query().where('email', payload.user_id.toLowerCase()).first()

    if (!user) {
      return response.notFound({
        message:
          'The user with the provided details does not exist in the system. Please ensure you have entered the correct information and try again.',
      })
    }

    // Check if admin is active
    if (!user.is_active) {
      return response.forbidden({
        message:
          'Your account has been deactivated. Please contact the system administrator for assistance.',
      })
    }

    let isValid = false

    // ✅ First try with default (scrypt)
    try {
      isValid = await hash.verify(user.password, payload.password)
    } catch {
      isValid = false
    }

    // ✅ If scrypt fails → try bcrypt
    if (!isValid) {
      try {
        const bcryptDriver = hash.use('bcrypt')
        isValid = await bcryptDriver.verify(user.password, payload.password)

        // 🔄 If bcrypt worked, upgrade hash to scrypt
        if (isValid) {
          user.password = payload.password
          await user.save()
        }
      } catch {
        isValid = false
      }
    }

    if (!isValid) {
      return response.unauthorized({
        message: 'The password is incorrect. Please check your credentials and try again.',
      })
    }

    const token = await User.accessTokens.create(user)

    await user.load('user_roles', (q) => {
      q.select(['id', 'slug', 'title'])
    })

    const permissions = await Acl.model(user).permissions()
    const otp = generateToken({ length: 6, numbersOnly: true })

    try {
      if (env.get('NODE_ENV') === 'production' && !user.verified_at) {
        user.otp = otp
        user.otp_expiry = DateTime.now().plus({ minute: 10 })
        user.save()
        mail
          .send((message) => {
            message
              .to(user.email)
              .from(env.get('SMTP_FROM'))
              .subject(`Otp to verify your ${env.get('APP_NAME')} account`)
              .htmlView('emails/verify_email', {
                otp,
                url: `${env.get('WEB_URL')}/auth/sign-in`,
                appName: env.get('APP_NAME'),
              })
          })
          .then(console.log)
          .catch(console.error)
      }
    } catch (e) {
      console.log(e)
    }

    return {
      user: {
        ...user.toJSON(),
        permissions: permissions.map(({ id, slug, title }) => ({
          id,
          slug,
          title,
        })),
      },
      access_token: token.value!.release(),
    }
  }

  async signup({ request, response }: HttpContext) {
    const payload = await request.validateUsing(signupValidator)
    let existingUser = await User.findBy('email', payload.user.email.toLowerCase())
    if (existingUser) {
      return response.conflict({
        message: 'This email is already in use',
      })
    }

    const otp = generateToken({ length: 6, numbersOnly: true })
    const user = new User()
    payload.user.email = payload.user.email.toLowerCase()
    user.fill({
      ...payload.user,
      otp,
      otp_expiry: DateTime.now().plus({ minute: 10 }),
    })
    await user.save()

    const mediaController = new MediaController()

    for (const [key, value] of Object.entries(request.allFiles())) {
      if (!(key.startsWith('document_') || key === 'image')) {
        continue // Skip if the key is not a document or logo
      }
      const media = await mediaController.saveMedia(value)
      if (key === 'image') {
        user.image_url = media.path
        await user.save()
      }
    }

    try {
      if (env.get('NODE_ENV') === 'production') {
        mail
          .send((message) => {
            message
              .to(payload.user.email)
              .from(env.get('SMTP_FROM'))
              .subject(`Otp to verify your ${env.get('APP_NAME')} account`)
              .htmlView('emails/verify_email', {
                otp,
                url: `${env.get('WEB_URL')}/auth/sign-in`,
                appName: env.get('APP_NAME'),
              })
          })
          .then(console.log)
          .catch(console.error)
      }
    } catch (e) {
      console.log(e)
    }
    const token = await User.accessTokens.create(user)
    return { user, access_token: token.value!.release() }
  }

  async resendOtp({ response, auth }: HttpContext) {
    const user = auth.user
    if (user!.verified_at) {
      return response.conflict({
        message: 'Your account is already verified and good to go!',
      })
    }
    const otp = generateToken({
      length: 6,
      numbersOnly: true,
    })
    user!.otp_expiry = DateTime.now().plus({
      minutes: 10,
    })
    user!.otp = otp
    await user!.save()
    if (env.get('NODE_ENV') === 'production') {
      await mail.send((message) => {
        message
          .to(user!.email)
          .from(env.get('SMTP_FROM'))
          .subject(`Otp to verify your ${env.get('APP_NAME')} account`)
          .htmlView('emails/verify_email', { otp, appName: env.get('APP_NAME') })
      })
    }
    return {
      message: 'Verification code sent!',
    }
  }

  async verifyOtp({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(otpVerificationValidator)
    const user = auth.user!
    if (user.verified_at) {
      return response.conflict({
        message: 'Your account is already verified and good to go!',
      })
    }
    if ((user.otp_expiry as DateTime) <= DateTime.now()) {
      return response.notAcceptable({
        message: 'Looks like the OTP has expired. Please request a new one.',
      })
    }
    if (user.otp === payload.otp) {
      user.otp = null
      user.otp_expiry = null
      user.verified_at = DateTime.now().toJSDate() as unknown as DateTime
      await user.save()
      return {
        message: "Verification successful! You're good to go.",
      }
    }
    return response.notAcceptable({
      message: 'The OTP you entered is invalid. Please try again.',
    })
  }

  async sendResetPasswordOtp({ request, response }: HttpContext) {
    const payload = await request.validateUsing(sendResetPasswordOtpValidator)
    const user = await User.findBy('email', payload.email)
    if (!user) {
      return response.notFound({
        message: "We couldn't find an account with this email.",
      })
    }
    user.reset_password_otp = generateToken({
      length: 6,
      numbersOnly: true,
    })
    user.reset_password_otp_expiry = DateTime.now().plus({
      minutes: 10,
    })
    await user.save()

    if (env.get('NODE_ENV') === 'production') {
      await mail.send((message) => {
        message
          .to(user!.email)
          .from(env.get('SMTP_FROM'))
          .subject(`Otp to verify your ${env.get('APP_NAME')} account`)
          .htmlView('emails/password_reset_otp', {
            otp: user.reset_password_otp,
            appName: env.get('APP_NAME'),
          })
      })
    }
    return {
      message: 'Verification code sent! Check your inbox.',
    }
  }

  async verifyResetPasswordOtp({ request, response }: HttpContext) {
    const payload = await request.validateUsing(verifyResetPasswordOtpValidator)
    const user = await User.findBy('email', payload.email)
    if (!user) {
      return response.notFound({
        message: "We couldn't find an account with this email.",
      })
    }
    if ((user.reset_password_otp_expiry as DateTime) <= DateTime.now()) {
      return response.notAcceptable({
        message: 'Looks like the OTP has expired. Please request a new one.',
      })
    }
    if (user.reset_password_otp === payload.otp) {
      return {
        message: "The OTP you provided is valid. You're all set!",
      }
    }

    return response.notAcceptable({
      message: 'The OTP you entered is invalid. Please try again.',
    })
  }

  async resetPassword({ request, response }: HttpContext) {
    const payload = await request.validateUsing(resetPasswordValidator)
    const user = await User.findBy('email', payload.email)
    if (!user) {
      return response.notFound({
        message: "We couldn't find an account with this email.",
      })
    }
    if ((user.reset_password_otp_expiry as DateTime) <= DateTime.now()) {
      return response.notAcceptable({
        message: 'Looks like the OTP has expired. Please request a new one.',
      })
    }
    if (user.reset_password_otp === payload.otp) {
      user.reset_password_otp = null
      user.reset_password_otp_expiry = null
      user.password = payload.password
      await user.save()
      return {
        message: 'Your password has been successfully reset!',
      }
    }

    return response.notAcceptable({
      message: 'The OTP you entered is invalid. Please try again.',
    })
  }

  async logout({ auth, response }: HttpContext) {
    await User.accessTokens.delete(auth.user!, auth.user!.currentAccessToken.identifier)
    return response.send({
      message: 'User logged out',
    })
  }

  async isAvailable({ request, response }: HttpContext) {
    if (request.input('type') === 'email') {
      const email = request.input('value')
      const user = await User.findBy('email', email)
      if (user) {
        return response.conflict({
          message: 'This email is already in use',
        })
      }
      return response.send({
        message: 'Email is available',
      })
    }
  }
}
