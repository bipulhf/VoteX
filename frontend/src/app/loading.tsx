export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Loading Message */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading data...</span>
        </div>
      </div>
    </div>
  );
}
