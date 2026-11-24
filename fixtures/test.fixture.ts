import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/auth/login.page';
import { SignupPage } from '../pages/auth/signup.page';
import { ForgotPasswordPage } from '../pages/auth/forgot-password.page';
import { SetPasswordPage } from '../pages/auth/set-password.page';
import { ResetPasswordPage } from '../pages/auth/reset-password.page';
import { YopmailPage } from '../pages/mail/yopmail.page';
import { DashboardPage } from '../pages/dashboard.page';
import { JourneysPage } from '../pages/journeys.page';
import { NotesPage } from '../pages/notes.page';
import { TasksPage } from '../pages/tasks.page';
import { TrackerPage } from '../pages/tracker.page';
import { SettingsPage } from '../pages/settings.page';
import { SidebarComponent } from '../pages/components/sidebar.component';

import { SeededDataFixture, seededDataFixtureInstance } from './seed-data/seed-data.fixture';
import { UserGenerator, GeneratedUser } from './users/user-generator';

export type AppFixtures = {
  // Page Objects
  loginPage: LoginPage;
  signupPage: SignupPage;
  forgotPasswordPage: ForgotPasswordPage;
  setPasswordPage: SetPasswordPage;
  resetPasswordPage: ResetPasswordPage;
  yopmailPage: YopmailPage;
  dashboardPage: DashboardPage;
  journeysPage: JourneysPage;
  notesPage: NotesPage;
  tasksPage: TasksPage;
  trackerPage: TrackerPage;
  settingsPage: SettingsPage;
  sidebar: SidebarComponent;

  // Data & User Fixtures
  seededData: SeededDataFixture;
  randomUser: GeneratedUser;
  userGenerator: typeof UserGenerator;
};

export const test = base.extend<AppFixtures>({
  // Page Object Instances
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  signupPage: async ({ page }, use) => use(new SignupPage(page)),
  forgotPasswordPage: async ({ page }, use) => use(new ForgotPasswordPage(page)),
  setPasswordPage: async ({ page }, use) => use(new SetPasswordPage(page)),
  resetPasswordPage: async ({ page }, use) => use(new ResetPasswordPage(page)),
  yopmailPage: async ({ page }, use) => use(new YopmailPage(page)),
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
  journeysPage: async ({ page }, use) => use(new JourneysPage(page)),
  notesPage: async ({ page }, use) => use(new NotesPage(page)),
  tasksPage: async ({ page }, use) => use(new TasksPage(page)),
  trackerPage: async ({ page }, use) => use(new TrackerPage(page)),
  settingsPage: async ({ page }, use) => use(new SettingsPage(page)),
  sidebar: async ({ page }, use) => use(new SidebarComponent(page)),

  // Seeded Data Fixture (provides access to seed-manifest.json and dataset.json)
  seededData: async ({}, use) => {
    await use(seededDataFixtureInstance);
  },

  // Dynamic Random User Fixture (generates a unique valid user for each test)
  randomUser: async ({}, use) => {
    const user = UserGenerator.generateRandomUser();
    await use(user);
  },

  // Dynamic User Generator Helper
  userGenerator: async ({}, use) => {
    await use(UserGenerator);
  },
});

export { expect } from '@playwright/test';
export { SeededDataFixture } from './seed-data/seed-data.fixture';
export { UserGenerator, GeneratedUser } from './users/user-generator';
