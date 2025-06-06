const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

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
