"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Edit,
  Eye,
  MoreHorizontal,
  Search,
  Trash2,
  UserPlus,
  Users,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Election } from "@/lib/type";

type ElectionsTableProps = {
  initialElections: Election[];
  onEdit: (election: Election) => void;
  onView: (election: Election) => void;
  onAddVoters: (election: Election) => void;
  onDelete?: (election: Election) => void;
};

export function ElectionsTable({
  initialElections,
  onEdit,
  onView,
  onAddVoters,
  onDelete,
}: ElectionsTableProps) {
  const [elections, setElections] = useState<Election[]>(initialElections);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof Election>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedElection, setSelectedElection] = useState<Election | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Filter elections based on search query
  const filteredElections = elections.filter((election) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      election.title.toLowerCase().includes(searchLower) ||
      election.description.toLowerCase().includes(searchLower) ||
      election.electionType.name.toLowerCase().includes(searchLower) ||
      election.status.toLowerCase().includes(searchLower)
    );
  });

  // Sort elections based on column and direction
  const sortedElections = [...filteredElections].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === "asc"
      ? (aValue as any) - (bValue as any)
      : (bValue as any) - (aValue as any);
  });

  // Handle sort
  const handleSort = (column: keyof Election) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (selectedElection && onDelete) {
      onDelete(selectedElection);
      setElections(
        elections.filter((election) => election.id !== selectedElection.id)
      );
      setIsDeleteModalOpen(false);
      setSelectedElection(null);
    }
  };

  // Open delete modal
  const openDeleteModal = (election: Election) => {
    setSelectedElection(election);
    setIsDeleteModalOpen(true);
  };

  // Get status badge variant
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

  // Get status color
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
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Elections</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search elections..."
              className="w-full rounded-md pl-8 md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center gap-1">
                  Title
                  {sortColumn === "title" && (
                    <span>
                      {sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-1">
                  Status
                  {sortColumn === "status" && (
                    <span>
                      {sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("startDate")}
              >
                <div className="flex items-center gap-1">
                  Start Date
                  {sortColumn === "startDate" && (
                    <span>
                      {sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("endDate")}
              >
                <div className="flex items-center gap-1">
                  End Date
                  {sortColumn === "endDate" && (
                    <span>
                      {sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead>Candidates</TableHead>
              <TableHead>Commissioners</TableHead>
              <TableHead>Voters</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedElections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No elections found.
                </TableCell>
              </TableRow>
            ) : (
              sortedElections.map((election) => (
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
                      variant={getStatusBadgeVariant(election.status)}
                      className={getStatusColor(election.status)}
                    >
                      {election.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(election.startDate), "PPP 'at' p")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(election.endDate), "PPP 'at' p")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span className="text-sm">
                        {election.candidates.length}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-1">
                        {election.commissioners
                          .slice(0, 3)
                          .map((commissioner) => (
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
                        {election.commissioners.length > 3 && (
                          <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                            <span className="text-xs">
                              +{election.commissioners.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {election._count.eligibleVoters}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(election)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(election)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAddVoters(election)}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Voters List
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteModal(election)}
                          className="text-destructive focus:text-destructive"
                          disabled={election._count.eligibleVoters > 0}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Election</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the election{" "}
              <span className="font-medium">"{selectedElection?.title}"</span>?
              This action cannot be undone.
              {selectedElection && selectedElection._count.votes > 0 && (
                <div className="mt-2 p-2 bg-destructive/10 text-destructive text-sm rounded">
                  This election has {selectedElection._count.votes} vote(s) and
                  cannot be deleted.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                selectedElection ? selectedElection._count.votes > 0 : false
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
