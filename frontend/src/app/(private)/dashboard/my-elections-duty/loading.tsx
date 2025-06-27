import { CheckCircle, Clock, Users, Vote, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Commissioner Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your election commissioner duties and approvals.
        </p>
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
            <Skeleton className="h-8 w-12 mb-1" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-8 mb-1" />
            <Skeleton className="h-3 w-36" />
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
            <Skeleton className="h-8 w-8 mb-1" />
            <Skeleton className="h-3 w-40" />
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
            <Skeleton className="h-8 w-8 mb-1" />
            <Skeleton className="h-3 w-44" />
          </CardContent>
        </Card>
      </div>

      {/* Loading Alert */}
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-3 w-96 mt-2" />
      </div>

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
            {/* Table Header */}
            <div className="border-b bg-muted/50">
              <div className="grid grid-cols-8 gap-4 p-4 text-sm font-medium">
                <div>Election</div>
                <div>Type</div>
                <div>Status</div>
                <div>End Date</div>
                <div>Votes</div>
                <div>Candidates</div>
                <div>Your Status</div>
                <div className="text-right">Actions</div>
              </div>
            </div>

            {/* Table Body - Loading Rows */}
            <div className="divide-y">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-8 gap-4 p-4 items-center"
                >
                  {/* Election */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>

                  {/* Type */}
                  <div>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>

                  {/* Status */}
                  <div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>

                  {/* End Date */}
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>

                  {/* Votes */}
                  <div>
                    <Skeleton className="h-4 w-8" />
                  </div>

                  {/* Candidates */}
                  <div>
                    <Skeleton className="h-4 w-4" />
                  </div>

                  {/* Your Status */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-end">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading Message */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading your commissioner duties...</span>
        </div>
      </div>
    </div>
  );
}
