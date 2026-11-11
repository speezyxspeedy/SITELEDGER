-- ==============================================================================
-- SiteLedger — Production Supabase PostgreSQL Schema & Security Architecture
-- Every Site. Every Resource. Every Update.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
CREATE TYPE user_role AS ENUM ('ADMIN', 'PROJECT_MANAGER', 'SITE_ENGINEER');
CREATE TYPE project_category AS ENUM (
  'Residential Construction',
  'Commercial Construction',
  'Industrial Construction',
  'Infrastructure',
  'Renovation',
  'Interior Work',
  'Other'
);
CREATE TYPE project_status AS ENUM ('PLANNING', 'ACTIVE', 'ON HOLD', 'COMPLETED', 'CANCELLED');
CREATE TYPE site_status AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'HANDOVER_COMPLETE');
CREATE TYPE worker_category AS ENUM (
  'Mason',
  'Carpenter',
  'Electrician',
  'Plumber',
  'Painter',
  'Welder',
  'General Labour',
  'Supervisor',
  'Machine Operator',
  'Other'
);
CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'HALF DAY', 'LEAVE');
CREATE TYPE report_status AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'NEEDS REVISION');
CREATE TYPE material_category AS ENUM (
  'Cement',
  'Steel',
  'Sand',
  'Aggregate',
  'Bricks',
  'Tiles',
  'Paint',
  'Electrical Supplies',
  'Plumbing Supplies',
  'Other'
);
CREATE TYPE material_transaction_type AS ENUM ('RECEIPT', 'CONSUMPTION', 'ADJUSTMENT', 'RETURN');
CREATE TYPE expense_category AS ENUM (
  'Labour',
  'Materials',
  'Equipment Rental',
  'Transport',
  'Fuel',
  'Subcontractor Payments',
  'Permits and Fees',
  'Other Expenses'
);
CREATE TYPE payment_status AS ENUM ('PAID', 'PENDING', 'PARTIALLY PAID', 'CANCELLED');
CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE milestone_status AS ENUM ('NOT STARTED', 'IN PROGRESS', 'COMPLETED', 'DELAYED', 'ON HOLD');
CREATE TYPE issue_category AS ENUM (
  'Material Shortage',
  'Labour Shortage',
  'Equipment Breakdown',
  'Weather Delay',
  'Design Clarification',
  'Quality Issue',
  'Safety Concern',
  'Transportation Issue',
  'Other'
);
CREATE TYPE issue_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE issue_status AS ENUM ('OPEN', 'UNDER REVIEW', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED', 'CLOSED');

-- ==============================================================================
-- 1. PROFILES TABLE (Linked with auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'SITE_ENGINEER',
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 2. PROJECTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  client_name TEXT NOT NULL,
  category project_category NOT NULL DEFAULT 'Commercial Construction',
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  start_date DATE NOT NULL,
  expected_end_date DATE NOT NULL,
  contract_value NUMERIC(15, 2) NOT NULL CHECK (contract_value >= 0),
  approved_budget NUMERIC(15, 2) NOT NULL CHECK (approved_budget >= 0),
  project_manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status project_status NOT NULL DEFAULT 'ACTIVE',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_project_dates CHECK (expected_end_date >= start_date)
);

-- ==============================================================================
-- 3. SITES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  site_code TEXT NOT NULL UNIQUE,
  site_name TEXT NOT NULL,
  address TEXT NOT NULL,
  area TEXT,
  city TEXT NOT NULL,
  site_engineer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status site_status NOT NULL DEFAULT 'ACTIVE',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. WORKERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  category worker_category NOT NULL,
  contractor_name TEXT,
  daily_wage NUMERIC(10, 2) NOT NULL CHECK (daily_wage >= 0),
  contact_number TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. ATTENDANCE TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status attendance_status NOT NULL DEFAULT 'PRESENT',
  working_hours NUMERIC(4, 1) NOT NULL DEFAULT 8.0 CHECK (working_hours >= 0 AND working_hours <= 24),
  daily_cost NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (daily_cost >= 0),
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Prevent duplicate attendance entries for the same worker, site, and date
  CONSTRAINT unique_worker_site_date UNIQUE (worker_id, site_id, attendance_date)
);

