/**
 * Notification Service
 * Handles email and push notifications for tender alerts
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Email configuration (use environment variables in production)
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport(EMAIL_CONFIG);
    this.subscribers = new Map(); // userId -> {email, phone, preferences}
  }

  // Add subscriber
  addSubscriber(userId, { email, phone, preferences = {} }) {
    this.subscribers.set(userId, {
      email,
      phone,
      preferences: {
        deadlineAlerts: true,
        bidOpeningReminders: true,
        newTenderAlerts: true,
        resultUpdates: true,
        ...preferences
      }
    });
  }

  // Send deadline notification
  async sendDeadlineNotification(tender, daysRemaining) {
    const subject = `🔔 Deadline Alert: ${tender.title} (${daysRemaining} days left)`;
    const html = this.generateDeadlineEmail(tender, daysRemaining);
    
    for (const [userId, subscriber] of this.subscribers) {
      if (subscriber.preferences.deadlineAlerts) {
        await this.sendEmail(subscriber.email, subject, html);
      }
    }
  }

  // Send bid opening reminder
  async sendBidOpeningReminder(tender, hoursRemaining) {
    const subject = `⏰ Bid Opening Today: ${tender.title}`;
    const html = this.generateBidOpeningEmail(tender, hoursRemaining);
    
    for (const [userId, subscriber] of this.subscribers) {
      if (subscriber.preferences.bidOpeningReminders) {
        await this.sendEmail(subscriber.email, subject, html);
      }
    }
  }

  // Send new bid alert
  async sendNewBidAlert(bid) {
    const subject = `📢 New Bid Created: ${bid.title}`;
    const html = this.generateNewBidEmail(bid);
    
    for (const [userId, subscriber] of this.subscribers) {
      // Send to all subscribers - new bid alerts
      await this.sendEmail(subscriber.email, subject, html);
    }
  }

  // Send new tender alert
  async sendNewTenderAlert(tender) {
    const subject = `📢 New Tender: ${tender.title}`;
    const html = this.generateNewTenderEmail(tender);
    
    for (const [userId, subscriber] of this.subscribers) {
      if (subscriber.preferences.newTenderAlerts) {
        await this.sendEmail(subscriber.email, subject, html);
      }
    }
  }

  // Send result update
  async sendResultUpdate(tender, result) {
    const subject = result === 'Won' 
      ? `🎉 Bid Won: ${tender.title}` 
      : `📊 Result Updated: ${tender.title}`;
    const html = this.generateResultEmail(tender, result);
    
    for (const [userId, subscriber] of this.subscribers) {
      if (subscriber.preferences.resultUpdates) {
        await this.sendEmail(subscriber.email, subject, html);
      }
    }
  }

  // Generic email sender
  async sendEmail(to, subject, html) {
    try {
      await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || 'alerts@businesswatch.mv',
        to,
        subject,
        html,
      });
      console.log(`✅ Email sent to ${to}: ${subject}`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
    }
  }

  // Email templates
  generateDeadlineEmail(tender, daysRemaining) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e11d48;">⏰ Deadline Alert</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${tender.title}</h3>
          <p><strong>Tender ID:</strong> ${tender.id}</p>
          <p><strong>Authority:</strong> ${tender.authority}</p>
          <p><strong>Category:</strong> ${tender.category}</p>
          <p style="color: #e11d48; font-weight: bold; font-size: 18px;">
            ⏰ ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining
          </p>
          <p><strong>Deadline:</strong> ${tender.submission_deadline} at ${tender.submission_time || 'N/A'}</p>
          ${tender.estimated_budget ? `<p><strong>Budget:</strong> ${tender.estimated_budget.toLocaleString()} MVR</p>` : ''}
        </div>
        <p>
          <a href="${tender.gazette_url}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View on Gazette
          </a>
        </p>
      </div>
    `;
  }

  generateBidOpeningEmail(tender, hoursRemaining) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b5cf6;">🔨 Bid Opening Today</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${tender.title}</h3>
          <p><strong>Tender ID:</strong> ${tender.id}</p>
          <p><strong>Authority:</strong> ${tender.authority}</p>
          <p style="color: #8b5cf6; font-weight: bold; font-size: 18px;">
            ⏰ Opening in ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}
          </p>
          <p><strong>Time:</strong> ${tender.bid_opening_time || 'N/A'}</p>
          <p><strong>Date:</strong> ${tender.bid_opening_date}</p>
        </div>
      </div>
    `;
  }

  generateNewBidEmail(bid) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">📢 New Bid Created</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${bid.title}</h3>
          <p><strong>Tender ID:</strong> ${bid.tenderId || bid.id}</p>
          <p><strong>Authority:</strong> ${bid.authority || 'N/A'}</p>
          ${bid.bidAmount ? `<p><strong>Bid Amount:</strong> ${bid.bidAmount.toLocaleString()} MVR</p>` : ''}
          ${bid.costEstimate ? `<p><strong>Cost Estimate:</strong> ${bid.costEstimate.toLocaleString()} MVR</p>` : ''}
          ${bid.profitMargin ? `<p><strong>Profit Margin:</strong> ${bid.profitMargin.toLocaleString()} MVR</p>` : ''}
          ${bid.items && bid.items.length > 0 ? `<p><strong>Items:</strong> ${bid.items.length} item(s)</p>` : ''}
          <p><strong>Created:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>
          <a href="https://businesswatch.mv/bids" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View All Bids
          </a>
        </p>
      </div>
    `;
  }

  generateNewTenderEmail(tender) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">📢 New Tender Available</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${tender.title}</h3>
          <p><strong>Tender ID:</strong> ${tender.id}</p>
          <p><strong>Authority:</strong> ${tender.authority}</p>
          <p><strong>Category:</strong> ${tender.category}</p>
          ${tender.estimated_budget ? `<p><strong>Budget:</strong> ${tender.estimated_budget.toLocaleString()} MVR</p>` : ''}
          <p><strong>Submission Deadline:</strong> ${tender.submission_deadline || 'TBA'}</p>
        </div>
        <p>
          <a href="${tender.gazette_url}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Details
          </a>
        </p>
      </div>
    `;
  }

  generateResultEmail(tender, result) {
    const color = result === 'Won' ? '#10b981' : result === 'Lost' ? '#e11d48' : '#6b7280';
    const icon = result === 'Won' ? '🎉' : result === 'Lost' ? '😔' : '📊';
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${color};">${icon} Result: ${result}</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${tender.title}</h3>
          <p><strong>Tender ID:</strong> ${tender.id}</p>
          <p><strong>Authority:</strong> ${tender.authority}</p>
          <p style="color: ${color}; font-weight: bold; font-size: 24px;">
            ${result}
          </p>
          ${tender.bid_amount ? `<p><strong>Your Bid:</strong> ${tender.bid_amount.toLocaleString()} MVR</p>` : ''}
        </div>
      </div>
    `;
  }
}

export const notificationService = new NotificationService();
export default NotificationService;
