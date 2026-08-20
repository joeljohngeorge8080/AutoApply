export interface Profile {
  id: string;
  name: string; // e.g. "Job Search", "Grad School"
  personal: {
    firstName: string;
    lastName: string;
    dateOfBirth: string; // ISO date (YYYY-MM-DD)
    gender?: string;
  };
  contact: {
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  };
  education: Array<{
    school: string;
    degree: string;
    fieldOfStudy: string;
    gpa?: string;
    startDate: string;
    endDate: string;
  }>;
  workHistory: Array<{
    employer: string;
    title: string;
    startDate: string;
    endDate: string;
    description?: string;
  }>;
}
