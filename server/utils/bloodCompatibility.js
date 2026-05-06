/** Blood types that can donate red blood cells for a patient needing `neededType`. */
const COMPATIBLE_DONOR_TYPES = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
};

const ALL_TYPES = Object.keys(COMPATIBLE_DONOR_TYPES);

export function donorTypesCompatibleWithNeed(neededType) {
  return COMPATIBLE_DONOR_TYPES[neededType] || [];
}

/** Request `blood_type` values (hospital need) that this donor can help fulfill. */
export function requestTypesMatchableByDonor(donorBloodType) {
  return ALL_TYPES.filter((need) =>
    COMPATIBLE_DONOR_TYPES[need].includes(donorBloodType)
  );
}
