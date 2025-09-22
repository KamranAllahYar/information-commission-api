import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')

router
  .group(function () {
    router.post('username/is-available', [AuthController, 'isAvailable'])
    router.post('login', [AuthController, 'login'])
    router.post('signup', [AuthController, 'signup'])
    router.post('send-reset-password-otp', [AuthController, 'sendResetPasswordOtp'])
    router.post('verify-reset-password-otp', [AuthController, 'verifyResetPasswordOtp'])
    router.post('reset-password', [AuthController, 'resetPassword'])
  })
  .prefix('api/auth')

router
  .group(function () {
    router.post('logout', [AuthController, 'logout'])
    router.get('authenticated', [AuthController, 'authenticated'])
    router.get('resend-otp', [AuthController, 'resendOtp'])
    router.post('verify-otp', [AuthController, 'verifyOtp'])
  })
  .prefix('api/auth')
  .use(middleware.auth())
