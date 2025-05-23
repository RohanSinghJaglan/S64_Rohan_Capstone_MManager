import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import configurePassport from './config/passport.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import schedulerService from './services/schedulerService.js';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers.js';
import context from './graphql/context.js';
import jwt from 'jsonwebtoken';
import userRouter from './routes/userRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import adminRouter from './routes/adminRoute.js';
import skinRouter from './routes/skinRoute.js';
import aiRouter from './routes/aiRoute.js';
import authRoutes from './routes/authRoute.js';
import featureRoutes from './routes/featureRoutes.js';
const rateLimiter = require('./middlewares/rateLimiter');



// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 4000;
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NODE_ENV === 'production' 
            ? process.env.FRONTEND_URL 
            : ['http://localhost:5173', 'http://localhost:5174'],
        credentials: true
    }
});

// Store active connections
const activeConnections = new Map();

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('authenticate', (data) => {
        if (data.userId) {
            activeConnections.set(data.userId, socket.id);
            socket.userId = data.userId;
            console.log(`User ${data.userId} authenticated`);
            socket.join(data.userId);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (socket.userId) {
            activeConnections.delete(socket.userId);
        }
    });
});

app.set('io', io);
app.set('activeConnections', activeConnections);

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['New-Token']
}));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify({
        origin: req.headers.origin,
        referer: req.headers.referer,
        authorization: req.headers.authorization ? 
            (req.headers.authorization.startsWith('Bearer ') ? 'Bearer [HIDDEN]' : '[HIDDEN]') : 
            'None'
    }));

    if (req.method === 'POST' && (req.url.includes('/login') || req.url.includes('/register'))) {
        const sanitizedBody = { ...req.body };
        if (sanitizedBody.password) sanitizedBody.password = '[HIDDEN]';
        console.log('Auth request body:', JSON.stringify(sanitizedBody, null, 2));
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());
configurePassport(passport); // ✅ Proper configuration

// Apollo Server setup
const schema = makeExecutableSchema({ typeDefs, resolvers });

const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql'
});

const serverCleanup = useServer({ 
    schema,
    context: async (ctx) => {
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
}, wsServer);

const apolloServer = new ApolloServer({
    schema,
    context,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await serverCleanup.dispose();
                    },
                };
            },
        },
    ],
});

// Routes
app.use(rateLimiter);// protecting all routes if placed above all the routes;
app.use("/api/auth", authRoutes);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api", featureRoutes);
app.use('/api/skin', skinRouter);
app.use('/api/ai', aiRouter);

app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working' });
});

app.get("/", (req, res) => {
    res.json({ 
        success: true, 
        message: "API Working",
        version: "1.0.0",
        googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL
    });
});

app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        success: false, 
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
});

// MongoDB connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Start server
const startServer = async () => {
    try {
        if (!process.env.JWT_SECRET) {
            console.error('ERROR: JWT_SECRET is not defined in .env file');
            process.exit(1);
        }

        if (!process.env.JWT_REFRESH_SECRET) {
            console.warn('WARNING: JWT_REFRESH_SECRET is not defined. Using JWT_SECRET as fallback.');
            process.env.JWT_REFRESH_SECRET = process.env.JWT_SECRET;
        }

        await apolloServer.start();
        apolloServer.applyMiddleware({ app, path: '/graphql', cors: false });

        await connectDB();
        schedulerService.initializeJobs();

        httpServer.listen(PORT, () => {
            console.log(`Server started on PORT:${PORT}`);
            console.log(`GraphQL endpoint: http://localhost:${PORT}${apolloServer.graphqlPath}`);
            console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
            console.log(`Google Callback URL: ${process.env.GOOGLE_CALLBACK_URL}`);
            console.log(`JWT configuration: Using dedicated refresh token secret: ${process.env.JWT_REFRESH_SECRET !== process.env.JWT_SECRET}`);
            console.log('Socket.io initialized');
            console.log('Environment variables available:');
            console.log({
                NODE_ENV: process.env.NODE_ENV || 'Not set',
                PORT: process.env.PORT || 'Not set',
                MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
                JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
                JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ? 'Set' : 'Not set',
                ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'Not set'
            });
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
