// import { Request, Response } from "express";
// import { IdentityEngine } from "../services/identityEngine";
// import { CONFIG } from "../utils/config";

// const engine = new IdentityEngine();

// export const provisionUser = async (req: Request, res: Response) => {
//   try {
//     const token = req.headers["x-service-auth"];

//     if (token !== CONFIG.SERVICE_AUTH_TOKEN) {
//       return res.status(403).json({ error: "Forbidden" });
//     }

//     const { email, employee_number, initial_roles } = req.body;

//     const result = await engine.registerLocalUser({
//       employee_number,
//       email,
//       password: crypto.randomUUID().slice(0, 8),
//       initial_roles: initial_roles ?? "employee",
//     });

//     return res.status(201).json({
//       message: "User provisioned",
//       user: result.user,
//       role: result.role
//     });

//   } catch (err: any) {
//     return res.status(400).json({ error: err.message });
//   }
// };
