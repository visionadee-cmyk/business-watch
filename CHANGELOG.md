# Changelog

All notable changes to the Business Watch project.

## [1.5.0] - 2026-04-03

### ✨ Added

#### Capital Tracking & Investment Management
- **New Capital Tab**: Added to Staff Expense page for tracking borrowed/paid capital
  - Source Type selection: Company Staff vs Other Party
  - Predefined Company Staff: 3 Directors (Abobakuru Qasim - Managing Director, Abdul Rasheed Ali - Director, Ziyad Rashadh - Director)
  - Partial payment support: Separate borrowed and paid amounts with different dates
  - Interest tracking: Mark entries with/without interest charges
  - Purpose and notes fields for each entry
- **Dashboard Capital Summary**: New section on main dashboard showing:
  - Overall totals: Total Borrowed, Total Paid, Outstanding Balance
  - Other Party Capital: Consolidated totals for all external sources
  - Company Staff Capital: Individual breakdown by person (borrowed/paid/balance per staff)
  - Staff Totals: Combined borrowed/paid/outstanding for all staff
- **Standalone System**: Capital tracking completely separate from profit/cost calculations
- **Full CRUD**: Create, read, update, delete capital entries with Firebase Firestore

### 🔧 Changed
- **StaffExpense.jsx**: Added Capital tab with source type selection, staff dropdown, capital table
- **Dashboard.jsx**: Added Capital Summary section with staff breakdown and Other Party consolidation
- **Chart Fix**: Monthly Revenue chart now uses submissionDeadline (due date) instead of submittedAt (logged date)

### 📁 New Files/Collections
- Firestore Collection: `capital` (stores all capital entries)

---

## [1.4.0] - 2026-04-03

### ✨ Added

#### Gazette URL Auto-Fetch
- **New API Endpoint**: `/api/fetch-gazette` for fetching tender data from Gazette URLs
- **Dhivehi to English Translation**: Dictionary-based translation with 150+ common tender terms
- **Auto-Populate Bid Form**: Fetches and fills tender details automatically
  - Title, authority, deadlines (submission/registration/opening/closing)
  - Contact info (email, phone), bid security, performance guarantee
  - Category, funding source, project name, eligibility criteria
- **Fetch Button**: Download icon button next to Gazette URL field in Bids.jsx

#### Financial Calculation Improvements
- **Additional Costs in Totals**: All bid value calculations now include additionalCosts
  - Dashboard stats, Finance page, Bids list totals
  - Revenue, cost, and profit calculations updated
- **Staff Expenses Deducted**: Net profit now subtracts total staff expenses
  - Dashboard netProfit calculation updated
  - Finance page budget summary updated
- **Monthly Profit by Submission Date**: Dashboard monthly chart now uses submissionDate/deadline (not createdAt)

### 🔧 Changed
- **Bids.jsx**: Added getAdditionalCostsTotal helper, totals include additional costs
- **Dashboard.jsx**: Added staffExpenses fetch, updated financial calculations, monthly data grouped by submission date
- **Finance.jsx**: Added staffExpenses fetch, updated budgetSummary to deduct expenses
- **API Consolidation**: Combined 3 notification endpoints into `/api/notifications/index.js`
- **Test Files Moved**: Moved test files from `api/` to `scripts/testing/` to reduce serverless function count

### 🐛 Fixed
- **Vercel Deployment**: Reduced API function count from 13+ to under 12 for Hobby plan
- **Notification API**: Consolidated subscribe/unsubscribe/new-bid into single endpoint

### 📁 New Files
```
business-watch/
├── api/
│   ├── fetch-gazette.js (new endpoint for Gazette URL fetching)
│   └── notifications/
│       └── index.js (consolidated notification endpoint)
└── scripts/testing/ (moved test files)
```

---

## [1.3.0] - 2026-04-02

### ✨ Added

#### Staff Expense Module
- **New Staff Expense Page**: Complete expense tracking system
  - Predefined types: Salary, Printing Charge, Binding, Laminating, Transport, Meals, Office Supplies, Utilities, Maintenance
  - User-defined custom expense types with localStorage persistence
  - Dashboard with 4 stat cards (Total, This Month, Staff Count, Entries)
  - Expense breakdown by type visualization
  - Staff-wise expense assignment
  - Search and filter by type
  - Firebase Firestore integration (`staffExpenses` collection)

#### Bid Lot Configuration
- **Lot Mode Toggle**: Choose between two lot configurations
  - "Many Items with One Lot": All items grouped under LOT 1
  - "Each Item with 1 Lot": Each item gets its own LOT number
- **Dynamic LOT Display**: Automatic LOT numbering based on selected mode
- **Enhanced Bid Items**: Individual cost, bid price, profit, and tax tracking per item
- **Additional Costs Section**: Commission, Installation, Boat Naal, Helpers Charge, Unloading Charge, Loading Charge, Tea/Dinner Charge, plus user-defined custom costs

#### Visual Updates
- **Logo Update**: Changed from PNG to JPEG format
- **Updated Logo Locations**: Login page, Footer, Sidebar
- **PWA Manifest**: Updated manifest.json to use new JPEG logo for app installation

#### Notification System
- **New Bid Email Alerts**: Automatic email notifications when new bids are created
  - API endpoint: `/api/notifications/new-bid`
  - Sends to all subscribed users
  - Includes bid title, amount, cost estimate, profit margin, and items count
  - Integrated into Bids.jsx handleSubmit
- **Email Templates**: New responsive HTML email template for bid notifications

### 📁 New Files
```
business-watch/
├── src/
│   └── pages/
│       └── StaffExpense.jsx (new page)
├── api/
│   └── notifications/
│       └── new-bid.js (new endpoint)
└── public/
    └── logo/
        └── logo.jpeg (updated logo)
```

