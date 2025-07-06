"use client";

import { format } from "date-fns";
import { Calendar, Check, Clock, Users } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type Election = {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  startDate: string;
  endDate: string;
  isResultPublic: boolean;
  createdAt: string;
  updatedAt: string;
  electionTypeId: string;
  createdById: string;
  electionType: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  candidates: Array<{
    id: string;
    name: string;
    party: string;
    imageUrl?: string;
  }>;
  commissioners: Array<{
    id: string;
    hasApproved: boolean;
    approvedAt: string | null;
    createdAt: string;
    updatedAt: string;
    userId: string;
    electionId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  _count: {
    votes: number;
  };
};

type ElectionDetailsProps = {
  isOpen: boolean;
  onClose: () => void;
  election: Election | null;
};

export function ElectionDetails({
  isOpen,
  onClose,
  election,
}: ElectionDetailsProps) {
  if (!election) return null;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "secondary";
      case "ACTIVE":
        return "default";
      case "COMPLETED":
        return "outline";
      case "CANCELLED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "text-gray-600";
      case "ACTIVE":
        return "text-white bg-green-600";
      case "COMPLETED":
        return "text-blue-600";
      case "CANCELLED":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {election.title}
            <Badge
              variant={getStatusBadgeVariant(election.status)}
              className={getStatusColor(election.status)}
            >
              {election.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>{election.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Election Type</h4>
              <Badge variant="outline">{election.electionType.name}</Badge>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Created By</h4>
              <p className="text-sm">
                {election.createdBy.firstName} {election.createdBy.lastName}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Start Date</h4>
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-4 w-4" />
                {format(new Date(election.startDate), "PPP 'at' p")}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">End Date</h4>
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-4 w-4" />
                {format(new Date(election.endDate), "PPP 'at' p")}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Results Visibility</h4>
              <Badge
                variant={election.isResultPublic ? "default" : "secondary"}
              >
                {election.isResultPublic ? "Public" : "Private"}
              </Badge>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Total Votes</h4>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="font-medium">{election._count.votes}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Candidates */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Candidates ({election.candidates.length})
            </h3>
            {election.candidates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {election.candidates.map((candidate) => (
                  <div key={candidate.id} className="p-3">
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
                    <div className="font-medium">{candidate.name}</div>
                    <Badge variant="outline" className="mt-1">
                      {candidate.party}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No candidates added yet.</p>
            )}
          </div>

          <Separator />

          {/* Commissioners */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Commissioners ({election.commissioners.length})
            </h3>
            {election.commissioners.length > 0 ? (
              <div className="space-y-3">
                {election.commissioners.map((commissioner) => (
                  <div
                    key={commissioner.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {commissioner.user.firstName[0]}
                          {commissioner.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {commissioner.user.firstName}{" "}
                          {commissioner.user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {commissioner.user.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {commissioner.hasApproved ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <Check className="h-4 w-4" />
                          <span className="text-sm">Approved</span>
                          {commissioner.approvedAt && (
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(commissioner.approvedAt),
                                "MMM d"
                              )}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No commissioners assigned yet.
              </p>
            )}
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-1 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Last Updated:</span>{" "}
              {format(new Date(election.updatedAt), "PPP 'at' p")}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
