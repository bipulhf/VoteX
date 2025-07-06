"use client";

import { useState } from "react";
import { Check, Vote, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { voteForElection } from "@/actions/election.action";
import { toast } from "sonner";

type Candidate = {
  id: string;
  name: string;
  party: string;
  imageUrl?: string;
  description?: string;
};

type Election = {
  id: string;
  title: string;
  description: string;
  candidates: Candidate[];
  electionType: {
    name: string;
  };
};

type VotingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  election: Election;
};

export function VotingModal({ isOpen, onClose, election }: VotingModalProps) {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const selectedCandidate = election.candidates.find(
    (c) => c.id === selectedCandidateId
  );

  const handleClose = () => {
    setSelectedCandidateId("");
    setIsSubmitting(false);
    setHasVoted(false);
    onClose();
  };

  const handleVoteClick = () => {
    if (!selectedCandidateId) return;
    setIsSubmitting(true);
  };

  const handleVoteConfirm = async () => {
    if (!selectedCandidateId) return;

    try {
      const result = await voteForElection(election.id, selectedCandidateId);
      if (result.error) {
        toast.error(result.error);
      } else {
        setHasVoted(true);
        toast.success("Vote cast successfully!");
      }
    } catch (error) {
      toast.error("Failed to cast vote");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoteCancel = () => {
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cast Your Vote</DialogTitle>
          <DialogDescription>
            {election.title} • {election.electionType.name}
          </DialogDescription>
        </DialogHeader>

        {!isSubmitting && !hasVoted ? (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Select Your Candidate</h3>
                <span className="text-sm text-muted-foreground">
                  {election.candidates.length} candidate
                  {election.candidates.length !== 1 ? "s" : ""}
                </span>
              </div>

              <RadioGroup
                value={selectedCandidateId}
                onValueChange={setSelectedCandidateId}
              >
                <div className="grid grid-cols-1 gap-4">
                  {election.candidates.map((candidate) => (
                    <div key={candidate.id} className="relative">
                      <Label
                        htmlFor={candidate.id}
                        className={`flex items-center space-x-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-accent ${
                          selectedCandidateId === candidate.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem
                          value={candidate.id}
                          id={candidate.id}
                          className="mt-1"
                        />
                        <Avatar className="h-16 w-16">
                          <AvatarImage
                            src={candidate.imageUrl || "/placeholder.svg"}
                            alt={candidate.name}
                          />
                          <AvatarFallback className="text-lg">
                            {candidate.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold text-lg">
                            {candidate.name}
                          </div>
                          <Badge variant="outline" className="mt-1">
                            {candidate.party}
                          </Badge>
                          {candidate.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {candidate.description}
                            </p>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {selectedCandidate && (
                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={selectedCandidate.imageUrl || "/placeholder.svg"}
                        alt={selectedCandidate.name}
                      />
                      <AvatarFallback>
                        {selectedCandidate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        Selected: {selectedCandidate.name}
                      </div>
                      <Badge variant="outline">{selectedCandidate.party}</Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVoteClick}
                disabled={!selectedCandidateId || isSubmitting}
              >
                <Vote className="mr-2 h-4 w-4" />
                Cast Vote
              </Button>
            </DialogFooter>
          </>
        ) : isSubmitting ? (
          <>
            <div className="space-y-6 py-8">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Confirm Your Vote</h3>
                <p className="text-sm text-muted-foreground">
                  Please review your selection before submitting your vote.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Your Choice
                </h4>
                <div className="mt-2 flex items-center gap-4 p-4 border rounded-lg bg-primary/5">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={selectedCandidate?.imageUrl || "/placeholder.svg"}
                      alt={selectedCandidate?.name}
                    />
                    <AvatarFallback className="text-lg">
                      {selectedCandidate?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-lg">
                      {selectedCandidate?.name}
                    </div>
                    <Badge variant="outline">{selectedCandidate?.party}</Badge>
                    {selectedCandidate?.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedCandidate.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleVoteCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleVoteConfirm}>
                <Check className="mr-2 h-4 w-4" />
                Confirm Vote
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-6 py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Vote Submitted!</h3>
                <p className="text-sm text-muted-foreground">
                  Your vote has been successfully recorded.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
