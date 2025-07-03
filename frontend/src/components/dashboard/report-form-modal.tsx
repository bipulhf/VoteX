"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, FileText, X, Upload, Image } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UploadDropzone } from "@/lib/uploadthing";
import { createReport } from "@/actions/report.action";
import { CreateReportData } from "@/lib/type";
import { toast } from "sonner";

const reportSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description too long"),
});

type ReportFormData = z.infer<typeof reportSchema>;

type ReportFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  electionId: string;
  electionTitle: string;
  onSuccess?: () => void;
};

export function ReportFormModal({
  isOpen,
  onClose,
  electionId,
  electionTitle,
  onSuccess,
}: ReportFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (data: ReportFormData) => {
    try {
      setIsSubmitting(true);

      const reportData: CreateReportData = {
        title: data.title,
        description: data.description,
        electionId,
        attachmentUrls,
      };

      const result = await createReport(reportData);

      if (result.error) {
        toast.error("Failed to create report", {
          description: result.error,
        });
      } else {
        toast.success("Report created successfully", {
          description: "Your report has been submitted and will be reviewed.",
        });

        form.reset();
        setAttachmentUrls([]);
        onClose();
        onSuccess?.();
      }
    } catch (error) {
      toast.error("Failed to create report", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      setAttachmentUrls([]);
      onClose();
    }
  };

  const removeAttachment = (urlToRemove: string) => {
    setAttachmentUrls((prev) => prev.filter((url) => url !== urlToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Election Issue
          </DialogTitle>
          <DialogDescription>
            Report an issue or concern about the election "{electionTitle}".
            Your report will be reviewed by election commissioners and
            administrators.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 flex flex-col"
          >
            <div className="flex-1 space-y-6 overflow-auto pr-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief summary of the issue..."
                        {...field}
                        disabled={isSubmitting}
                        className="focus-visible:ring-0"
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a clear, concise title for your report (max 200
                      characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed description of the issue, including when it occurred, what happened, and any other relevant information..."
                        className="min-h-[120px] resize-none focus-visible:ring-0"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide detailed information about the issue (max 2000
                      characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <FormLabel>Attachments (Optional)</FormLabel>
                  <FormDescription className="mb-3">
                    Upload up to 10 images as evidence (max 4MB each)
                  </FormDescription>
                </div>

                {attachmentUrls.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">
                      Uploaded Files ({attachmentUrls.length}/10)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {attachmentUrls.map((url, index) => (
                        <div
                          key={url}
                          className="relative group border rounded-lg overflow-hidden bg-muted/50"
                        >
                          <div className="aspect-video relative">
                            <img
                              src={url}
                              alt={`Attachment ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center bg-muted">
                                      <div class="text-center">
                                        <div class="w-8 h-8 mx-auto mb-2 text-muted-foreground">
                                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                                            <circle cx="12" cy="13" r="3"/>
                                          </svg>
                                        </div>
                                        <p class="text-xs text-muted-foreground">Image ${
                                          index + 1
                                        }</p>
                                      </div>
                                    </div>
                                  `;
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeAttachment(url)}
                              disabled={isSubmitting}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="p-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Image className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs font-medium">
                                  Attachment {index + 1}
                                </span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                Uploaded
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {attachmentUrls.length < 10 && (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <UploadDropzone
                      endpoint="reportAttachment"
                      onClientUploadComplete={(res) => {
                        if (res && res.length > 0) {
                          const newUrls = res.map((file) => file.url);
                          setAttachmentUrls((prev) => {
                            const combined = [...prev, ...newUrls];
                            return combined.slice(0, 10); // Ensure max 10 files
                          });
                          toast.success(
                            `${res.length} file(s) uploaded successfully`
                          );
                        }
                      }}
                      onUploadError={(error: Error) => {
                        toast.error("Upload failed", {
                          description: error.message,
                        });
                      }}
                      className="border-none p-0"
                      appearance={{
                        container: "w-full",
                        uploadIcon: "text-muted-foreground",
                        label: "text-sm text-muted-foreground",
                        allowedContent: "text-xs text-muted-foreground",
                        button:
                          "bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-8 px-3",
                      }}
                    />
                  </div>
                )}

                {attachmentUrls.length >= 10 && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Maximum number of attachments (10) reached
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Report
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
