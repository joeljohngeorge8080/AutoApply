import type { Profile } from "./types";

const STORAGE_KEY = "profiles";

async function readProfiles(): Promise<Profile[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as Profile[] | undefined) ?? [];
}

async function writeProfiles(profiles: Profile[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: profiles });
}

export async function listProfiles(): Promise<Profile[]> {
  return readProfiles();
}

export async function getProfile(id: string): Promise<Profile | undefined> {
  const profiles = await readProfiles();
  return profiles.find((p) => p.id === id);
}

export async function saveProfile(profile: Profile): Promise<void> {
  const profiles = await readProfiles();
  const index = profiles.findIndex((p) => p.id === profile.id);
  if (index === -1) {
    profiles.push(profile);
  } else {
    profiles[index] = profile;
  }
  await writeProfiles(profiles);
}

export async function deleteProfile(id: string): Promise<void> {
  const profiles = await readProfiles();
  await writeProfiles(profiles.filter((p) => p.id !== id));
}
