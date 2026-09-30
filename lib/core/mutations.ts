"use server";

// ============================================================
// BASE URL
// ============================================================

const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
};

// ============================================================
// POST
// ============================================================

/**
 * Sends a POST request with JSON body.
 */
export const postMutation = async (url: string, data: unknown) => {
  const baseUrl = getBaseUrl();

  try {
    const res = await fetch(`${baseUrl}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!res.ok) {
      const rawText = await res.text();
      console.error("POST Error:", rawText);
      return { error: true, status: res.status };
    }

    return await res.json();
  } catch (err) {
    console.error("POST Exception:", err);
    return { error: true, message: "Server connection failed!" };
  }
};

// ============================================================
// DELETE
// ============================================================

export const deleteMutation = async (url: string) => {
  const baseUrl = getBaseUrl();

  try {
    const res = await fetch(`${baseUrl}${url}`, {
      method: "DELETE",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${res.status}`
      );
    }

    return await res.json();
  } catch (error) {
    console.error("DELETE Exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// ============================================================
// PATCH
// ============================================================

export const patchMutation = async (url: string, data: unknown) => {
  const baseUrl = getBaseUrl();

  try {
    const res = await fetch(`${baseUrl}${url}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${res.status}`
      );
    }

    return await res.json();
  } catch (error) {
    console.error("PATCH Exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// ============================================================
// GET
// ============================================================

export const getData = async (url: string) => {
  const baseUrl = getBaseUrl();

  try {
    const res = await fetch(`${baseUrl}${url}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${res.status}`
      );
    }

    return await res.json();
  } catch (error) {
    console.error("GET Exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};