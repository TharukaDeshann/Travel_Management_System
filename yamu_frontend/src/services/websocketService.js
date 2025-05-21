import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = {};
    this.connectionState = {
      isConnected: false,
      retryCount: 0,
      maxRetries: 5,
      reconnectDelay: 5000,
    };
    this.connectionListeners = [];
  }

  initialize() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      },
      reconnectDelay: this.connectionState.reconnectDelay,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => {
        if (str.includes('ERROR')) {
          console.error('WebSocket Error:', str);
        }
      },
      beforeConnect: () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No authentication token available');
        }
        this.client.connectHeaders = { Authorization: `Bearer ${token}` };
        return true;
      },
      onConnect: () => {
        this.connectionState.isConnected = true;
        this.connectionState.retryCount = 0;
        this.notifyConnectionChange(true);
      },
      onStompError: (error) => {
        this.handleConnectionError(error);
      },
      onDisconnect: () => {
        this.connectionState.isConnected = false;
        this.notifyConnectionChange(false);
      }
    });
  }

  async connect() {
    if (this.client?.connected) {
      return true;
    }

    if (!this.client) {
      this.initialize();
    }

    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        reject(new Error('No authentication token available'));
        return;
      }

      const onConnect = () => {
        this.connectionState.isConnected = true;
        this.connectionState.retryCount = 0;
        this.notifyConnectionChange(true);
        cleanup();
        resolve(true);
      };

      const onError = (error) => {
        cleanup();
        reject(error);
      };

      const cleanup = () => {
        this.client.onConnect = null;
        this.client.onStompError = null;
      };

      this.client.onConnect = onConnect;
      this.client.onStompError = onError;

      this.client.activate();
    });
  }

  handleConnectionError(error) {
    this.connectionState.isConnected = false;
    this.connectionState.retryCount++;

    if (this.connectionState.retryCount <= this.connectionState.maxRetries) {
      console.warn(`Connection attempt ${this.connectionState.retryCount}/${this.connectionState.maxRetries}`);
      setTimeout(() => this.connect(), this.connectionState.reconnectDelay);
    } else {
      this.notifyConnectionChange(false);
      console.error('Max connection retries reached');
    }
  }

  subscribe(destination, callback) {
    if (!this.client?.connected) {
      console.error('Cannot subscribe - not connected');
      return null;
    }

    if (this.subscriptions[destination]) {
      this.subscriptions[destination].unsubscribe();
    }

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const parsedMessage = JSON.parse(message.body);
        callback(parsedMessage);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    this.subscriptions[destination] = subscription;
    return subscription;
  }

  send(destination, body) {
    if (!this.client?.connected) {
      console.error('Cannot send - not connected');
      return false;
    }

    try {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  disconnect() {
    if (this.client?.connected) {
      Object.values(this.subscriptions).forEach(sub => sub.unsubscribe());
      this.subscriptions = {};
      this.client.deactivate();
    }
    this.client = null;
    this.connectionState.isConnected = false;
    this.notifyConnectionChange(false);
  }

  notifyConnectionChange(isConnected) {
    this.connectionListeners.forEach((listener) => listener(isConnected));
  }

  addConnectionListener(listener) {
    this.connectionListeners.push(listener);
    return () => {
      this.connectionListeners = this.connectionListeners.filter((l) => l !== listener);
    };
  }

  isConnected() {
    return this.connectionState.isConnected;
  }
}

export const websocketService = new WebSocketService();