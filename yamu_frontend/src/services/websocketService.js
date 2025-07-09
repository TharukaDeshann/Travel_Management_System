import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
    this.connectionState = {
      isConnected: false,
      retryCount: 0,
      maxRetries: 5,
      reconnectDelay: 5000,
    };
    this.connectionListeners = new Set();
    this.connectionPromise = null;
  }

  initialize() {
    if (this.client) {
      this.disconnect(); // Clean up any existing connection
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: this.connectionState.reconnectDelay,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => {
        if (process.env.NODE_ENV !== 'production' && str.includes('ERROR')) {
          console.error('WebSocket Error:', str);
        }
      },
      onWebSocketClose: () => {
        this.handleDisconnection();
      },
      onWebSocketError: (error) => {
        this.handleConnectionError(error);
      }
    });

    this.client.onConnect = (frame) => {
      this.connectionState.isConnected = true;
      this.connectionState.retryCount = 0;
      this.notifyConnectionChange(true);
      if (this.connectionPromise) {
        this.connectionPromise.resolve(true);
        this.connectionPromise = null;
      }
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP protocol error:', frame.headers.message);
      this.handleConnectionError(new Error(frame.headers.message));
    };

    this.client.onDisconnect = () => {
      this.handleDisconnection();
    };
  }

  async connect() {
    if (this.client?.connected) {
      return true;
    }

    if (this.connectionPromise) {
      return this.connectionPromise.promise;
    }

    if (!this.client) {
      this.initialize();
    }

    // Create new promise for connection
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    this.connectionPromise = { promise, resolve, reject };

    try {
      this.client.activate();
      return await promise;
    } catch (error) {
      this.connectionPromise = null;
      throw error;
    }
  }

  handleConnectionError(error) {
    console.error('WebSocket connection error:', error);
    this.connectionState.isConnected = false;
    this.connectionState.retryCount++;

    if (this.connectionState.retryCount <= this.connectionState.maxRetries) {
      console.warn(`Connection attempt ${this.connectionState.retryCount}/${this.connectionState.maxRetries}`);
      setTimeout(() => this.connect(), this.connectionState.reconnectDelay);
    } else {
      this.notifyConnectionChange(false);
      console.error('Max connection retries reached');
      if (this.connectionPromise) {
        this.connectionPromise.reject(new Error('Max connection retries reached'));
        this.connectionPromise = null;
      }
    }
  }

  handleDisconnection() {
    this.connectionState.isConnected = false;
    this.notifyConnectionChange(false);
    if (this.connectionPromise) {
      this.connectionPromise.reject(new Error('Disconnected'));
      this.connectionPromise = null;
    }
  }

  subscribe(destination, callback, headers = {}) {
    if (!this.client?.connected) {
      console.error('Cannot subscribe - not connected');
      return null;
    }

    this.unsubscribe(destination);

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const parsedMessage = JSON.parse(message.body);
        callback(parsedMessage);
      } catch (error) {
        console.error('Error parsing message:', error, message.body);
      }
    }, headers);

    this.subscriptions.set(destination, subscription);
    return subscription;
  }

  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  send(destination, body, headers = {}) {
    if (!this.client?.connected) {
      console.error('Cannot send - not connected');
      return false;
    }

    try {
      const token = localStorage.getItem('accessToken');
      this.client.publish({
        destination,
        body: JSON.stringify(body),
        headers: {
          ...headers,
          Authorization: `Bearer ${token}`
        }
      });
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  disconnect() {
    if (this.client) {
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions.clear();

      if (this.client.connected) {
        this.client.deactivate().catch(console.error);
      }

      this.client = null;
    }
    this.connectionState.isConnected = false;
    this.notifyConnectionChange(false);
  }

  notifyConnectionChange(isConnected) {
    this.connectionListeners.forEach(listener => listener(isConnected));
  }

  addConnectionListener(listener) {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  isConnected() {
    return this.connectionState.isConnected;
  }
}

export const websocketService = new WebSocketService();
