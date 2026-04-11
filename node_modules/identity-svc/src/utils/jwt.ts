import jwt, { SignOptions, Algorithm } from "jsonwebtoken";
import { CONFIG } from "./config";
import { JwtUser } from "../types/types";

function getAlgorithm(): Algorithm {
  if (CONFIG.AUTH.JWT_PRIVATE_KEY && CONFIG.AUTH.JWT_PUBLIC_KEY) {
    return "RS256";
  }
  return "HS256";
}

export function signJwt(
  payload: JwtUser,
  overrideOptions?: SignOptions     // <-- allow second argument
): string {
  const algorithm = getAlgorithm();

  // Default options
  const baseOptions: SignOptions = {
    algorithm,
    expiresIn: CONFIG.AUTH.JWT_EXPIRES_IN as any, // already validated as string | number
  };

  // Merge: user overrides > base options
  const finalOptions: SignOptions = {
    ...baseOptions,
    ...(overrideOptions || {}),
  };

  if (algorithm === "RS256") {
    return jwt.sign(
      payload,
      CONFIG.AUTH.JWT_PRIVATE_KEY as jwt.Secret,
      finalOptions
    );
  }

  return jwt.sign(
    payload,
    CONFIG.AUTH.JWT_SECRET as jwt.Secret,
    finalOptions
  );
}

export function verifyJwt<T = JwtUser>(token: string): T {
  const algorithm = getAlgorithm();

  if (algorithm === "RS256") {
    return jwt.verify(
      token,
      CONFIG.AUTH.JWT_PUBLIC_KEY as jwt.Secret,
      { algorithms: ["RS256"] }
    ) as T;
  }

  return jwt.verify(
    token,
    CONFIG.AUTH.JWT_SECRET as jwt.Secret,
    { algorithms: ["HS256"] }
  ) as T;
}


export function signRefreshToken(payload: any): string {
  const options: SignOptions = {
    expiresIn: CONFIG.AUTH.JWT_REFRESH_EXPIRES_IN as any, // "30d"
  };

  return jwt.sign(
    payload,
    CONFIG.AUTH.JWT_REFRESH_SECRET as jwt.Secret,
    options
  );
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(
    token,
    CONFIG.AUTH.JWT_REFRESH_SECRET as jwt.Secret
  );
}