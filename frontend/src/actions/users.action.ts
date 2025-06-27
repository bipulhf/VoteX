"use server";

import { API_URL } from "@/lib/data";
import { cookies } from "next/headers";

export async function getAllUsers() {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/users`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
    });
    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(errorData.message || "Failed to login");
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

export async function updateUser(userId: string, role: "USER" | "ADMIN") {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/users/${userId}/role`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
      method: "PUT",
      body: JSON.stringify({ role }),
    });
    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(errorData.message || "Failed to update user");
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

export async function deleteUser(userId: string) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/users/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
      method: "DELETE",
    });
    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(errorData.message || "Failed to delete user");
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
