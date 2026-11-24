import { UserGenerator, GeneratedUser } from './user-generator';

export interface UserFixtureHook {
  randomUser: GeneratedUser;
  userGenerator: typeof UserGenerator;
  createUser: (prefix?: string) => GeneratedUser;
}

export const userFixtureInstance: UserFixtureHook = {
  randomUser: UserGenerator.generateRandomUser(),
  userGenerator: UserGenerator,
  createUser: (prefix?: string) => UserGenerator.generateRandomUser(prefix),
};
