# User Manual - Business Watch

Complete guide for using the Business Watch tender management system.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Navigation Overview](#navigation-overview)
4. [Tenders](#tenders)
5. [Bids](#bids)
6. [Quotations](#quotations)
7. [Procurement](#procurement)
8. [Suppliers](#suppliers)
9. [Deliveries](#deliveries)
10. [Documents](#documents)
11. [Projects](#projects)
12. [Finance](#finance)
13. [Analytics](#analytics)
14. [Reports](#reports)
15. [Calendar](#calendar)
16. [KPI Dashboard](#kpi-dashboard)
17. [Cost Calculator](#cost-calculator)
18. [Advanced Search](#advanced-search)
19. [Email Notifications](#email-notifications)
20. [Administration](#administration)
21. [Mobile Usage](#mobile-usage)
22. [Data Sources](#data-sources)
23. [Troubleshooting](#troubleshooting)
24. [Quick Reference](#quick-reference)

---

## Getting Started

### Login

1. Open the application at `http://localhost:5173` (local) or your Vercel URL
2. Enter your email and password
3. Click "Sign In"

**Default Roles:**
- **Admin**: Full system access including user management
- **Staff**: Limited access (cannot delete or manage users)

---

## Dashboard

The Dashboard is your command center showing key business metrics and urgent alerts.

### Overview Cards

- **Total Tenders**: 43 Gazette tenders from government sources
- **Active Bids**: Current bidding activities in progress
- **Won Projects**: Successfully awarded tenders
- **Pending Deliveries**: Items awaiting delivery
- **Total Revenue**: Financial summary of all projects

### Urgent Alerts Section

Displays tenders with deadlines today or within 24 hours:
- Tender title and ID
- Deadline time
- Authority name
- Direct link to tender details

### Dashboard Charts

- **Revenue by Quarter**: Track income trends
- **Tenders by Category**: Visual breakdown (IT, Medical, Construction, etc.)
- **Bid Success Rate**: Win/loss ratio over time
- **Delivery Status**: Project completion tracking

---

## Navigation Overview

The sidebar contains 25+ modules organized by function:

### Main Modules
| Module | Description | Access |
|--------|-------------|--------|
| Dashboard | Overview and alerts | All users |
| Tenders | Browse all tenders | All users |
| Bids | Manage your bids | All users |
| Quotations | Create and track quotes | All users |
| Procurement | Purchase orders and tracking | All users |
| Suppliers | Vendor management | All users |
| Deliveries | Track shipments | All users |
| Documents | File management | All users |
| Projects | Won tender projects | All users |
| Finance | Budget and accounting | All users |

### Analytics & Reports
| Module | Description | Access |
|--------|-------------|--------|
| Analytics | Data visualization | All users |
| Reports | Generate exports | All users |
| Calendar | Deadline timeline | All users |
| KPI Dashboard | Key metrics | All users |
| Cost Calculator | Bid estimation | All users |
| Advanced Search | Powerful filtering | All users |

### Administration
| Module | Description | Access |
|--------|-------------|--------|
| Users | User management | Admin only |
| Upload Excel | Bulk data import | Admin only |

---

## Tenders

Browse and search all 43+ Gazette tenders from Maldives government sources.

### Viewing Tenders

Each tender displays:
- **ID**: Unique identifier (TND-2026-XXX)
- **Title**: Tender description
- **Authority**: Government organization
- **Category**: IT, Construction, Medical, etc.
- **Deadline**: Submission deadline with countdown
- **Status**: Open, Closed, Won, Lost
- **Estimated Budget**: Project value range

### Search & Filter

**Search by:**
- Title keywords
- Authority name
- Category dropdown
- Tender ID

**Filter by:**
- Status (Open/Closed/Won/Lost)
- Category (18 categories)
- Authority (20+ organizations)
- Deadline range (Next 7/30/90 days)

### Tender Details Modal

Click any tender to view:
- Full description and requirements
- Quantities and specifications
- Contact information
- Gazette URL (external link)
- Info Sheet URL (PDF download)
- Bid opening date/time
- Your bid amount (if submitted)
- Submission history

### Creating a Bid from Tender

1. Click on tender card
2. Click "Create Bid" button
3. Enter bid amount and cost estimate
4. Add notes and attachments
5. Save - system calculates profit margin automatically

---

## Bids

Manage all your bidding activities in one place.

### Bid Status Types

- **Draft**: Bid in preparation
- **Submitted**: Bid sent to authority
- **Pending**: Awaiting results
- **Won**: Successfully awarded
- **Lost**: Not awarded
- **Withdrawn**: Bid retracted

### Bid List Views

**Card View:**
- Visual grid layout
- Color-coded by status
- Quick action buttons

**Table View:**
- Sortable columns
- Bulk actions
- Export to Excel

### Bid Statistics

Top of page shows:
- Total bids count
- Total value (all bids)
- Won count and value
- Win rate percentage
- Pending count

### Bid Management Actions

- **Edit**: Modify draft bids
- **Submit**: Send to authority
- **Duplicate**: Copy for similar tender
- **Convert to Project**: When won
- **Delete**: Remove draft bids

---

## Quotations

Create and manage quotations for clients.

### Quotation Features

- Create custom quotes
- Add line items with quantities
- Calculate totals with tax
- Track quotation status
- Convert to orders
- Export as PDF

### Quotation Status

- **Draft**: In preparation
- **Sent**: Delivered to client
- **Accepted**: Client approved
- **Rejected**: Client declined
- **Expired**: Past validity date

---

## Procurement

Manage purchase orders and supplier interactions.

### Purchase Orders

Create POs for won tenders:
1. Select project/tender
2. Add items to purchase
3. Select suppliers
4. Set quantities and prices
5. Track delivery dates

### Procurement Workflow

- **Requisition**: Request items
- **Approved**: PO authorized
- **Ordered**: Sent to supplier
- **Shipped**: In transit
- **Delivered**: Items received
- **Invoiced**: Bill received

---

## Suppliers

Vendor and supplier management database.

### Supplier Information

Store and manage:
- Company name and contact details
- Primary contact person
- Email and phone
- Items/categories supplied
- Historical pricing data
- Performance ratings

### Supplier Actions

- Add new suppliers
- Edit existing records
- View purchase history
- Track performance
- Rate and review

---

## Deliveries

Track all incoming shipments and deliveries.

### Delivery Tracking

- Track shipment status
- Expected delivery dates
- Actual receipt dates
- Delivery notes
- Item condition records

### Delivery Status

- **Pending**: Awaiting shipment
- **Shipped**: In transit
- **In Customs**: Clearing customs
- **Out for Delivery**: Local delivery
- **Delivered**: Items received
- **Delayed**: Late shipment

---

## Documents

Centralized document management system.

### Document Types

- Tender documents
- Bid submissions
- Contracts
- Invoices
- Delivery receipts
- Correspondence

### Document Features

- Upload PDFs, images, Excel files
- Categorize by project
- Version control
- Search by name/date
- Download anytime
- Share with team

---

## Projects

Track won tenders converted to active projects.

### Project Overview

Each project shows:
- Tender reference
- Contract value
- Start and end dates
- Project status
- Team assignments
- Budget vs actual costs

### Project Status

- **Planning**: Initial setup
- **Active**: In progress
- **On Hold**: Temporarily paused
- **Completed**: Finished
- **Cancelled**: Terminated

---

## Finance

Financial management and budget tracking.

### Financial Dashboard

- **Accounts**: Bank and cash accounts
- **Transactions**: All financial movements
- **Budget Summary**: Budget vs actual spending
- **Revenue Tracking**: Income by project

### Key Metrics

- Total revenue
- Total expenses
- Net profit
- Budget utilization
- Outstanding invoices
- Pending payments

### Data Source

Finance data is derived from:
- Bid amounts (revenue)
- Procurement costs (expenses)
- Project budgets

---

## Analytics

Deep data visualization and analysis.

### Analytics Views

- **Tender Analytics**: Trends over time
- **Bid Analytics**: Success patterns
- **Financial Analytics**: Revenue/expense trends
- **Supplier Analytics**: Vendor performance

### Chart Types

- Line charts (trends)
- Bar charts (comparisons)
- Pie charts (breakdowns)
- Heat maps (activity)

---

## Reports

Generate and export business reports.

### Report Types

**Tender Reports:**
- Summary by category
- By authority
- By deadline status
- New tenders report

**Financial Reports:**
- Revenue by quarter
- Profit margins
- Cost breakdowns
- Budget variance

**Performance Reports:**
- Bid success rate
- Won vs Lost analysis
- Delivery performance
- Supplier ratings

### Export Formats

- Excel (.xlsx)
- PDF
- CSV
- Print-friendly

---

## Calendar

Visual timeline of all tender deadlines.

### Calendar Views

- **Month View**: Overview of all deadlines
- **Week View**: Detailed weekly schedule
- **Day View**: Hour-by-hour on busy days

### Calendar Events

- Tender submission deadlines
- Bid opening dates
- Project milestones
- Delivery schedules
- Meeting reminders

### Color Coding

- Red: Urgent (today/tomorrow)
- Orange: This week
- Yellow: Next week
- Green: Future

---

## KPI Dashboard

Key Performance Indicators at a glance.

### KPIs Tracked

- **Total Bids**: Number submitted
- **Won Bids**: Successfully awarded
- **Win Rate**: Percentage won
- **Total Value**: All bid amounts
- **Won Value**: Revenue from wins
- **Average Profit Margin**: Bid profitability

### Time Periods

Filter KPIs by:
- This month
- This quarter
- This year
- All time

---

## Cost Calculator

Estimate costs for tender submissions.

### Calculator Features

- Select items from database
- Adjust quantities
- Add markup percentage
- Calculate exchange rates
- Factor in shipping costs
- Include tax calculations

### Cost Components

- Base item costs
- Shipping and freight
- Import duties
- Handling fees
- Insurance
- Contingency (10-15%)

---

## Advanced Search

Powerful search across all data.

### Search Capabilities

- **Tenders**: Search by any field
- **Bids**: Find by status, value, date
- **Suppliers**: Search by name, items
- **Projects**: Find by status, value

### Search Filters

- Date ranges
- Value ranges
- Status filters
- Category filters
- Authority filters

---

## Email Notifications

Stay informed with automatic alerts.

### Notification Types

**Tender Alerts:**
- New tenders matching your criteria
- Tender deadline reminders (7, 3, 1 days)
- Bid opening reminders

**Bid Alerts:**
- Bid result updates
- Status change notifications

**Deadline Alerts:**
- Daily summary of urgent tenders
- Weekly digest of upcoming deadlines

### Setting Up Notifications

1. Click the **bell icon** in the top navigation
2. Click "Notification Settings"
3. Enter your email
4. Select alert types:
   - Deadline alerts
   - Bid opening reminders
   - New tender alerts
   - Result updates
5. Click "Subscribe"

### Managing Preferences

- Enable/disable specific alert types
- Change email address
- Unsubscribe anytime
- Set quiet hours (no night emails)

---

## Team Chat

Real-time messaging for team collaboration.

### Chat Features

- **Real-time messaging**: Instant message delivery
- **@mentions**: Tag specific users or @all to notify everyone
- **User identification**: See who's online with role badges (Admin/Staff)
- **Message history**: Last 100 messages stored locally for 24 hours
- **Mobile responsive**: Full chat functionality on mobile devices

### Using @mentions

To tag someone in a message:
1. Type `@` in the message box
2. Select a user from the dropdown, or type their name
3. Use `@all` to notify all team members
4. Mentioned users see a yellow highlight on the message

### Pusher Setup (Required for Chat)

Chat uses **Pusher** for real-time messaging (free forever, 200k messages/day, no credit card).

**Setup Steps:**

1. **Create free account**: Go to [pusher.com](https://pusher.com) and sign up
2. **Create app**: Click "Create app" → Name it "Business Watch Chat"
3. **Get credentials**: 
   - Go to "App Keys" tab
   - Copy your `app_id`, `key`, and `secret`
4. **Update code**: Open `src/hooks/useChat.js` and replace:
   ```javascript
   const PUSHER_KEY = 'a6f9d8c2a8e8c2a8e8c2'; // Replace with your actual key
   const PUSHER_CLUSTER = 'ap2'; // Or your cluster (mt1, eu, etc.)
   ```
5. **Enable client events** (for @all mentions):
   - In Pusher dashboard → App Settings
   - Enable "Client Events"
   - Save changes

**Free Tier Limits:**
- 200,000 messages per day
- 100 concurrent connections
- No expiration
- No credit card required

---

## Administration (Admin Only)

### User Management

**Create New User:**
1. Go to Users page (sidebar)
2. Click "Add User"
3. Enter:
   - Full name
   - Email address
   - Temporary password
   - Role (Admin/Staff)
4. Click Save

**Edit User:**
- Click user row
- Modify details
- Change role if needed
- Save changes

**Delete User:**
- Click delete icon
- Confirm deletion
- User data archived

### Data Upload

**Upload Gazette Tenders:**
```bash
npm run upload-tenders
```
This uploads all 43 tenders from `data/working_file.json` to Firebase.

**Upload Excel Data:**
1. Go to "Upload Excel" page
2. Select file type:
   - Suppliers
   - Purchases
   - Projects
   - Deliveries
3. Upload Excel file
4. Map columns to system fields
5. Preview data
6. Import to system

### Firestore Rules

View/modify security rules in `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tenders/{tenderId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules --project bussiness-watch
```

---

## Mobile Usage

Business Watch is fully responsive for mobile devices.

### Mobile Navigation

- **Hamburger Menu**: Tap to open sidebar
- **Swipe**: Swipe right to open menu
- **Touch-friendly**: All buttons sized for touch
- **Scrollable**: Smooth scrolling on all pages

### Mobile-Optimized Pages

**Dashboard:**
- Cards stack vertically
- Charts resize to fit screen
- Alerts in scrollable list

**Tenders & Bids:**
- Card view default on mobile
- Table view available via toggle
- Horizontal scroll for tables
- Touch to open details

**Forms:**
- Full-width inputs
- Large touch targets
- Number pad for amounts
- Date pickers optimized

### Mobile Tips

- Use landscape mode for tables
- Pinch to zoom on charts
- Pull down to refresh data
- Long press for quick actions

---

## Data Sources

### Gazette Tenders

**Source**: https://gazette.gov.mv/iulaan

**Current Dataset**:
- 43 active tenders
- 18 categories
- 20+ authorities
- Updated: March 30, 2026

**File Locations**:
- Local: `data/working_file.json`
- Firebase: `tenders/` collection
- Backup: Projects 2026.json

### Categories

Most common tender categories:
1. IT Equipment (17 tenders)
2. Medical Equipment (3 tenders)
3. Construction (3 tenders)
4. Office Supplies (2 tenders)
5. Apparel/Uniform (2 tenders)

### Top Authorities

Tenders by organization:
1. Islamic University of Maldives (4 tenders)
2. Elections Commission (3 tenders)
3. Male City Council (2 tenders)
4. Ministry of Health (2 tenders)

---

## Troubleshooting

### Cannot See Tenders

1. Check Firebase connection
2. Run: `npm run upload-tenders`
3. Check browser console for errors
4. Verify Firestore rules allow reads

### Upload Script Fails

1. Check Firestore rules allow writes
2. Verify Firebase project ID: `bussiness-watch`
3. Check internet connection
4. Try: `firebase login:ci` then deploy with token

### Permission Denied

1. Ensure you're logged in
2. Check your role (Admin vs Staff)
3. Verify Firestore security rules
4. Contact admin if access needed

### Data Not Syncing

1. Check `useTenders()` hook
2. Verify Firebase connection
3. Check local data file exists
4. Force refresh: `useTenders(true)` for local mode

### Email Notifications Not Working

1. Check SMTP settings in `.env`
2. Verify subscriber exists in `data/subscribers.json`
3. Check GitHub Actions cron job status
4. Verify `CRON_SECRET` is set correctly

---

## Quick Reference

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl + K` | Search |
| `Esc` | Close modal |
| `Ctrl + S` | Save form |
| `Ctrl + N` | New item |
| `Ctrl + E` | Export |

### Common Tasks

| Task | Steps |
|------|-------|
| View urgent tenders | Dashboard → Urgent Alerts |
| Search tenders | Tenders page → Search bar |
| Create bid | Tenders → Select tender → Create Bid |
| Upload data | Admin → Upload Excel / Run script |
| Export report | Reports → Select report → Export |
| Subscribe to alerts | Click bell icon → Notification Settings |
| Check deadlines | Calendar page or Dashboard |
| Calculate costs | Cost Calculator page |

### Important Dates (Sample)

**Urgent Deadlines**:
- March 30, 2026: 3 IUM tenders (14:00)
- April 2, 2026: Multiple deadlines
- April 5-9, 2026: Various submissions

---

## Version Information

**Document Version**: 1.2.0  
**Last Updated**: March 31, 2026  
**App Version**: 1.2.0  
**Total Tenders**: 43

---

**For technical support:**
1. Check this manual
2. Review README.md
3. Check CHANGELOG.md
4. Contact system administrator
