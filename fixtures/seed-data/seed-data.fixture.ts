import * as fs from 'fs';
import * as path from 'path';

export interface SeededUser {
  id?: number;
  username: string;
  email: string;
  password?: string;
}

export interface SeededMetrics {
  totalJourneys: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalNotes: number;
  archivedNotes: number;
  totalPlans: number;
  totalTrackers: number;
  totalFiles: number;
}

export interface SeedManifestData {
  seededAt: string;
  backendUrl: string;
  user: SeededUser;
  journeys: number[];
  plans: number[];
  tasks: number[];
  notes: number[];
  trackers: number[];
  attachments?: number[];
  uploadedFiles?: Array<{ id: number; fileName: string; module: string }>;
}

export interface SeedDatasetData {
  name: string;
  description: string;
  expectedMetrics: SeededMetrics;
  user: SeededUser;
  journeys: Array<{ name: string; description: string; status: string }>;
  plans: Array<{ title: string; category: string }>;
  notes: Array<{ title: string; content?: string; isPinned?: boolean; isArchived?: boolean }>;
}

export class SeededDataFixture {
  private static manifestCache: SeedManifestData | null = null;
  private static datasetCache: SeedDatasetData | null = null;

  public get manifest(): SeedManifestData {
    if (!SeededDataFixture.manifestCache) {
      const manifestPath = path.join(__dirname, 'seed-manifest.json');
      if (fs.existsSync(manifestPath)) {
        SeededDataFixture.manifestCache = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      } else {
        SeededDataFixture.manifestCache = {
          seededAt: new Date().toISOString(),
          backendUrl: process.env.API_BASE_URL || 'http://localhost:5000',
          user: {
            username: process.env.SEED_USER_NAME || 'automation_seed_user',
            email: process.env.SEED_USER_EMAIL || 'automation_seed_user@yopmail.com',
          },
          journeys: [],
          plans: [],
          tasks: [],
          notes: [],
          trackers: [],
          uploadedFiles: [],
        };
      }
    }
    return SeededDataFixture.manifestCache!;
  }

  public get dataset(): SeedDatasetData {
    if (!SeededDataFixture.datasetCache) {
      const datasetPath = path.join(__dirname, 'dataset.json');
      if (fs.existsSync(datasetPath)) {
        SeededDataFixture.datasetCache = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
      } else {
        SeededDataFixture.datasetCache = {
          name: 'Default Scenario B',
          description: 'Default dataset fallback',
          expectedMetrics: {
            totalJourneys: 3,
            totalTasks: 12,
            completedTasks: 4,
            inProgressTasks: 3,
            pendingTasks: 5,
            overdueTasks: 2,
            totalNotes: 4,
            archivedNotes: 2,
            totalPlans: 2,
            totalTrackers: 2,
            totalFiles: 2,
          },
          user: {
            username: 'automation_seed_user',
            email: 'automation_seed_user@yopmail.com',
          },
          journeys: [],
          plans: [],
          notes: [],
        };
      }
    }
    return SeededDataFixture.datasetCache!;
  }

  public get user(): SeededUser {
    return {
      username: this.manifest.user.username || this.dataset.user.username,
      email: this.manifest.user.email || this.dataset.user.email,
      password: process.env.SEED_USER_PASSWORD || 'Automation@123',
    };
  }

  public get expectedMetrics(): SeededMetrics {
    return this.dataset.expectedMetrics;
  }

  public getSeededUser(): SeededUser {
    return this.user;
  }

  public getExpectedMetrics(): SeededMetrics {
    return this.expectedMetrics;
  }

  public getDashboardSeedData(): any {
    const dashPath = path.join(__dirname, 'dashboard-seed.json');
    if (fs.existsSync(dashPath)) {
      return JSON.parse(fs.readFileSync(dashPath, 'utf8'));
    }
    return {
      overview: { summary: this.expectedMetrics },
      analytics: {},
      operations: {},
      drilldown: {},
    };
  }

  public getApiSeedData(): {
    journey: { name: string; startDate: string; description: string };
    tasks: Array<{ title: string; priority: string; status: string }>;
  } {
    const apiPath = path.join(__dirname, 'api-seed.json');
    if (fs.existsSync(apiPath)) {
      return JSON.parse(fs.readFileSync(apiPath, 'utf8'));
    }
    return {
      journey: {
        name: 'Master Launch Journey',
        startDate: '2026-11-01',
        description: 'Seeded automated test journey',
      },
      tasks: [
        {
          title: 'Initial System Verification',
          priority: 'HIGH',
          status: 'COMPLETED',
        },
        {
          title: 'Audit User Workflows',
          priority: 'HIGH',
          status: 'PENDING',
        },
      ],
    };
  }

  public getSampleJourneyData(index = 0): { name: string; description: string; status?: string } {
    const journeyPath = path.join(__dirname, 'journey-seed.json');
    if (fs.existsSync(journeyPath)) {
      const data = JSON.parse(fs.readFileSync(journeyPath, 'utf8'));
      if (data.sampleJourneys && data.sampleJourneys[index]) {
        return data.sampleJourneys[index];
      }
      if (data.defaultSampleJourney) {
        return data.defaultSampleJourney;
      }
    }
    return (
      this.dataset.journeys[index] || {
        name: 'Cloud Infrastructure Migration',
        description: 'Migrate on-premise infrastructure to AWS ECS, RDS PostgreSQL, and S3',
        status: 'active',
      }
    );
  }

  public getSeededJourneys(): Array<{ name: string; description: string; status: string }> {
    return this.dataset.journeys;
  }

  public generateDynamicJourney(prefix = 'Dynamic Journey'): { name: string; description: string } {
    const id = Date.now().toString(36);
    return {
      name: `${prefix} ${id}`,
      description: `Automated test journey ${id} created from fixtures`,
    };
  }
}

export const seededDataFixtureInstance = new SeededDataFixture();
