type UserRole = "observer" | "volunteer";
type UploadFile = {
    originalname: string;
    path: string;
};
type AuthUserDoc = {
    email: string;
    password: string;
    verificationCode?: string | null;
    role?: UserRole;
    observerDetails?: unknown;
    volunteerDetails?: unknown;
    isVerified?: boolean;
    formCompletion?: boolean;
    resetPasswordToken?: string;
    resetPasswordExpires?: number;
    save: () => Promise<unknown>;
    [key: string]: unknown;
};
type RegisterPayload = {
    email: string;
    password: string;
    confirmPassword: string;
};
type SubmitRolePayload = {
    email: string;
    role: UserRole;
    details: Record<string, unknown>;
    file?: UploadFile;
};
type AuthPayload = {
    email: string;
    password: string;
};
export declare const registerUser: (payload: RegisterPayload) => Promise<boolean>;
export declare const verifyUserCode: (email: string, code: string) => Promise<boolean>;
export declare const selectUserRole: (email: string, role: UserRole) => Promise<boolean>;
export declare const submitRoleFormDetails: (payload: SubmitRolePayload) => Promise<boolean>;
export declare const authenticateUser: (payload: AuthPayload) => Promise<string>;
export declare const generateResetToken: (email: string) => Promise<boolean>;
export declare const resetUserPassword: (token: string, newPassword: string) => Promise<boolean>;
export declare const updateUserDetailsService: (email: string, updateData: Record<string, unknown>) => Promise<AuthUserDoc>;
export declare const getAllUsers: () => Promise<AuthUserDoc[]>;
export declare const getUsersByRole: (role: string) => Promise<AuthUserDoc[]>;
export {};
//# sourceMappingURL=authservice2.d.ts.map