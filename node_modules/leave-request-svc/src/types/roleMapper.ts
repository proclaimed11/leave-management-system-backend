import { EmployeeRole } from "../types/approval";

export function mapDirectoryRoleToEmployeeRole(
  directoryRole: string
): EmployeeRole {
  switch (directoryRole.toLowerCase()) {
    case "employee":
      return "employee";
    case "supervisor":
      return "supervisor";
    case "hod":
      return "hod";
    case "hr":
      return "hr";
    case "management":
      return "management";
    case "admin":
      return "admin";
    case "consultant":
      return "consultant";
    default:
      return "employee"; 
  }
}
