const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000
mongoose.set('bufferCommands', false)

app.use(cors())
app.use(express.json())

const registrationSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  rollNo: { type: String, required: true },
  companies: { type: [String], required: true },
}, { strict: false, timestamps: true })

const Registration = mongoose.model('Registration', registrationSchema)

app.get('/', (req, res) => {
  res.json({ message: 'Student Registry API is running', health: '/api/health' })
})

app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1
  res.status(connected ? 200 : 503).json({ status: connected ? 'ok' : 'database unavailable' })
})

const requireDatabase = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database unavailable. Check the MongoDB connection.' })
  }
  next()
}

app.use('/api/registrations', requireDatabase)

app.get('/api/registrations', async (req, res, next) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 })
    res.json(registrations)
  } catch (error) {
    next(error)
  }
})

app.post('/api/registrations', async (req, res, next) => {
  try {
    const registration = await Registration.create(req.body)
    res.status(201).json(registration)
  } catch (error) {
    next(error)
  }
})

app.delete('/api/registrations/:id', async (req, res, next) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id)
    if (!registration) return res.status(404).json({ message: 'Registration not found' })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.use((error, req, res, next) => {
  console.error(error)
  res.status(500).json({ message: 'Internal server error' })
})

const startServer = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured')
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  })
  console.log('Connected to MongoDB')
  app.listen(port, () => console.log(`Server listening on http://localhost:${port}`))
}

startServer().catch((error) => {
  console.error('MongoDB connection failed:', error.message)
  process.exitCode = 1
})
