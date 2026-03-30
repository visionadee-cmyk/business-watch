/**
 * API Route: /api/check-deadlines
 * Triggered by cron job to check deadlines and send notifications
 */

import { notificationService } from '../services/notificationService.js';
import { schedulerService } from '../services/schedulerService.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function handler(req, res) {
  // Verify cron secret (for security)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Load tenders from working_file.json
    const workingFilePath = join(__dirname, '../../data/working_file.json');
    const workingData = JSON.parse(readFileSync(workingFilePath, 'utf8'));
    const tenders = workingData.tenders || [];

    // Load subscriber preferences
    const subscribersPath = join(__dirname, '../../data/subscribers.json');
    let subscribers = [];
    try {
      subscribers = JSON.parse(readFileSync(subscribersPath, 'utf8'));
    } catch {
      subscribers = [{ email: process.env.ADMIN_EMAIL || 'admin@businesswatch.mv' }];
    }

    // Add subscribers to notification service
    subscribers.forEach((sub, i) => {
      notificationService.addSubscriber(`user-${i}`, sub);
    });

    // Check deadlines
    await schedulerService.checkDeadlines(tenders);

    res.status(200).json({
      success: true,
      message: 'Deadline check completed',
      tendersChecked: tenders.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in deadline check:', error);
    res.status(500).json({ error: 'Failed to check deadlines' });
  }
}
