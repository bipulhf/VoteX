"use client";

import { useState } from "react";
import { isAfter, isBefore } from "date-fns";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ElectionDetails } from "@/components/dashboard/election-details";
import { ElectionCard } from "@/components/dashboard/election-card";
import { Election } from "@/lib/type";

export default function LiveElectionsWrapper({
  elections,
}: {
  elections: Election[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showPreviousElections, setShowPreviousElections] = useState(false);

  const now = new Date();

  // Filter elections
  const filteredElections = elections.filter((election) => {
    const matchesSearch =
      election.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.electionType.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesType =
      typeFilter === "all" || election.electionTypeId === typeFilter;

    return matchesSearch && matchesType;
  });

  // Separate elections into categories
  const activeElections = filteredElections.filter((election) => {
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    return (
      !isAfter(startDate, now) &&
      isBefore(now, endDate) &&
      election.status === "ACTIVE"
    );
  });

  const upcomingElections = filteredElections.filter((election) => {
    const startDate = new Date(election.startDate);
    return isAfter(startDate, now) || election.status === "DRAFT";
  });

  const previousElections = filteredElections.filter((election) => {
    const endDate = new Date(election.endDate);
    return isAfter(now, endDate);
  });

  const handleView = (election: any) => {
    setSelectedElection(election);
    setIsDetailsOpen(true);
  };

  const handleVote = (election: any) => {
    // In a real app, this would navigate to the voting interface
    console.log("Navigate to voting for election:", election.id);
  };

  // Get unique election types for filter
  const electionTypes = Array.from(
    new Set(elections.map((e) => e.electionType.id))
  )
    .map((id) => elections.find((e) => e.electionType.id === id)?.electionType)
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Elections Overview
        </h1>
        <p className="text-muted-foreground">
          View and participate in current and upcoming elections.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center w-full">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search elections..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {electionTypes.map((type) => (
                <SelectItem key={type!.id} value={type!.id}>
                  {type!.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setShowPreviousElections(!showPreviousElections)}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Previous Results
            {showPreviousElections ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Previous Elections Results */}
      {showPreviousElections && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Previous Elections</h2>
            <span className="text-sm text-muted-foreground">
              ({previousElections.length})
            </span>
          </div>

          {previousElections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {previousElections.map((election) => (
                <ElectionCard
                  key={election.id}
                  election={election}
                  onView={handleView}
                  previous={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
              <History className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No Previous Elections
              </h3>
              <p className="text-muted-foreground">
                There are no completed elections to display.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Currently Happening Elections */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold">Currently Happening</h2>
          <span className="text-sm text-muted-foreground">
            ({activeElections.length})
          </span>
        </div>

        {activeElections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeElections.map((election) => (
              <ElectionCard
                key={election.id}
                election={election}
                onView={handleView}
                onVote={handleVote}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Elections</h3>
            <p className="text-muted-foreground">
              There are currently no elections taking place.
            </p>
          </div>
        )}
      </div>

      {/* Upcoming Elections */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Upcoming Elections</h2>
          <span className="text-sm text-muted-foreground">
            ({upcomingElections.length})
          </span>
        </div>

        {upcomingElections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingElections.map((election) => (
              <ElectionCard
                key={election.id}
                election={election}
                onView={handleView}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Upcoming Elections</h3>
            <p className="text-muted-foreground">
              There are no elections scheduled for the future.
            </p>
          </div>
        )}
      </div>

      {/* Election Details Modal */}
      <ElectionDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        election={selectedElection}
      />
    </div>
  );
}
