/**
 * SiteLedger — Core Reactive Database & Construction Business Logic Store
 * Implements real validation rules, relational integrity, material stock calculations,
 * attendance constraint enforcement, and audit logs.
 */

import {
  Project,
  ConstructionSite,
  Worker,
  AttendanceRecord,
  DailyProgressReport,
  ReportActivity,
  Material,
  MaterialTransaction,
  MaterialStockBalance,
  ProjectExpense,
  Milestone,
  SiteIssue,
  SiteDocument,
  ActivityLog,
  UserProfile,
  UserRole,
  ConstructionKPIs,
} from '../types';

// Initial Users
export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin-01',
    fullName: 'Sarah Jenkins',
    email: 'sarah.jenkins@siteledger.build',
    role: 'ADMIN',
    phone: '+1 (555) 234-8901',
    avatarUrl: '',
    assignedProjectIds: ['prj-001', 'prj-002'],
    assignedSiteIds: ['site-001', 'site-002', 'site-003'],
  },
  {
    id: 'usr-pm-01',
    fullName: 'Michael Torres, P.E.',
    email: 'm.torres@siteledger.build',
    role: 'PROJECT_MANAGER',
    phone: '+1 (555) 789-1022',
    avatarUrl: '',
    assignedProjectIds: ['prj-001', 'prj-002'],
    assignedSiteIds: ['site-001', 'site-002', 'site-003'],
  },
  {
    id: 'usr-eng-01',
    fullName: 'Marcus Vance',
    email: 'm.vance@siteledger.build',
    role: 'SITE_ENGINEER',
    phone: '+1 (555) 432-6789',
    avatarUrl: '',
    assignedProjectIds: ['prj-001'],
    assignedSiteIds: ['site-001'],
  },
  {
    id: 'usr-eng-02',
    fullName: 'Elena Rostova',
    email: 'e.rostova@siteledger.build',
    role: 'SITE_ENGINEER',
    phone: '+1 (555) 345-9876',
    avatarUrl: '',
    assignedProjectIds: ['prj-001'],
    assignedSiteIds: ['site-002'],
  },
  {
    id: 'usr-eng-03',
    fullName: 'David Chen',
    email: 'd.chen@siteledger.build',
    role: 'SITE_ENGINEER',
    phone: '+1 (555) 654-3210',
    avatarUrl: '',
    assignedProjectIds: ['prj-002'],
    assignedSiteIds: ['site-003'],
  },
];

// Initial Projects
export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'prj-001',
    projectCode: 'PRJ-2026-001',
    name: 'Skyline Commercial Tower',
    description: '36-story mixed-use commercial office hub with 3-level underground parking and high-performance glass facade.',
    clientName: 'Apex Metro Investments Group',
    category: 'Commercial Construction',
    address: '450 North Grand Avenue',
    city: 'Chicago',
    state: 'IL',
    startDate: '2025-08-15',
    expectedEndDate: '2027-04-30',
    contractValue: 14500000,
    approvedBudget: 12200000,
    projectManagerId: 'usr-pm-01',
    projectManagerName: 'Michael Torres, P.E.',
    status: 'ACTIVE',
    imageUrl: '/src/assets/images/site_skyline_commercial_1794412319370.jpg',
    createdAt: '2025-08-01T08:00:00Z',
    updatedAt: '2026-11-10T14:30:00Z',
  },
  {
    id: 'prj-002',
    projectCode: 'PRJ-2026-002',
    name: 'Oakridge Green Residences',
    description: 'Phase 1 development of 120 luxury sustainable townhomes and residential garden blocks with underground utilities.',
    clientName: 'Oakridge Living Developments LLC',
    category: 'Residential Construction',
    address: '8800 Meadowbrook Boulevard',
    city: 'Austin',
    state: 'TX',
    startDate: '2025-11-01',
    expectedEndDate: '2026-12-15',
    contractValue: 8750000,
    approvedBudget: 7800000,
    projectManagerId: 'usr-pm-01',
    projectManagerName: 'Michael Torres, P.E.',
    status: 'ACTIVE',
    imageUrl: '/src/assets/images/site_residential_oakridge_1794412336445.jpg',
    createdAt: '2025-10-15T09:00:00Z',
    updatedAt: '2026-11-09T11:00:00Z',
  },
];

// Initial Sites
export const INITIAL_SITES: ConstructionSite[] = [
  {
    id: 'site-001',
    projectId: 'prj-001',
    siteCode: 'SITE-001-ALPHA',
    siteName: 'Tower Alpha Superstructure',
    address: '450 North Grand Avenue, Core Zone A',
    area: 'Levels 12-24 Slab & Columns',
    city: 'Chicago',
    siteEngineerId: 'usr-eng-01',
    siteEngineerName: 'Marcus Vance',
    startDate: '2025-09-01',
    status: 'ACTIVE',
    notes: 'Tower crane #1 and concrete pumping boom active. High-wind protocols enforced above level 15.',
    createdAt: '2025-08-20T08:00:00Z',
    updatedAt: '2026-11-10T09:00:00Z',
  },
  {
    id: 'site-002',
    projectId: 'prj-001',
    siteCode: 'SITE-002-PODIUM',
    siteName: 'Podium & Basement Works',
    address: '450 North Grand Avenue, Lower Plaza',
    area: 'Subgrade Levels B1-B3 & Retail Ring',
    city: 'Chicago',
    siteEngineerId: 'usr-eng-02',
    siteEngineerName: 'Elena Rostova',
    startDate: '2025-08-25',
    status: 'ACTIVE',
    notes: 'MEP rough-in underway. Waterproof membrane inspection scheduled for this week.',
    createdAt: '2025-08-20T08:00:00Z',
    updatedAt: '2026-11-10T10:00:00Z',
  },
  {
    id: 'site-003',
    projectId: 'prj-002',
    siteCode: 'SITE-003-OAK',
    siteName: 'Oakridge Block A & B',
    address: '8800 Meadowbrook Boulevard, Sector 1',
    area: 'Units 101-140 Framing & Roofing',
    city: 'Austin',
    siteEngineerId: 'usr-eng-03',
    siteEngineerName: 'David Chen',
    startDate: '2025-11-10',
    status: 'ACTIVE',
    notes: 'Timber framing 85% completed. Roofing trusses delivery arriving Thursday.',
    createdAt: '2025-10-20T08:00:00Z',
    updatedAt: '2026-11-08T15:00:00Z',
  },
];

// Initial Workers (15 realistic workers)
export const INITIAL_WORKERS: Worker[] = [
  { id: 'wrk-001', workerCode: 'WRK-101', fullName: 'Carlos Ramirez', category: 'Mason', contractorName: 'Vanguard Masonry Contractors', dailyWage: 280, contactNumber: '+1 555-101-2001', isActive: true, createdAt: '2025-08-01' },
  { id: 'wrk-002', workerCode: 'WRK-102', fullName: 'Mateo Gutierrez', category: 'Mason', contractorName: 'Vanguard Masonry Contractors', dailyWage: 260, contactNumber: '+1 555-101-2002', isActive: true, createdAt: '2025-08-01' },
  { id: 'wrk-003', workerCode: 'WRK-103', fullName: 'Liam O’Connor', category: 'Carpenter', contractorName: 'Apex Formwork & Timber', dailyWage: 310, contactNumber: '+1 555-101-2003', isActive: true, createdAt: '2025-08-01' },
  { id: 'wrk-004', workerCode: 'WRK-104', fullName: 'Sean Murphy', category: 'Carpenter', contractorName: 'Apex Formwork & Timber', dailyWage: 290, contactNumber: '+1 555-101-2004', isActive: true, createdAt: '2025-08-01' },
  { id: 'wrk-005', workerCode: 'WRK-105', fullName: 'Darnell Washington', category: 'Electrician', contractorName: 'VoltEdge Electrical Services', dailyWage: 340, contactNumber: '+1 555-101-2005', isActive: true, createdAt: '2025-08-05' },
  { id: 'wrk-006', workerCode: 'WRK-106', fullName: 'Anthony Rossi', category: 'Electrician', contractorName: 'VoltEdge Electrical Services', dailyWage: 320, contactNumber: '+1 555-101-2006', isActive: true, createdAt: '2025-08-05' },
  { id: 'wrk-007', workerCode: 'WRK-107', fullName: 'Vikram Patel', category: 'Plumber', contractorName: 'HydroFlow Mechanical Inc', dailyWage: 330, contactNumber: '+1 555-101-2007', isActive: true, createdAt: '2025-08-10' },
  { id: 'wrk-008', workerCode: 'WRK-108', fullName: 'Jackson Miller', category: 'Machine Operator', contractorName: 'HeavyLift Crane & Rigging', dailyWage: 380, contactNumber: '+1 555-101-2008', isActive: true, createdAt: '2025-08-12' },
  { id: 'wrk-009', workerCode: 'WRK-109', fullName: 'Robert Kowalski', category: 'Welder', contractorName: 'Precision Steelwork LLC', dailyWage: 350, contactNumber: '+1 555-101-2009', isActive: true, createdAt: '2025-08-15' },
  { id: 'wrk-010', workerCode: 'WRK-110', fullName: 'Jamal Crawford', category: 'Supervisor', contractorName: 'SiteLedger Direct Ops', dailyWage: 420, contactNumber: '+1 555-101-2010', isActive: true, createdAt: '2025-08-01' },
  { id: 'wrk-011', workerCode: 'WRK-111', fullName: 'Jose Hernandez', category: 'General Labour', contractorName: 'Tri-County Labor Solutions', dailyWage: 200, contactNumber: '+1 555-101-2011', isActive: true, createdAt: '2025-08-20' },
  { id: 'wrk-012', workerCode: 'WRK-112', fullName: 'Alejandro Morales', category: 'General Labour', contractorName: 'Tri-County Labor Solutions', dailyWage: 200, contactNumber: '+1 555-101-2012', isActive: true, createdAt: '2025-08-20' },
  { id: 'wrk-013', workerCode: 'WRK-113', fullName: 'Manuel Santos', category: 'General Labour', contractorName: 'Tri-County Labor Solutions', dailyWage: 200, contactNumber: '+1 555-101-2013', isActive: true, createdAt: '2025-08-20' },
  { id: 'wrk-014', workerCode: 'WRK-114', fullName: 'Lucas Bennett', category: 'Painter', contractorName: 'ProCoat Finishes Ltd', dailyWage: 270, contactNumber: '+1 555-101-2014', isActive: true, createdAt: '2025-09-01' },
  { id: 'wrk-015', workerCode: 'WRK-115', fullName: 'Andrei Petrov', category: 'Welder', contractorName: 'Precision Steelwork LLC', dailyWage: 350, contactNumber: '+1 555-101-2015', isActive: true, createdAt: '2025-09-05' },
];

