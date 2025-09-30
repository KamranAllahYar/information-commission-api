/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

import '#start/api/auth'
import '#start/api/user'
import '#start/api/setting'
import '#start/api/permission'
import '#start/api/contact_message'
import '#start/api/notification'
import '#start/api/admins'
import '#start/api/commissioner'
import '#start/api/complaints'
import '#start/api/requests'
import '#start/api/resources'
import '#start/api/news'
import '#start/api/dashboard'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
