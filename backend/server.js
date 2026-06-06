const express           = require('express')
const http              = require('http')
const { Server }        = require('socket.io')
const mongoose          = require('mongoose')
const cors              = require('cors')
const dotenv            = require('dotenv')
const connectDB         = require('./config/db')
const authRoutes        = require('./routes/authRoutes')
const taskRoutes        = require('./routes/taskRoutes')
const userRoutes        = require('./routes/userRoutes')
const connectionRoutes  = require('./routes/connectionRoutes')
const errorHandler      = require('./middleware/errorHandler')

dotenv.config()

const app    = express()
const server = http.createServer(app)
const io     = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET','POST','PUT','PATCH','DELETE'] }
})

app.set('io', io)

connectDB()

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => res.json({ message: 'TeamUp AI API is running.' }))

app.use('/api/auth',        authRoutes)
app.use('/api/tasks',       taskRoutes)
app.use('/api/users',       userRoutes)
app.use('/api/connections', connectionRoutes)

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }))
app.use(errorHandler)

io.on('connection', (socket) => {
  socket.on('join:user', (userId) => {
    socket.join(`user:${userId}`)
  })

  socket.on('join:workspace', (connectionId) => {
    socket.join(`workspace:${connectionId}`)
  })

  socket.on('leave:workspace', (connectionId) => {
    socket.leave(`workspace:${connectionId}`)
  })

  socket.on('disconnect', () => {})
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
