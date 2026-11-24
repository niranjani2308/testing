/**
 * LifeTrack AI - Data Seeding Datasets Specification
 * Phase 3: Safe Sample Data Seeding & Data Verification
 *
 * Defines isolated datasets for:
 * - Scenario A: Empty / New User (0 records across all modules)
 * - Scenario B: Medium / Standard Dataset (3 Journeys, 12 Tasks, 6 Notes, 2 Plans, 2 Trackers, Files)
 * - Scenario C: Large / Boundary Dataset (Stress & boundary definitions; strictly requires approval)
 */

export interface JourneySeedPayload {
  name: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  status?: 'not_started' | 'active' | 'paused' | 'completed' | 'archived';
}

export interface TaskSeedPayload {
  title: string;
  description?: string;
  notes?: string;
  startDate?: string;
  dueDate?: string; // YYYY-MM-DD
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  journeyIndex?: number; // references journey index in array
  isIndependent?: boolean;
}

export interface PlanSeedPayload {
  title: string;
  category: string;
  description?: string;
  startDate: string;
  deadline?: string;
  tasks: Array<{
    title: string;
    plannedDate: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    whatToDo?: string;
    whyItMatters?: string;
    howToDo?: string;
    expectedResult?: string;
  }>;
}

export interface NoteSeedPayload {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  type: 'PERSONAL' | 'JOURNEY';
  journeyIndex?: number;
  entryDate?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  filesToAttach?: string[];
}

export interface TrackerSeedPayload {
  name: string;
  description?: string;
  trackingType: 'COUNT' | 'DURATION' | 'NUMERIC' | 'BOOLEAN';
  unit?: string;
  targetValue?: number;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  journeyIndex: number;
  logs: Array<{
    value: number;
    loggedAt: string;
    notes?: string;
  }>;
}

export interface SeedDataset {
  name: string;
  description: string;
  journeys: JourneySeedPayload[];
  plans: PlanSeedPayload[];
  tasks: TaskSeedPayload[];
  notes: NoteSeedPayload[];
  trackers: TrackerSeedPayload[];
  expectedMetrics: {
    totalJourneys: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    totalNotes: number; // active notes
    archivedNotes: number;
    totalPlans: number;
    totalTrackers: number;
    totalFiles?: number;
  };
}

// ==========================================
// SCENARIO A: EMPTY / NEW USER
// ==========================================
export const SCENARIO_A_EMPTY: SeedDataset = {
  name: 'Scenario A: Empty / New User',
  description: 'Clean state with 0 user-generated records. Validates empty states, empty charts, zero metrics.',
  journeys: [],
  plans: [],
  tasks: [],
  notes: [],
  trackers: [],
  expectedMetrics: {
    totalJourneys: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    totalNotes: 0,
    archivedNotes: 0,
    totalPlans: 0,
    totalTrackers: 0,
  },
};

