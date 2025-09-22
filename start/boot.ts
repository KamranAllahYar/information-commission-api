import app from '@adonisjs/core/services/app'

app
  .ready(async () => {
    console.log('firebase service initialized')
  })
  .then()
