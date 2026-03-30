# User Manual - Business Watch

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Tenders](#tenders)
4. [Bids](#bids)
5. [Procurement](#procurement)
6. [Reports](#reports)
7. [Administration](#administration)

---

## Getting Started

### Login

1. Open the application at `http://localhost:5173`
2. Enter your email and password
3. Click "Sign In"

**Default Roles:**
- **Admin**: Full system access
- **Staff**: Limited access (cannot delete or manage users)

### Navigation

The sidebar contains all main modules:
- Dashboard
- Tenders (Gazette + Internal)
- Bids
- Quotations
- Procurement
- Suppliers
- Deliveries
- Documents
- Projects
- Finance
- Users (Admin only)

---

## Dashboard

### Overview Cards

The dashboard displays key metrics:
- **Total Tenders**: 43 Gazette tenders
- **Active Bids**: Current bidding activities
- **Won Projects**: Successfully won tenders
- **Pending Deliveries**: Items awaiting delivery
- **Total Revenue**: Financial summary

### Urgent Alerts

**Today's Urgent Tenders (March 30, 2026):**
1. IUM - 44 Monitors + 1 Laptop (14:00)
2. IUM - 40 Laptops (14:00)
3. IUM - 48 Computer Systems (14:00)

### Charts

- Revenue by quarter
- Tenders by category
- Bid success rate
- Delivery status

---

## Tenders

### Viewing Tenders

The Tenders page shows all 43 Gazette tenders with:
- **ID**: TND-2026-XXX
- **Title**: Tender description
- **Authority**: Government organization
- **Category**: IT, Construction, Medical, etc.
- **Deadline**: Submission deadline
- **Status**: Open, Closed, Won, Lost

### Search & Filter

**Search by:**
- Title keywords
- Authority name
- Category
- Tender ID

**Filter by:**
- Category dropdown
- Status
- Deadline range

### Tender Details

Click any tender to view:
- Full description
- Requirements (quantities, specifications)
- Contact information
- Gazette URL (opens external link)
- Info Sheet URL (downloads PDF)
- Bid opening date/time
- Estimated budget
- Your bid amount (if any)

### Adding a Bid

1. Click on a tender
2. Click "Create Bid" button
3. Enter:
   - Your bid amount
   - Cost estimate
   - Notes
4. Save

The system calculates:
- Profit margin percentage
- Profit amount

---

## Bids

### Managing Bids

View all your bids with status:
- **Pending**: Bid submitted, waiting result
- **Won**: Successfully awarded
- **Lost**: Not awarded
- **Submitted**: Internal tracking

### Bid Calculator

When creating a bid:
```
Bid Amount: 235,000 MVR
Cost Estimate: 200,000 MVR
--------------------------------
Profit: 35,000 MVR (17.5%)
```

### Converting to Project

Winning a bid automatically creates a project for procurement tracking.

---

## Procurement

### Purchase Orders

For won tenders, create purchase orders:
1. Select the tender/project
2. Add items to purchase
3. Select suppliers
4. Track costs

### Supplier Selection

Choose from saved suppliers or add new:
- Supplier name
- Contact person
- Email/Phone
- Items they supply
- Historical pricing

### Cost Tracking

Track all procurement costs:
- Item costs
- Shipping
- Taxes
- Total project cost

---

## Reports

### Available Reports

1. **Tender Summary**
   - By category
   - By authority
   - By deadline

2. **Financial Reports**
   - Revenue by quarter
   - Profit margins
   - Cost breakdowns

3. **Performance Reports**
   - Bid success rate
   - Won vs Lost
   - Delivery performance

### Exporting Data

Export reports to:
- Excel (.xlsx)
- PDF
- CSV

---

## Administration (Admin Only)

### User Management

**Create New User:**
1. Go to Users page
2. Click "Add User"
3. Enter:
   - Name
   - Email
   - Password
   - Role (Admin/Staff)
4. Save

**Edit User:**
- Click user row
- Modify details
- Save changes

**Delete User:**
- Click delete icon
- Confirm deletion

### Data Upload

**Upload Gazette Tenders:**
```bash
npm run upload-tenders
```

This uploads all 43 tenders from `working_file.json` to Firebase.

**Upload Excel Data:**
1. Go to "Upload Excel" page
2. Select file type (Suppliers, Purchases, etc.)
3. Upload Excel file
4. Map columns
5. Import

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
1. IT Equipment (17)
2. Medical Equipment (3)
3. Construction (3)
4. Office Supplies (2)
5. Apparel/Uniform (2)

### Top Authorities

Tenders by organization:
1. Islamic University of Maldives (4)
2. Elections Commission (3)
3. Male City Council (2)
4. Ministry of Health (2)

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

---

## Quick Reference

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `Ctrl + K` | Search |
| `Esc` | Close modal |
| `Ctrl + S` | Save form |

### Common Tasks

| Task | Steps |
|---|---|
| View urgent tenders | Dashboard → Urgent Alerts |
| Search tenders | Tenders page → Search bar |
| Create bid | Tenders → Select tender → Create Bid |
| Upload data | Admin → Upload Excel / Run script |
| Export report | Reports → Select report → Export |

### Important Dates

**Urgent Deadlines**:
- March 30, 2026: 3 IUM tenders (14:00)
- April 2, 2026: Multiple deadlines
- April 5-9, 2026: Various submissions

### Contact

For technical issues:
1. Check this manual
2. Review README.md
3. Check CHANGELOG.md
4. Contact system administrator

---

**Document Version**: 1.1.0  
**Last Updated**: March 30, 2026  
**Total Tenders**: 43
