import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Request from '#models/request'
import { faker } from '@faker-js/faker'

export default class RequestSeeder extends BaseSeeder {
  public async run() {
    const requests = Array.from({ length: 15 }).map(() => ({
      name_of_applicant: faker.person.fullName(),
      date_of_birth: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }).toISOString().split('T')[0],
      address: faker.location.streetAddress(),
      telephone_number: faker.phone.number(),
      email: faker.internet.email().toLowerCase(),
      type_of_applicant: faker.helpers.arrayElement(['individual', 'organization']),
      description_of_information: faker.lorem.paragraph(),
      manner_of_access: faker.helpers.arrayElement(['inspection', 'copy', 'viewing_listen', 'written_transcript']),
      is_life_liberty: faker.datatype.boolean(),
      life_liberty_details: faker.datatype.boolean() ? faker.lorem.sentence() : null,
      form_of_access: faker.helpers.arrayElement(['hard_copy', 'electronic_copy']),
      date_of_submission: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
      witness_signature: faker.person.fullName(),
      witness_statement: faker.lorem.sentence(),
      institution_stamp: faker.company.name(),
      receipt_officer_name: faker.person.fullName(),
      date_of_receipt: faker.date.recent({ days: 20 }).toISOString().split('T')[0],
    }))

    await Request.createMany(requests)
  }
}
