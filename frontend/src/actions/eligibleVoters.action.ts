"use server";

import { API_URL } from "@/lib/data";
import { cookies } from "next/headers";

export async function getEligibleVoters(electionId: string) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/eligible-voters/${electionId}`, {
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
      throw new Error(errorData.message || "Failed to get eligible voters");
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

export async function addEligibleVoters(electionId: string, emails: string[]) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/eligible-voters/${electionId}/add`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
      method: "POST",
      body: JSON.stringify({ emails }),
    });
    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(errorData.message || "Failed to add eligible voters");
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

export async function updateEligibleVoters(
  electionId: string,
  emails: string[]
) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/eligible-voters/${electionId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
      method: "PUT",
      body: JSON.stringify({ emails }),
    });
    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(errorData.message || "Failed to update eligible voters");
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