// Initial Materials Catalog
export const INITIAL_MATERIALS: Material[] = [
  { id: 'mat-001', materialCode: 'MAT-CEM-01', materialName: 'Portland Cement (Type I/II 50kg)', category: 'Cement', unit: 'Bags', minimumStock: 300, unitCost: 14.50, createdAt: '2025-08-01' },
  { id: 'mat-002', materialCode: 'MAT-STL-01', materialName: 'TMT Steel Rebar (Grade 60, 16mm/20mm)', category: 'Steel', unit: 'Tonnes', minimumStock: 15, unitCost: 920.00, createdAt: '2025-08-01' },
  { id: 'mat-003', materialCode: 'MAT-SND-01', materialName: 'Washed Concrete Coarse Sand', category: 'Sand', unit: 'm³', minimumStock: 80, unitCost: 45.00, createdAt: '2025-08-01' },
  { id: 'mat-004', materialCode: 'MAT-AGG-01', materialName: 'Crushed Stone Aggregate 20mm', category: 'Aggregate', unit: 'Tonnes', minimumStock: 100, unitCost: 38.00, createdAt: '2025-08-01' },
  { id: 'mat-005', materialCode: 'MAT-BRK-01', materialName: 'Engineered Red Facing Bricks', category: 'Bricks', unit: 'Pcs', minimumStock: 5000, unitCost: 0.95, createdAt: '2025-08-05' },
  { id: 'mat-006', materialCode: 'MAT-ELE-01', materialName: 'EMT Conduit 1-inch (10ft pipe)', category: 'Electrical Supplies', unit: 'Pcs', minimumStock: 200, unitCost: 18.25, createdAt: '2025-08-10' },
  { id: 'mat-007', materialCode: 'MAT-PLM-01', materialName: 'Schedule 40 PVC Drainage Pipe 4-inch', category: 'Plumbing Supplies', unit: 'Pcs', minimumStock: 120, unitCost: 32.00, createdAt: '2025-08-10' },
];

// Initial Material Transactions
export const INITIAL_MATERIAL_TRANSACTIONS: MaterialTransaction[] = [
  // Receipts
  { id: 'mtx-001', materialId: 'mat-001', materialName: 'Portland Cement (Type I/II 50kg)', materialCategory: 'Cement', unit: 'Bags', projectId: 'prj-001', siteId: 'site-001', transactionType: 'RECEIPT', quantity: 800, unitCost: 14.50, totalCost: 11600, supplier: 'Midwest Ready-Mix & Cement', invoiceReference: 'INV-CEM-8910', transactionDate: '2026-11-01', storageLocation: 'Shed A - Dry Bay 2', recordedBy: 'usr-eng-01', notes: 'Delivered in shrink-wrapped pallets, batch inspected.', createdAt: '2026-11-01T08:30:00Z' },
  { id: 'mtx-002', materialId: 'mat-002', materialName: 'TMT Steel Rebar (Grade 60, 16mm/20mm)', materialCategory: 'Steel', unit: 'Tonnes', projectId: 'prj-001', siteId: 'site-001', transactionType: 'RECEIPT', quantity: 45, unitCost: 920.00, totalCost: 41400, supplier: 'Great Lakes Steel Mills', invoiceReference: 'INV-STL-4022', transactionDate: '2026-11-02', storageLocation: 'Rebar Staging Yard West', recordedBy: 'usr-eng-01', notes: 'Mill test certificates verified for ASTM A615 Grade 60.', createdAt: '2026-11-02T10:00:00Z' },
  { id: 'mtx-003', materialId: 'mat-003', materialName: 'Washed Concrete Coarse Sand', materialCategory: 'Sand', unit: 'm³', projectId: 'prj-001', siteId: 'site-001', transactionType: 'RECEIPT', quantity: 180, unitCost: 45.00, totalCost: 8100, supplier: 'Illinois River Quarries', invoiceReference: 'INV-AGG-1109', transactionDate: '2026-11-03', storageLocation: 'Bunker 1', recordedBy: 'usr-eng-01', notes: 'Sieve analysis passed.', createdAt: '2026-11-03T09:15:00Z' },
  { id: 'mtx-004', materialId: 'mat-005', materialName: 'Engineered Red Facing Bricks', materialCategory: 'Bricks', unit: 'Pcs', projectId: 'prj-002', siteId: 'site-003', transactionType: 'RECEIPT', quantity: 12000, unitCost: 0.95, totalCost: 11400, supplier: 'Texas Clay Works LLC', invoiceReference: 'INV-TCW-6504', transactionDate: '2026-11-04', storageLocation: 'Site 3 Staging Area', recordedBy: 'usr-eng-03', notes: 'First shipment of architectural brick facade.', createdAt: '2026-11-04T11:00:00Z' },
  // Consumptions
  { id: 'mtx-005', materialId: 'mat-001', materialName: 'Portland Cement (Type I/II 50kg)', materialCategory: 'Cement', unit: 'Bags', projectId: 'prj-001', siteId: 'site-001', transactionType: 'CONSUMPTION', quantity: 240, unitCost: 14.50, totalCost: 3480, transactionDate: '2026-11-08', linkedReportId: 'dpr-001', storageLocation: 'Shed A - Dry Bay 2', recordedBy: 'usr-eng-01', notes: 'Level 14 core shear wall pour.', createdAt: '2026-11-08T17:00:00Z' },
  { id: 'mtx-006', materialId: 'mat-002', materialName: 'TMT Steel Rebar (Grade 60, 16mm/20mm)', materialCategory: 'Steel', unit: 'Tonnes', projectId: 'prj-001', siteId: 'site-001', transactionType: 'CONSUMPTION', quantity: 12, unitCost: 920.00, totalCost: 11040, transactionDate: '2026-11-08', linkedReportId: 'dpr-001', storageLocation: 'Rebar Staging Yard West', recordedBy: 'usr-eng-01', notes: 'Tied columns and beam reinforcement.', createdAt: '2026-11-08T17:15:00Z' },
  { id: 'mtx-007', materialId: 'mat-005', materialName: 'Engineered Red Facing Bricks', materialCategory: 'Bricks', unit: 'Pcs', projectId: 'prj-002', siteId: 'site-003', transactionType: 'CONSUMPTION', quantity: 3200, unitCost: 0.95, totalCost: 3040, transactionDate: '2026-11-09', linkedReportId: 'dpr-002', storageLocation: 'Site 3 Staging Area', recordedBy: 'usr-eng-03', notes: 'Block A South Elevation Masonry.', createdAt: '2026-11-09T16:30:00Z' },
];

