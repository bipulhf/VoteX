"use client";

import { useState } from "react";
import { format, isAfter } from "date-fns";
import {
  Check,
  Clock,
  Eye,
  Users,
  Vote,
  Calendar,
  AlertCircle,
  CheckCircle,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { approveElection } from "@/actions/election.action";
import { toast } from "sonner";
import { ViewVotersModal } from "./view-voters-modal";
import { ReportsModal } from "./reports-modal";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type CommissionerElection = {
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
    description: string;
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
  _count: {
    votes: number;
    commissioners: number;
  };
  commissionerStatus: {
    hasApproved: boolean;
    approvedAt: string | null;
    assignedAt: string;
  };
};

export default function ElectionCommissionWrapper({
  myElectionsDuty,
}: {
  myElectionsDuty: CommissionerElection[];
}) {
  const [elections, setElections] =
    useState<CommissionerElection[]>(myElectionsDuty);
  const [selectedElection, setSelectedElection] =
    useState<CommissionerElection | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isVotersModalOpen, setIsVotersModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);

  const now = new Date();

  // Check if election has ended
  const hasElectionEnded = (election: CommissionerElection) => {
    return isAfter(now, new Date(election.endDate));
  };

  // Check if election can be approved
  const canApproveElection = (election: CommissionerElection) => {
    return (
      hasElectionEnded(election) && !election.commissionerStatus.hasApproved
    );
  };

  // Get election status for display
  const getElectionDisplayStatus = (election: CommissionerElection) => {
    if (hasElectionEnded(election)) {
      return "ENDED";
    }
    return election.status;
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ENDED":
        return "outline";
      case "ACTIVE":
        return "default";
      case "DRAFT":
        return "secondary";
      case "COMPLETED":
        return "default";
      case "CANCELLED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ENDED":
        return "text-blue-600";
      case "ACTIVE":
        return "text-white bg-green-600";
      case "DRAFT":
        return "text-gray-600";
      case "COMPLETED":
        return "text-blue-600";
      case "CANCELLED":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Handle approval
  const handleApproval = async () => {
    if (!selectedElection) return;

    setIsApproving(true);
    try {
      toast.loading("Approving election...");
      const resp = await approveElection(selectedElection.id);
      if (resp.error) {
        toast.dismiss();
        toast.error(resp.error);
        return;
      }

      toast.dismiss();
      toast.success("Election approved successfully");

      setIsApprovalModalOpen(false);
      setSelectedElection(null);

      window.location.reload();
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to approve election");
    } finally {
      setIsApproving(false);
    }
  };

  // Open approval modal
  const openApprovalModal = (election: CommissionerElection) => {
    setSelectedElection(election);
    setIsApprovalModalOpen(true);
  };

  // Calculate summary statistics
  const totalElections = elections.length;
  const approvedElections = elections.filter(
    (e) => e.commissionerStatus.hasApproved
  ).length;
  const pendingApprovals = elections.filter((e) =>
    canApproveElection(e)
  ).length;
  const activeElections = elections.filter(
    (e) => e.status === "ACTIVE" && !hasElectionEnded(e)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Commissioner Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your election commissioner duties and approvals.
          </p>
        </div>
        <Button variant="outline" onClick={() => setIsReportsModalOpen(true)}>
          <FileText className="mr-2 h-4 w-4" />
          View Reports
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Elections
            </CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalElections}</div>
            <p className="text-xs text-muted-foreground">
              Elections assigned to you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvedElections}
            </div>
            <p className="text-xs text-muted-foreground">
              Elections you've approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approval
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {pendingApprovals}
            </div>
            <p className="text-xs text-muted-foreground">
              Elections awaiting your approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Elections
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {activeElections}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently ongoing elections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Alert */}
      {pendingApprovals > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            You have {pendingApprovals} election
            {pendingApprovals > 1 ? "s" : ""} that have ended and require your
            approval. Please review and approve the results.
          </AlertDescription>
        </Alert>
      )}

      {/* Elections Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Commissioner Duties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Election</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Voters</TableHead>
                  <TableHead>Candidates</TableHead>
                  <TableHead>Votes</TableHead>
                  <TableHead>Your Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {elections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No elections assigned to you.
                    </TableCell>
                  </TableRow>
                ) : (
                  elections.map((election) => (
                    <TableRow key={election.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{election.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {election.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {election.electionType.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(
                            getElectionDisplayStatus(election)
                          )}
                          className={getStatusColor(
                            getElectionDisplayStatus(election)
                          )}
                        >
                          {getElectionDisplayStatus(election)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(election.endDate), "MMM d, yyyy")}
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(election.endDate), "h:mm a")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={"link"}
                          size="sm"
                          className="p-0"
                          onClick={() => {
                            setSelectedElection(election);
                            setIsVotersModalOpen(true);
                          }}
                        >
                          View Voter List
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {election.candidates.length}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Vote className="h-3 w-3" />
                          <span className="text-sm font-medium">
                            {election._count.votes}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {election.commissionerStatus.hasApproved ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <Check className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Approved
                            </span>
                            {election.commissionerStatus.approvedAt && (
                              <div className="text-xs text-muted-foreground ml-1">
                                {format(
                                  new Date(
                                    election.commissionerStatus.approvedAt
                                  ),
                                  "MMM d"
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">Pending</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {!canApproveElection(election) && (
                            <p className="text-sm text-muted-foreground">
                              {format(
                                new Date(
                                  election.commissionerStatus.assignedAt
                                ),
                                "PPP 'at' p"
                              )}
                            </p>
                          )}
                          {canApproveElection(election) && (
                            <Button
                              size="sm"
                              onClick={() => openApprovalModal(election)}
                            >
                              <Check className="mr-1 h-3 w-3" />
                              Approve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {isVotersModalOpen && selectedElection && (
        <ViewVotersModal
          isOpen={isVotersModalOpen}
          onClose={() => setIsVotersModalOpen(false)}
          electionId={selectedElection.id}
        />
      )}

      <ReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
      />

      {/* Approval Modal */}
      <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approve Election Results
            </DialogTitle>
            <DialogDescription>
              Please review the election details before approving the results.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedElection && (
            <div className="space-y-4">
              {/* Election Details */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Election Information</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div>
                      <span className="text-muted-foreground">Title:</span>{" "}
                      {selectedElection.title}
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Description:
                      </span>{" "}
                      {selectedElection.description}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>{" "}
                      {selectedElection.electionType.name}
                    </div>
                    <div>
                      <span className="text-muted-foreground">End Date:</span>{" "}
                      {format(new Date(selectedElection.endDate), "PPP 'at' p")}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Vote Summary */}
                <div>
                  <h4 className="font-medium">Vote Summary</h4>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <div className="text-lg font-bold text-primary">
                        {selectedElection._count.votes}
                      </div>
                      <div className="text-muted-foreground">
                        Total Votes Cast
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {selectedElection.candidates.length}
                      </div>
                      <div className="text-muted-foreground">Candidates</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Candidates */}
                <div>
                  <h4 className="font-medium">Candidates</h4>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                    {selectedElection.candidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="flex items-center justify-between p-2"
                      >
                        <div>
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
                          <Badge variant="outline" className="text-xs">
                            {candidate.party}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Warning */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important Notice</AlertTitle>
                <AlertDescription>
                  By approving these results, you confirm that you have reviewed
                  the election process and believe the results to be accurate
                  and legitimate. This approval cannot be withdrawn once
                  submitted.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApprovalModalOpen(false)}
              disabled={isApproving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApproval}
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isApproving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Approving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Approve Results
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
