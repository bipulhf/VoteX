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
  image?: string;
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
  election: Election | null;
};

export function VotingModal({ isOpen, onClose, election }: VotingModalProps) {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!election) return null;

  const selectedCandidate = election.candidates.find(
    (c) => c.id === selectedCandidateId
  );

  const handleVoteClick = () => {
    if (selectedCandidateId) {
      setIsConfirming(true);
    }
  };

  const handleConfirmVote = async () => {
    if (selectedCandidateId) {
      setIsSubmitting(true);
      try {
        toast.loading("Submitting vote...");
        const resp = await voteForElection(election.id, selectedCandidateId);
        if (resp.error) {
          toast.dismiss();
          toast.error(resp.error);
          return;
        }
        toast.dismiss();
        toast.success("Vote submitted successfully");
        onClose();
        window.location.reload();
        setSelectedCandidateId("");
        setIsConfirming(false);
      } catch (error) {
        toast.error("Error submitting vote");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    setIsConfirming(false);
    setSelectedCandidateId("");
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedCandidateId("");
      setIsConfirming(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5 text-primary" />
            Cast Your Vote
          </DialogTitle>
          <DialogDescription>
            <div className="space-y-1">
              <div className="font-medium text-foreground">
                {election.title}
              </div>
              <div className="text-sm">{election.description}</div>
              <Badge variant="outline" className="mt-2">
                {election.electionType.name}
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        {!isConfirming ? (
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
                            src={candidate.image || "/placeholder.svg"}
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
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-base">
                            {candidate.name}
                          </div>
                          <Badge variant="outline" className="mt-1">
                            {candidate.party}
                          </Badge>
                          {candidate.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {candidate.description}
                            </p>
                          )}
                        </div>
                        {selectedCandidateId === candidate.id && (
                          <div className="absolute top-2 right-2">
                            <div className="bg-primary text-primary-foreground rounded-full p-1">
                              <Check className="h-4 w-4" />
                            </div>
                          </div>
                        )}
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
                        src={selectedCandidate.image || "/placeholder.svg"}
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
        ) : (
          <>
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Vote className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Confirm Your Vote</h3>
                  <p className="text-muted-foreground mt-1">
                    Please review your selection before submitting. This action
                    cannot be undone.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Election
                  </h4>
                  <div className="mt-1">
                    <div className="font-medium">{election.title}</div>
                    <Badge variant="outline" className="mt-1">
                      {election.electionType.name}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Your Choice
                  </h4>
                  <div className="mt-2 flex items-center gap-4 p-4 border rounded-lg bg-primary/5">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={selectedCandidate?.image || "/placeholder.svg"}
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
                      <Badge variant="outline">
                        {selectedCandidate?.party}
                      </Badge>
                      {selectedCandidate?.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedCandidate.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-amber-800">
                      Important Notice
                    </div>
                    <div className="text-amber-700 mt-1">
                      Once you submit your vote, it cannot be changed or
                      withdrawn. Please ensure your selection is correct.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <X className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button
                onClick={handleConfirmVote}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Submit Vote
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
