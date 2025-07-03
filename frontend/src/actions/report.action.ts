"use server";

import { API_URL } from "@/lib/data";
import { cookies } from "next/headers";
import { CreateReportData } from "@/lib/type";

export async function getAllReports(search?: string) {
  try {
    const cookieStore = await cookies();
    const url = new URL(`${API_URL}/reports`);

    if (search) {
      url.searchParams.append("search", search);
    }

    const resp = await fetch(url.toString(), {
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
      throw new Error(errorData.message || "Failed to get reports");
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

export async function getReportsByElection(electionId: string) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/reports/election/${electionId}`, {
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
      throw new Error(errorData.message || "Failed to get election reports");
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

export async function getReportById(id: string) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/reports/${id}`, {
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
      throw new Error(errorData.message || "Failed to get report");
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

export async function createReport(reportData: CreateReportData) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/reports`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
      method: "POST",
      body: JSON.stringify(reportData),
    });

    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(errorData.message || "Failed to create report");
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

export async function updateReport(
  id: string,
  reportData: Partial<CreateReportData>
) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/reports/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
      method: "PUT",
      body: JSON.stringify(reportData),
    });

    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(errorData.message || "Failed to update report");
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
