import express from 'express'
import dotenv from 'dotenv'
import transcribeRoutes from './routes/transcribe.js'
import cors from 'cors';
dotenv.config()

const app = express()
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json())
app.use('/api/note', transcribeRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
