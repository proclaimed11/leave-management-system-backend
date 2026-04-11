import type { Request, Response, NextFunction } from "express";
export type DirectoryRole = "employee" | "supervisor" | "hod" | "management" | "hr" | "admin" | "consultant";
export interface RoleAwareRequest extends Request {
    directory_role?: DirectoryRole;
}
export declare const requireDirectoryRole: (allowed: DirectoryRole[]) => (req: RoleAwareRequest, res: Response, next: NextFunction) => void;
export declare const hrOrAdmin: (req: RoleAwareRequest, res: Response, next: NextFunction) => void;
export declare const adminOnly: (req: RoleAwareRequest, res: Response, next: NextFunction) => void;
export declare const supervisorOrAbove: (req: RoleAwareRequest, res: Response, next: NextFunction) => void;
export declare const managementOnly: (req: RoleAwareRequest, res: Response, next: NextFunction) => void;
export declare const staffOnly: (req: RoleAwareRequest, res: Response, next: NextFunction) => void;
export declare const managerOnly: (req: RoleAwareRequest, res: Response, next: NextFunction) => void;
export declare const internalOnly: (req: Request, res: Response, next: NextFunction) => void;
