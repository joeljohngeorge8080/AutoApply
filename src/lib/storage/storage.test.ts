import { beforeEach, describe, expect, it } from "vitest";
import { deleteProfile, getProfile, listProfiles, saveProfile } from "./storage";
import type { Profile } from "./types";

function makeProfile(id: string, name: string): Profile {
  return {
    id,
    name,
    personal: { firstName: "Ada", lastName: "Lovelace", dateOfBirth: "1990-01-01" },
    contact: {
      email: "ada@example.com",
      phone: "555-0100",
      address: { street: "1 Main St", city: "Springfield", state: "IL", zip: "62701", country: "US" },
    },
    education: [],
    workHistory: [],
  };
}

class FakeChromeStorage {
  private store: Record<string, unknown> = {};

  local = {
    get: async (key: string) => {
      return key in this.store ? { [key]: this.store[key] } : {};
    },
    set: async (items: Record<string, unknown>) => {
      Object.assign(this.store, items);
    },
  };
}

beforeEach(() => {
  (globalThis as unknown as { chrome: unknown }).chrome = { storage: new FakeChromeStorage() };
});

describe("storage CRUD", () => {
  it("returns an empty list when nothing is stored", async () => {
    expect(await listProfiles()).toEqual([]);
  });

  it("saves and lists a new profile", async () => {
    const profile = makeProfile("1", "Job Search");
    await saveProfile(profile);
    expect(await listProfiles()).toEqual([profile]);
  });

  it("gets a profile by id", async () => {
    const profile = makeProfile("1", "Job Search");
    await saveProfile(profile);
    expect(await getProfile("1")).toEqual(profile);
    expect(await getProfile("missing")).toBeUndefined();
  });

  it("updates an existing profile in place rather than duplicating", async () => {
    const profile = makeProfile("1", "Job Search");
    await saveProfile(profile);
    const updated = { ...profile, name: "Grad School" };
    await saveProfile(updated);
    const all = await listProfiles();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe("Grad School");
  });

  it("deletes a profile", async () => {
    await saveProfile(makeProfile("1", "Job Search"));
    await saveProfile(makeProfile("2", "Grad School"));
    await deleteProfile("1");
    const all = await listProfiles();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe("2");
  });
});
