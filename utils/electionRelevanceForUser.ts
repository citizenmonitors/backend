/**
 * Same relevance rules as `getAllActiveElectionsService` (non-admin users):
 * which active-election rows a user should see for their registered location.
 */
export const standardizeElectionName = (name: unknown): string =>
  String(name || "")
    .toLowerCase()
    .replace(/[-\s]/g, "_")
    .trim();

export const normalizeLgaKeyForElection = (raw: unknown): string => {
  if (!raw) return "";
  let s = String(raw).toLowerCase().trim();
  s = s.replace(/^\d+[-_\s]+/, "");
  s = s.replace(/[/\s,-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  return s;
};

type ElectionLite = { electionType?: string; electionName?: string };

export const isActiveElectionRelevantForUser = (
  election: ElectionLite | null | undefined,
  electionLocation: unknown,
  user: { state?: unknown; lga?: unknown }
): boolean => {
  if (!election) return false;

  const electionType = String(election.electionType || "")
    .toLowerCase()
    .trim();
  const normalizedLocation = standardizeElectionName(electionLocation || "");
  const electionLgaKey = normalizeLgaKeyForElection(electionLocation);
  const electionLgaKeys = new Set(
    [normalizedLocation, electionLgaKey, standardizeElectionName(electionLocation || "")].filter(
      Boolean
    )
  );

  const userState = standardizeElectionName(user.state);
  const userLgaRaw = user.lga;
  const userLgaKeys = new Set(
    [
      standardizeElectionName(userLgaRaw),
      normalizeLgaKeyForElection(userLgaRaw),
    ].filter(Boolean)
  );

  if (
    ["national", "house-of-representatives", "senatorial"].includes(electionType)
  ) {
    return true;
  }
  if (["gubernatorial", "house-of-assembly"].includes(electionType)) {
    return normalizedLocation === userState;
  }
  if (electionType === "lga") {
    for (const uk of userLgaKeys) {
      for (const ek of electionLgaKeys) {
        if (uk && ek && uk === ek) return true;
      }
    }
    return false;
  }
  return false;
};