// ==========================================
// SCENARIO B: MEDIUM / STANDARD DATASET
// Exactly: 3 Journeys, 2 Plans, 12 Tasks (4 Completed, 3 In Progress, 5 Pending [2 Overdue]), 6 Notes, 2 Trackers
// ==========================================
export const SCENARIO_B_MEDIUM: SeedDataset = {
  name: 'Scenario B: Medium / Standard Dataset',
  description: 'Realistic standard dataset with 3 journeys, 2 plans, 12 tasks (4 completed, 3 in progress, 5 pending including 2 overdue), 6 notes (4 active, 2 archived, 2 pinned), and 2 trackers.',
  journeys: [
    {
      name: 'Cloud Infrastructure Migration',
      description: 'End-to-end migration of microservices and databases to AWS ECS & RDS.',
      startDate: '2026-11-01',
      endDate: '2026-12-31',
      status: 'active',
    },
    {
      name: 'Health & Marathon Conditioning',
      description: 'Comprehensive 16-week endurance training, nutrition, and recovery schedule.',
      startDate: '2026-10-15',
      endDate: '2027-02-28',
      status: 'active',
    },
    {
      name: 'Antigravity Test Automation Suite',
      description: 'Playwright TypeScript test automation framework implementation.',
      startDate: '2026-11-20',
      status: 'not_started',
    },
  ],
  plans: [
    {
      title: 'DevOps CI/CD Automation Plan',
      category: 'Engineering',
      description: 'Pipeline for automated build, lint, unit tests, and staging deployments.',
      startDate: '2026-11-15',
      deadline: '2026-12-15',
      tasks: [
        {
          title: 'Draft Docker Multi-Stage Buildfile',
          plannedDate: '2026-11-28',
          priority: 'HIGH',
          whatToDo: 'Create lightweight multi-stage Dockerfile',
          expectedResult: 'Image size under 200MB',
        },
      ],
    },
    {
      title: 'Endurance Nutrition Protocol',
      category: 'Health',
      description: 'Dietary carbohydrate cycling and hydration schedule for long runs.',
      startDate: '2026-11-01',
      deadline: '2027-01-30',
      tasks: [
        {
          title: 'Establish Micronutrient & Electrolyte Baseline',
          plannedDate: '2026-11-29',
          priority: 'MEDIUM',
          whatToDo: 'Track sodium and magnesium intake',
          expectedResult: 'No muscle cramping during tempo runs',
        },
      ],
    },
  ],
  tasks: [
    // Completed Tasks (4)
    {
      title: 'Configure VPC & Security Subnets',
      description: 'Provision private and public subnets with NAT Gateway',
      priority: 'HIGH',
      status: 'COMPLETED',
      journeyIndex: 0,
      dueDate: '2026-11-10',
    },
    {
      title: 'Setup PostgreSQL Multi-AZ Cluster',
      description: 'Deploy RDS PostgreSQL instance with automated backups',
      priority: 'HIGH',
      status: 'COMPLETED',
      journeyIndex: 0,
      dueDate: '2026-11-12',
    },
    {
      title: 'Baseline 5K Aerobic Assessment Run',
      description: 'Run 5K at conversational pace to calculate VO2 Max baseline',
      priority: 'MEDIUM',
      status: 'COMPLETED',
      journeyIndex: 1,
      dueDate: '2026-10-25',
    },
    {
      title: 'Configure Playwright TypeScript Test Fixtures',
      description: 'Setup Page Object Model, custom fixtures, and environment loader',
      priority: 'LOW',
      status: 'COMPLETED',
      isIndependent: true,
      dueDate: '2026-11-21',
    },

    // In Progress Tasks (3)
    {
      title: 'Migrate Backend Docker Containers to ECS Fargate',
      description: 'Deploy task definitions and configure Application Load Balancer',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      journeyIndex: 0,
      dueDate: '2026-11-28',
    },
    {
      title: 'Weekly 15K Long Slow Distance Run',
      description: 'Sustain Zone 2 heart rate for 90 minutes',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      journeyIndex: 1,
      dueDate: '2026-11-26',
    },
    {
      title: 'Build Universal Seed & Manifest Utility',
      description: 'Develop API-based data seeding and rollback mechanism in TypeScript',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      isIndependent: true,
      dueDate: '2026-11-24',
    },

    // Pending Tasks (3 individual: 1 upcoming + 2 overdue)
    // Combined with the 2 tasks auto-generated by the 2 Plans = 5 Pending total!
    {
      title: 'Setup Route53 Latency-Based Routing',
      description: 'Configure DNS health checks and primary-secondary failover rules',
      priority: 'HIGH',
      status: 'PENDING',
      journeyIndex: 0,
      dueDate: '2026-12-10',
    },
    // Overdue Tasks (2 Overdue - dueDate strictly before current date 2026-11-23)
    {
      title: 'Legacy Database Schema Freeze Notice',
      description: 'Broadcast maintenance window and freeze write operations on legacy database',
      priority: 'HIGH',
      status: 'PENDING',
      journeyIndex: 0,
      dueDate: '2026-11-10',
    },
    {
      title: 'Sports Dietitian Macro Consultation',
      description: 'Finalize intra-workout gel fueling protocol with registered dietitian',
      priority: 'MEDIUM',
      status: 'PENDING',
      journeyIndex: 1,
      dueDate: '2026-11-15',
    },
  ],
  notes: [
    // 4 Active Notes (2 Personal, 2 Journey-linked; 2 Pinned)
    {
      title: 'Personal Reflections on Cognitive Flow & Deep Work',
      content: 'Morning 90-minute uninterrupted work blocks yield 3x higher technical throughput.',
      category: 'Personal',
      tags: ['productivity', 'focus', 'deep-work'],
      type: 'PERSONAL',
      isPinned: true,
      isArchived: false,
    },
    {
      title: 'SelectorHub Best Practices for Dynamic SPAs',
      content: 'Always prefer semantic role attributes and robust XPath selectors over auto-generated IDs.',
      category: 'Engineering',
      tags: ['testing', 'playwright', 'qa'],
      type: 'PERSONAL',
      isPinned: false,
      isArchived: false,
    },
    {
      title: 'AWS Network Topology & CIDR Allocations',
      content: 'Primary VPC: 10.0.0.0/16. Private App Subnets: 10.0.1.0/24, 10.0.2.0/24.',
      category: 'Architecture',
      tags: ['aws', 'networking', 'vpc'],
      type: 'JOURNEY',
      journeyIndex: 0,
      isPinned: true,
      isArchived: false,
      filesToAttach: ['sample.pdf', 'sample.png'],
    },
    {
      title: 'Marathon Race Pace & Split Targets',
      content: 'Target pace: 5:15 min/km for consistent negative split. Gel intake every 45 mins.',
      category: 'Health',
      tags: ['running', 'marathon', 'nutrition'],
      type: 'JOURNEY',
      journeyIndex: 1,
      isPinned: false,
      isArchived: false,
    },

    // 2 Archived Notes (Total notes = 6)
    {
      title: 'Deprecated Q3 On-Premise Server List',
      content: 'Legacy bare-metal rack servers scheduled for decommission on Nov 30.',
      category: 'Legacy',
      tags: ['datacenter', 'deprecated'],
      type: 'JOURNEY',
      journeyIndex: 0,
      isPinned: false,
      isArchived: true,
    },
    {
      title: 'Archived Workout Log - October 2026',
      content: 'Historic strength training volume logs and max exertion notes.',
      category: 'Archive',
      tags: ['archive', 'fitness'],
      type: 'PERSONAL',
      isPinned: false,
      isArchived: true,
    },
  ],
  trackers: [
    {
      name: 'Daily Running Mileage',
      description: 'Track daily running distance in miles during marathon prep',
      trackingType: 'NUMERIC',
      unit: 'miles',
      targetValue: 8,
      frequency: 'DAILY',
      journeyIndex: 1,
      logs: [
        { value: 5.2, loggedAt: '2026-11-18', notes: 'Moderate tempo run around the park' },
        { value: 4.5, loggedAt: '2026-11-19', notes: 'Track intervals: 8x400m' },
        { value: 7.0, loggedAt: '2026-11-20', notes: 'Continuous Zone 2 endurance session' },
      ],
    },
    {
      name: 'Architecture Pull Requests Reviewed',
      description: 'Track team pull requests reviewed for cloud migration compliance',
      trackingType: 'COUNT',
      unit: 'PRs',
      targetValue: 5,
      frequency: 'WEEKLY',
      journeyIndex: 0,
      logs: [
        { value: 3, loggedAt: '2026-11-19', notes: 'Terraform module reviews' },
        { value: 5, loggedAt: '2026-11-21', notes: 'NestJS and TypeORM migrations reviewed' },
      ],
    },
  ],
  expectedMetrics: {
    totalJourneys: 3,
    totalTasks: 12,
    completedTasks: 4,
    inProgressTasks: 3,
    pendingTasks: 5,
    overdueTasks: 2,
    totalNotes: 4, // 4 active notes visible on dashboard overview
    archivedNotes: 2, // 2 archived notes in vault
    totalPlans: 2,
    totalTrackers: 2,
    totalFiles: 2,
  },
};

// ==========================================
// SCENARIO C: LARGE / BOUNDARY DATASET (TEMPLATE ONLY)
// ==========================================
export const SCENARIO_C_LARGE_SPEC = {
  name: 'Scenario C: Large / Boundary Dataset',
  description: 'Stress and scale dataset: 25+ Journeys, 150+ Tasks, 50+ Notes, 15+ Trackers, 40+ Files. MUST NOT be executed without explicit user approval.',
  targetScale: {
    journeys: 25,
    tasks: 150,
    notes: 50,
    trackers: 15,
    files: 40,
  },
  requiresApproval: true,
};
