type PollingUnitDetail = Record<string, unknown>;
declare const buildLocalGovernments: (stateDir: string) => string[];
declare const buildWards: (lgaDir: string, subPathParts?: string[]) => string[];
declare const buildPollingUnits: (lgaDir: string, wardParts: string[]) => string[];
declare const buildPollingUnitDetails: (lgaDir: string, wardParts: string[]) => PollingUnitDetail[];
declare const getData: (baseDir: string) => {
    states: string[];
};
/**
 * Pick the best-matching child directory name under `baseDir` for a human
 * or slug-like `name` segment. Handles numeric prefixes (`28-ondo`),
 * punctuation, repeated spaces, and mixed separators.
 */
declare const findDirectoryWithPrefix: (baseDir: string, name: string) => string | null;
declare const resolveNestedDirectories: (baseDir: string, parts: string[]) => string | null;
export { getData, buildLocalGovernments, buildWards, buildPollingUnits, buildPollingUnitDetails, findDirectoryWithPrefix, resolveNestedDirectories, };
//# sourceMappingURL=locationService.d.ts.map