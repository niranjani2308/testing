import { request, APIRequestContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import {
  SeedDataset,
  SCENARIO_B_MEDIUM,
  JourneySeedPayload,
  TaskSeedPayload,
  NoteSeedPayload,
  TrackerSeedPayload,
  PlanSeedPayload,
} from '../test-data/seeding.datasets';

export interface SeedManifest {
  seededAt: string;
  backendUrl: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  journeys: number[];
  plans: number[];
  tasks: number[];
  notes: number[];
  trackers: number[];
  uploadedFiles: Array<{ id?: number; fileName: string; module: string }>;
  attachments?: Array<{ id?: number; fileName: string; module: string }>;
}

export class LifeTrackSeeder {
  private apiContext: APIRequestContext | null = null;
  private token: string | null = null;
  private backendUrl: string;
  private manifest: SeedManifest | null = null;
  private manifestPath: string;

  constructor(backendUrl: string = process.env.BACKEND_URL || 'http://localhost:5000') {
    this.backendUrl = backendUrl.replace(/\/$/, '');
    this.manifestPath = path.resolve(__dirname, '../test-data/seed-manifest.json');
  }

  /**
   * Initializes Playwright APIRequestContext
   */
  async initContext(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      this.token = token;
    }

    this.apiContext = await request.newContext({
      baseURL: this.backendUrl,
      extraHTTPHeaders: headers,
    });
  }

  /**
   * Authenticate test user and store bearer token
   */
  async authenticate(username: string, password: string): Promise<{ token: string; user: any }> {
    if (!this.apiContext) {
      await this.initContext();
    }

    const response = await this.apiContext!.post('/auth/login', {
      data: { username, password },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`Authentication failed with status ${response.status()}: ${errorBody}`);
    }

    const resJson = await response.json();
    this.token = resJson.access_token || resJson.token;
    const user = resJson.user;

    // Re-initialize context with bearer token
    await this.initContext(this.token!);

    this.manifest = {
      seededAt: new Date().toISOString(),
      backendUrl: this.backendUrl,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      journeys: [],
      plans: [],
      tasks: [],
      notes: [],
      trackers: [],
      uploadedFiles: [],
    };

    return { token: this.token!, user };
  }

  /**
   * Seed Scenario B (Standard Dataset) via authenticated REST APIs
   */
  async seedScenarioB(dataset: SeedDataset = SCENARIO_B_MEDIUM): Promise<SeedManifest> {
    if (!this.apiContext || !this.token || !this.manifest) {
      throw new Error('Seeder not authenticated. Call authenticate() first.');
    }

    // 1. Seed Journeys
    const journeyIdMap: number[] = [];
    for (const journeyData of dataset.journeys) {
      const resp = await this.apiContext.post('/api/journeys', {
        data: journeyData,
      });
      if (!resp.ok()) {
        throw new Error(`Failed to create Journey "${journeyData.name}": ${await resp.text()}`);
      }
      const created = await resp.json();
      journeyIdMap.push(created.id);
      this.manifest.journeys.push(created.id);
    }

    // 2. Seed Approved Plans (Universal AI Planner)
    const planIdMap: number[] = [];
    for (const planData of dataset.plans) {
      const resp = await this.apiContext.post('/api/tasks/ai-plan/approve', {
        data: planData,
      });
      if (resp.ok()) {
        const createdPlan = await resp.json();
        const planId = createdPlan.plan?.id || createdPlan.id;
        if (planId) {
          planIdMap.push(planId);
          this.manifest.plans.push(planId);
        }
        // If tasks were auto-created by plan approval
        if (createdPlan.tasks && Array.isArray(createdPlan.tasks)) {
          for (const t of createdPlan.tasks) {
            this.manifest.tasks.push(t.id);
          }
        }
      }
    }

    // 3. Seed Individual Tasks
    for (const taskData of dataset.tasks) {
      const payload: any = {
        title: taskData.title,
        description: taskData.description,
        notes: taskData.notes,
        startDate: taskData.startDate,
        dueDate: taskData.dueDate,
        priority: taskData.priority || 'MEDIUM',
        status: taskData.status || 'PENDING',
      };

      if (taskData.journeyIndex !== undefined && journeyIdMap[taskData.journeyIndex]) {
        payload.journeyId = journeyIdMap[taskData.journeyIndex];
      }

      const resp = await this.apiContext.post('/api/tasks', {
        data: payload,
      });
      if (!resp.ok()) {
        throw new Error(`Failed to create Task "${taskData.title}": ${await resp.text()}`);
      }
      const created = await resp.json();
      this.manifest.tasks.push(created.id);
    }

    // 4. Seed Notes, Pin/Archive States, & File Uploads
    const noteIdMap: number[] = [];
    for (const noteData of dataset.notes) {
      const payload: any = {
        title: noteData.title,
        content: noteData.content,
        category: noteData.category,
        tags: noteData.tags || [],
        type: noteData.type,
      };

      if (noteData.type === 'JOURNEY' && noteData.journeyIndex !== undefined && journeyIdMap[noteData.journeyIndex]) {
        payload.journeyId = journeyIdMap[noteData.journeyIndex];
      }

      const resp = await this.apiContext.post('/api/notes', {
        data: payload,
      });
      if (!resp.ok()) {
        throw new Error(`Failed to create Note "${noteData.title}": ${await resp.text()}`);
      }
      const createdNote = await resp.json();
      noteIdMap.push(createdNote.id);
      this.manifest.notes.push(createdNote.id);

      // Pin if requested
      if (noteData.isPinned) {
        await this.apiContext.patch(`/api/notes/${createdNote.id}/pin`, {
          data: { isPinned: true },
        });
      }

      // Archive if requested
      if (noteData.isArchived) {
        await this.apiContext.patch(`/api/notes/${createdNote.id}/archive`, {
          data: { isArchived: true },
        });
      }

      // Upload file attachments if specified
      if (noteData.filesToAttach && noteData.filesToAttach.length > 0) {
        for (const fileName of noteData.filesToAttach) {
          const filePath = path.resolve(__dirname, '../test-data/files', fileName);
          if (fs.existsSync(filePath)) {
            const fileBuffer = fs.readFileSync(filePath);
            const uploadResp = await this.apiContext.post(`/api/notes/${createdNote.id}/upload`, {
              multipart: {
                files: {
                  name: fileName,
                  mimeType: fileName.endsWith('.pdf') ? 'application/pdf' : 'image/png',
                  buffer: fileBuffer,
                },
              },
            });
            if (uploadResp.ok()) {
              this.manifest.uploadedFiles.push({
                fileName,
                module: `notes-${createdNote.id}`,
              });
            }
          }
        }
      }
    }

    // 5. Seed Trackers & Tracker Logs
    for (const trackerData of dataset.trackers) {
      const journeyId = journeyIdMap[trackerData.journeyIndex];
      if (!journeyId) continue;

      const trackerPayload = {
        journeyId,
        name: trackerData.name,
        description: trackerData.description,
        trackingType: trackerData.trackingType,
        unit: trackerData.unit,
        targetValue: trackerData.targetValue,
        frequency: trackerData.frequency,
      };

      const resp = await this.apiContext.post('/api/trackers', {
        data: trackerPayload,
      });
      if (!resp.ok()) {
        throw new Error(`Failed to create Tracker "${trackerData.name}": ${await resp.text()}`);
      }
      const createdTracker = await resp.json();
      this.manifest.trackers.push(createdTracker.id);

      // Add tracker logs
      for (const log of trackerData.logs) {
        await this.apiContext.post(`/api/trackers/${createdTracker.id}/logs`, {
          data: log,
        });
      }
    }

    // Save manifest to disk
    this.saveManifest();
    return this.manifest;
  }

  /**
   * Verify seeded records against Dashboard Overview & Analytics
   */
  async verifyDashboardMetrics() {
    if (!this.apiContext) {
      throw new Error('API context not initialized');
    }

    const overviewResp = await this.apiContext.get('/api/dashboard/overview');
    if (!overviewResp.ok()) {
      throw new Error(`Failed to fetch dashboard overview: ${await overviewResp.text()}`);
    }
    const overview = await overviewResp.json();

    const analyticsResp = await this.apiContext.get('/api/dashboard/analytics');
    if (!analyticsResp.ok()) {
      throw new Error(`Failed to fetch dashboard analytics: ${await analyticsResp.text()}`);
    }
    const analytics = await analyticsResp.json();

    return {
      overview,
      analytics,
    };
  }

  /**
   * Safe Manifest-Based Cleanup
   * Reverses seeding by deleting strictly the entities tracked in the manifest
   */
  async cleanup(customManifestPath?: string): Promise<{
    trackersDeleted: number;
    notesDeleted: number;
    tasksDeleted: number;
    plansDeleted: number;
    journeysDeleted: number;
  }> {
    const targetPath = customManifestPath || this.manifestPath;
    if (!fs.existsSync(targetPath)) {
      return { trackersDeleted: 0, notesDeleted: 0, tasksDeleted: 0, plansDeleted: 0, journeysDeleted: 0 };
    }

    const manifestContent: SeedManifest = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
    if (!this.apiContext) {
      await this.initContext(this.token || undefined);
    }

    let trackersDeleted = 0;
    let notesDeleted = 0;
    let tasksDeleted = 0;
    let plansDeleted = 0;
    let journeysDeleted = 0;

    // 1. Delete Trackers
    for (const trackerId of manifestContent.trackers) {
      const res = await this.apiContext!.delete(`/api/trackers/${trackerId}`);
      if (res.ok()) trackersDeleted++;
    }

    // 2. Delete Notes
    for (const noteId of manifestContent.notes) {
      const res = await this.apiContext!.delete(`/api/notes/${noteId}`);
      if (res.ok()) notesDeleted++;
    }

    // 3. Delete Tasks
    for (const taskId of manifestContent.tasks) {
      const res = await this.apiContext!.delete(`/api/tasks/${taskId}`);
      if (res.ok()) tasksDeleted++;
    }

    // 4. Delete Plans
    for (const planId of manifestContent.plans) {
      const res = await this.apiContext!.delete(`/api/tasks/plans/${planId}`);
      if (res.ok()) plansDeleted++;
    }

    // 5. Delete Journeys
    for (const journeyId of manifestContent.journeys) {
      const res = await this.apiContext!.delete(`/api/journeys/${journeyId}`);
      if (res.ok()) journeysDeleted++;
    }

    // Remove manifest after clean execution
    try {
      fs.unlinkSync(targetPath);
    } catch (e) {
      // Ignore if already deleted
    }

    return {
      trackersDeleted,
      notesDeleted,
      tasksDeleted,
      plansDeleted,
      journeysDeleted,
    };
  }

  /**
   * Persist current manifest to disk
   */
  private saveManifest() {
    if (!this.manifest) return;
    const dir = path.dirname(this.manifestPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.manifestPath, JSON.stringify(this.manifest, null, 2), 'utf8');
  }

  /**
   * Get current manifest
   */
  getManifest(): SeedManifest | null {
    return this.manifest;
  }

  /**
   * Close API context
   */
  async dispose() {
    if (this.apiContext) {
      await this.apiContext.dispose();
      this.apiContext = null;
    }
  }
}
