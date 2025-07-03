"use server";

import { API_URL } from "@/lib/data";
import { cookies } from "next/headers";

type CreateElectionData = {
  title: string;
  description: string;
  electionTypeId: string;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
};

type CreateCandidateData = {
  name: string;
  party: string;
  imageUrl?: string;
  position: number;
};

type CreateCommissionerData = {
  userId: string;
};

export async function getAllElections() {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/elections`, {
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
      throw new Error(errorData.message || "Failed to get elections");
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

export async function getAllElectionsAdmin() {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/elections/all`, {
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
      throw new Error(errorData.message || "Failed to get elections");
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

export async function getElectionById(id: string) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/elections/${id}`, {
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
      throw new Error(errorData.message || "Failed to get election");
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

export async function getElectionResultsById(id: string) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/elections/${id}/results`, {
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
      throw new Error(errorData.message || "Failed to get election results");
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

export async function createElection(electionData: CreateElectionData) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/elections`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
      method: "POST",
      body: JSON.stringify(electionData),
    });

    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(errorData.message || "Failed to create election");
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

export async function addElectionCandidate(
  electionId: string,
  candidateData: CreateCandidateData
) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/elections/${electionId}/candidates`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
      method: "POST",
      body: JSON.stringify(candidateData),
    });

    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(errorData.message || "Failed to add candidate");
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

export async function addElectionCommissioner(
  electionId: string,
  commissionerData: CreateCommissionerData
) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(
      `${API_URL}/elections/${electionId}/commissioners`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookieStore.get("token")?.value}`,
        },
        method: "POST",
        body: JSON.stringify(commissionerData),
      }
    );

    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(errorData.message || "Failed to add commissioner");
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

export async function updateElection(
  electionId: string,
  electionData: CreateElectionData
) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/elections/${electionId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
      method: "PUT",
      body: JSON.stringify(electionData),
    });

    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(errorData.message || "Failed to update election");
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

export async function updateElectionCandidate(
  electionId: string,
  candidateId: string,
  candidateData: Omit<CreateCandidateData, "position">
) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(
      `${API_URL}/elections/${electionId}/candidates/${candidateId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookieStore.get("token")?.value}`,
        },
        method: "PUT",
        body: JSON.stringify(candidateData),
      }
    );

    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(errorData.message || "Failed to update candidate");
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

export async function updateElectionWithCandidates(
  electionId: string,
  electionData: CreateElectionData,
  candidates: { id?: string; name: string; party: string; imageUrl?: string }[]
) {
  try {
    // Step 1: Update the election
    const electionResult = await updateElection(electionId, electionData);
    if (electionResult.error) {
      return { error: electionResult.error };
    }

    // Step 2: Update candidates
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];

      if (candidate.id) {
        // Update existing candidate
        const candidateResult = await updateElectionCandidate(
          electionId,
          candidate.id,
          {
            name: candidate.name,
            party: candidate.party,
            imageUrl: candidate.imageUrl,
          }
        );

        if (candidateResult.error) {
          return {
            error: `Failed to update candidate "${candidate.name}": ${candidateResult.error}`,
            partialSuccess: { electionId, updatedCandidates: i },
          };
        }
      } else {
        // Add new candidate
        const candidateResult = await addElectionCandidate(electionId, {
          name: candidate.name,
          party: candidate.party,
          imageUrl: candidate.imageUrl,
          position: i + 1,
        });

        if (candidateResult.error) {
          return {
            error: `Failed to add new candidate "${candidate.name}": ${candidateResult.error}`,
            partialSuccess: { electionId, updatedCandidates: i },
          };
        }
      }
    }

    return {
      success: true,
      election: electionResult,
      electionId,
      message: "Election updated successfully with all candidates",
    };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "An unknown error occurred while updating election" };
  }
}

export async function createElectionWithCandidatesAndCommissioners(
  electionData: CreateElectionData,
  candidates: { name: string; party: string; imageUrl?: string }[],
  commissioners: { userId: string }[]
) {
  try {
    // Step 1: Create the election
    const electionResult = await createElection(electionData);
    if (electionResult.error) {
      return { error: electionResult.error };
    }

    const electionId = electionResult.data.id;

    // Step 2: Add candidates
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const candidateResult = await addElectionCandidate(electionId, {
        name: candidate.name,
        party: candidate.party,
        imageUrl: candidate.imageUrl,
        position: i + 1,
      });

      if (candidateResult.error) {
        return {
          error: `Failed to add candidate "${candidate.name}": ${candidateResult.error}`,
          partialSuccess: { electionId, addedCandidates: i },
        };
      }
    }

    // Step 3: Add commissioners
    for (let i = 0; i < commissioners.length; i++) {
      const commissioner = commissioners[i];
      const commissionerResult = await addElectionCommissioner(electionId, {
        userId: commissioner.userId,
      });

      if (commissionerResult.error) {
        return {
          error: `Failed to add commissioner: ${commissionerResult.error}`,
          partialSuccess: {
            electionId,
            addedCandidates: candidates.length,
            addedCommissioners: i,
          },
        };
      }
    }

    return {
      success: true,
      election: electionResult,
      electionId,
      message:
        "Election created successfully with all candidates and commissioners",
    };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "An unknown error occurred while creating election" };
  }
}

export async function voteForElection(electionId: string, candidateId: string) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/elections/${electionId}/vote`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
      method: "POST",
      body: JSON.stringify({ candidateId }),
    });

    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(errorData.message || "Failed to vote for election");
    }

    const data = await resp.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "An unknown error occurred while voting for election" };
  }
}

export async function getMyElectionsDuty() {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(
      `${API_URL}/elections/my-commissioner-assignments`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookieStore.get("token")?.value}`,
        },
        method: "GET",
      }
    );
    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(errorData.message || "Failed to get my elections duty");
    }
    const data = await resp.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return {
      error: "An unknown error occurred while getting my elections duty",
    };
  }
}

export async function approveElection(electionId: string) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(
      `${API_URL}/elections/${electionId}/approve-results`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookieStore.get("token")?.value}`,
        },
        method: "POST",
      }
    );
    if (!resp.ok) {
      const errorData = await resp.json();
      if (errorData.errors) {
        throw new Error(JSON.stringify(errorData.errors));
      }
      throw new Error(errorData.message || "Failed to approve election");
    }
    const data = await resp.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "An unknown error occurred while approving election" };
  }
}

export async function deleteElection(electionId: string) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/elections/${electionId}`, {
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
      throw new Error(errorData.message || "Failed to delete election");
    }

    const data = await resp.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "An unknown error occurred while deleting election" };
  }
}

export async function createNextRoundElection(
  electionId: string,
  data: { numberOfCandidates: number; startDate: string; endDate: string }
) {
  try {
    const cookieStore = await cookies();
    const resp = await fetch(`${API_URL}/elections/${electionId}/next-round`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookieStore.get("token")?.value}`,
      },
      body: JSON.stringify(data),
    });
    const result = await resp.json();
    if (!resp.ok) {
      return { error: result.message || "Failed to create next round" };
    }
    return { data: result.data };
  } catch (error: any) {
    return { error: error.message || "Failed to create next round" };
  }
}
