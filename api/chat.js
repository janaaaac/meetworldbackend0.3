// Simple chat API for video chat platform
const users = new Map();
let waitingUser = null;

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
          if (senderUser && senderUser.partner) {
            const partnerUser = users.get(senderUser.partner);
            if (partnerUser) {
              if (!partnerUser.messages) partnerUser.messages = [];
              partnerUser.messages.push({
                from: userId,
                message: data.message,
                timestamp: Date.now()
              });
            }
          }
          res.status(200).json({ success: true });
          break;

        case 'getMessages':
          const msgUser = users.get(userId);
          if (msgUser && msgUser.messages) {
            const messages = msgUser.messages;
            msgUser.messages = [];
            res.status(200).json({ messages });
          } else {
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
