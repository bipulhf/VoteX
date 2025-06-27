"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Trash2,
  UserPlus,
  Download,
  AlertCircle,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getEligibleVoters,
  addEligibleVoters,
  updateEligibleVoters,
} from "@/actions/eligibleVoters.action";
import { toast } from "sonner";

type Voter = {
  id: string;
  name: string;
  email: string;
};

type ViewVotersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  electionId: string;
};

export function ViewVotersModal({
  isOpen,
  onClose,
  electionId,
}: ViewVotersModalProps) {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEligibleVoters();
    }
  }, [isOpen, electionId]);

  const fetchEligibleVoters = async () => {
    try {
      setIsLoading(true);
      const result = await getEligibleVoters(electionId);
      if (result.error) {
        throw new Error(result.error);
      }
      setVoters(
        result.data.eligibleVoters.map((voter: any) => ({
          id: voter.id,
          name: voter.name,
          email: voter.email,
        }))
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch eligible voters"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getEmailInitials = (email: string): string => {
    const parts = email.split("@")[0];
    if (parts.includes(".")) {
      const nameParts = parts.split(".");
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return parts.slice(0, 2).toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            View Eligible Voters
          </DialogTitle>
          <DialogDescription>
            View the list of eligible voters for this election.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          <Separator />

          {/* Voters List Section */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-medium">
                Voters List ({voters.length})
              </Label>
            </div>

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Loading voters...
                </div>
              </div>
            ) : voters.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center py-12">
                <div className="space-y-3">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Mail className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">No voters added yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload a CSV file with email addresses to add voters
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="">
                <ScrollArea className="h-[500px] flex-1 border rounded-lg">
                  <div className="space-y-2 p-4">
                    {voters.map((voter) => (
                      <div
                        key={voter.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getEmailInitials(voter.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col gap-2">
                              {voter.name && (
                                <p className="text-sm font-bold truncate">
                                  {voter.name}
                                </p>
                              )}
                              <p className="text-xs truncate">{voter.email}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
