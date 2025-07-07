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
import { Checkbox } from "@/components/ui/checkbox";
import {
  createElectionWithCandidatesAndCommissioners,
  updateElectionWithCandidates,
} from "@/actions/election.action";
import { CandidateImageUpload } from "./candidate-image-upload";
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
  imageUrl?: string;
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
    // National Election Specific Fields
    officeLevel: "",
    positionType: "",
    state: "",
    district: "",
    isNationalElection: false,
    termDuration: "",
    hasIncumbent: false,
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
        // National Election Specific Fields
        officeLevel: "",
        positionType: "",
        state: "",
        district: "",
        isNationalElection: false,
        termDuration: "",
        hasIncumbent: false,
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
        // National Election Specific Fields
        officeLevel: "",
        positionType: "",
        state: "",
        district: "",
        isNationalElection: false,
        termDuration: "",
        hasIncumbent: false,
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
        imageUrl: undefined,
      };
      setCandidates([...candidates, candidate]);
      setNewCandidate({ name: "", party: "" });
    }
  };

  // Remove candidate
  const removeCandidate = (candidateId: string) => {
    setCandidates(candidates.filter((c) => c.id !== candidateId));
  };

  // Update candidate image
  const updateCandidateImage = (candidateId: string, imageUrl: string) => {
    setCandidates(
      candidates.map((candidate) =>
        candidate.id === candidateId ? { ...candidate, imageUrl } : candidate
      )
    );
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
    // Bangladesh National Election fields (frontend only - not sent to backend per requirements)
    if (formData.isNationalElection) {
      console.log("Bangladesh National Election Data:", {
        officeLevel: formData.officeLevel,
        positionType: formData.positionType,
        division: formData.state,
        district: formData.district,
        termDuration: formData.termDuration,
        hasIncumbent: formData.hasIncumbent,
      });
    }

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
          imageUrl: candidate.imageUrl,
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
        imageUrl: candidate.imageUrl,
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

            {/* National Election Specific Fields */}
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isNationalElection"
                  checked={formData.isNationalElection}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isNationalElection: !!checked })
                  }
                />
                <Label htmlFor="isNationalElection" className="font-medium">
                  🇧🇩 Bangladesh National Election
                </Label>
              </div>

              {formData.isNationalElection && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="officeLevel">Office Level</Label>
                      <Select
                        value={formData.officeLevel}
                        onValueChange={(value) =>
                          setFormData({ ...formData, officeLevel: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select office level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="national">National</SelectItem>
                          <SelectItem value="divisional">Divisional</SelectItem>
                          <SelectItem value="district">District</SelectItem>
                          <SelectItem value="upazila">Upazila</SelectItem>
                          <SelectItem value="union">Union</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="positionType">Position Type</Label>
                      <Select
                        value={formData.positionType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, positionType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prime-minister">
                            Prime Minister
                          </SelectItem>
                          <SelectItem value="member-parliament">
                            Member of Parliament (MP)
                          </SelectItem>
                          <SelectItem value="speaker">
                            Speaker of Parliament
                          </SelectItem>
                          <SelectItem value="deputy-speaker">
                            Deputy Speaker
                          </SelectItem>
                          <SelectItem value="minister">Minister</SelectItem>
                          <SelectItem value="state-minister">
                            State Minister
                          </SelectItem>
                          <SelectItem value="mayor-dhaka">
                            Mayor (Dhaka City Corporation)
                          </SelectItem>
                          <SelectItem value="mayor-chittagong">
                            Mayor (Chittagong City Corporation)
                          </SelectItem>
                          <SelectItem value="mayor-city">
                            City Corporation Mayor
                          </SelectItem>
                          <SelectItem value="mayor-municipality">
                            Municipality Mayor
                          </SelectItem>
                          <SelectItem value="district-commissioner">
                            District Commissioner
                          </SelectItem>
                          <SelectItem value="upazila-chairman">
                            Upazila Chairman
                          </SelectItem>
                          <SelectItem value="union-chairman">
                            Union Parishad Chairman
                          </SelectItem>
                          <SelectItem value="councillor">Councillor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">Division</Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) =>
                          setFormData({ ...formData, state: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select division" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dhaka">Dhaka Division</SelectItem>
                          <SelectItem value="chittagong">
                            Chittagong Division
                          </SelectItem>
                          <SelectItem value="rajshahi">
                            Rajshahi Division
                          </SelectItem>
                          <SelectItem value="khulna">
                            Khulna Division
                          </SelectItem>
                          <SelectItem value="barisal">
                            Barisal Division
                          </SelectItem>
                          <SelectItem value="sylhet">
                            Sylhet Division
                          </SelectItem>
                          <SelectItem value="rangpur">
                            Rangpur Division
                          </SelectItem>
                          <SelectItem value="mymensingh">
                            Mymensingh Division
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="district">District/Constituency</Label>
                      <Input
                        id="district"
                        value={formData.district}
                        onChange={(e) =>
                          setFormData({ ...formData, district: e.target.value })
                        }
                        placeholder="e.g., Dhaka-1, Chittagong-5"
                      />
                    </div>
                  </div>
                </div>
              )}
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
                <div className="space-y-4">
                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <CandidateImageUpload
                        candidateId={candidate.id}
                        candidateName={candidate.name}
                        imageUrl={candidate.imageUrl}
                        onImageUploaded={(imageUrl) =>
                          updateCandidateImage(candidate.id, imageUrl)
                        }
                        disabled={isLoading}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{candidate.name}</span>
                          <Badge variant="outline">{candidate.party}</Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCandidate(candidate.id)}
                        disabled={isLoading}
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
