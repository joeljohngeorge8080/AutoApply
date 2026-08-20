import type { Profile } from "../storage/types";

export const SAMPLE_PROFILE: Profile = {
  id: "1",
  name: "Job Search",
  personal: {
    firstName: "Ada",
    lastName: "Lovelace",
    dateOfBirth: "1990-06-15",
    gender: "Female",
  },
  contact: {
    email: "ada@example.com",
    phone: "555-0100",
    address: {
      street: "1 Analytical Engine Way",
      city: "London",
      state: "LDN",
      zip: "SW1A 1AA",
      country: "UK",
    },
  },
  education: [
    {
      school: "University of London",
      degree: "Bachelor of Science",
      fieldOfStudy: "Mathematics",
      gpa: "3.9",
      startDate: "2008-09-01",
      endDate: "2012-06-01",
    },
  ],
  workHistory: [
    {
      employer: "Analytical Engines Inc",
      title: "Software Pioneer",
      startDate: "2013-01-01",
      endDate: "2020-01-01",
      description: "Wrote the first algorithm intended for machine processing.",
    },
  ],
};
