"use client";

import {
  AUTH_COOKIE_NAME,
  type AuthResponse,
  changeMyPassword,
  loginBuyer,
  registerBuyer,
  updateMyProfile,
} from "@/lib/api/buyer-api";

export function setAuthToken(token: string, expiresInSeconds: number) {
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${expiresInSeconds}; SameSite=Lax`;
}

export function clearAuthToken() {
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function readAuthTokenFromCookie(): string | undefined {
  const chunk = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`));

  if (!chunk) {
    return undefined;
  }

  return decodeURIComponent(chunk.slice(AUTH_COOKIE_NAME.length + 1));
}

export async function login(input: { email: string; password: string }): Promise<AuthResponse> {
  const response = await loginBuyer(input);
  setAuthToken(response.accessToken, response.expiresInSeconds);
  return response;
}

export async function signup(input: {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  registrationNumber: string;
}): Promise<AuthResponse> {
  const response = await registerBuyer(input);
  setAuthToken(response.accessToken, response.expiresInSeconds);
  return response;
}

export async function updateMyProfileFromClient(updates: Parameters<typeof updateMyProfile>[1]) {
  const token = readAuthTokenFromCookie();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return updateMyProfile(token, updates);
}

export async function changeMyPasswordFromClient(payload: { currentPassword: string; nextPassword: string }) {
  const token = readAuthTokenFromCookie();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return changeMyPassword(token, payload);
}