// Initial Attendance Records (for realistic today/recent logs)
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-001', workerId: 'wrk-001', workerName: 'Carlos Ramirez', workerCategory: 'Mason', contractorName: 'Vanguard Masonry Contractors', projectId: 'prj-001', siteId: 'site-001', attendanceDate: '2026-11-10', status: 'PRESENT', workingHours: 8.5, dailyCost: 297.5, recordedBy: 'usr-eng-01', createdAt: '2026-11-10T07:15:00Z' },
  { id: 'att-002', workerId: 'wrk-002', workerName: 'Mateo Gutierrez', workerCategory: 'Mason', contractorName: 'Vanguard Masonry Contractors', projectId: 'prj-001', siteId: 'site-001', attendanceDate: '2026-11-10', status: 'PRESENT', workingHours: 8.0, dailyCost: 260.0, recordedBy: 'usr-eng-01', createdAt: '2026-11-10T07:15:00Z' },
  { id: 'att-003', workerId: 'wrk-003', workerName: 'Liam O’Connor', workerCategory: 'Carpenter', contractorName: 'Apex Formwork & Timber', projectId: 'prj-001', siteId: 'site-001', attendanceDate: '2026-11-10', status: 'PRESENT', workingHours: 8.0, dailyCost: 310.0, recordedBy: 'usr-eng-01', createdAt: '2026-11-10T07:20:00Z' },
  { id: 'att-004', workerId: 'wrk-004', workerName: 'Sean Murphy', workerCategory: 'Carpenter', contractorName: 'Apex Formwork & Timber', projectId: 'prj-001', siteId: 'site-001', attendanceDate: '2026-11-10', status: 'HALF DAY', workingHours: 4.0, dailyCost: 145.0, recordedBy: 'usr-eng-01', createdAt: '2026-11-10T07:20:00Z' },
  { id: 'att-005', workerId: 'wrk-008', workerName: 'Jackson Miller', workerCategory: 'Machine Operator', contractorName: 'HeavyLift Crane & Rigging', projectId: 'prj-001', siteId: 'site-001', attendanceDate: '2026-11-10', status: 'PRESENT', workingHours: 9.0, dailyCost: 427.5, recordedBy: 'usr-eng-01', createdAt: '2026-11-10T07:05:00Z' },
  { id: 'att-006', workerId: 'wrk-009', workerName: 'Robert Kowalski', workerCategory: 'Welder', contractorName: 'Precision Steelwork LLC', projectId: 'prj-001', siteId: 'site-001', attendanceDate: '2026-11-10', status: 'PRESENT', workingHours: 8.0, dailyCost: 350.0, recordedBy: 'usr-eng-01', createdAt: '2026-11-10T07:25:00Z' },
  { id: 'att-007', workerId: 'wrk-010', workerName: 'Jamal Crawford', workerCategory: 'Supervisor', contractorName: 'SiteLedger Direct Ops', projectId: 'prj-001', siteId: 'site-001', attendanceDate: '2026-11-10', status: 'PRESENT', workingHours: 9.0, dailyCost: 472.5, recordedBy: 'usr-eng-01', createdAt: '2026-11-10T07:00:00Z' },
  { id: 'att-008', workerId: 'wrk-011', workerName: 'Jose Hernandez', workerCategory: 'General Labour', contractorName: 'Tri-County Labor Solutions', projectId: 'prj-001', siteId: 'site-001', attendanceDate: '2026-11-10', status: 'PRESENT', workingHours: 8.0, dailyCost: 200.0, recordedBy: 'usr-eng-01', createdAt: '2026-11-10T07:30:00Z' },
  { id: 'att-009', workerId: 'wrk-012', workerName: 'Alejandro Morales', workerCategory: 'General Labour', contractorName: 'Tri-County Labor Solutions', projectId: 'prj-001', siteId: 'site-001', attendanceDate: '2026-11-10', status: 'PRESENT', workingHours: 8.0, dailyCost: 200.0, recordedBy: 'usr-eng-01', createdAt: '2026-11-10T07:30:00Z' },
  { id: 'att-010', workerId: 'wrk-013', workerName: 'Manuel Santos', workerCategory: 'General Labour', contractorName: 'Tri-County Labor Solutions', projectId: 'prj-001', siteId: 'site-001', attendanceDate: '2026-11-10', status: 'ABSENT', workingHours: 0.0, dailyCost: 0.0, recordedBy: 'usr-eng-01', createdAt: '2026-11-10T08:00:00Z' },
  // Site 003 attendance
  { id: 'att-011', workerId: 'wrk-005', workerName: 'Darnell Washington', workerCategory: 'Electrician', contractorName: 'VoltEdge Electrical Services', projectId: 'prj-002', siteId: 'site-003', attendanceDate: '2026-11-10', status: 'PRESENT', workingHours: 8.0, dailyCost: 340.0, recordedBy: 'usr-eng-03', createdAt: '2026-11-10T07:45:00Z' },
  { id: 'att-012', workerId: 'wrk-007', workerName: 'Vikram Patel', workerCategory: 'Plumber', contractorName: 'HydroFlow Mechanical Inc', projectId: 'prj-002', siteId: 'site-003', attendanceDate: '2026-11-10', status: 'PRESENT', workingHours: 8.0, dailyCost: 330.0, recordedBy: 'usr-eng-03', createdAt: '2026-11-10T07:50:00Z' },
];

// Initial Daily Progress Reports
export const INITIAL_DAILY_REPORTS: DailyProgressReport[] = [
  {
    id: 'dpr-001',
    reportCode: 'DPR-2026-1108-01',
    projectId: 'prj-001',
    siteId: 'site-001',
    projectName: 'Skyline Commercial Tower',
    siteName: 'Tower Alpha Superstructure',
    submittedBy: 'usr-eng-01',
    engineerName: 'Marcus Vance',
    reportDate: '2026-11-08',
    weather: 'Clear, 22°C (Wind: 14 km/h SW)',
    workingHours: 9.0,
    siteConditions: 'Dry, firm ground conditions. Concrete pumps positioned at bay 3.',
    labourCount: 28,
    equipmentUsed: 'Liebherr 280 EC-H Tower Crane, Putzmeister 47Z Boom Pump, 2x Wacker Plate Compactors',
    remarks: 'Concrete slab casting on Level 14 completed ahead of schedule. Cylinder compression test samples labeled and cured.',
    status: 'APPROVED',
    reviewedBy: 'usr-pm-01',
    reviewedByName: 'Michael Torres, P.E.',
    reviewedAt: '2026-11-09T08:30:00Z',
    reviewNotes: 'Verified cylinder batch tickets against mix design C40. Quantities approved.',
    activities: [
      { id: 'act-001', activityName: 'Concrete Slab Casting (Level 14 Core)', plannedQuantity: 120, completedQuantity: 120, unit: 'm³', progressPercentage: 100, remarks: 'Mix C40/50 placed continuously without cold joints.' },
      { id: 'act-002', activityName: 'Column Rebar Reinforcement Tie-off', plannedQuantity: 16, completedQuantity: 14, unit: 'Tonnes', progressPercentage: 87.5, remarks: 'Remaining 2 columns to be completed tomorrow morning.' },
      { id: 'act-003', activityName: 'Doka Formwork Shoring Inspection', plannedQuantity: 850, completedQuantity: 850, unit: 'sq ft', progressPercentage: 100, remarks: 'Safety sign-off granted by third-party surveyor.' },
    ],
    photographicEvidence: [
      '/src/assets/images/site_inspection_concrete_1794412352346.jpg',
      '/src/assets/images/site_skyline_commercial_1794412319370.jpg',
    ],
    createdAt: '2026-11-08T18:00:00Z',
    updatedAt: '2026-11-09T08:30:00Z',
  },
  {
    id: 'dpr-002',
    reportCode: 'DPR-2026-1109-02',
    projectId: 'prj-002',
    siteId: 'site-003',
    projectName: 'Oakridge Green Residences',
    siteName: 'Oakridge Block A & B',
    submittedBy: 'usr-eng-03',
    engineerName: 'David Chen',
    reportDate: '2026-11-09',
    weather: 'Partly Cloudy, 24°C',
    workingHours: 8.0,
    siteConditions: 'Good. Scaffolding tagged green and approved for 3 storeys.',
    labourCount: 18,
    equipmentUsed: 'JCB Telehandler 540-140, Mortar Mixer 400L',
    remarks: 'Facing brickwork progressing steadily across South elevations. Timber trusses alignment checked.',
    status: 'SUBMITTED',
    activities: [
      { id: 'act-004', activityName: 'Architectural Facing Brickwork', plannedQuantity: 500, completedQuantity: 380, unit: 'sq ft', progressPercentage: 76.0, remarks: 'Cavity insulation ties installed per engineering drawing D-104.' },
      { id: 'act-005', activityName: 'Roof Truss Placement (Block A)', plannedQuantity: 24, completedQuantity: 20, unit: 'Pcs', progressPercentage: 83.3, remarks: 'Wind bracing fixed on northern slope.' },
      { id: 'act-006', activityName: 'Rough-in Electrical Conduits (Units 105-108)', plannedQuantity: 4, completedQuantity: 4, unit: 'Units', progressPercentage: 100, remarks: 'Inspected by certified master electrician.' },
    ],
    photographicEvidence: [
      '/src/assets/images/site_residential_oakridge_1794412336445.jpg',
    ],
    createdAt: '2026-11-09T17:45:00Z',
    updatedAt: '2026-11-09T17:45:00Z',
  },
  {
    id: 'dpr-003',
    reportCode: 'DPR-2026-1110-03',
    projectId: 'prj-001',
    siteId: 'site-002',
    projectName: 'Skyline Commercial Tower',
    siteName: 'Podium & Basement Works',
    submittedBy: 'usr-eng-02',
    engineerName: 'Elena Rostova',
    reportDate: '2026-11-10',
    weather: 'Overcast, 18°C',
    workingHours: 8.0,
    siteConditions: 'Underground ventilation running continuously. Moisture levels within tolerance.',
    labourCount: 14,
    equipmentUsed: 'Scissor Lift Skyjack 4632, Pipe Threading Machine',
    remarks: 'Basement fire sprinkler loop pressurized to 200 psi hydrotest. Zero pressure drop after 4 hours.',
    status: 'SUBMITTED',
    activities: [
      { id: 'act-007', activityName: 'Fire Sprinkler Main Pipe Installation', plannedQuantity: 180, completedQuantity: 175, unit: 'm', progressPercentage: 97.2, remarks: 'Hydrostatic pressure test passed with city inspector present.' },
      { id: 'act-008', activityName: 'HVAC Ductwork Hanging (Basement B1)', plannedQuantity: 240, completedQuantity: 190, unit: 'sq ft', progressPercentage: 79.17, remarks: 'Awaiting specialized vibration dampener brackets.' },
    ],
    photographicEvidence: [],
    createdAt: '2026-11-10T17:10:00Z',
    updatedAt: '2026-11-10T17:10:00Z',
  },
];

