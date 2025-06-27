"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ElectionDetails } from "@/components/dashboard/election-details";
import { ElectionForm } from "@/components/dashboard/election-form";
import { ElectionsTable } from "@/components/dashboard/elections-table";
import { Election, ElectionType, User } from "@/lib/type";
import { deleteElection } from "@/actions/election.action";
import { toast } from "sonner";
import { AddVotersModal } from "./add-voters-modal";

export default function ElectionsPage({
  elections,
  electionTypes,
  users,
}: {
  elections: Election[];
  electionTypes: ElectionType[];
  users: User[];
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [editingElection, setEditingElection] = useState<any>(null);
  const [isAddVotersModalOpen, setIsAddVotersModalOpen] = useState(false);

  const handleCreate = () => {
    setEditingElection(null);
    setIsFormOpen(true);
  };

  const handleEdit = (election: any) => {
    setEditingElection(election);
    setIsFormOpen(true);
  };

  const handleView = (election: any) => {
    setSelectedElection(election);
    setIsDetailsOpen(true);
  };

  const handleAddVoters = (election: any) => {
    setSelectedElection(election);
    setIsAddVotersModalOpen(true);
  };

  const handleSubmit = (electionData: any) => {
    // In a real app, you would make an API call here
    console.log("Election data:", electionData);
  };

  const handleDelete = async (election: Election) => {
    try {
      const result = await deleteElection(election.id);

      if (result.error) {
        toast.dismiss();
        toast.error("Failed to delete election", {
          description: result.error,
        });
      } else {
        toast.dismiss();
        toast.success("Election deleted successfully", {
          description: `"${election.title}" has been deleted.`,
        });
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to delete election", {
        description: "An unexpected error occurred.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Elections Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage elections with candidates and commissioners.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Election
        </Button>
      </div>

      <ElectionsTable
        initialElections={elections}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onAddVoters={handleAddVoters}
      />

      <ElectionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        election={editingElection}
        electionTypes={electionTypes}
        users={users}
      />

      {selectedElection && isAddVotersModalOpen && (
        <AddVotersModal
          isOpen={isAddVotersModalOpen}
          onClose={() => setIsAddVotersModalOpen(false)}
          electionId={selectedElection.id}
          onSuccess={() => {
            setIsAddVotersModalOpen(false);
          }}
        />
      )}
      <ElectionDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        election={selectedElection}
      />
    </div>
  );
}
