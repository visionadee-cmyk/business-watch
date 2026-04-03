# Business Watch - Tender & Procurement Management System

A full-stack web application for managing Maldives government tenders, bids, procurement, and project tracking with real-time Firebase integration.

## 🌟 New Features (April 2026)

### Capital Tracking & Investment Management
- **Track Capital Sources**: Record borrowed amounts from Company Staff or Other Parties
- **3 Directors Predefined**: Abobakuru Qasim (Managing Director), Abdul Rasheed Ali (Director), Ziyad Rashadh (Director)
- **Source Categorization**: Separate tracking for Company Staff vs Other Party investments
- **Partial Payments**: Record borrowed and paid amounts separately with different dates
- **Interest Tracking**: Mark entries as having interest charges or not
- **Dashboard Integration**: Capital Summary appears on main dashboard with:
  - Total Borrowed, Paid, and Outstanding balances
  - Other Party Capital (consolidated total)
  - Company Staff Capital (individual breakdown by person)
- **Standalone**: Capital does NOT affect profit/cost calculations - completely separate tracking
- **Full CRUD**: Create, read, update, delete capital entries from Staff Expense > Capital tab

### Staff Expense Management
- **Track Staff Expenses**: Salary, printing, binding, laminating, and custom expense types
- **Expense Dashboard**: Visual statistics by type and time period
- **User-Defined Categories**: Add custom expense types with localStorage persistence
- **Staff-wise Tracking**: Assign expenses to specific staff members
- **Firebase Integration**: All data stored in Firestore with real-time sync

### Bid Lot Configuration
- **Flexible Lot Options**: Choose between "Many Items with One Lot" or "Each Item with 1 Lot"
- **Dynamic LOT Display**: Automatic LOT numbering based on selected mode
- **Per-Item Tracking**: Individual costs, bid prices, and profit calculations per item
- **Additional Costs**: Commission, installation, transport, and custom cost types

### Gazette URL Auto-Fetch
- **Paste Gazette URL**: When creating a bid, paste a Gazette link (e.g., `https://gazette.gov.mv/iulaan/384248`)
- **Auto-Populate Form**: System fetches tender details including:
  - Title (translated from Dhivehi to English)
  - Ministry/Authority name
  - Submission & registration deadlines
  - Contact information (email, phone)
  - Bid security and performance guarantee amounts
  - Tender category and funding source
- **Dhivehi Translation**: Built-in dictionary translates 150+ common tender terms
- **One-Click Fetch**: Download icon button next to Gazette URL field

### Financial Calculation Updates
- **Additional Costs in Totals**: Bid values now include additional costs (commission, installation, transport, etc.) in all statistics
- **Expenses Deducted from Profit**: Net profit calculations now subtract staff expenses
- **Monthly Profit by Submission Date**: Dashboard monthly charts group profit by bid submission date (not entry date)

### Notification System
- **Email Notifications**: Automatic email alerts when new bids are created
  - Sends to all subscribed users
  - Includes bid details, amount, and items count
  - Integration with notification preferences

## 🌟 Previous Features (March 2026)

### Gazette Tender Integration
- **43 Live Tenders**: Automatically scraped from gazette.gov.mv
- **Real-time Updates**: Firestore database with live tender data
- **Dual Mode**: Firebase + Local JSON fallback
- **Advanced Search**: Search by title, authority, category
- **Urgent Deadlines**: Automatic alerts for tenders closing soon

### Data Sources
| Source | Count | Status |
|---|---|---|
| Gazette (Live) | 43 tenders | ✅ Active |
| IUM Tenders | 3 | 🔥 Closing Today (March 30, 14:00) |
| IT Equipment | 17 | 📊 Most Popular Category |
| Construction | 3 | 🏗️ Including 58MW Power Plant |

## Features

### Core Modules
- **Authentication**: Firebase Email/Password login with Admin and Staff roles
- **Dashboard**: Key statistics, charts, recent activity, and deadline alerts
- **Tender Management**: Track Maldives government tenders with full details from Gazette
- **Bid Management**: Create bids with auto-calculated profit margins
- **Procurement System**: Manage purchases for won tenders
- **Supplier Management**: Store supplier information and track purchase history
- **Delivery Tracking**: Track delivery status and mark projects as completed
- **Document Management**: Upload and store tender documents, bid files, invoices
- **User Management**: Admin-only user creation and role management
- **Financial Overview**: Revenue tracking with charts and profit calculations