// Initial Project Expenses
export const INITIAL_EXPENSES: ProjectExpense[] = [
  { id: 'exp-001', expenseCode: 'EXP-2026-001', projectId: 'prj-001', siteId: 'site-001', category: 'Equipment Rental', description: 'Monthly lease for Liebherr 280 EC-H Tower Crane (November)', amount: 48500, vendor: 'HeavyLift Tower Cranes USA', invoiceReference: 'INV-HL-9921', expenseDate: '2026-11-01', paymentStatus: 'PAID', approvalStatus: 'APPROVED', approvedBy: 'usr-admin-01', approvedAt: '2026-11-02T10:00:00Z', receiptUrl: '', createdBy: 'usr-pm-01', createdAt: '2026-11-01T11:00:00Z' },
  { id: 'exp-002', expenseCode: 'EXP-2026-002', projectId: 'prj-001', siteId: 'site-001', category: 'Materials', description: 'Ready-mix concrete delivery 120m³ (Level 14 pour)', amount: 24600, vendor: 'Midwest Ready-Mix & Cement', invoiceReference: 'INV-CEM-8910', expenseDate: '2026-11-08', paymentStatus: 'PAID', approvalStatus: 'APPROVED', approvedBy: 'usr-admin-01', approvedAt: '2026-11-09T09:00:00Z', receiptUrl: '', createdBy: 'usr-pm-01', createdAt: '2026-11-08T18:30:00Z' },
  { id: 'exp-003', expenseCode: 'EXP-2026-003', projectId: 'prj-001', siteId: 'site-001', category: 'Labour', description: 'Weekly contractor payroll payout - Formwork & Steel fixing crew', amount: 32400, vendor: 'Apex Formwork & Timber', invoiceReference: 'PAY-APEX-W45', expenseDate: '2026-11-07', paymentStatus: 'PAID', approvalStatus: 'APPROVED', approvedBy: 'usr-admin-01', approvedAt: '2026-11-07T16:00:00Z', receiptUrl: '', createdBy: 'usr-admin-01', createdAt: '2026-11-07T14:00:00Z' },
  { id: 'exp-004', expenseCode: 'EXP-2026-004', projectId: 'prj-001', siteId: 'site-001', category: 'Fuel', description: 'Ultra-low sulfur off-road diesel (1,500 gallons) for backup generator & cranes', amount: 5850, vendor: 'Pioneer Fuel Logistics', invoiceReference: 'INV-PFL-8301', expenseDate: '2026-11-05', paymentStatus: 'PAID', approvalStatus: 'APPROVED', approvedBy: 'usr-pm-01', approvedAt: '2026-11-05T14:30:00Z', receiptUrl: '', createdBy: 'usr-eng-01', createdAt: '2026-11-05T12:00:00Z' },
  { id: 'exp-005', expenseCode: 'EXP-2026-005', projectId: 'prj-002', siteId: 'site-003', category: 'Materials', description: 'Facing bricks shipment 12,000 units', amount: 11400, vendor: 'Texas Clay Works LLC', invoiceReference: 'INV-TCW-6504', expenseDate: '2026-11-04', paymentStatus: 'PENDING', approvalStatus: 'APPROVED', approvedBy: 'usr-admin-01', approvedAt: '2026-11-05T09:00:00Z', receiptUrl: '', createdBy: 'usr-pm-01', createdAt: '2026-11-04T12:00:00Z' },
  { id: 'exp-006', expenseCode: 'EXP-2026-006', projectId: 'prj-001', siteId: 'site-002', category: 'Subcontractor Payments', description: 'Progress claim #3 - Basement fire suppression & mechanical rough-in', amount: 62000, vendor: 'HydroFlow Mechanical Inc', invoiceReference: 'CLM-HF-03', expenseDate: '2026-11-10', paymentStatus: 'PENDING', approvalStatus: 'PENDING', receiptUrl: '', createdBy: 'usr-pm-01', createdAt: '2026-11-10T11:00:00Z' },
];

// Initial Milestones (with weights and planned vs actual progress)
export const INITIAL_MILESTONES: Milestone[] = [
  // Project 1 Milestones
  { id: 'mls-001', projectId: 'prj-001', siteId: 'site-001', title: 'Deep Piling & Substructure Foundation', description: 'Driven steel piles and 2.5m thick raft foundation pour with waterproofing.', assignedTo: 'usr-eng-01', assignedToName: 'Marcus Vance', plannedStart: '2025-08-15', plannedEnd: '2025-12-15', actualCompletion: '2025-12-10', plannedProgress: 100, actualProgress: 100, weight: 20, priority: 'CRITICAL', status: 'COMPLETED', createdAt: '2025-08-15' },
  { id: 'mls-002', projectId: 'prj-001', siteId: 'site-001', title: 'Tower Superstructure Framing (Levels 1 to 20)', description: 'Reinforced concrete shear walls, post-tensioned floor slabs, and crane jumps.', assignedTo: 'usr-eng-01', assignedToName: 'Marcus Vance', plannedStart: '2025-12-16', plannedEnd: '2026-12-31', plannedProgress: 80, actualProgress: 72, weight: 35, priority: 'CRITICAL', status: 'IN PROGRESS', isDelayed: true, daysDelayed: 12, createdAt: '2025-12-15' },
  { id: 'mls-003', projectId: 'prj-001', siteId: 'site-002', title: 'Podium MEP & Utility Plant Rooms', description: 'Central chiller plant, switchgear, transformer vaults, and main riser ducts.', assignedTo: 'usr-eng-02', assignedToName: 'Elena Rostova', plannedStart: '2026-02-01', plannedEnd: '2026-11-30', plannedProgress: 90, actualProgress: 85, weight: 20, priority: 'HIGH', status: 'IN PROGRESS', createdAt: '2026-02-01' },
  { id: 'mls-004', projectId: 'prj-001', siteId: 'site-001', title: 'Curtain Wall Facade & Glazing Installation', description: 'Unitized double-glazed thermal curtain wall panels on lower 15 levels.', assignedTo: 'usr-eng-01', assignedToName: 'Marcus Vance', plannedStart: '2026-07-01', plannedEnd: '2027-02-28', plannedProgress: 35, actualProgress: 25, weight: 15, priority: 'HIGH', status: 'IN PROGRESS', isDelayed: true, daysDelayed: 18, createdAt: '2026-06-15' },
  { id: 'mls-005', projectId: 'prj-001', siteId: 'site-001', title: 'Interior Fit-out & Commissioning', description: 'Drywall, acoustic ceiling, tenant floor finishes, and elevator certification.', assignedTo: 'usr-pm-01', assignedToName: 'Michael Torres, P.E.', plannedStart: '2026-10-01', plannedEnd: '2027-04-30', plannedProgress: 10, actualProgress: 5, weight: 10, priority: 'MEDIUM', status: 'IN PROGRESS', createdAt: '2026-09-01' },
  // Project 2 Milestones
  { id: 'mls-006', projectId: 'prj-002', siteId: 'site-003', title: 'Site Civil Grading & Roadway Infrastructure', description: 'Stormwater retention pond, sewer trunks, and concrete curbs.', assignedTo: 'usr-eng-03', assignedToName: 'David Chen', plannedStart: '2025-11-01', plannedEnd: '2026-02-28', actualCompletion: '2026-02-20', plannedProgress: 100, actualProgress: 100, weight: 25, priority: 'HIGH', status: 'COMPLETED', createdAt: '2025-11-01' },
  { id: 'mls-007', projectId: 'prj-002', siteId: 'site-003', title: 'Block A Framing & Building Envelope', description: 'Engineered wood framing, moisture barrier, and brick masonry facade.', assignedTo: 'usr-eng-03', assignedToName: 'David Chen', plannedStart: '2026-03-01', plannedEnd: '2026-10-15', plannedProgress: 95, actualProgress: 88, weight: 40, priority: 'CRITICAL', status: 'IN PROGRESS', isDelayed: true, daysDelayed: 8, createdAt: '2026-03-01' },
  { id: 'mls-008', projectId: 'prj-002', siteId: 'site-003', title: 'Interior Drywall & Trim Finishes', description: 'Level 4 drywall finish, cabinetry, tile flooring, and fixtures.', assignedTo: 'usr-eng-03', assignedToName: 'David Chen', plannedStart: '2026-08-01', plannedEnd: '2026-12-15', plannedProgress: 45, actualProgress: 40, weight: 35, priority: 'MEDIUM', status: 'IN PROGRESS', createdAt: '2026-07-15' },
];

