import common from './common.json';
import auth from './auth.json';
import sidebar from './sidebar.json';
import dashboard from './dashboard.json';
import journeys from './journeys.json';
import notes from './notes.json';
import tasks from './tasks.json';
import tracker from './tracker.json';

export class IndexSelectors {
  // Common Locators across the application
  commonFlow = common.commonFlows;

  // Auth Module Locators
  loginSection = auth.loginSection;
  signupSection = auth.signupSection;
  forgotPasswordSection = auth.forgotPasswordSection;
  setPasswordSection = auth.setPasswordSection;

  // Navigation & Workspace Layout Locators
  sidebarNavigation = sidebar.sidebarNavigation;
  mobileNavigation = sidebar.mobileNavigation;

  // Dashboard Module Locators
  dashboardOverview = dashboard.dashboardOverview;
  analyticsSection = dashboard.analyticsSection;
  drawerSection = dashboard.drawerSection;
  exportModal = dashboard.exportModal;

  // Journeys Module Locators
  journeySection = journeys.journeySection;
  createJourneyModal = journeys.createJourneyModal;
  editJourneyModal = journeys.editJourneyModal;
  journeyWorkspace = journeys.journeyWorkspace;

  // Notes Module Locators
  notesSection = notes.notesSection;
  noteModal = notes.noteModal;
  attachmentsSection = notes.attachmentsSection;

  // Tasks & AI Planner Module Locators
  taskSection = tasks.taskSection;
  manualTaskModal = tasks.manualTaskModal;
  aiPlanSection = tasks.aiPlanSection;
  copilotSection = tasks.copilotSection;

  // Tracker Module Locators
  trackerSection = tracker.trackerSection;
  journeyProgressSection = tracker.journeyProgressSection;
  taskPlanProgressSection = tracker.taskPlanProgressSection;
}
