type BankEntry = {
    name?: string;
    code?: string;
    [key: string]: unknown;
};
declare const getBanks: () => Promise<BankEntry[]>;
export default getBanks;
//# sourceMappingURL=bankService.d.ts.map