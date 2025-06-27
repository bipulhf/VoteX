"use server";

import { API_URL } from "@/lib/data";
import { cookies } from "next/headers";

export async function login(email: string, password: string) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/auth/login`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(errorData.message || "Failed to login");
    }
    const data = await resp.json();
    cookieStore.set("token", data.data.accessToken);
    cookieStore.set("role", data.data.user.role);
    cookieStore.set("id", data.data.user.id);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "An unknown error occurred" };
  }
}

export async function register({
  firstName,
  lastName,
  email,
  password,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  try {
    const resp = await fetch(`${API_URL}/auth/register`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ firstName, lastName, email, password }),
    });
    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(errorData.message || "Failed to register");
    }
    const data = await resp.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "An unknown error occurred" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  cookieStore.delete("role");
  cookieStore.delete("id");
  return { success: "Logged out successfully" };
}

export async function verifyEmail(token: string) {
  try {
    const resp = await fetch(`${API_URL}/auth/verify-email`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ token }),
    });
    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(errorData.message || "Failed to verify email");
    }
    const data = await resp.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "An unknown error occurred" };
  }
}

export async function resendVerificationMail(email: string) {
  try {
    const resp = await fetch(`${API_URL}/auth/resend-verification`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ email }),
    });
    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(
        errorData.message || "Failed to resend verification mail"
      );
    }
    const data = await resp.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "An unknown error occurred" };
  }
}
