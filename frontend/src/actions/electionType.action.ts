"use server";

import { API_URL } from "@/lib/data";
import { cookies } from "next/headers";

export async function getAllElectionTypes() {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/election-types`, {
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
      throw new Error(errorData.message || "Failed to get election types");
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

export async function createElectionType(
  name: string,
  description: string,
  isActive: boolean
) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/election-types`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
      method: "POST",
      body: JSON.stringify({ name, description, isActive }),
    });
    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(errorData.message || "Failed to create election type");
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

export async function updateElectionType(
  id: string,
  name: string,
  description: string,
  isActive: boolean
) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/election-types/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
      method: "PUT",
      body: JSON.stringify({ name, description, isActive }),
    });
    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(errorData.message || "Failed to update election type");
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

export async function deleteElectionType(id: string) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/election-types/${id}`, {
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
      throw new Error(errorData.message || "Failed to delete election type");
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
