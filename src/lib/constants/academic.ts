/**
 * Suggested defaults for eligibility/form pickers. These are NOT hardcoded
 * constraints — admins can type any custom department/year/semester value in
 * the eligibility and form-builder UIs; these lists just seed the picker with
 * common values so nobody has to type "Computer Science & Engineering" from
 * scratch every time.
 */

export const SUGGESTED_DEPARTMENTS = [
  "CSE",
  "IT",
  "AI & DS",
  "ECE",
  "EE",
  "ME",
  "Civil",
] as const;

export const ACADEMIC_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"] as const;

export const SEMESTERS = [
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8",
] as const;