-- ==============================================================================
-- 6. DAILY PROGRESS REPORTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_code TEXT NOT NULL UNIQUE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  report_date DATE NOT NULL,
  weather TEXT NOT NULL, -- e.g. Sunny (32°C), Heavy Rain, Overcast
  working_hours NUMERIC(4, 1) NOT NULL DEFAULT 8.0,
  site_conditions TEXT,
  labour_count INTEGER NOT NULL DEFAULT 0 CHECK (labour_count >= 0),
  equipment_used TEXT,
  remarks TEXT,
  status report_status NOT NULL DEFAULT 'SUBMITTED',
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. REPORT ACTIVITIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS report_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES daily_reports(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  planned_quantity NUMERIC(12, 2) NOT NULL CHECK (planned_quantity >= 0),
  completed_quantity NUMERIC(12, 2) NOT NULL CHECK (completed_quantity >= 0),
  unit TEXT NOT NULL, -- sq ft, m², m³, kg, tonnes, bags, pcs
  progress_percentage NUMERIC(5, 2) GENERATED ALWAYS AS (
    CASE WHEN planned_quantity > 0 THEN (completed_quantity / planned_quantity) * 100 ELSE 0 END
  ) STORED,
  remarks TEXT
);

-- ==============================================================================
-- 8. MATERIALS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_code TEXT NOT NULL UNIQUE,
  material_name TEXT NOT NULL,
  category material_category NOT NULL,
  unit TEXT NOT NULL,
  minimum_stock NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (minimum_stock >= 0),
  unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 9. MATERIAL TRANSACTIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS material_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE RESTRICT,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  transaction_type material_transaction_type NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  unit_cost NUMERIC(10, 2) NOT NULL CHECK (unit_cost >= 0),
  supplier TEXT,
  invoice_reference TEXT,
  transaction_date DATE NOT NULL,
  linked_report_id UUID REFERENCES daily_reports(id) ON DELETE SET NULL,
  storage_location TEXT,
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 10. PROJECT EXPENSES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_code TEXT NOT NULL UNIQUE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  category expense_category NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  vendor TEXT NOT NULL,
  invoice_reference TEXT,
  expense_date DATE NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  approval_status approval_status NOT NULL DEFAULT 'PENDING',
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  receipt_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 11. TASKS & MILESTONES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  planned_start DATE NOT NULL,
  planned_end DATE NOT NULL,
  actual_completion DATE,
  planned_progress NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (planned_progress >= 0 AND planned_progress <= 100),
  actual_progress NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (actual_progress >= 0 AND actual_progress <= 100),
  weight NUMERIC(5, 2) NOT NULL DEFAULT 10.0 CHECK (weight > 0),
  priority issue_priority NOT NULL DEFAULT 'MEDIUM',
  status milestone_status NOT NULL DEFAULT 'NOT STARTED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_milestone_dates CHECK (planned_end >= planned_start)
);

