import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import userRouter from "./routes/userRoute.js"
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'

// app config 
const app = express();
const port = process.env.PORT || 4000;
connectDB();
// Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NODE_ENV === 'production' 
            ? process.env.FRONTEND_URL 
            : [
                'http://localhost:5173',  // Main frontend
                'http://localhost:5174'   // Admin panel
              ],
        credentials: true
    }
})

// Store active connections
const activeConnections = new Map()

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id)
    
    // Authenticate user and store connection
    socket.on('authenticate', (data) => {
        if (data.userId) {
            activeConnections.set(data.userId, socket.id)
            socket.userId = data.userId
            console.log(`User ${data.userId} authenticated`)
            
            // Join user to a room with their ID
            socket.join(data.userId)
        }
    })
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
        if (socket.userId) {
            activeConnections.delete(socket.userId)
        }
    })
})

// Make io available globally
app.set('io', io)
app.set('activeConnections', activeConnections)

// Creating the WebSocket server
const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql'
})

// WebSocketServer for subscriptions
const serverCleanup = useServer({ 
    schema,
    context: async (ctx, msg, args) => {
        // Authenticate websocket connections
        const token = ctx.connectionParams?.Authorization?.split(' ')[1] || '';
        try {
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                return { user: decoded };
            }
        } catch (err) {
            console.error('Subscription auth error:', err.message);
        }
        return { user: null };
    } 
}, wsServer)


// api endpoints
app.use("/api/user", userRouter) // user routes
app.use("/api/admin", adminRouter)
// middleware
app.use(express.json());
app.use(cors());

// api endpoints
app.get('/', (req, res) => {
    res.send('API Working');
});
app.listen(port,()=> console.log("Server Started",port))
