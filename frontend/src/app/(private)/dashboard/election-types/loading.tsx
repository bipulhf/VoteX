import { Search, ArrowDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ElectionTypesLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Election Types Management
        </h1>
        <p className="text-muted-foreground">
          Create and manage different types of elections available on the
          platform.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Election Types</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Skeleton className="h-10 w-[300px] pl-8" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="rounded-md border">
          {/* Table Header */}
          <div className="border-b bg-muted/50">
            <div className="grid grid-cols-6 gap-4 p-4 text-sm font-medium">
              <div className="flex items-center gap-1">
                Name
                <ArrowDown className="h-4 w-4 opacity-50" />
              </div>
              <div>Description</div>
              <div>Status</div>
              <div>Elections</div>
              <div>Created</div>
              <div className="text-right">Actions</div>
            </div>
          </div>

          {/* Table Body - Loading Rows */}
          <div className="divide-y">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-6 gap-4 p-4 items-center"
              >
                <div>
                  <Skeleton className="h-4 w-32" />
                </div>
                <div>
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div>
                  <Skeleton className="h-6 w-8 rounded-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-end">
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Message */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading election types...</span>
        </div>
      </div>
    </div>
  );
}
