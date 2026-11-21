import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/auth/login.page';
import { SignupPage } from '../pages/auth/signup.page';
import { ForgotPasswordPage } from '../pages/auth/forgot-password.page';
import { SetPasswordPage } from '../pages/auth/set-password.page';
import { YopmailPage } from '../pages/mail/yopmail.page';
import { DashboardPage } from '../pages/dashboard.page';
import { JourneysPage } from '../pages/journeys.page';
import { NotesPage } from '../pages/notes.page';
import { TasksPage } from '../pages/tasks.page';
import { TrackerPage } from '../pages/tracker.page';
import { SidebarComponent } from '../pages/components/sidebar.component';

type AppFixtures = {
  loginPage: LoginPage;
  signupPage: SignupPage;
  forgotPasswordPage: ForgotPasswordPage;
  setPasswordPage: SetPasswordPage;
  yopmailPage: YopmailPage;
  dashboardPage: DashboardPage;
  journeysPage: JourneysPage;
  notesPage: NotesPage;
  tasksPage: TasksPage;
  trackerPage: TrackerPage;
  sidebar: SidebarComponent;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  signupPage: async ({ page }, use) => use(new SignupPage(page)),
  forgotPasswordPage: async ({ page }, use) => use(new ForgotPasswordPage(page)),
  setPasswordPage: async ({ page }, use) => use(new SetPasswordPage(page)),
  yopmailPage: async ({ page }, use) => use(new YopmailPage(page)),
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
  journeysPage: async ({ page }, use) => use(new JourneysPage(page)),
  notesPage: async ({ page }, use) => use(new NotesPage(page)),
  tasksPage: async ({ page }, use) => use(new TasksPage(page)),
  trackerPage: async ({ page }, use) => use(new TrackerPage(page)),
  sidebar: async ({ page }, use) => use(new SidebarComponent(page)),
});

export { expect } from '@playwright/test';
