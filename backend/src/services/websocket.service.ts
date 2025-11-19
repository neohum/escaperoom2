import { WebSocketServer, WebSocket } from 'ws';
import { getSubscriber, getPublisher } from '../config/redis';

interface Client {
  ws: WebSocket;
  roomId: string;
  userId?: string;
  guestToken?: string;
}

const clients = new Map<WebSocket, Client>();

export function setupWebSocket(wss: WebSocketServer) {
  const subscriber = getSubscriber();
  const publisher = getPublisher();

  // Subscribe to all room changes
  subscriber.psubscribe('room:*:changes', (err) => {
    if (err) {
      console.error('Failed to subscribe to room changes:', err);
    }
  });

  // Handle Redis messages
  subscriber.on('pmessage', (pattern, channel, message) => {
    // Broadcast to all clients in the room
    const roomId = channel.split(':')[1];
    
    clients.forEach((client, ws) => {
      if (client.roomId === roomId && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  });

  // Handle WebSocket connections
  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'join':
            // Join a room
            clients.set(ws, {
              ws,
              roomId: message.roomId,
              userId: message.userId,
              guestToken: message.guestToken,
            });
            console.log(`Client joined room: ${message.roomId}`);
            break;

          case 'edit':
            // Broadcast edit to other clients via Redis
            const client = clients.get(ws);
            if (client) {
              await publisher.publish(
                `room:${client.roomId}:changes`,
                JSON.stringify({
                  type: 'edit',
                  data: message.data,
                  userId: client.userId || client.guestToken,
                  timestamp: new Date().toISOString(),
                })
              );
            }
            break;

          case 'cursor':
            // Broadcast cursor position
            const cursorClient = clients.get(ws);
            if (cursorClient) {
              await publisher.publish(
                `room:${cursorClient.roomId}:changes`,
                JSON.stringify({
                  type: 'cursor',
                  data: message.data,
                  userId: cursorClient.userId || cursorClient.guestToken,
                })
              );
            }
            break;

          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      const client = clients.get(ws);
      if (client) {
        console.log(`Client left room: ${client.roomId}`);
        clients.delete(ws);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log('WebSocket server setup complete');
}

