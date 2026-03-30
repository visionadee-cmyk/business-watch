/**
 * Scheduler Service
 * Checks for upcoming deadlines and triggers notifications
 */

import { notificationService } from './notificationService.js';

class SchedulerService {
  constructor() {
    this.checkInterval = null;
  }

  // Start periodic checks (runs every hour)
  start() {
    console.log('🔄 Scheduler started - checking every hour');
    this.checkDeadlines(); // Immediate check
    this.checkInterval = setInterval(() => this.checkDeadlines(), 60 * 60 * 1000);
  }

  // Stop scheduler
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Check all deadlines
  async checkDeadlines(tenders) {
    const now = new Date();
    
    for (const tender of tenders) {
      // Check submission deadlines
      if (tender.submission_deadline && tender.status === 'Open') {
        const deadline = new Date(tender.submission_deadline);
        const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        
        // Alert at 7, 3, and 1 day(s) before deadline
        if ([7, 3, 1].includes(daysRemaining) && daysRemaining > 0) {
          await notificationService.sendDeadlineNotification(tender, daysRemaining);
        }
      }

      // Check bid opening times
      if (tender.bid_opening_date && tender.status === 'Open') {
        const openingDate = new Date(tender.bid_opening_date);
        
        // If opening is today
        if (this.isSameDay(openingDate, now)) {
          const hoursRemaining = tender.bid_opening_time 
            ? this.calculateHoursRemaining(tender.bid_opening_time)
            : 0;
          
          // Alert 4 hours before and at opening time
          if (hoursRemaining === 4 || hoursRemaining === 0) {
            await notificationService.sendBidOpeningReminder(tender, hoursRemaining);
          }
        }
      }
    }
  }

  // Check for new tenders (compare with existing)
  async checkNewTenders(existingTenders, newTenders) {
    const existingIds = new Set(existingTenders.map(t => t.id));
    
    for (const tender of newTenders) {
      if (!existingIds.has(tender.id)) {
        console.log(`📢 New tender found: ${tender.id}`);
        await notificationService.sendNewTenderAlert(tender);
      }
    }
  }

  // Check for result updates
  async checkResultUpdates(previousTenders, currentTenders) {
    const previousMap = new Map(previousTenders.map(t => [t.id, t]));
    
    for (const tender of currentTenders) {
      const previous = previousMap.get(tender.id);
      
      if (previous && previous.result !== tender.result && tender.result !== 'Pending') {
        console.log(`📊 Result updated for ${tender.id}: ${tender.result}`);
        await notificationService.sendResultUpdate(tender, tender.result);
      }
    }
  }

  // Helper: Check if two dates are the same day
  isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
  }

  // Helper: Calculate hours remaining until a specific time
  calculateHoursRemaining(timeString) {
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    const targetTime = new Date(now);
    targetTime.setHours(hours, minutes, 0, 0);
    
    const diffMs = targetTime - now;
    return Math.ceil(diffMs / (1000 * 60 * 60));
  }
}

export const schedulerService = new SchedulerService();
export default SchedulerService;