// Initial Site Issues
export const INITIAL_SITE_ISSUES: SiteIssue[] = [
  {
    id: 'iss-001',
    issueCode: 'ISS-2026-001',
    projectId: 'prj-001',
    siteId: 'site-001',
    title: 'Tower Crane #1 Hydraulic Hoist Seal Seepage',
    description: 'Lead rigger noticed minor hydraulic fluid weeping around main winch hydraulic motor during morning pre-lift inspection. Crane flagged for immediate mechanic review before heavy structural lifts.',
    category: 'Equipment Breakdown',
    priority: 'HIGH',
    reportedBy: 'usr-eng-01',
    reportedByName: 'Marcus Vance',
    assignedTo: 'usr-pm-01',
    assignedToName: 'Michael Torres, P.E.',
    targetDate: '2026-11-12',
    status: 'IN PROGRESS',
    photographicEvidence: ['/src/assets/images/site_skyline_commercial_1794412319370.jpg'],
    createdAt: '2026-11-09T08:15:00Z',
    updatedAt: '2026-11-09T14:00:00Z',
  },
  {
    id: 'iss-002',
    issueCode: 'ISS-2026-002',
    projectId: 'prj-001',
    siteId: 'site-002',
    title: 'Discrepancy in MEP Chilled Water Pipe Invert Levels',
    description: 'Collision detected between 10-inch chilled water supply pipe and storm overflow box at column grid G-14. Requires structural engineer design clarification before coring through beam.',
    category: 'Design Clarification',
    priority: 'CRITICAL',
    reportedBy: 'usr-eng-02',
    reportedByName: 'Elena Rostova',
    assignedTo: 'usr-pm-01',
    assignedToName: 'Michael Torres, P.E.',
    targetDate: '2026-11-14',
    status: 'UNDER REVIEW',
    createdAt: '2026-11-08T11:30:00Z',
    updatedAt: '2026-11-08T11:30:00Z',
  },
  {
    id: 'iss-003',
    issueCode: 'ISS-2026-003',
    projectId: 'prj-002',
    siteId: 'site-003',
    title: 'Temporary Portland Cement Shipment Delay (Rain Road Washout)',
    description: 'Heavy rain in northern quarry corridor delayed 400-bag cement delivery by 36 hours. Borrowed 80 bags from nearby contractor depot to prevent stoppage of Block A masonry.',
    category: 'Material Shortage',
    priority: 'MEDIUM',
    reportedBy: 'usr-eng-03',
    reportedByName: 'David Chen',
    assignedTo: 'usr-eng-03',
    assignedToName: 'David Chen',
    targetDate: '2026-11-07',
    status: 'RESOLVED',
    resolutionNotes: 'Quarry trucks arrived at 14:00. Stock restored and borrowed bags returned. Zero downtime on masonry lines.',
    resolvedAt: '2026-11-07T17:00:00Z',
    createdAt: '2026-11-05T09:00:00Z',
    updatedAt: '2026-11-07T17:00:00Z',
  },
];

// Initial Site Documents
export const INITIAL_DOCUMENTS: SiteDocument[] = [
  { id: 'doc-001', projectId: 'prj-001', siteId: 'site-001', relatedRecordId: 'dpr-001', recordType: 'DPR', title: 'Level 14 Slab Concrete Pour Inspection Certificate', storagePath: '/documents/prj-001/qc_cert_lvl14.pdf', fileName: 'qc_cert_lvl14.pdf', fileType: 'application/pdf', fileSize: 1845000, isPrivate: false, uploadedBy: 'usr-eng-01', uploadedByName: 'Marcus Vance', createdAt: '2026-11-08T18:10:00Z' },
  { id: 'doc-002', projectId: 'prj-001', siteId: 'site-001', relatedRecordId: 'exp-001', recordType: 'EXPENSE', title: 'Liebherr Tower Crane Lease Agreement & Inspection Log', storagePath: '/documents/prj-001/crane_lease_nov26.pdf', fileName: 'crane_lease_nov26.pdf', fileType: 'application/pdf', fileSize: 3240000, isPrivate: true, uploadedBy: 'usr-admin-01', uploadedByName: 'Sarah Jenkins', createdAt: '2026-11-01T11:15:00Z' },
  { id: 'doc-003', projectId: 'prj-002', siteId: 'site-003', relatedRecordId: 'dpr-002', recordType: 'DPR', title: 'Oakridge Block A Masonry Facade Progress Photograph', storagePath: '/documents/prj-002/masonry_progress_01.jpg', fileName: 'masonry_progress_01.jpg', fileType: 'image/jpeg', fileSize: 2450000, isPrivate: false, uploadedBy: 'usr-eng-03', uploadedByName: 'David Chen', createdAt: '2026-11-09T17:50:00Z' },
];

// Initial Activity Logs
export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  { id: 'log-001', actorId: 'usr-eng-01', actorName: 'Marcus Vance', projectId: 'prj-001', action: 'SUBMITTED_DPR', entityType: 'DAILY_REPORT', entityId: 'dpr-001', details: { reportCode: 'DPR-2026-1108-01', completedQuantities: '120 m³ concrete' }, createdAt: '2026-11-08T18:00:00Z' },
  { id: 'log-002', actorId: 'usr-pm-01', actorName: 'Michael Torres, P.E.', projectId: 'prj-001', action: 'APPROVED_DPR', entityType: 'DAILY_REPORT', entityId: 'dpr-001', details: { reportCode: 'DPR-2026-1108-01', notes: 'Verified lab tickets' }, createdAt: '2026-11-09T08:30:00Z' },
  { id: 'log-003', actorId: 'usr-eng-01', actorName: 'Marcus Vance', projectId: 'prj-001', action: 'MATERIAL_CONSUMPTION', entityType: 'MATERIAL', entityId: 'mat-001', details: { materialName: 'Portland Cement', quantity: 240, unit: 'Bags' }, createdAt: '2026-11-08T17:00:00Z' },
  { id: 'log-004', actorId: 'usr-admin-01', actorName: 'Sarah Jenkins', projectId: 'prj-001', action: 'APPROVED_EXPENSE', entityType: 'EXPENSE', entityId: 'exp-001', details: { amount: 48500, category: 'Equipment Rental' }, createdAt: '2026-11-02T10:00:00Z' },
];

export interface DatabaseState {
  users: UserProfile[];
  projects: Project[];
  sites: ConstructionSite[];
  workers: Worker[];
  attendance: AttendanceRecord[];
  dailyReports: DailyProgressReport[];
  materials: Material[];
  materialTransactions: MaterialTransaction[];
  expenses: ProjectExpense[];
  milestones: Milestone[];
  siteIssues: SiteIssue[];
  documents: SiteDocument[];
  activityLogs: ActivityLog[];
  currentUserId: string;
  selectedProjectId: string | 'ALL';
  theme: 'light' | 'dark';
}

const STORAGE_KEY = 'siteledger_state_v1';

