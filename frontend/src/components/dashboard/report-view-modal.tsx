"use client";

import { format } from "date-fns";
import { FileText, Calendar, ExternalLink } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Report } from "@/lib/type";

type ReportViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  report: Report;
};

export function ReportViewModal({
  isOpen,
  onClose,
  report,
}: ReportViewModalProps) {
  const handleDownloadAttachment = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this election report.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Report Header */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{report.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(
                      new Date(report.createdAt),
                      "MMM dd, yyyy 'at' HH:mm"
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Report ID: {report.id.slice(-8)}
                  </div>
                </div>
              </div>

              <Separator />
            </div>

            {/* Election Info */}
            <div className="space-y-3">
              <h4 className="font-medium">Election Information</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Election:</span>
                <span className="text-sm">{report.election.title}</span>
              </div>
            </div>

            {/* Reporter Info */}
            <div className="space-y-3">
              <h4 className="font-medium">Reported By</h4>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {report.reporter.firstName[0]}
                    {report.reporter.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {report.reporter.firstName} {report.reporter.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {report.reporter.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Report Description */}
            <div className="space-y-3">
              <h4 className="font-medium">Description</h4>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">
                  {report.description}
                </p>
              </div>
            </div>

            {/* Attachments */}
            {report.attachmentUrls.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">
                  Attachments ({report.attachmentUrls.length})
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {report.attachmentUrls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Attachment {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadAttachment(url)}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-3">
              <h4 className="font-medium">Timeline</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="font-medium">Created:</span>
                  <span className="text-muted-foreground">
                    {format(
                      new Date(report.createdAt),
                      "MMM dd, yyyy 'at' HH:mm"
                    )}
                  </span>
                </div>
                {report.updatedAt !== report.createdAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                    <span className="font-medium">Last Updated:</span>
                    <span className="text-muted-foreground">
                      {format(
                        new Date(report.updatedAt),
                        "MMM dd, yyyy 'at' HH:mm"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
