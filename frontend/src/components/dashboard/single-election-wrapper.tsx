"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Award,
  Check,
  Clock,
  Crown,
  Eye,
  Users,
  Vote,
  AlertTriangle,
  FileText,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Election } from "@/lib/type";
import { ReportFormModal } from "./report-form-modal";

// Type definitions based on your data structure
type ElectionResult = {
  candidateId: string;
  candidateName: string;
  imageUrl?: string;
  party: string;
  voteCount: number;
  percentage: number;
};

type Commissioner = {
  userId: string;
  userName: string;
  hasApproved: boolean;
};

type ElectionResultsData = {
  electionId: string;
  electionTitle: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  totalVotes: number;
  totalEligibleVoters: number;
  turnoutPercentage: number;
  results: ElectionResult[];
  isPublished: boolean;
  commissioners: Commissioner[];
};

export default function SingleElectionWrapper({
  electionData,
}: {
  electionData: ElectionResultsData;
}) {
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  if (!electionData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Election Not Found</h3>
        <p className="text-muted-foreground">
          The requested election could not be found.
        </p>
        <Link
          href="/dashboard/elections/overview"
          className="mt-4 inline-block"
        >
          <Button variant="outline">Back to Elections</Button>
        </Link>
      </div>
    );
  }

  // Calculate results
  const sortedResults = [...electionData.results].sort(
    (a, b) => b.voteCount - a.voteCount
  );
  const winner = sortedResults[0];
  const approvedCommissioners = electionData.commissioners.filter(
    (c) => c.hasApproved
  );
  const allCommissionersApproved =
    approvedCommissioners.length === electionData.commissioners.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/live-elections">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Elections
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {electionData.electionTitle}
          </h1>
          <p className="text-muted-foreground">
            Election ID: {electionData.electionId}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsReportModalOpen(true)}
        >
          <FileText className="mr-2 h-4 w-4" />
          Report Issue
        </Button>
      </div>

      {/* Election Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Election Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {electionData.totalVotes.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Votes Cast
              </div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {electionData.results.length}
              </div>
              <div className="text-sm text-muted-foreground">Candidates</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commissioner Approval Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Commissioner Approval Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Approval Progress</span>
              <span className="text-sm text-muted-foreground">
                {approvedCommissioners.length}/
                {electionData.commissioners.length} approved
              </span>
            </div>
            <Progress
              value={
                (approvedCommissioners.length /
                  electionData.commissioners.length) *
                100
              }
              className="h-2"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {electionData.commissioners.map((commissioner) => (
                <div
                  key={commissioner.userId}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    commissioner.hasApproved
                      ? "bg-green-50 border-green-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {commissioner.userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      {commissioner.userName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Commissioner
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {commissioner.hasApproved ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-green-600">Approved</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span className="text-xs text-amber-600">Pending</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {!allCommissionersApproved ? (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Results Pending Approval</AlertTitle>
          <AlertDescription>
            The election results are currently pending approval from all
            commissioners. Results will be displayed once all commissioners have
            approved the outcome.
            <div className="mt-2 text-sm">
              Pending approval from:{" "}
              {electionData.commissioners
                .filter((c) => !c.hasApproved)
                .map((c) => c.userName)
                .join(", ")}
            </div>
          </AlertDescription>
        </Alert>
      ) : !electionData.isPublished ? (
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertTitle>Results Not Published</AlertTitle>
          <AlertDescription>
            The election results have been approved by all commissioners but
            have not been published yet. Only authorized personnel can view the
            results.
          </AlertDescription>
        </Alert>
      ) : electionData.totalVotes === 0 ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Votes Cast</AlertTitle>
          <AlertDescription>
            This election has not received any votes yet. Results will be
            available once voting begins.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          {/* Winner Announcement */}
          {winner && winner.voteCount > 0 && (
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Crown className="h-6 w-6" />
                  Election Winner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={winner.imageUrl || "/placeholder.svg"}
                      alt={winner.candidateName}
                    />
                    <AvatarFallback className="text-2xl">
                      {winner.candidateName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold">
                      {winner.candidateName}
                    </h2>
                    <Badge variant="outline" className="mt-2 mb-3">
                      {winner.party}
                    </Badge>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Votes Received:
                        </span>
                        <div className="text-2xl font-bold text-primary">
                          {winner.voteCount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Vote Percentage:
                        </span>
                        <div className="text-2xl font-bold text-primary">
                          {winner.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <Award className="h-16 w-16 text-yellow-500 mx-auto mb-2" />
                    <div className="text-sm font-medium text-muted-foreground">
                      Winner
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  Election Results
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedResults.map((result, index) => (
                  <div key={result.candidateId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-muted-foreground">
                            #{index + 1}
                          </span>
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={result.imageUrl}
                              alt={result.candidateName}
                            />
                            <AvatarFallback>
                              {result.candidateName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <div className="font-semibold">
                            {result.candidateName}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {result.party}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {result.voteCount.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {result.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <Progress value={result.percentage} className="h-2" />
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">
                    {electionData.totalVotes.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Votes
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {electionData.results.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Candidates
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {winner?.percentage.toFixed(1) || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Winning Margin
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ReportFormModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        electionId={electionData.electionId}
        electionTitle={electionData.electionTitle}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
