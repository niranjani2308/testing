export interface DashboardSeedConfig {
  summary: {
    totalJourneys: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    totalNotes: number;
    totalUploadedFiles: number;
    storageUsedBytes: number;
  };
  upcomingTasks: Array<{
    id: number;
    title: string;
    dueDate: string;
    priority: string;
    status: string;
  }>;
  overdueTasks: Array<{
    id: number;
    title: string;
    dueDate: string;
    priority: string;
    status: string;
  }>;
  recentJourneys: Array<{
    id: number;
    name: string;
    status: string;
    startDate: string;
    endDate?: string | null;
    totalTasks: number;
    completedTasks: number;
    progressPercent: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: 'TASK' | 'NOTE' | 'JOURNEY' | 'FILE';
    title: string;
    date: string;
    detail?: string;
  }>;
}

export const defaultDashboardSeedData = {
  overview: {
    summary: {
      totalJourneys: 3,
      totalTasks: 12,
      completedTasks: 5,
      inProgressTasks: 3,
      pendingTasks: 4,
      totalNotes: 6,
      totalUploadedFiles: 4,
      storageUsedBytes: 1542000,
    },
    upcomingTasks: [
      {
        id: 101,
        title: 'Review System Architecture & Microservices',
        dueDate: '2026-11-25',
        priority: 'HIGH',
        status: 'PENDING',
      },
      {
        id: 102,
        title: 'Run Security Pentest Audit & Dependency Scan',
        dueDate: '2026-11-28',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
      },
    ],
    overdueTasks: [
      {
        id: 99,
        title: 'Submit ISO Compliance Checklist & Reports',
        dueDate: '2026-11-15',
        priority: 'HIGH',
        status: 'PENDING',
      },
    ],
    recentJourneys: [
      {
        id: 1,
        name: 'Cloud Infrastructure Migration',
        status: 'active',
        startDate: '2026-11-01',
        endDate: '2026-12-15',
        totalTasks: 8,
        completedTasks: 4,
        progressPercent: 50,
      },
      {
        id: 2,
        name: 'Q4 Engineering OKRs & Milestones',
        status: 'active',
        startDate: '2026-10-15',
        endDate: '2026-12-31',
        totalTasks: 4,
        completedTasks: 1,
        progressPercent: 25,
      },
    ],
    recentActivities: [
      {
        id: 'act-1',
        type: 'TASK' as const,
        title: 'Completed Docker Containerization Workflow',
        date: new Date().toISOString(),
        detail: 'Tasks pipeline passed all verification stages',
      },
      {
        id: 'act-2',
        type: 'NOTE' as const,
        title: 'Added API Documentation & Architecture Diagrams',
        date: new Date(Date.now() - 3600000).toISOString(),
        detail: 'Stored inside Notes Vault',
      },
    ],
  },
  analytics: {
    taskStatusChart: [
      { status: 'COMPLETED' as const, label: 'Completed', count: 5, percentage: 42, color: '#10b981' },
      { status: 'IN_PROGRESS' as const, label: 'In Progress', count: 3, percentage: 25, color: '#3b82f6' },
      { status: 'PENDING' as const, label: 'Pending', count: 4, percentage: 33, color: '#f59e0b' },
    ],
    fileTypeChart: [
      { category: 'PDF' as const, count: 2, totalBytes: 850000 },
      { category: 'Images' as const, count: 2, totalBytes: 692000 },
    ],
    dailyActivityChart: [
      { date: '2026-11-17', tasksCompleted: 1, notesCreated: 1, filesUploaded: 0, journeysStarted: 0, total: 2 },
      { date: '2026-11-18', tasksCompleted: 2, notesCreated: 2, filesUploaded: 1, journeysStarted: 1, total: 6 },
      { date: '2026-11-19', tasksCompleted: 1, notesCreated: 0, filesUploaded: 1, journeysStarted: 0, total: 2 },
      { date: '2026-11-20', tasksCompleted: 1, notesCreated: 2, filesUploaded: 1, journeysStarted: 0, total: 4 },
      { date: '2026-11-21', tasksCompleted: 0, notesCreated: 1, filesUploaded: 1, journeysStarted: 0, total: 2 },
    ],
    journeyProgressChart: [
      { id: 1, name: 'Cloud Infrastructure Migration', status: 'active', totalTasks: 8, completedTasks: 4, progressPercent: 50 },
      { id: 2, name: 'Q4 Engineering OKRs & Milestones', status: 'active', totalTasks: 4, completedTasks: 1, progressPercent: 25 },
    ],
  },
  operations: {
    totalSuccessfulUploads: 4,
    totalStorageBytes: 1542000,
    downloadTrackingNotice: 'All data operations are logged with audit trails.',
    storageByModule: {
      journeys: { bytes: 850000, count: 2 },
      notes: { bytes: 692000, count: 2 },
    },
    operationsHistory: [
      {
        id: 1,
        operationType: 'UPLOAD' as const,
        fileName: 'architecture_diagram.pdf',
        fileType: 'application/pdf',
        fileSize: 850000,
        timestamp: new Date().toISOString(),
        status: 'SUCCESS' as const,
        sourceModule: 'JOURNEYS' as const,
      },
    ],
  },
  drilldown: {
    overdue: {
      title: 'Overdue Tasks',
      type: 'OVERDUE_TASKS',
      count: 1,
      records: [
        {
          id: 99,
          title: 'Submit ISO Compliance Checklist & Reports',
          dueDate: '2026-11-15',
          priority: 'HIGH',
          status: 'PENDING',
        },
      ],
    },
    journeys: {
      title: 'Active Journeys',
      type: 'JOURNEY',
      count: 2,
      records: [
        {
          id: 1,
          name: 'Cloud Infrastructure Migration',
          status: 'active',
          progressPercent: 50,
        },
        {
          id: 2,
          name: 'Q4 Engineering OKRs & Milestones',
          status: 'active',
          progressPercent: 25,
        },
      ],
    },
  },
};