### 🔧 Changed
- **Bids.jsx**: Added lotMode field to formData, lot configuration UI, dynamic LOT display, integrated bid notification API call
- **Sidebar.jsx**: Added Staff Expense navigation with Wallet icon
- **App.jsx**: Added Staff Expense route `/staff-expense`
- **manifest.json**: Updated all icon paths from logo.png to logo.jpeg
- **notificationService.js**: Added sendNewBidAlert() and generateNewBidEmail() functions

### 📊 Statistics
- **Total Pages**: 30+ pages
- **Navigation Items**: 27 sidebar items
- **Expense Types**: 9 predefined + unlimited custom
- **Notification Types**: 5 (deadline, bid opening, new tender, result update, new bid)

## [1.2.0] - 2026-03-31

### ✨ Added

#### Core Features
- **useData Hook**: New centralized data hook providing bids and tenders data across all pages
- **Auto Email Alerts**: Automatic email notifications for new tenders, deadline alerts, and bid openings
- **Subscriber Management**: Email subscription system with preference controls
- **GitHub Actions Cron Jobs**: Automated deadline checks and gazette scraping via GitHub Actions
- **Vercel Deployment**: Automated deployment pipeline via GitHub Actions

#### Tech Stack
- **Node.js Version**: Updated to Node.js 22 in GitHub Actions workflow

### 🔧 Changed

#### Data Architecture
- **Data Architecture**: Removed Hisaabu.json dependencies; all finance data now derived from bids
- **Mobile Responsiveness**: Removed sticky headers on all pages for better mobile UX
- **Finance Page**: Now uses useData hook instead of local accounting data
- **Cost Calculator**: Updated to use useData hook for item data

### 🐛 Fixed

#### Deployment Issues
- **Vercel Deployment**: Fixed deployment failure by hardcoding org/project IDs and removing Vercel cron jobs
- **JSON Parsing Errors**: Removed invalid Hisaabu_clean.json file causing build errors
- **Import Errors**: Fixed missing useData hook imports across pages
- **Mobile Overflow**: Fixed sticky header overflow issues on mobile devices

### 📦 Removed

#### Unused Files
- **Hisaabu Data Files**: Deleted Hisaabu.json and all related references
- **Vercel Cron Jobs**: Moved cron jobs to GitHub Actions (Hobby plan limitation)
- **Sticky Headers**: Removed sticky positioning from Bids page headers

## [1.1.0] - 2026-03-30

### ✨ Added

#### Gazette Tender Integration
- **43 Live Tenders** from gazette.gov.mv
  - IT Equipment: 17 tenders
  - Medical Equipment: 3 tenders
  - Office Supplies: 2 tenders
  - Construction: 3 tenders (including 58MW Power Plant)
  - 12 additional categories
- **Real-time Firebase Sync**: Firestore database integration
- **Dual Mode**: Firebase + Local JSON fallback
- **Advanced Search**: Search by title, authority, category
- **Deadline Alerts**: Automatic urgent deadline detection
- **Dhivehi Support**: Local language titles included

#### Firebase Services
- New `useTenders()` hook with Firebase + local fallback
- `tenderService.js` for Firebase CRUD operations
- `uploadTenders.js` script for bulk data upload
- Firestore security rules with public read access
- Firestore indexes for efficient queries

#### Data Management
- `working_file.json` with 43 structured tenders
- Metadata tracking (extracted_at, total count, source)
- Summary statistics by category
- Urgent deadlines array

### 🔧 Changed

#### Firebase Security Rules
- Updated to allow public read access to tenders
- Require authentication for writes
- Deployed to `bussiness-watch` project

#### Scripts
- Added `npm run upload-tenders` command

### 📁 New Files

```
business-watch/
├── data/
│   └── working_file.json (43 tenders)
├── scripts/
│   └── uploadTenders.js
├── src/
│   ├── hooks/
│   │   └── useTenders.js
│   └── services/
│       └── tenderService.js
├── firestore.rules
├── firestore.indexes.json
└── firebase.json
```

### 🔥 Urgent Tenders Today

| ID | Tender | Authority | Deadline |
|---|---|---|---|
| TND-2026-001 | 44 Monitors + 1 Laptop | IUM | March 30, 14:00 |
| TND-2026-002 | 40 Laptops | IUM | March 30, 14:00 |
| TND-2026-003 | 48 Computer Systems | IUM | March 30, 14:00 |

### 📊 Statistics

- **Total Tenders**: 43
- **Categories**: 18
- **Authorities**: 20+ different organizations
- **IT Tenders**: 17 (39.5%)
- **Urgent (7 days)**: 4 tenders

### 🔗 Data Sources

- Primary: https://gazette.gov.mv/iulaan
- 57 URLs processed
- 43 successfully extracted
- 14 failed (timeouts, 404s, expired)

## [1.0.0] - 2026-03-29

### ✨ Initial Release

#### Core Features
- Firebase Authentication (Email/Password)
- User Roles (Admin/Staff)
- Dashboard with statistics and charts
- Tender Management
- Bid Management with profit calculations
- Procurement System
- Supplier Management
- Delivery Tracking
- Document Management
- User Management
- Financial Overview

#### Tech Stack
- React 18 + Vite
- Firebase (Auth, Firestore, Storage)
- Tailwind CSS
- Recharts
- date-fns

#### Pages
- Login
- Dashboard
- Tenders
- Bids
- Quotations
- Procurement
- Suppliers
- Deliveries
- Documents
- Projects
- Users (Admin only)
- Data Upload
- Excel Data Upload
- Tender Sheets
- Quotes
- Finance

---

**Last Updated**: April 3, 2026
