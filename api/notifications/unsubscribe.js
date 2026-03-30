/**
 * API Route: /api/notifications/unsubscribe
 * Unsubscribe from notification alerts
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
    const { email } = req.body;

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

    // Remove subscriber
    const filtered = subscribers.filter(s => s.email !== email);

    if (filtered.length === subscribers.length) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Save
    writeFileSync(subscribersPath, JSON.stringify(filtered, null, 2));

    res.status(200).json({
      success: true,
      message: 'Unsubscribed successfully'
    });

  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
}