class DatabaseStore {
  private state: DatabaseState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
    // Setup initial theme class on documentElement
    if (typeof document !== 'undefined') {
      if (this.state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  private loadState(): DatabaseState {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        // Verify key tables exist
        if (parsed.projects && parsed.projects.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse SiteLedger state from localStorage, loading initial seed:', e);
    }
    return this.getInitialState();
  }

  private getInitialState(): DatabaseState {
    return {
      users: INITIAL_USERS,
      projects: INITIAL_PROJECTS,
      sites: INITIAL_SITES,
      workers: INITIAL_WORKERS,
      attendance: INITIAL_ATTENDANCE,
      dailyReports: INITIAL_DAILY_REPORTS,
      materials: INITIAL_MATERIALS,
      materialTransactions: INITIAL_MATERIAL_TRANSACTIONS,
      expenses: INITIAL_EXPENSES,
      milestones: INITIAL_MILESTONES,
      siteIssues: INITIAL_SITE_ISSUES,
      documents: INITIAL_DOCUMENTS,
      activityLogs: INITIAL_ACTIVITY_LOGS,
      currentUserId: INITIAL_USERS[0].id,
      selectedProjectId: 'ALL',
      theme: 'light',
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  public getState(): DatabaseState {
    return this.state;
  }

  // Reload Initial Demo Project Data
  public resetToDemo(): void {
    this.state = this.getInitialState();
    this.saveState();
  }

  // --------------------------------------------------------------------------
  // USER & ROLE MANAGEMENT
  // --------------------------------------------------------------------------
  public getCurrentUser(): UserProfile {
    const user = this.state.users.find((u) => u.id === this.state.currentUserId);
    return user || this.state.users[0];
  }

  public setCurrentUser(userId: string): void {
    const user = this.state.users.find((u) => u.id === userId);
    if (user) {
      this.state.currentUserId = user.id;
      this.saveState();
    }
  }

  public toggleTheme(): void {
    this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
    if (typeof document !== 'undefined') {
      if (this.state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    this.saveState();
  }

  public setSelectedProject(projectId: string | 'ALL'): void {
    this.state.selectedProjectId = projectId;
    this.saveState();
  }

  // --------------------------------------------------------------------------
  // LOG AUDIT ACTIVITY
  // --------------------------------------------------------------------------
  private logActivity(action: string, entityType: string, entityId: string, projectId?: string, details?: any): void {
    const currentUser = this.getCurrentUser();
    const newLog: ActivityLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      projectId,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    };
    this.state.activityLogs.unshift(newLog);
    if (this.state.activityLogs.length > 200) {
      this.state.activityLogs.pop();
    }
  }

  // --------------------------------------------------------------------------
  // PROJECTS CRUD
  // --------------------------------------------------------------------------
  public addProject(data: Omit<Project, 'id' | 'projectCode' | 'createdAt' | 'updatedAt'>): Project {
    const currentUser = this.getCurrentUser();
    if (currentUser.role !== 'ADMIN') {
      throw new Error('Permission Denied: Only Admin / Contractors can create new projects.');
    }

    const year = new Date().getFullYear();
    const count = this.state.projects.length + 1;
    const projectCode = `PRJ-${year}-${String(count).padStart(3, '0')}`;

    const newProject: Project = {
      ...data,
      id: 'prj-' + Date.now(),
      projectCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.projects.push(newProject);
    this.logActivity('CREATED_PROJECT', 'PROJECT', newProject.id, newProject.id, { projectCode, name: newProject.name });
    this.saveState();
    return newProject;
  }

  public updateProject(id: string, updates: Partial<Project>): Project {
    const currentUser = this.getCurrentUser();
    const index = this.state.projects.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Project not found.');

    const project = this.state.projects[index];
    if (currentUser.role === 'SITE_ENGINEER') {
      throw new Error('Permission Denied: Site Engineers cannot modify project level parameters.');
    }
    if (currentUser.role === 'PROJECT_MANAGER' && project.projectManagerId !== currentUser.id) {
      throw new Error('Permission Denied: Project Managers can only modify assigned projects.');
    }

    const updated = {
      ...project,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.state.projects[index] = updated;
    this.logActivity('UPDATED_PROJECT', 'PROJECT', updated.id, updated.id, updates);
    this.saveState();
    return updated;
  }

  public deleteProject(id: string): void {
    const currentUser = this.getCurrentUser();
    if (currentUser.role !== 'ADMIN') {
      throw new Error('Permission Denied: Only Admin can delete projects.');
    }

    this.state.projects = this.state.projects.filter((p) => p.id !== id);
    // Cascade delete linked sites
    this.state.sites = this.state.sites.filter((s) => s.projectId !== id);
    this.logActivity('DELETED_PROJECT', 'PROJECT', id, id);
    this.saveState();
  }

  // --------------------------------------------------------------------------
  // SITES CRUD
  // --------------------------------------------------------------------------
  public addSite(data: Omit<ConstructionSite, 'id' | 'siteCode' | 'createdAt' | 'updatedAt'>): ConstructionSite {
    const currentUser = this.getCurrentUser();
    if (currentUser.role === 'SITE_ENGINEER') {
      throw new Error('Permission Denied: Site Engineers cannot create sites.');
    }

    const count = this.state.sites.length + 1;
    const siteCode = `SITE-${String(count).padStart(3, '0')}`;

    const newSite: ConstructionSite = {
      ...data,
      id: 'site-' + Date.now(),
      siteCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.sites.push(newSite);
    this.logActivity('CREATED_SITE', 'SITE', newSite.id, newSite.projectId, { siteCode, siteName: newSite.siteName });
    this.saveState();
    return newSite;
  }

  public updateSite(id: string, updates: Partial<ConstructionSite>): ConstructionSite {
    const currentUser = this.getCurrentUser();
    const index = this.state.sites.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Site not found.');

    const site = this.state.sites[index];
    if (currentUser.role === 'SITE_ENGINEER' && site.siteEngineerId !== currentUser.id) {
      throw new Error('Permission Denied: Cannot modify sites assigned to other engineers.');
    }

    const updated = {
      ...site,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.state.sites[index] = updated;
    this.logActivity('UPDATED_SITE', 'SITE', updated.id, updated.projectId, updates);
    this.saveState();
    return updated;
  }

  // --------------------------------------------------------------------------
  // WORKERS & LABOUR ATTENDANCE
  // --------------------------------------------------------------------------
  public addWorker(data: Omit<Worker, 'id' | 'workerCode' | 'createdAt'>): Worker {
    const count = this.state.workers.length + 1;
    const workerCode = `WRK-${100 + count}`;
    const newWorker: Worker = {
      ...data,
      id: 'wrk-' + Date.now(),
      workerCode,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.state.workers.push(newWorker);
    this.logActivity('REGISTERED_WORKER', 'WORKER', newWorker.id, undefined, { workerCode, fullName: newWorker.fullName });
    this.saveState();
    return newWorker;
  }

  public recordAttendance(data: Omit<AttendanceRecord, 'id' | 'dailyCost' | 'createdAt'>): AttendanceRecord {
    // Constraint check: prevent duplicate attendance entries for same worker, site, and date
    const existing = this.state.attendance.find(
      (a) => a.workerId === data.workerId && a.siteId === data.siteId && a.attendanceDate === data.attendanceDate
    );
    if (existing) {
      throw new Error(`Attendance already logged for worker on ${data.attendanceDate} at this site.`);
    }

    const worker = this.state.workers.find((w) => w.id === data.workerId);
    const wage = worker ? worker.dailyWage : 200;

    // Daily cost calculation based on status and working hours
    let cost = 0;
    if (data.status === 'PRESENT') {
      cost = (wage / 8) * data.workingHours;
    } else if (data.status === 'HALF DAY') {
      cost = (wage / 8) * Math.min(data.workingHours, 4);
    }

    const newRecord: AttendanceRecord = {
      ...data,
      id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      dailyCost: Math.round(cost * 100) / 100,
      createdAt: new Date().toISOString(),
    };

    this.state.attendance.push(newRecord);
    this.logActivity('RECORDED_ATTENDANCE', 'ATTENDANCE', newRecord.id, data.projectId, {
      workerName: data.workerName,
      status: data.status,
      date: data.attendanceDate,
    });
    this.saveState();
    return newRecord;
  }

  public batchRecordAttendance(records: Omit<AttendanceRecord, 'id' | 'dailyCost' | 'createdAt'>[]): number {
    let count = 0;
    records.forEach((rec) => {
      try {
        this.recordAttendance(rec);
        count++;
      } catch (e) {
        // Skip duplicate
      }
    });
    return count;
  }

  // --------------------------------------------------------------------------
  // DAILY PROGRESS REPORTS (DPR)
  // --------------------------------------------------------------------------
  public addDailyReport(data: {
    projectId: string;
    siteId: string;
    reportDate: string;
    weather: string;
    workingHours: number;
    siteConditions?: string;
    labourCount: number;
    equipmentUsed?: string;
    remarks?: string;
    activities: Omit<ReportActivity, 'id' | 'progressPercentage'>[];
    photographicEvidence?: string[];
  }): DailyProgressReport {
    const currentUser = this.getCurrentUser();
    const project = this.state.projects.find((p) => p.id === data.projectId);
    const site = this.state.sites.find((s) => s.id === data.siteId);

    const dateStr = data.reportDate.replace(/-/g, '');
    const count = this.state.dailyReports.length + 1;
    const reportCode = `DPR-${dateStr}-${String(count).padStart(2, '0')}`;

    // Process activities and calculate percentage
    const processedActivities: ReportActivity[] = data.activities.map((act, i) => {
      const planned = Number(act.plannedQuantity) || 0;
      const completed = Number(act.completedQuantity) || 0;
      const pct = planned > 0 ? (completed / planned) * 100 : 0;
      return {
        ...act,
        id: 'act-' + Date.now() + '-' + i,
        plannedQuantity: planned,
        completedQuantity: completed,
        progressPercentage: Math.round(pct * 10) / 10,
      };
    });

    const newReport: DailyProgressReport = {
      ...data,
      id: 'dpr-' + Date.now(),
      reportCode,
      projectName: project ? project.name : '',
      siteName: site ? site.siteName : '',
      submittedBy: currentUser.id,
      engineerName: currentUser.fullName,
      status: 'SUBMITTED',
      activities: processedActivities,
      photographicEvidence: data.photographicEvidence || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.dailyReports.unshift(newReport);
    this.logActivity('SUBMITTED_DPR', 'DAILY_REPORT', newReport.id, data.projectId, {
      reportCode,
      activityCount: processedActivities.length,
    });
    this.saveState();
    return newReport;
  }

  public reviewDailyReport(
    reportId: string,
    action: 'APPROVE' | 'REJECT' | 'NEEDS_REVISION',
    reviewNotes?: string
  ): DailyProgressReport {
    const currentUser = this.getCurrentUser();
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'PROJECT_MANAGER') {
      throw new Error('Permission Denied: Only Admins or Project Managers can review and approve reports.');
    }

    const index = this.state.dailyReports.findIndex((r) => r.id === reportId);
    if (index === -1) throw new Error('Report not found.');

    const report = this.state.dailyReports[index];
    const newStatus =
      action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'NEEDS REVISION';

    const updated: DailyProgressReport = {
      ...report,
      status: newStatus,
      reviewedBy: currentUser.id,
      reviewedByName: currentUser.fullName,
      reviewedAt: new Date().toISOString(),
      reviewNotes: reviewNotes || report.reviewNotes,
      updatedAt: new Date().toISOString(),
    };

    this.state.dailyReports[index] = updated;
    this.logActivity(`REVIEWED_DPR_${action}`, 'DAILY_REPORT', updated.id, updated.projectId, {
      status: newStatus,
      reviewNotes,
    });
    this.saveState();
    return updated;
  }

  // --------------------------------------------------------------------------
  // MATERIALS & INVENTORY MANAGEMENT
  // --------------------------------------------------------------------------
  public addMaterial(data: Omit<Material, 'id' | 'materialCode' | 'createdAt'>): Material {
    const count = this.state.materials.length + 1;
    const catCode = data.category.substring(0, 3).toUpperCase();
    const materialCode = `MAT-${catCode}-${String(count).padStart(2, '0')}`;

    const newMaterial: Material = {
      ...data,
      id: 'mat-' + Date.now(),
      materialCode,
      createdAt: new Date().toISOString().split('T')[0],
    };

    this.state.materials.push(newMaterial);
    this.saveState();
    return newMaterial;
  }

  // Get live stock balance for a material at a given site or project
  public getMaterialStockBalance(materialId: string, siteId?: string, projectId?: string): MaterialStockBalance {
    const mat = this.state.materials.find((m) => m.id === materialId);
    if (!mat) {
      throw new Error('Material not found.');
    }

    const txns = this.state.materialTransactions.filter((t) => {
      if (t.materialId !== materialId) return false;
      if (siteId && siteId !== 'ALL' && t.siteId !== siteId) return false;
      if (projectId && projectId !== 'ALL' && t.projectId !== projectId) return false;
      return true;
    });

    let received = 0;
    let consumed = 0;
    let adjusted = 0;

    txns.forEach((t) => {
      if (t.transactionType === 'RECEIPT') received += t.quantity;
      else if (t.transactionType === 'CONSUMPTION') consumed += t.quantity;
      else if (t.transactionType === 'RETURN') received -= t.quantity;
      else if (t.transactionType === 'ADJUSTMENT') adjusted += t.quantity;
    });

    const currentBalance = received - consumed + adjusted;
    const estimatedValue = currentBalance * mat.unitCost;

    let status: 'OPTIMAL' | 'LOW_STOCK' | 'CRITICAL' = 'OPTIMAL';
    if (currentBalance <= 0) {
      status = 'CRITICAL';
    } else if (currentBalance < mat.minimumStock) {
      status = 'LOW_STOCK';
    }

    return {
      materialId: mat.id,
      materialCode: mat.materialCode,
      materialName: mat.materialName,
      category: mat.category,
      unit: mat.unit,
      minimumStock: mat.minimumStock,
      openingStock: 0,
      totalReceived: received,
      totalConsumed: consumed,
      totalAdjusted: adjusted,
      currentBalance,
      estimatedValue,
      status,
    };
  }

  // Record Material Transaction with Negative Stock Prevention
  public recordMaterialTransaction(data: {
    materialId: string;
    projectId: string;
    siteId: string;
    transactionType: 'RECEIPT' | 'CONSUMPTION' | 'ADJUSTMENT' | 'RETURN';
    quantity: number;
    unitCost?: number;
    supplier?: string;
    invoiceReference?: string;
    transactionDate: string;
    linkedReportId?: string;
    storageLocation?: string;
    notes?: string;
  }): MaterialTransaction {
    const currentUser = this.getCurrentUser();
    const mat = this.state.materials.find((m) => m.id === data.materialId);
    if (!mat) throw new Error('Material not found.');

    const qty = Number(data.quantity);
    if (qty <= 0) throw new Error('Quantity must be greater than zero.');

    // Validate against negative inventory on consumption
    if (data.transactionType === 'CONSUMPTION' || data.transactionType === 'RETURN') {
      const currentStock = this.getMaterialStockBalance(data.materialId, data.siteId, data.projectId).currentBalance;
      if (currentStock - qty < 0) {
        throw new Error(
          `Stock Violation: Cannot consume ${qty} ${mat.unit}. Current available balance is only ${currentStock} ${mat.unit}. Accidental negative stock is strictly prohibited.`
        );
      }
    }

    const unitCost = data.unitCost !== undefined ? Number(data.unitCost) : mat.unitCost;
    const totalCost = unitCost * qty;

    const newTxn: MaterialTransaction = {
      ...data,
      id: 'mtx-' + Date.now(),
      materialName: mat.materialName,
      materialCategory: mat.category,
      unit: mat.unit,
      quantity: qty,
      unitCost,
      totalCost,
      recordedBy: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    this.state.materialTransactions.unshift(newTxn);
    this.logActivity(`MATERIAL_${data.transactionType}`, 'MATERIAL', mat.id, data.projectId, {
      material: mat.materialName,
      quantity: qty,
      unit: mat.unit,
      siteId: data.siteId,
    });
    this.saveState();
    return newTxn;
  }

  // --------------------------------------------------------------------------
  // PROJECT EXPENSES & BUDGET MANAGEMENT
  // --------------------------------------------------------------------------
  public addExpense(data: Omit<ProjectExpense, 'id' | 'expenseCode' | 'createdAt' | 'approvalStatus' | 'paymentStatus'> & {
    paymentStatus?: 'PAID' | 'PENDING' | 'PARTIALLY PAID' | 'CANCELLED';
  }): ProjectExpense {
    const currentUser = this.getCurrentUser();
    const count = this.state.expenses.length + 1;
    const expenseCode = `EXP-2026-${String(count).padStart(3, '0')}`;

    // Admin auto-approves their own submitted expenses; others default to PENDING
    const approvalStatus = currentUser.role === 'ADMIN' ? 'APPROVED' : 'PENDING';
    const approvedBy = currentUser.role === 'ADMIN' ? currentUser.id : undefined;
    const approvedAt = currentUser.role === 'ADMIN' ? new Date().toISOString() : undefined;

    const newExpense: ProjectExpense = {
      ...data,
      id: 'exp-' + Date.now(),
      expenseCode,
      paymentStatus: data.paymentStatus || 'PENDING',
      approvalStatus,
      approvedBy,
      approvedAt,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    this.state.expenses.unshift(newExpense);
    this.logActivity('RECORDED_EXPENSE', 'EXPENSE', newExpense.id, data.projectId, {
      amount: data.amount,
      category: data.category,
      vendor: data.vendor,
    });
    this.saveState();
    return newExpense;
  }

  public updateExpenseApproval(expenseId: string, status: 'APPROVED' | 'REJECTED'): ProjectExpense {
    const currentUser = this.getCurrentUser();
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'PROJECT_MANAGER') {
      throw new Error('Permission Denied: Only Admins or Project Managers can approve financial expenses.');
    }

    const index = this.state.expenses.findIndex((e) => e.id === expenseId);
    if (index === -1) throw new Error('Expense not found.');

    const exp = this.state.expenses[index];
    const updated: ProjectExpense = {
      ...exp,
      approvalStatus: status,
      approvedBy: currentUser.id,
      approvedAt: new Date().toISOString(),
    };

    this.state.expenses[index] = updated;
    this.logActivity(`EXPENSE_${status}`, 'EXPENSE', updated.id, updated.projectId, { amount: updated.amount });
    this.saveState();
    return updated;
  }

  public updateExpensePayment(expenseId: string, status: 'PAID' | 'PENDING' | 'PARTIALLY PAID' | 'CANCELLED'): ProjectExpense {
    const currentUser = this.getCurrentUser();
    if (currentUser.role === 'SITE_ENGINEER') {
      throw new Error('Permission Denied: Site Engineers cannot modify payment settlement status.');
    }

    const index = this.state.expenses.findIndex((e) => e.id === expenseId);
    if (index === -1) throw new Error('Expense not found.');

    const exp = this.state.expenses[index];
    const updated: ProjectExpense = {
      ...exp,
      paymentStatus: status,
    };
    this.state.expenses[index] = updated;
    this.saveState();
    return updated;
  }

  // --------------------------------------------------------------------------
  // MILESTONES & PLANNED VS ACTUAL PROGRESS
  // --------------------------------------------------------------------------
  public addMilestone(data: Omit<Milestone, 'id' | 'createdAt'>): Milestone {
    const newMilestone: Milestone = {
      ...data,
      id: 'mls-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.state.milestones.push(newMilestone);
    this.logActivity('CREATED_MILESTONE', 'MILESTONE', newMilestone.id, data.projectId, { title: data.title });
    this.saveState();
    return newMilestone;
  }

  public updateMilestoneProgress(id: string, actualProgress: number, status?: Milestone['status']): Milestone {
    const index = this.state.milestones.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Milestone not found.');

    const m = this.state.milestones[index];
    const progress = Math.min(100, Math.max(0, actualProgress));
    const newStatus = status || (progress >= 100 ? 'COMPLETED' : progress > 0 ? 'IN PROGRESS' : 'NOT STARTED');

    const updated: Milestone = {
      ...m,
      actualProgress: progress,
      status: newStatus,
      actualCompletion: progress >= 100 ? new Date().toISOString().split('T')[0] : m.actualCompletion,
    };

    this.state.milestones[index] = updated;
    this.logActivity('UPDATED_MILESTONE_PROGRESS', 'MILESTONE', updated.id, updated.projectId, {
      actualProgress: progress,
      status: newStatus,
    });
    this.saveState();
    return updated;
  }

  // Calculate weighted project progress
  public calculateWeightedProgress(projectId: string): {
    plannedWeighted: number;
    actualWeighted: number;
    totalWeight: number;
  } {
    const milestones = this.state.milestones.filter((m) => m.projectId === projectId);
    if (milestones.length === 0) {
      return { plannedWeighted: 0, actualWeighted: 0, totalWeight: 0 };
    }

    const totalWeight = milestones.reduce((sum, m) => sum + (m.weight || 10), 0);
    if (totalWeight <= 0) return { plannedWeighted: 0, actualWeighted: 0, totalWeight: 0 };

    const plannedSum = milestones.reduce((sum, m) => sum + m.plannedProgress * (m.weight || 10), 0);
    const actualSum = milestones.reduce((sum, m) => sum + m.actualProgress * (m.weight || 10), 0);

    return {
      plannedWeighted: Math.round((plannedSum / totalWeight) * 10) / 10,
      actualWeighted: Math.round((actualSum / totalWeight) * 10) / 10,
      totalWeight,
    };
  }

  // --------------------------------------------------------------------------
  // SITE ISSUES MANAGEMENT
  // --------------------------------------------------------------------------
  public addSiteIssue(data: Omit<SiteIssue, 'id' | 'issueCode' | 'createdAt' | 'updatedAt' | 'status'> & {
    status?: SiteIssue['status'];
  }): SiteIssue {
    const currentUser = this.getCurrentUser();
    const count = this.state.siteIssues.length + 1;
    const issueCode = `ISS-2026-${String(count).padStart(3, '0')}`;

    const newIssue: SiteIssue = {
      ...data,
      id: 'iss-' + Date.now(),
      issueCode,
      reportedBy: currentUser.id,
      reportedByName: currentUser.fullName,
      status: data.status || 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.siteIssues.unshift(newIssue);
    this.logActivity('REPORTED_ISSUE', 'SITE_ISSUE', newIssue.id, data.projectId, {
      issueCode,
      title: data.title,
      priority: data.priority,
    });
    this.saveState();
    return newIssue;
  }

  public updateSiteIssueStatus(
    issueId: string,
    status: SiteIssue['status'],
    resolutionNotes?: string
  ): SiteIssue {
    const index = this.state.siteIssues.findIndex((i) => i.id === issueId);
    if (index === -1) throw new Error('Issue not found.');

    const issue = this.state.siteIssues[index];

    // Enforce business rule: A resolution note is required before closing or resolving an issue
    if ((status === 'RESOLVED' || status === 'CLOSED') && (!resolutionNotes || resolutionNotes.trim().length === 0)) {
      if (!issue.resolutionNotes) {
        throw new Error('Mandatory Requirement: A clear resolution note is required before marking a site issue as Resolved or Closed.');
      }
    }

    const updated: SiteIssue = {
      ...issue,
      status,
      resolutionNotes: resolutionNotes || issue.resolutionNotes,
      resolvedAt: (status === 'RESOLVED' || status === 'CLOSED') ? (issue.resolvedAt || new Date().toISOString()) : undefined,
      updatedAt: new Date().toISOString(),
    };

    this.state.siteIssues[index] = updated;
    this.logActivity('UPDATED_ISSUE_STATUS', 'SITE_ISSUE', updated.id, updated.projectId, {
      status,
      resolutionNotes,
    });
    this.saveState();
    return updated;
  }

  // --------------------------------------------------------------------------
  // DOCUMENTS & PHOTOS MANAGEMENT
  // --------------------------------------------------------------------------
  public addDocument(data: Omit<SiteDocument, 'id' | 'createdAt' | 'uploadedBy' | 'uploadedByName'>): SiteDocument {
    const currentUser = this.getCurrentUser();
    const newDoc: SiteDocument = {
      ...data,
      id: 'doc-' + Date.now(),
      uploadedBy: currentUser.id,
      uploadedByName: currentUser.fullName,
      createdAt: new Date().toISOString(),
    };
    this.state.documents.unshift(newDoc);
    this.logActivity('UPLOADED_DOCUMENT', 'DOCUMENT', newDoc.id, data.projectId, { title: data.title });
    this.saveState();
    return newDoc;
  }

  public deleteDocument(id: string): void {
    const currentUser = this.getCurrentUser();
    const doc = this.state.documents.find((d) => d.id === id);
    if (!doc) return;

    if (currentUser.role === 'SITE_ENGINEER' && doc.uploadedBy !== currentUser.id) {
      throw new Error('Permission Denied: Site Engineers can only delete their own uploaded documents.');
    }

    this.state.documents = this.state.documents.filter((d) => d.id !== id);
    this.logActivity('DELETED_DOCUMENT', 'DOCUMENT', id, doc.projectId);
    this.saveState();
  }

  // --------------------------------------------------------------------------
  // COMPUTED KPIS & EXECUTIVE METRICS
  // --------------------------------------------------------------------------
  public getKPIs(projectId?: string): ConstructionKPIs {
    const selectedPrj = projectId && projectId !== 'ALL' ? projectId : undefined;

    const filteredProjects = selectedPrj
      ? this.state.projects.filter((p) => p.id === selectedPrj)
      : this.state.projects;

    const filteredSites = selectedPrj
      ? this.state.sites.filter((s) => s.projectId === selectedPrj)
      : this.state.sites;

    const filteredReports = selectedPrj
      ? this.state.dailyReports.filter((r) => r.projectId === selectedPrj)
      : this.state.dailyReports;

    const todayStr = new Date().toISOString().split('T')[0];
    const reportsToday = filteredReports.filter((r) => r.reportDate === todayStr || r.createdAt.startsWith(todayStr)).length;

    const filteredAttendance = selectedPrj
      ? this.state.attendance.filter((a) => a.projectId === selectedPrj)
      : this.state.attendance;
    const labourToday = filteredAttendance.filter((a) => a.status === 'PRESENT' || a.status === 'HALF DAY').length;

    // Materials stock value
    const materialBalances = this.state.materials.map((m) =>
      this.getMaterialStockBalance(m.id, undefined, selectedPrj)
    );
    const totalMaterialStockValue = materialBalances.reduce((sum, b) => sum + b.estimatedValue, 0);

    // Expenses
    const filteredExpenses = selectedPrj
      ? this.state.expenses.filter((e) => e.projectId === selectedPrj)
      : this.state.expenses;

    const totalApprovedBudget = filteredProjects.reduce((sum, p) => sum + (p.approvedBudget || 0), 0);
    const totalExpenditure = filteredExpenses
      .filter((e) => e.approvalStatus === 'APPROVED' || e.paymentStatus === 'PAID')
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const budgetUtilizationPct =
      totalApprovedBudget > 0 ? Math.round((totalExpenditure / totalApprovedBudget) * 1000) / 10 : 0;

    // Monthly expenses
    const monthlyExpenses = filteredExpenses
      .filter((e) => e.expenseDate.startsWith('2026-11'))
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    // Milestones
    const filteredMilestones = selectedPrj
      ? this.state.milestones.filter((m) => m.projectId === selectedPrj)
      : this.state.milestones;
    const delayedMilestonesCount = filteredMilestones.filter((m) => m.isDelayed || m.status === 'DELAYED').length;

    // Issues
    const filteredIssues = selectedPrj
      ? this.state.siteIssues.filter((i) => i.projectId === selectedPrj)
      : this.state.siteIssues;
    const openIssuesCount = filteredIssues.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;

    // Weighted progress
    let overallWeightedProgressPct = 0;
    if (selectedPrj) {
      overallWeightedProgressPct = this.calculateWeightedProgress(selectedPrj).actualWeighted;
    } else if (filteredProjects.length > 0) {
      const sum = filteredProjects.reduce((acc, p) => acc + this.calculateWeightedProgress(p.id).actualWeighted, 0);
      overallWeightedProgressPct = Math.round((sum / filteredProjects.length) * 10) / 10;
    }

    return {
      totalProjects: filteredProjects.length,
      activeProjects: filteredProjects.filter((p) => p.status === 'ACTIVE').length,
      totalSites: filteredSites.length,
      activeSites: filteredSites.filter((s) => s.status === 'ACTIVE').length,
      reportsSubmittedToday: reportsToday,
      labourPresentToday: labourToday,
      totalMaterialStockValue: Math.round(totalMaterialStockValue),
      monthlyProjectExpenses: monthlyExpenses,
      delayedMilestonesCount,
      openIssuesCount,
      approvedBudgetTotal: totalApprovedBudget,
      totalExpenditure,
      budgetUtilizationPct,
      overallWeightedProgressPct,
    };
  }
}

export const dbStore = new DatabaseStore();
