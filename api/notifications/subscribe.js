/**
 * API Route: /api/notifications/subscribe
 * Subscribe to notification alerts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, phone, preferences } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Load existing subscribers
    const subscribersPath = join(__dirname, '../../data/subscribers.json');
    let subscribers = [];
    try {
      subscribers = JSON.parse(readFileSync(subscribersPath, 'utf8'));
    } catch {
      subscribers = [];
    }

    // Check if already subscribed
    if (subscribers.some(s => s.email === email)) {
      return res.status(409).json({ error: 'Already subscribed' });
    }

    // Add new subscriber
    subscribers.push({
      email,
      phone,
      preferences: {
        deadlineAlerts: true,
        bidOpeningReminders: true,
        newTenderAlerts: true,
        resultUpdates: true,
        ...preferences
      },
      subscribedAt: new Date().toISOString()
    });

    // Save
    writeFileSync(subscribersPath, JSON.stringify(subscribers, null, 2));

    res.status(201).json({
      success: true,
      message: 'Subscribed successfully'
    });

  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
}
