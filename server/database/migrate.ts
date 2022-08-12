import { join } from 'path'
import pg from 'pg'
import { migrate } from 'postgres-migrations'

require('dotenv-flow').config({ path: __dirname })

async function main() {
<<<<<<< HEAD
  // const DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"

  // if (!DATABASE_URL) {
  //   throw new Error('DATABASE_URL not set!')
  // }

  const dbConfig = {
    connectionString: "postgresql://user:pass@localhost:5432/db?schema=public",
=======
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set!')
  }

  const dbConfig = {
    connectionString: process.env.DATABASE_URL,
>>>>>>> 8878edb0239f31da82f84c0e03adc4dc99afbb96
  }
  const client = new pg.Client(dbConfig)
  await client.connect()
  console.log('Running migrations')
  await migrate({ client }, join(__dirname, '../database/migrations'))
  console.log('Migrations DONE')

  await client.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