### Gazette Tender Features
- 🔍 **Search & Filter**: By category, authority, deadline
- 📅 **Deadline Alerts**: Visual indicators for urgent tenders
- 🔗 **Direct Links**: Gazette URLs and info sheets
- 📊 **Statistics**: Category breakdown, urgent deadlines summary
- 🌐 **Dhivehi Support**: Local language titles included

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Firebase (Firestore + Auth + Storage)
- **Database**: Cloud Firestore with real-time sync
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Prerequisites

- Node.js 18+ and npm
- Firebase account (free tier)
- Git

## Setup Instructions

### 1. Clone or Create Project

```bash
cd business-watch
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project" and name it "business-watch"
3. Enable the following services:
   - **Authentication**: Enable Email/Password sign-in method
   - **Firestore Database**: Create database in test mode
   - **Storage**: Enable and create default bucket

4. Get your Firebase configuration:
   - Go to Project Settings → General
   - Scroll to "Your apps" and click the web icon (</>)
   - Register app as "business-watch-web"
   - Copy the firebaseConfig object

### 4. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Replace the values with your actual Firebase configuration.

### 5. Firebase Security Rules

#### Firestore Rules
Go to Firestore Database → Rules and set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Storage Rules
Go to Storage → Rules and set:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Note: These rules allow any authenticated user to read/write. For production, implement proper role-based rules.

### 6. Create First Admin User

1. Start the development server:
```bash
npm run dev
```

2. Open http://localhost:5173

3. Click "Sign up" or use the Firebase Console to create a user

4. Manually set the user's role to "admin" in Firestore:
   - Go to Firestore Database
   - Create a collection called "users"
   - Create a document with the user's UID
   - Add fields: `name`, `email`, `role: "admin"`, `createdAt`

### 7. Run Locally

```bash
npm run dev
```

The app will be available at http://localhost:5173

## Building for Production

```bash
npm run build
```

This creates a `dist` folder with production-ready files.

## Deployment to Vercel

### Option 1: Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard or via CLI:
```bash
vercel env add VITE_FIREBASE_API_KEY
```

### Option 2: GitHub + Vercel Integration

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/business-watch.git
git push -u origin main
```

2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in Vercel project settings
5. Deploy

## Project Structure

```
business-watch/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Layout.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── Sidebar.jsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Tenders.jsx
│   │   ├── Bids.jsx
│   │   ├── Procurement.jsx
│   │   ├── Suppliers.jsx
│   │   ├── Deliveries.jsx
│   │   ├── Documents.jsx
│   │   └── Users.jsx
│   ├── services/        # Firebase services
│   │   └── firebase.js
│   ├── App.jsx
│   ├── firebaseConfig.js
│   ├── index.css
│   └── main.jsx
├── public/
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── .env
```

## Firebase Database Structure

### Collections

- **users**: `{ name, email, role, createdAt }`
- **tenders**: `{ tenderId, title, authority, description, category, publishedDate, submissionDeadline, estimatedBudget, status, documents[], createdAt }`
- **bids**: `{ tenderId, bidAmount, costEstimate, profitMargin, status, result, documents[], notes, createdAt }`
- **purchases**: `{ tenderId, itemName, quantity, supplierId, costPerUnit, totalCost, purchaseDate, status, notes, createdAt }`
- **suppliers**: `{ name, contactPerson, email, phone, address, itemsSupplied, notes, createdAt }`
- **deliveries**: `{ tenderId, itemName, quantity, status, expectedDate, deliveryDate, completed, notes, createdAt }`
- **documents**: `{ name, category, description, fileUrl, fileType, fileSize, storagePath, createdAt }`

## User Roles

- **Admin**: Full access to all features including user management and deletion
- **Staff**: Can view and create records, cannot delete or manage users

## Default Login

Create an admin user through Firebase console or registration, then manually set role to "admin" in Firestore.

## Troubleshooting

### Firebase permission errors
- Check Firestore and Storage rules are properly set
- Ensure user is authenticated

### Missing environment variables
- Verify `.env` file exists with all VITE_FIREBASE_* variables
- Restart dev server after adding env variables

### Build errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

**Last Updated**: April 3, 2026  
**Total Tenders**: 50+  
**Data Source**: https://gazette.gov.mv/iulaan

MIT License - feel free to use for your business.

## Support

For issues or questions:
1. Check Firebase console for errors
2. Verify environment variables
3. Check browser console for frontend errors
