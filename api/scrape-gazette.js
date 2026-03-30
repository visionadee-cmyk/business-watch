/**
 * API Route: /api/scrape-gazette
 * Fetches new tenders from gazette.gov.mv and sends alerts
 */

import { gazetteScraper } from '../services/gazetteScraper.js';
import { notificationService } from '../services/notificationService.js';
import { schedulerService } from '../services/schedulerService.js';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function handler(req, res) {
  // Verify cron secret
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Load existing tenders
    const workingFilePath = join(__dirname, '../../data/working_file.json');
    const workingData = JSON.parse(readFileSync(workingFilePath, 'utf8'));
    const existingTenders = workingData.tenders || [];

    // Scrape new tenders
    const newTenders = await gazetteScraper.fetchLatestTenders();

    // Check for new tenders and send alerts
    await schedulerService.checkNewTenders(existingTenders, newTenders);

    // Merge and save
    const existingIds = new Set(existingTenders.map(t => t.id));
    const actuallyNew = newTenders.filter(t => !existingIds.has(t.id));
    
    if (actuallyNew.length > 0) {
      workingData.tenders = [...actuallyNew, ...existingTenders];
      workingData.metadata.total_tenders = workingData.tenders.length;
      workingData.metadata.last_updated = new Date().toISOString();
      
      writeFileSync(workingFilePath, JSON.stringify(workingData, null, 2));
    }

    res.status(200).json({
      success: true,
      message: 'Gazette scrape completed',
      newTendersFound: actuallyNew.length,
      totalTenders: workingData.tenders.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error scraping gazette:', error);
    res.status(500).json({ error: 'Failed to scrape gazette' });
  }
}
