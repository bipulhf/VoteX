"use client";

import { useState, useEffect } from "react";
import { FileText, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportsTable } from "./reports-table";
import { Report } from "@/lib/type";
import { getAllReports } from "@/actions/report.action";
import { toast } from "sonner";
import { ReportViewModal } from "./report-view-modal";

type ReportsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ReportsModal({ isOpen, onClose }: ReportsModalProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const result = await getAllReports();

      if (result.error) {
        toast.error("Failed to fetch reports", {
          description: result.error,
        });
        setReports([]);
      } else {
        setReports(result.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch reports", {
        description: "An unexpected error occurred.",
      });
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReports();
    }
  }, [isOpen]);

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedReport(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="min-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Election Reports
            </DialogTitle>
            <DialogDescription>
              View and manage reports submitted by voters across all elections.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-10 w-72" />
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </div>
            ) : (
              <ReportsTable
                initialReports={reports}
                onView={handleViewReport}
              />
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedReport && (
        <ReportViewModal
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          report={selectedReport}
        />
      )}
    </>
  );
}
