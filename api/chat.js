// Simple chat API for video chat platform
const users = new Map();
let waitingUser = null;

// Simple rate limiting - track requests per user
const userRequests = new Map();
const RATE_LIMIT_WINDOW = 10000; // 10 seconds
const MAX_REQUESTS_PER_WINDOW = 50; // 50 requests per 10 seconds

function checkRateLimit(userId) {
  const now = Date.now();
  
  if (!userRequests.has(userId)) {
    userRequests.set(userId, { count: 1, windowStart: now });
    return true;
  }
  
  const userStats = userRequests.get(userId);
  
  // Reset window if enough time has passed
  if (now - userStats.windowStart > RATE_LIMIT_WINDOW) {
    userStats.count = 1;
    userStats.windowStart = now;
    return true;
  }
  
  // Check if user has exceeded limit
  if (userStats.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  userStats.count++;
  return true;
}

async function handler(req, res) {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Handle GET requests for status
    if (req.method === 'GET') {
      res.status(200).json({ 
        status: 'running',
        users: users.size,
        waitingUser: waitingUser ? 'yes' : 'no',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (req.method === 'POST') {
      const { userId, type, data } = req.body || {};
      
      if (!userId) {
        res.status(400).json({ error: 'userId required' });
        return;
      }

      // Check rate limit
      if (!checkRateLimit(userId)) {
        res.status(429).json({ 
          error: 'Too many requests. Please slow down.',
          retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
        });
        return;
      }

      console.log(`API call: ${type} from ${userId}`);

      switch (type) {
        case 'join':
          users.set(userId, { partner: null, lastSeen: Date.now() });
          res.status(200).json({ success: true });
          break;

        case 'findPartner':
          if (waitingUser && waitingUser !== userId && users.has(waitingUser)) {
            // Pair users
            users.get(userId).partner = waitingUser;
            users.get(waitingUser).partner = userId;
            
            const partnerId = waitingUser;
            waitingUser = null;
            
            res.status(200).json({ 
              success: true, 
              partner: partnerId,
              action: 'partnerFound'
            });
          } else {
            waitingUser = userId;
            res.status(200).json({ 
              success: true, 
              action: 'waiting'
            });
          }
          break;

        case 'signal':
          const user = users.get(userId);
          if (user && user.partner) {
            const partnerUser = users.get(user.partner);
            if (partnerUser) {
              if (!partnerUser.signals) partnerUser.signals = [];
              partnerUser.signals.push({
                from: userId,
                signal: data.signal,
                timestamp: Date.now()
              });
            }
          }
          res.status(200).json({ success: true });
          break;

        case 'getSignals':
          const currentUser = users.get(userId);
          if (currentUser && currentUser.signals) {
            const signals = currentUser.signals;
            currentUser.signals = [];
            res.status(200).json({ signals });
          } else {
            res.status(200).json({ signals: [] });
          }
          break;

        case 'chatMessage':
          const senderUser = users.get(userId);
          console.log(`Chat message from ${userId}: "${data.message}"`);
          console.log(`Sender exists: ${!!senderUser}, Partner: ${senderUser?.partner}`);
          
          if (senderUser && senderUser.partner) {
            const partnerUser = users.get(senderUser.partner);
            console.log(`Partner exists: ${!!partnerUser}`);
            
            if (partnerUser) {
              if (!partnerUser.messages) partnerUser.messages = [];
              partnerUser.messages.push({
                from: userId,
                message: data.message,
                timestamp: Date.now()
              });
              console.log(`Message queued for partner ${senderUser.partner}`);
              res.status(200).json({ success: true, messageQueued: true });
            } else {
              console.log(`Partner ${senderUser.partner} not found in users map`);
              res.status(200).json({ success: false, error: 'Partner not found' });
            }
          } else {
            console.log(`Sender ${userId} has no partner or doesn't exist`);
            res.status(200).json({ success: false, error: 'No partner or user not found' });
          }
          break;

        case 'getMessages':
          const msgUser = users.get(userId);
          console.log(`Getting messages for ${userId}, user exists: ${!!msgUser}`);
          
          if (msgUser && msgUser.messages && msgUser.messages.length > 0) {
            const messages = msgUser.messages;
            msgUser.messages = []; // Clear messages after retrieving
            console.log(`Returning ${messages.length} messages for ${userId}`);
            res.status(200).json({ messages });
          } else {
            console.log(`No messages for ${userId}`);
            res.status(200).json({ messages: [] });
          }
          break;

        case 'disconnect':
          const disconnectUser = users.get(userId);
          if (disconnectUser && disconnectUser.partner) {
            const partnerUser = users.get(disconnectUser.partner);
            if (partnerUser) {
              partnerUser.partner = null;
              if (!partnerUser.events) partnerUser.events = [];
              partnerUser.events.push({ type: 'partnerDisconnected', timestamp: Date.now() });
            }
          }
          if (waitingUser === userId) {
            waitingUser = null;
          }
          users.delete(userId);
          res.status(200).json({ success: true });
          break;

        case 'getEvents':
          const eventUser = users.get(userId);
          if (eventUser && eventUser.events) {
            const events = eventUser.events;
            eventUser.events = [];
            res.status(200).json({ events });
          } else {
            res.status(200).json({ events: [] });
          }
          break;

        case 'batchUpdate':
          // Batch endpoint that returns signals, messages, and events in one call
          const batchUser = users.get(userId);
          const batchResult = {
            signals: [],
            messages: [],
            events: []
          };
          
          if (batchUser) {
            // Get signals
            if (batchUser.signals) {
              batchResult.signals = batchUser.signals;
              batchUser.signals = [];
            }
            
            // Get messages
            if (batchUser.messages && batchUser.messages.length > 0) {
              batchResult.messages = batchUser.messages;
              batchUser.messages = [];
            }
            
            // Get events
            if (batchUser.events) {
              batchResult.events = batchUser.events;
              batchUser.events = [];
            }
          }
          
          res.status(200).json(batchResult);
          break;

        case 'debug':
          const debugUser = users.get(userId);
          const debugInfo = {
            userId,
            userExists: !!debugUser,
            partner: debugUser?.partner || null,
            partnerExists: debugUser?.partner ? !!users.get(debugUser.partner) : false,
            messageCount: debugUser?.messages?.length || 0,
            signalCount: debugUser?.signals?.length || 0,
            totalUsers: users.size,
            waitingUser: waitingUser
          };
          console.log('Debug info:', debugInfo);
          res.status(200).json(debugInfo);
          break;

        default:
          res.status(400).json({ error: 'Unknown action: ' + type });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}

module.exports = handler;
