"use client";

import { format, isAfter, isBefore } from "date-fns";
import {
  Calendar,
  Clock,
  Eye,
  Users,
  Vote,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { VotingModal } from "./voting-modal";
import { useRouter } from "next/navigation";

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

type ElectionCardProps = {
  election: Election;
  onView: (election: Election) => void;
  onVote?: (election: Election) => void;
  previous?: boolean;
};

export function ElectionCard({
  election,
  onView,
  onVote,
  previous = false,
}: ElectionCardProps) {
  const router = useRouter();
  const now = new Date();
  const startDate = new Date(election.startDate);
  const endDate = new Date(election.endDate);

  const [isVotingModalOpen, setIsVotingModalOpen] = useState(false);

  const isUpcoming = isAfter(startDate, now);
  const isActive =
    !isUpcoming && isBefore(now, endDate) && election.status === "ACTIVE";
  const isCompleted = election.status === "COMPLETED" || isAfter(now, endDate);

  // Calculate progress for active elections
  const getElectionProgress = () => {
    if (!isActive) return 0;
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  };

  // Get time remaining for active elections
  const getTimeRemaining = () => {
    if (!isActive) return null;
    const remaining = endDate.getTime() - now.getTime();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? "s" : ""} remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  // Get approved commissioners count
  const approvedCommissioners = election.commissioners.filter(
    (c) => c.hasApproved
  ).length;
  const totalCommissioners = election.commissioners.length;

  const handleVoteClick = () => {
    setIsVotingModalOpen(true);
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">
              {election.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {election.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {election.electionType.name}
          </Badge>
          {isActive && (
            <Badge
              variant="default"
              className="text-xs bg-green-100 text-green-800 border-green-200"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              Live
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Date Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Starts:</span>
            <span className="font-medium">
              {format(startDate, "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Ends:</span>
            <span className="font-medium">
              {format(endDate, "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
        </div>

        {/* Active Election Progress */}
        {isActive && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{getTimeRemaining()}</span>
            </div>
            <Progress value={getElectionProgress()} className="h-2" />
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-medium">{election.candidates.length}</div>
              <div className="text-muted-foreground">Candidates</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Vote className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-medium">{election._count.votes}</div>
              <div className="text-muted-foreground">Votes</div>
            </div>
          </div>
        </div>

        {/* Commissioners */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Commissioners</span>
            <div className="flex items-center gap-1 text-sm">
              {approvedCommissioners === totalCommissioners ? (
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : (
                <AlertCircle className="h-3 w-3 text-amber-600" />
              )}
              <span className="text-muted-foreground">
                {approvedCommissioners}/{totalCommissioners} approved
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              {election.commissioners.slice(0, 4).map((commissioner) => (
                <Avatar
                  key={commissioner.id}
                  className="h-6 w-6 border-2 border-background"
                >
                  <AvatarFallback className="text-xs">
                    {commissioner.user.firstName[0]}
                    {commissioner.user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
              {election.commissioners.length > 4 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs">
                    +{election.commissioners.length - 4}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Candidates Preview */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Candidates</span>
          <div className="flex flex-wrap gap-1">
            {election.candidates.slice(0, 3).map((candidate) => (
              <Badge key={candidate.id} variant="outline" className="text-xs">
                {candidate.name}
              </Badge>
            ))}
            {election.candidates.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{election.candidates.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (!previous) {
              onView(election);
            } else {
              router.push(`/dashboard/elections/${election.id}`);
            }
          }}
          className="flex-1"
        >
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </Button>
        {isActive && onVote && (
          <Button size="sm" onClick={handleVoteClick} className="flex-1">
            <Vote className="mr-2 h-4 w-4" />
            Vote Now
          </Button>
        )}
        {isUpcoming && (
          <Button variant="secondary" size="sm" disabled className="flex-1">
            <Clock className="mr-2 h-4 w-4" />
            Upcoming
          </Button>
        )}
      </CardFooter>
      <VotingModal
        isOpen={isVotingModalOpen}
        onClose={() => setIsVotingModalOpen(false)}
        election={election}
      />
    </Card>
  );
}
