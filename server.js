const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API route with dynamic import for ES module
app.all('/api/chat', async (req, res) => {
  try {
    const { default: chatHandler } = await import('./api/chat.js');
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to use the video chat`);
});
