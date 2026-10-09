/**
 * Profile + photo API, called from the browser.
 *
 * These endpoints are auth-protected, so calls must run in the browser (not
 * in a `"use server"` file): the session cookie belongs to the API's host, and
 * only the browser can attach it via `credentials: "include"`.
 *
 * Endpoints used:
 *   GET   /api/v1/users/me        - current user
 *   PATCH /api/v1/users/me        - update name / phone / gender
 *   GET   /api/v1/profile/me      - current profile (about/links)
 *   PATCH /api/v1/profile/me      - update profile (links)
 *   POST  /api/v1/profile/me/photo- upload a profile photo (multipart, field "file")
 *
 * Every call returns a flattened `{ success, message, data }` result so a
 * component can show `message` directly. Errors never throw.
 */

import { apiUrl } from "@/lib/core/api-url";

export interface ApiUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  role: string | null;
  image?: string | null;
}

/** The response body returned by the server for all of these endpoints. */
interface ApiEnvelope<T> {
  success: boolean;
  statusCode?: number;
  message?: string;
  data?: T;
}

export interface ApiResult<T> {
  ok: boolean;
  message: string;
  data: T | null;
}

function toResult<T>(envelope: ApiEnvelope<T> | null, fallback: string): ApiResult<T> {
  if (!envelope) {
    return { ok: false, message: fallback, data: null };
  }
  if (!envelope.success) {
    return { ok: false, message: envelope.message || fallback, data: null };
  }
  return { ok: true, message: envelope.message || "Done.", data: envelope.data ?? null };
}

async function readEnvelope<T>(response: Response): Promise<ApiEnvelope<T> | null> {
  try {
    return (await response.json()) as ApiEnvelope<T>;
  } catch {
    return null;
  }
}

/** POST/PATCH with a JSON body and the session cookie. */
async function sendJson<T>(method: "GET" | "PATCH", path: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const response = await fetch(apiUrl(path), {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return toResult<T>(await readEnvelope<T>(response), `Request failed (${response.status}).`);
  } catch (error) {
    console.error("Profile API request failed:", error);
    return { ok: false, message: "Could not reach the server. Please try again.", data: null };
  }
}

// ---------------------------------------------------------------------------
// GET /api/v1/users/me
// ---------------------------------------------------------------------------

export async function getMe(): Promise<ApiResult<ApiUser>> {
  return sendJson<ApiUser>("GET", "/api/v1/users/me");
}

// ---------------------------------------------------------------------------
// PATCH /api/v1/users/me
// ---------------------------------------------------------------------------

export interface UpdateMePayload {
  name?: string;
  phone?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
}

export async function updateMe(payload: UpdateMePayload): Promise<ApiResult<ApiUser>> {
  return sendJson<ApiUser>("PATCH", "/api/v1/users/me", payload);
}

// ---------------------------------------------------------------------------
// GET /api/v1/profile/me
// ---------------------------------------------------------------------------

export interface ApiProfile {
  id?: string;
  userId?: string;
  about?: string | null;
  links?: string[] | null;
  image?: string | null;
}

export async function getMyProfile(): Promise<ApiResult<ApiProfile>> {
  return sendJson<ApiProfile>("GET", "/api/v1/profile/me");
}

// ---------------------------------------------------------------------------
// PATCH /api/v1/profile/me
// ---------------------------------------------------------------------------

export interface UpdateProfilePayload {
  about?: string;
  links?: string[];
}

export async function updateMyProfile(payload: UpdateProfilePayload): Promise<ApiResult<ApiProfile>> {
  return sendJson<ApiProfile>("PATCH", "/api/v1/profile/me", payload);
}

// ---------------------------------------------------------------------------
// POST /api/v1/profile/me/photo  (multipart, field "file")
// ---------------------------------------------------------------------------

export async function uploadProfilePhoto(file: File): Promise<ApiResult<{ image?: string; publicId?: string }>> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(apiUrl("/api/v1/profile/me/photo"), {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    return toResult<{ image?: string; publicId?: string }>(
      await readEnvelope(response),
      `Upload failed (${response.status}).`,
    );
  } catch (error) {
    console.error("Profile photo upload failed:", error);
    return { ok: false, message: "Could not upload the photo. Please try again.", data: null };
  }
}