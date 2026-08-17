/**
 * Canonical field names the matching engine can resolve to a Profile value.
 * Education and work history are matched against the most recent entry
 * (last item in each array) — v1 does not handle repeating field groups
 * for multiple education/work entries on a single form.
 */
export type CanonicalField =
  | "firstName"
  | "lastName"
  | "fullName"
  | "dateOfBirth"
  | "age"
  | "gender"
  | "email"
  | "phone"
  | "addressStreet"
  | "addressCity"
  | "addressState"
  | "addressZip"
  | "addressCountry"
  | "school"
  | "degree"
  | "fieldOfStudy"
  | "gpa"
  | "educationStartDate"
  | "educationEndDate"
  | "employer"
  | "jobTitle"
  | "workStartDate"
  | "workEndDate"
  | "workDescription";

/**
 * Canonical field -> known label/placeholder/name variants, already in
 * normalized form (lowercase, no punctuation). Order matters only for
 * readability; matching does not depend on order.
 */
export const DICTIONARY: Record<CanonicalField, string[]> = {
  firstName: ["first name", "firstname", "given name", "forename", "your first name", "applicant first name", "first"],
  lastName: ["last name", "lastname", "surname", "family name", "your last name", "applicant last name", "last"],
  fullName: ["full name", "fullname", "applicant name", "your name", "full legal name", "complete name"],
  dateOfBirth: ["date of birth", "dateofbirth", "dob", "birth date", "birthdate", "date of birth", "when were you born"],
  age: ["age", "your age"],
  gender: ["gender", "sex", "select gender", "what is your gender"],
  email: ["email", "email address", "e mail", "contact email", "primary email", "work email", "your email"],
  phone: ["phone", "phone number", "telephone", "mobile", "mobile number", "cell", "cell number", "contact phone", "best phone", "primary phone", "phone"],
  addressStreet: ["street", "street address", "address line 1", "address 1", "address", "street address", "address line 2", "apartment", "suite"],
  addressCity: ["city", "town", "city name"],
  addressState: ["state", "province", "region", "state province"],
  addressZip: ["zip", "zip code", "postal code", "postcode", "zip postal"],
  addressCountry: ["country", "country name"],
  school: ["school", "university", "college", "institution", "school name", "education institution", "university name", "college name"],
  degree: ["degree", "degree type", "qualification", "degree obtained", "degree name"],
  fieldOfStudy: ["field of study", "major", "fieldofstudy", "area of study", "major minor", "subject area", "program", "course"],
  gpa: ["gpa", "grade point average", "grade average", "cumulative gpa"],
  educationStartDate: ["education start date", "start date", "attendance start", "enrollment date", "start of studies", "when did you start"],
  educationEndDate: ["education end date", "end date", "graduation date", "attendance end", "graduation", "when did you graduate"],
  employer: ["employer", "company", "company name", "current employer", "previous employer", "organization", "employer name", "where do you work"],
  jobTitle: ["job title", "title", "position", "role", "position title", "current position", "job function", "position held"],
  workStartDate: ["employment start date", "job start date", "work start date", "employment began", "start of employment"],
  workEndDate: ["employment end date", "job end date", "work end date", "employment ended", "end of employment"],
  workDescription: ["job description", "responsibilities", "description", "duties", "work description", "summary of responsibilities"],
};
