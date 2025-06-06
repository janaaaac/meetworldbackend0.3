const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://pagead2.googlesyndication.com", "https://googleads.g.doubleclick.net"],
            imgSrc: ["'self'", "data:", "https:", "https://pagead2.googlesyndication.com"],
            frameSrc: ["'self'", "https://googleads.g.doubleclick.net"],
            connectSrc: ["'self'", "wss:", "https:"],
            mediaSrc: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? ['https://meetworld.social', 'https://www.meetworld.social'] : true,
    credentials: true
}));

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 API requests per windowMs
    message: { error: 'API rate limit exceeded. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(generalLimiter);
app.use('/api/', apiLimiter);

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public', {
    setHeaders: (res, path, stat) => {
        // Set cache headers for static assets
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour for HTML
        } else {
            res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day for other assets
        }
    }
}));

// Health check endpoint for Railway
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        port: PORT 
    });
});

// API route with CommonJS require
app.all('/api/chat', async (req, res) => {
  try {
    const chatHandler = require('./api/chat.js');
    return await chatHandler(req, res);
  } catch (error) {
    console.error('API Handler Error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📱 Open http://localhost:${PORT} to use the video chat`);
    console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
});
