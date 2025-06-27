"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, Plus, Trash2, X } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  createElectionWithCandidatesAndCommissioners,
  updateElectionWithCandidates,
} from "@/actions/election.action";
import { toast } from "sonner";

type ElectionType = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

type Candidate = {
  id: string;
  name: string;
  party: string;
};

type Commissioner = {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

type Election = {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  startDate: string;
  endDate: string;
  isResultPublic: boolean;
  electionTypeId: string;
  candidates: Candidate[];
  commissioners: Commissioner[];
};

type ElectionFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (election: Partial<Election>) => void;
  election?: Election | null;
  electionTypes: ElectionType[];
  users: User[];
};

export function ElectionForm({
  isOpen,
  onClose,
  onSubmit,
  election,
  electionTypes,
  users,
}: ElectionFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "DRAFT" as const,
    startDate: new Date(),
    endDate: new Date(),
    isResultPublic: false,
    electionTypeId: "",
  });

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [commissioners, setCommissioners] = useState<Commissioner[]>([]);
  const [newCandidate, setNewCandidate] = useState({ name: "", party: "" });
  const [selectedCommissionerIds, setSelectedCommissionerIds] = useState<
    string[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens/closes or election changes
  useEffect(() => {
    if (election) {
      setFormData({
        title: election.title,
        description: election.description,
        status: election.status as "DRAFT",
        startDate: new Date(election.startDate),
        endDate: new Date(election.endDate),
        isResultPublic: election.isResultPublic,
        electionTypeId: election.electionTypeId,
      });
      setCandidates(election.candidates || []);
      setCommissioners(election.commissioners || []);
      setSelectedCommissionerIds(
        election.commissioners?.map((c) => c.userId) || []
      );
    } else {
      setFormData({
        title: "",
        description: "",
        status: "DRAFT",
        startDate: new Date(),
        endDate: new Date(),
        isResultPublic: false,
        electionTypeId: "",
      });
      setCandidates([]);
      setCommissioners([]);
      setSelectedCommissionerIds([]);
    }
    setNewCandidate({ name: "", party: "" });
  }, [election, isOpen]);

  // Add candidate
  const addCandidate = () => {
    if (newCandidate.name.trim() && newCandidate.party.trim()) {
      const candidate: Candidate = {
        id: `candidate_${Date.now()}`,
        name: newCandidate.name.trim(),
        party: newCandidate.party.trim(),
      };
      setCandidates([...candidates, candidate]);
      setNewCandidate({ name: "", party: "" });
    }
  };

  // Remove candidate
  const removeCandidate = (candidateId: string) => {
    setCandidates(candidates.filter((c) => c.id !== candidateId));
  };

  // Add commissioner
  const addCommissioner = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user && !selectedCommissionerIds.includes(userId)) {
      const commissioner: Commissioner = {
        id: `commissioner_${Date.now()}`,
        userId: user.id,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      };
      setCommissioners([...commissioners, commissioner]);
      setSelectedCommissionerIds([...selectedCommissionerIds, userId]);
    }
  };

  // Remove commissioner
  const removeCommissioner = (userId: string) => {
    setCommissioners(commissioners.filter((c) => c.userId !== userId));
    setSelectedCommissionerIds(
      selectedCommissionerIds.filter((id) => id !== userId)
    );
  };

  // Handle submit
  const handleSubmit = async () => {
    if (election) {
      // Handle edit case
      setIsLoading(true);
      toast.loading("Updating election...");

      try {
        const electionData = {
          title: formData.title,
          description: formData.description,
          electionTypeId: formData.electionTypeId,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
          status: formData.status,
        };

        const candidatesData = candidates.map((candidate) => ({
          id: candidate.id,
          name: candidate.name,
          party: candidate.party,
        }));

        const result = await updateElectionWithCandidates(
          election.id,
          electionData,
          candidatesData
        );

        toast.dismiss();

        if (result.error) {
          toast.error(result.error);
          if (result.partialSuccess) {
            toast.info("Some updates were saved. Please check and try again.");
          }
        } else {
          toast.success("Election updated successfully!");
          onClose();
          // Optionally refresh the page or call a refresh function
          window.location.reload();
        }
      } catch (error) {
        toast.dismiss();
        toast.error("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Handle create case
    setIsLoading(true);
    toast.loading("Creating election...");

    try {
      const electionData = {
        title: formData.title,
        description: formData.description,
        electionTypeId: formData.electionTypeId,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        status: formData.status,
      };

      const candidatesData = candidates.map((candidate) => ({
        name: candidate.name,
        party: candidate.party,
      }));

      const commissionersData = commissioners.map((commissioner) => ({
        userId: commissioner.userId,
      }));

      const result = await createElectionWithCandidatesAndCommissioners(
        electionData,
        candidatesData,
        commissionersData
      );

      toast.dismiss();

      if (result.error) {
        toast.error(result.error);
        if (result.partialSuccess) {
          toast.info("Some data was saved. Please check and try again.");
        }
      } else {
        toast.success("Election created successfully!");
        onClose();
        // Optionally refresh the page or call a refresh function
        window.location.reload();
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Get available commissioners (users with COMMISSIONER role who aren't already assigned)
  const availableCommissioners = users.filter(
    (user) => !selectedCommissionerIds.includes(user.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {election ? "Edit Election" : "Create Election"}
          </DialogTitle>
          <DialogDescription>
            {election
              ? "Update the election information."
              : "Create a new election with candidates and commissioners."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter election title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="electionType">Election Type</Label>
              <Select
                value={formData.electionTypeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, electionTypeId: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select election type" />
                </SelectTrigger>
                <SelectContent>
                  {electionTypes
                    .filter((type) => type.isActive)
                    .map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter election description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as any })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <input
                type="datetime-local"
                value={format(formData.startDate, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    startDate: new Date(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <input
                type="datetime-local"
                value={format(formData.endDate, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    endDate: new Date(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <Separator />

          {/* Candidates */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Candidates</h3>
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Candidate name"
                value={newCandidate.name}
                onChange={(e) =>
                  setNewCandidate({ ...newCandidate, name: e.target.value })
                }
              />
              <Input
                placeholder="Party"
                value={newCandidate.party}
                onChange={(e) =>
                  setNewCandidate({ ...newCandidate, party: e.target.value })
                }
              />
              <Button
                onClick={addCandidate}
                disabled={
                  !newCandidate.name.trim() || !newCandidate.party.trim()
                }
              >
                <Plus className="h-4 w-4" />
                Add Candidate
              </Button>
            </div>

            {candidates.length > 0 && (
              <div className="space-y-2">
                <Label>Added Candidates</Label>
                <div className="space-y-2">
                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <span className="font-medium">{candidate.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {candidate.party}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCandidate(candidate.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!election && (
            <>
              <Separator />

              {/* Commissioners */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Commissioners</h3>
                {availableCommissioners.length > 0 && (
                  <div className="space-y-2">
                    <Label>Add Commissioner</Label>
                    <Select onValueChange={addCommissioner}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a commissioner" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCommissioners.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {commissioners.length > 0 && (
                  <div className="space-y-2">
                    <Label>Assigned Commissioners</Label>
                    <div className="space-y-2">
                      {commissioners.map((commissioner) => (
                        <div
                          key={commissioner.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div>
                            <span className="font-medium">
                              {commissioner.user.firstName}{" "}
                              {commissioner.user.lastName}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({commissioner.user.email})
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeCommissioner(commissioner.userId)
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !formData.title.trim() ||
              !formData.electionTypeId ||
              candidates.length === 0
            }
          >
            {isLoading
              ? election
                ? "Updating..."
                : "Creating..."
              : election
              ? "Update"
              : "Create"}{" "}
            Election
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
