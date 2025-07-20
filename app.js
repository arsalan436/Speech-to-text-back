import express from 'express'
import dotenv from 'dotenv'
import transcribeRoutes from './routes/transcribe.js'

dotenv.config()

const app = express()
app.use(express.json())

app.use('/api/transcribe', transcribeRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
