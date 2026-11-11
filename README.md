# SiteLedger — Construction Operations & Project Progress Platform

> **Tagline:** Every Site. Every Resource. Every Update.

SiteLedger is an enterprise-grade construction site operations and project progress management SaaS designed for contractors, builders, construction firms, and civil site engineers. It orchestrates multi-site supervision, daily progress reporting (DPR), labour attendance, material stock balances with negative-inventory prevention, expense budget utilization, milestone scheduling with weighted progress derivations, and quality issue resolution audits.

---

## 1. Key Capabilities & Feature Modules

1. **Executive Operations Dashboard**: Live KPI cards (Projects, Sites, DPRs filed today, Labour deployment headcount, Stock valuation, Delayed milestones, Open safety/quality issues, and Budget utilization gauge).
2. **Multi-Project & Multi-Site Hierarchy**: Full project CRUD with unique project code generation (`PRJ-2026-001`), approved budgets, contract values, and multiple active work zones/sites per project.
3. **Daily Progress Reports (DPR)**: The core civil engineering workflow. Multi-activity tracking with planned vs completed quantities, automated completion percentages, division-by-zero safeguards, weather conditions, working hours, equipment deployed, photographic evidence, and formal approval/rejection workflows with audit sign-offs.
4. **Labour & Attendance Management**: Workforce register across trades (Masons, Carpenters, Electricians, Plumbers, Machine Operators, etc.), daily roll call (Present, Half Day, Absent), automated wage cost calculations, and database constraint enforcement preventing duplicate daily entries.
5. **Material Inventory & Stock Control**: Commodities catalog (Cement, Steel Rebars, Sand, Aggregate, Bricks, etc.), inbound material receipts with supplier and invoice logs, consumption deductions linked to DPRs, live closing stock calculation (`Closing = Opening + Received - Consumed`), and strict prevention of accidental negative inventory.
6. **Project Expenses & Budget Utilization**: Real-time financial monitoring across Labour, Equipment Rental, Materials, Fuel, and Subcontractor claims. Live calculation of Approved Budget vs Recorded Expenditure and remaining balances.
7. **Tasks & Milestones**: Gantt-style progress tracking with start/target dates, priority levels, delay flags, and progress sliders.
8. **Planned vs Actual Progress Analytics Engine**: S-Curve cumulative progress visualization and transparent milestone-weighted progress percentage derivation.
9. **Site Issues & Non-Conformance Log**: Issue categorization (Equipment breakdown, Material shortage, Safety, Design clarification) with priority levels, photo evidence, and mandatory technical resolution notes before closure.
10. **Report Generation & Multi-Format Exports**: Certified print-ready HTML dossiers, browser Print-to-PDF, CSV data ledgers, and JSON archives.
11. **Role-Based Access Control (RBAC)**: Support for `ADMIN` (Contractor), `PROJECT_MANAGER`, and `SITE_ENGINEER` with Supabase Row Level Security (RLS) enforcement.
12. **Demo Mode**: Instant one-click reload of sample construction sites, workers, materials, and reports labeled as demo data.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, HTML5, Tailwind CSS v4, Lucide Icons, Motion
- **Visualizations**: Crisp, responsive SVG-based S-Curve progress graphs, labour distribution bar charts, and budget utilization radial gauges.
- **Backend & Database**: Supabase (PostgreSQL 15+), Supabase Auth, Row Level Security (RLS), Supabase Storage, Supabase Realtime
- **Offline / Local Engine**: Persistent reactive database store with constraint validation and transaction guards.

---

## 3. Folder Structure

```
SiteLedger/
├── index.html
├── package.json
├── metadata.json
├── README.md
├── supabase-schema.sql
├── .env.example
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   └── index.ts
│   ├── services/
│   │   ├── supabase.ts
│   │   ├── dbStore.ts
│   │   └── useSiteLedger.ts
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── Charts.tsx
│   │   │   └── GlobalSearchModal.tsx
│   │   ├── dashboard/
│   │   │   └── OverviewDashboard.tsx
│   │   ├── projects/
│   │   │   └── ProjectsView.tsx
│   │   ├── sites/
│   │   │   └── SitesView.tsx
│   │   ├── reports/
│   │   │   └── DailyReportsView.tsx
│   │   ├── labour/
│   │   │   └── LabourView.tsx
│   │   ├── inventory/
│   │   │   └── MaterialInventoryView.tsx
│   │   ├── expenses/
│   │   │   └── ExpensesView.tsx
│   │   ├── milestones/
│   │   │   └── MilestonesView.tsx
│   │   ├── analytics/
│   │   │   └── PlannedVsActualView.tsx
│   │   ├── issues/
│   │   │   └── SiteIssuesView.tsx
│   │   ├── exports/
│   │   │   └── ReportsExportView.tsx
│   │   ├── team/
│   │   │   └── TeamView.tsx
│   │   └── settings/
│   │       └── SettingsView.tsx
│   └── assets/
│       └── images/
```

---

## 4. Supabase Setup & SQL Schema Installation

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open `/supabase-schema.sql` from this repository.
4. Copy the entire file and execute it in the SQL Editor. This provisions:
   - All relational tables (`projects`, `sites`, `workers`, `attendance`, `daily_reports`, `report_activities`, `materials`, `material_transactions`, `expenses`, `milestones`, `site_issues`, `documents`, `activity_logs`).
   - Trigger `trg_protect_approved_reports`: prevents silent tampering with approved daily progress reports.
   - Trigger `trg_issue_resolution_check`: enforces mandatory resolution notes when closing site issues.
   - Stored Procedure `record_material_transaction`: atomically calculates current stock and throws an exception on negative inventory.
   - Row Level Security (RLS) policies enforcing role boundaries between `ADMIN`, `PROJECT_MANAGER`, and `SITE_ENGINEER`.

---

## 5. Environment Variables & Local Development

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### Local Development Commands:
```bash
# Install dependencies
npm install

# Start Vite dev server on port 3000
npm run dev

# Compile TypeScript & check code validity
npm run lint

# Build production bundle
npm run build
```

---

## 6. Netlify / Vercel Deployment

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the hosting provider's Environment Variables settings.
