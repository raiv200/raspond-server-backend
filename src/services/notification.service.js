const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(process.cwd(), 'notifications.log');

function logToFile(msg) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
}

class NotificationService {
  constructor() {
    this.client = null;
    this.subscribers = new Map();
    this.isConnected = false;
    this.shouldBeConnected = false;
  }

  async _createClient() {
    logToFile('Creating PG client...');
    this.client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    this.client.on('notification', (msg) => {
      logToFile(`Received notification on channel: ${msg.channel}`);
      if (msg.channel === 'doc_status' && msg.payload) {
        try {
          const payload = JSON.parse(msg.payload);
          logToFile(`Parsed payload for doc: ${payload.document_id}`);
          this._notifySubscribers(payload);
        } catch (e) {
          logToFile(`Error parsing payload: ${e.message}`);
        }
      }
    });

    this.client.on('error', (err) => {
      logToFile(`PG client error: ${err.message}`);
      this.isConnected = false;
      if (this.shouldBeConnected) this._handleReconnect();
    });

    this.client.on('end', () => {
      logToFile('PG connection ended');
      this.isConnected = false;
      if (this.shouldBeConnected) this._handleReconnect();
    });
  }

  async connect() {
    if (this.isConnected) return;
    this.shouldBeConnected = true;
    try {
      if (!this.client) await this._createClient();
      logToFile('Connecting to PG...');
      await this.client.connect();
      logToFile('Connected. Sending LISTEN doc_status...');
      await this.client.query('LISTEN doc_status');
      logToFile('LISTEN successful');
      this.isConnected = true;
    } catch (error) {
      logToFile(`Failed to connect: ${error.message}`);
      if (this.shouldBeConnected) setTimeout(() => this.connect(), 5000);
    }
  }

  _handleReconnect() {
    if (this.isConnected || !this.shouldBeConnected) return;
    logToFile('Scheduling reconnect in 5s...');
    this.client = null;
    setTimeout(() => this.connect(), 5000);
  }

  async subscribe(documentId, callback) {
    logToFile(`Subscribing to: ${documentId}`);
    if (!this.subscribers.has(documentId)) this.subscribers.set(documentId, []);
    this.subscribers.get(documentId).push(callback);
    if (!this.isConnected) await this.connect();
  }

  async unsubscribe(documentId, callback) {
    logToFile(`Unsubscribing from: ${documentId}`);
    const subs = this.subscribers.get(documentId);
    if (subs) {
      this.subscribers.set(documentId, subs.filter((cb) => cb !== callback));
      if (this.subscribers.get(documentId).length === 0) this.subscribers.delete(documentId);
    }
    if (this.subscribers.size === 0 && this.isConnected) {
      logToFile('No subscribers left. Cleaning up...');
      await this.cleanup();
    }
  }

  _notifySubscribers(payload) {
    const { document_id } = payload;
    const subs = this.subscribers.get(document_id);
    if (subs) {
      logToFile(`Forwarding to ${subs.length} subscribers for doc: ${document_id}`);
      subs.forEach((cb) => cb(payload));
    } else {
      logToFile(`No subscribers for doc: ${document_id}`);
    }
  }

  async cleanup() {
    this.shouldBeConnected = false;
    if (this.client) {
      try { await this.client.end(); } catch (e) {}
      this.client = null;
    }
    this.isConnected = false;
  }
}

const notificationService = new NotificationService();

module.exports = { notificationService };
