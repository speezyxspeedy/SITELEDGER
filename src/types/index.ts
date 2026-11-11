/**
 * SiteLedger — Core Domain Types and Schemas
 * Construction Site Operations & Project Progress Management Platform
 */

export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'SITE_ENGINEER';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  assignedProjectIds?: string[];
  assignedSiteIds?: string[];
}

export type ProjectCategory =
  | 'Residential Construction'
  | 'Commercial Construction'
  | 'Industrial Construction'
  | 'Infrastructure'
  | 'Renovation'
  | 'Interior Work'
  | 'Other';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON HOLD' | 'COMPLETED' | 'CANCELLED';

export interface Project {
  id: string;
  projectCode: string;
  name: string;
  description: string;
  clientName: string;
  category: ProjectCategory;
  address: string;
  city: string;
  state: string;
  startDate: string; // YYYY-MM-DD
  expectedEndDate: string; // YYYY-MM-DD
  contractValue: number;
  approvedBudget: number;
  projectManagerId?: string;
  projectManagerName?: string;
  status: ProjectStatus;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type SiteStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'HANDOVER_COMPLETE';

export interface ConstructionSite {
  id: string;
  projectId: string;
  siteCode: string;
  siteName: string;
  address: string;
  area?: string;
  city: string;
  siteEngineerId?: string;
  siteEngineerName?: string;
  startDate: string;
  status: SiteStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkerCategory =
  | 'Mason'
  | 'Carpenter'
  | 'Electrician'
  | 'Plumber'
  | 'Painter'
  | 'Welder'
  | 'General Labour'
  | 'Supervisor'
  | 'Machine Operator'
  | 'Other';

export interface Worker {
  id: string;
  workerCode: string;
  fullName: string;
  category: WorkerCategory;
  contractorName?: string;
  dailyWage: number;
  contactNumber?: string;
  isActive: boolean;
  createdAt: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF DAY' | 'LEAVE';

export interface AttendanceRecord {
  id: string;
  workerId: string;
  workerName: string;
  workerCategory: WorkerCategory;
  contractorName?: string;
  projectId: string;
  siteId: string;
  attendanceDate: string; // YYYY-MM-DD
  status: AttendanceStatus;
  workingHours: number;
  dailyCost: number;
  recordedBy?: string;
  createdAt: string;
}

export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'NEEDS REVISION';

export interface ReportActivity {
  id: string;
  activityName: string;
  plannedQuantity: number;
  completedQuantity: number;
  unit: string; // sq ft, m², m³, kg, tonnes, bags, pcs, hrs
  progressPercentage: number;
  remarks?: string;
}

export interface DailyProgressReport {
  id: string;
  reportCode: string;
  projectId: string;
  siteId: string;
  projectName?: string;
  siteName?: string;
  submittedBy: string;
  engineerName: string;
  reportDate: string; // YYYY-MM-DD
  weather: string; // e.g. "Sunny, 31°C", "Rain delay", "Overcast"
  workingHours: number;
  siteConditions?: string;
  labourCount: number;
  equipmentUsed?: string;
  remarks?: string;
  status: ReportStatus;
  activities: ReportActivity[];
  photographicEvidence?: string[];
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type MaterialCategory =
  | 'Cement'
  | 'Steel'
  | 'Sand'
  | 'Aggregate'
  | 'Bricks'
  | 'Tiles'
  | 'Paint'
  | 'Electrical Supplies'
  | 'Plumbing Supplies'
  | 'Other';

export interface Material {
  id: string;
  materialCode: string;
  materialName: string;
  category: MaterialCategory;
  unit: string;
  minimumStock: number;
  unitCost: number;
  createdAt: string;
}

export type MaterialTransactionType = 'RECEIPT' | 'CONSUMPTION' | 'ADJUSTMENT' | 'RETURN';

export interface MaterialTransaction {
  id: string;
  materialId: string;
  materialName?: string;
  materialCategory?: MaterialCategory;
  unit?: string;
  projectId: string;
  siteId: string;
  transactionType: MaterialTransactionType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier?: string;
  invoiceReference?: string;
  transactionDate: string; // YYYY-MM-DD
  linkedReportId?: string;
  storageLocation?: string;
  notes?: string;
  recordedBy?: string;
  createdAt: string;
}

export interface MaterialStockBalance {
  materialId: string;
  materialCode: string;
  materialName: string;
  category: MaterialCategory;
  unit: string;
  minimumStock: number;
  openingStock: number;
  totalReceived: number;
  totalConsumed: number;
  totalAdjusted: number;
  currentBalance: number;
  estimatedValue: number;
  status: 'OPTIMAL' | 'LOW_STOCK' | 'CRITICAL';
}

export type ExpenseCategory =
  | 'Labour'
  | 'Materials'
  | 'Equipment Rental'
  | 'Transport'
  | 'Fuel'
  | 'Subcontractor Payments'
  | 'Permits and Fees'
  | 'Other Expenses';

export type PaymentStatus = 'PAID' | 'PENDING' | 'PARTIALLY PAID' | 'CANCELLED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ProjectExpense {
  id: string;
  expenseCode: string;
  projectId: string;
  siteId?: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  vendor: string;
  invoiceReference?: string;
  expenseDate: string; // YYYY-MM-DD
  paymentStatus: PaymentStatus;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  receiptUrl?: string;
  createdBy?: string;
  createdAt: string;
}

export type MilestonePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type MilestoneStatus = 'NOT STARTED' | 'IN PROGRESS' | 'COMPLETED' | 'DELAYED' | 'ON HOLD';

export interface Milestone {
  id: string;
  projectId: string;
  siteId?: string;
  title: string;
  description?: string;
  assignedTo?: string;
  assignedToName?: string;
  plannedStart: string; // YYYY-MM-DD
  plannedEnd: string; // YYYY-MM-DD
  actualCompletion?: string;
  plannedProgress: number; // 0 - 100
  actualProgress: number; // 0 - 100
  weight: number; // Percentage weight e.g. 15%
  priority: MilestonePriority;
  status: MilestoneStatus;
  isDelayed?: boolean;
  daysDelayed?: number;
  createdAt: string;
}

export type IssueCategory =
  | 'Material Shortage'
  | 'Labour Shortage'
  | 'Equipment Breakdown'
  | 'Weather Delay'
  | 'Design Clarification'
  | 'Quality Issue'
  | 'Safety Concern'
  | 'Transportation Issue'
  | 'Other';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IssueStatus = 'OPEN' | 'UNDER REVIEW' | 'ASSIGNED' | 'IN PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface SiteIssue {
  id: string;
  issueCode: string;
  projectId: string;
  siteId: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  reportedBy: string;
  reportedByName?: string;
  assignedTo?: string;
  assignedToName?: string;
  targetDate?: string;
  status: IssueStatus;
  photographicEvidence?: string[];
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteDocument {
  id: string;
  projectId: string;
  siteId?: string;
  relatedRecordId?: string;
  recordType: 'DPR' | 'EXPENSE' | 'ISSUE' | 'MILESTONE' | 'INVOICE' | 'GENERAL';
  title: string;
  storagePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  isPrivate: boolean;
  uploadedBy: string;
  uploadedByName?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  actorId: string;
  actorName: string;
  projectId?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface ConstructionKPIs {
  totalProjects: number;
  activeProjects: number;
  totalSites: number;
  activeSites: number;
  reportsSubmittedToday: number;
  labourPresentToday: number;
  totalMaterialStockValue: number;
  monthlyProjectExpenses: number;
  delayedMilestonesCount: number;
  openIssuesCount: number;
  approvedBudgetTotal: number;
  totalExpenditure: number;
  budgetUtilizationPct: number;
  overallWeightedProgressPct: number;
}
