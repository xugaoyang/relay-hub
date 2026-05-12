import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import platformsRouter from './routes/platforms'
import adminRouter from './routes/admin'
import { startChecker } from './checker'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }))

app.use('/api/platforms', platformsRouter)
app.use('/api/admin', adminRouter)

app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`)
  startChecker()
})