-- ==============================================================================
-- 12. SITE ISSUES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS site_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_code TEXT NOT NULL UNIQUE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category issue_category NOT NULL,
  priority issue_priority NOT NULL DEFAULT 'MEDIUM',
  reported_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_date DATE,
  status issue_status NOT NULL DEFAULT 'OPEN',
  photographic_evidence TEXT,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 13. DOCUMENTS & EVIDENCE TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  related_record_id UUID,
  record_type TEXT NOT NULL, -- 'DPR', 'EXPENSE', 'ISSUE', 'MILESTONE', 'CONTRACT'
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT TRUE,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 14. AUDIT & ACTIVITY LOGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(project_manager_id);
CREATE INDEX IF NOT EXISTS idx_sites_project ON sites(project_id);
CREATE INDEX IF NOT EXISTS idx_sites_engineer ON sites(site_engineer_id);
CREATE INDEX IF NOT EXISTS idx_attendance_project_date ON attendance(project_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_site_date ON attendance(site_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_reports_project_site ON daily_reports(project_id, site_id, report_date);
CREATE INDEX IF NOT EXISTS idx_material_txn_site ON material_transactions(material_id, site_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project_status ON expenses(project_id, approval_status);
CREATE INDEX IF NOT EXISTS idx_milestones_project ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_project_status ON site_issues(project_id, status);

-- ==============================================================================
-- DATABASE TRIGGER & FUNCTION: PREVENT SILENT MODIFICATION OF APPROVED REPORTS
-- ==============================================================================
CREATE OR REPLACE FUNCTION prevent_approved_report_edit()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'APPROVED' AND NEW.status = 'APPROVED' THEN
    IF OLD.weather <> NEW.weather OR 
       OLD.working_hours <> NEW.working_hours OR 
       OLD.site_conditions <> NEW.site_conditions OR
       OLD.remarks <> NEW.remarks THEN
      RAISE EXCEPTION 'Approved daily reports cannot be modified directly. Must submit an amendment or revision request.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_approved_reports
BEFORE UPDATE ON daily_reports
FOR EACH ROW
EXECUTE FUNCTION prevent_approved_report_edit();

-- ==============================================================================
-- DATABASE TRIGGER & FUNCTION: MANDATORY RESOLUTION NOTES ON CLOSING ISSUES
-- ==============================================================================
CREATE OR REPLACE FUNCTION check_issue_resolution_notes()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.status = 'RESOLVED' OR NEW.status = 'CLOSED') AND 
     (NEW.resolution_notes IS NULL OR TRIM(NEW.resolution_notes) = '') THEN
    RAISE EXCEPTION 'A resolution note is required before marking a site issue as Resolved or Closed.';
  END IF;
  IF NEW.status = 'RESOLVED' AND OLD.status <> 'RESOLVED' THEN
    NEW.resolved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_issue_resolution_check
BEFORE UPDATE ON site_issues
FOR EACH ROW
EXECUTE FUNCTION check_issue_resolution_notes();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Security helper functions
CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES Policies
CREATE POLICY "Profiles readable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Users can update their own phone/avatar, but NOT role"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND 
    role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins have full access to profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (get_auth_role() = 'ADMIN');

-- PROJECTS Policies
CREATE POLICY "Projects accessible by company members"
  ON projects FOR SELECT
  TO authenticated
  USING (
    get_auth_role() = 'ADMIN' OR
    project_manager_id = auth.uid() OR
    id IN (SELECT project_id FROM sites WHERE site_engineer_id = auth.uid())
  );

CREATE POLICY "Admins can insert and update projects"
  ON projects FOR ALL
  TO authenticated
  USING (get_auth_role() = 'ADMIN');

CREATE POLICY "PMs can update assigned projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (project_manager_id = auth.uid())
  WITH CHECK (project_manager_id = auth.uid());

-- SITES Policies
CREATE POLICY "Sites viewable by project staff"
  ON sites FOR SELECT
  TO authenticated
  USING (
    get_auth_role() = 'ADMIN' OR
    site_engineer_id = auth.uid() OR
    project_id IN (SELECT id FROM projects WHERE project_manager_id = auth.uid())
  );

CREATE POLICY "Admins and PMs can manage sites"
  ON sites FOR ALL
  TO authenticated
  USING (
    get_auth_role() = 'ADMIN' OR
    project_id IN (SELECT id FROM projects WHERE project_manager_id = auth.uid())
  );

-- DAILY REPORTS Policies
CREATE POLICY "Reports readable by team members"
  ON daily_reports FOR SELECT
  TO authenticated
  USING (
    get_auth_role() = 'ADMIN' OR
    submitted_by = auth.uid() OR
    site_id IN (SELECT id FROM sites WHERE site_engineer_id = auth.uid()) OR
    project_id IN (SELECT id FROM projects WHERE project_manager_id = auth.uid())
  );

CREATE POLICY "Engineers can submit daily reports for their sites"
  ON daily_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    get_auth_role() IN ('ADMIN', 'SITE_ENGINEER') AND
    (get_auth_role() = 'ADMIN' OR site_id IN (SELECT id FROM sites WHERE site_engineer_id = auth.uid()))
  );

CREATE POLICY "Admins and PMs can approve/review reports"
  ON daily_reports FOR UPDATE
  TO authenticated
  USING (
    get_auth_role() IN ('ADMIN', 'PROJECT_MANAGER') OR
    (submitted_by = auth.uid() AND status = 'DRAFT')
  );

-- MATERIAL TRANSACTIONS & STOCK VALIDATION RPC
CREATE OR REPLACE FUNCTION record_material_transaction(
  p_material_id UUID,
  p_project_id UUID,
  p_site_id UUID,
  p_txn_type material_transaction_type,
  p_quantity NUMERIC,
  p_unit_cost NUMERIC,
  p_supplier TEXT,
  p_invoice_ref TEXT,
  p_txn_date DATE,
  p_linked_report_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_current_stock NUMERIC;
  v_new_id UUID;
BEGIN
  -- Calculate current site material stock
  SELECT COALESCE(
    SUM(CASE WHEN transaction_type = 'RECEIPT' THEN quantity 
             WHEN transaction_type = 'CONSUMPTION' THEN -quantity 
             WHEN transaction_type = 'RETURN' THEN -quantity
             ELSE quantity END), 0)
  INTO v_current_stock
  FROM material_transactions
  WHERE material_id = p_material_id AND site_id = p_site_id;

  -- Validate against negative inventory on consumption or return
  IF (p_txn_type = 'CONSUMPTION' OR p_txn_type = 'RETURN') AND (v_current_stock - p_quantity < 0) THEN
    RAISE EXCEPTION 'Transaction rejected: Insufficient stock. Current balance is %, requested deduction is %.', v_current_stock, p_quantity;
  END IF;

  INSERT INTO material_transactions (
    material_id, project_id, site_id, transaction_type, quantity,
    unit_cost, supplier, invoice_reference, transaction_date,
    linked_report_id, recorded_by, notes
  ) VALUES (
    p_material_id, p_project_id, p_site_id, p_txn_type, p_quantity,
    p_unit_cost, p_supplier, p_invoice_ref, p_txn_date,
    p_linked_report_id, auth.uid(), p_notes
  ) RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
