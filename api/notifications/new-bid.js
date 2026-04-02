/**
 * API Route: /api/notifications/new-bid
 * Send notification when a new bid is created
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { notificationService } from '../services/notificationService.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const bid = req.body;

    if (!bid || !bid.title) {
      return res.status(400).json({ error: 'Bid data with title is required' });
    }

    // Load subscribers
    const subscribersPath = join(__dirname, '../../data/subscribers.json');
    let subscribers = [];
    try {
      subscribers = JSON.parse(readFileSync(subscribersPath, 'utf8'));
    } catch {
      subscribers = [];
    }

    // Add subscribers to notification service
    subscribers.forEach((sub, index) => {
      notificationService.addSubscriber(`sub-${index}`, {
        email: sub.email,
        phone: sub.phone,
        preferences: sub.preferences
      });
    });

    // Send new bid alert
    await notificationService.sendNewBidAlert(bid);

    res.status(200).json({
      success: true,
      message: `New bid notification sent to ${subscribers.length} subscriber(s)`,
      subscribersCount: subscribers.length
    });

  } catch (error) {
    console.error('Error sending new bid notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
}
