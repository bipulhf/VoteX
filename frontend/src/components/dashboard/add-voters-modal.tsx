"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Trash2,
  UserPlus,
  Download,
  AlertCircle,
  Mail,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getEligibleVoters,
  addEligibleVoters,
  updateEligibleVoters,
} from "@/actions/eligibleVoters.action";
import { toast } from "sonner";

type Voter = {
  id: string;
  name?: string;
  email: string;
};

type AddVotersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  electionId: string;
  onSuccess?: () => void;
};

export function AddVotersModal({
  isOpen,
  onClose,
  electionId,
  onSuccess,
}: AddVotersModalProps) {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchEligibleVoters();
    }
  }, [isOpen, electionId]);

  const fetchEligibleVoters = async () => {
    try {
      setIsLoading(true);
      const result = await getEligibleVoters(electionId);
      if (result.error) {
        throw new Error(result.error);
      }
      setVoters(
        result.data.eligibleVoters.map((voter: any) => ({
          id: voter.id,
          name: voter.name,
          email: voter.email,
        }))
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch eligible voters"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setUploadError("Please upload a valid CSV file");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        throw new Error(
          "CSV file must contain at least a header row and one email address"
        );
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      if (!headers.some((h) => h.includes("email"))) {
        throw new Error("CSV file must contain an 'email' column");
      }

      const emailIndex = headers.findIndex((h) => h.includes("email"));
      const newVoters: Voter[] = [];
      const duplicateEmails = new Set(voters.map((v) => v.email.toLowerCase()));
      let validCount = 0;
      let duplicateCount = 0;
      let invalidCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i]
          .split(",")
          .map((v) => v.trim().replace(/"/g, ""));

        if (values.length <= emailIndex) continue;

        const email = values[emailIndex]?.toLowerCase().trim();

        if (!email) continue;

        if (!isValidEmail(email)) {
          invalidCount++;
          continue;
        }

        if (duplicateEmails.has(email)) {
          duplicateCount++;
          continue;
        }

        const voter: Voter = {
          id: `voter_${Date.now()}_${i}`,
          email: email,
        };

        newVoters.push(voter);
        duplicateEmails.add(email);
        validCount++;
      }

      if (newVoters.length === 0) {
        let errorMsg = "No valid email addresses found in the CSV file";
        if (invalidCount > 0)
          errorMsg += `. ${invalidCount} invalid email format(s)`;
        if (duplicateCount > 0)
          errorMsg += `. ${duplicateCount} duplicate email(s)`;
        throw new Error(errorMsg);
      }

      setVoters((prev) => [...prev, ...newVoters]);

      let successMsg = `Successfully imported ${validCount} voters`;
      if (duplicateCount > 0)
        successMsg += `. ${duplicateCount} duplicates skipped`;
      if (invalidCount > 0)
        successMsg += `. ${invalidCount} invalid emails skipped`;

      setUploadSuccess(successMsg);

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to process CSV file"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteVoter = (voterId: string) => {
    setVoters((prev) => prev.filter((voter) => voter.id !== voterId));
  };

  const handleAddVoters = async () => {
    try {
      setIsLoading(true);
      const emails = voters.map((voter) => voter.email);
      const result = await addEligibleVoters(electionId, emails);

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("Voters added successfully");

      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add voters"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateVoters = async () => {
    try {
      setIsLoading(true);
      const emails = voters.map((voter) => voter.email);
      const result = await updateEligibleVoters(electionId, emails);

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("Voters updated successfully");

      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update voters"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state
    setVoters([]);
    setUploadError(null);
    setUploadSuccess(null);
  };

  const downloadTemplate = () => {
    const csvContent =
      "email\njohn.doe@example.com\njane.smith@example.com\nbob.johnson@example.com";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voters_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getEmailInitials = (email: string): string => {
    const parts = email.split("@")[0];
    if (parts.includes(".")) {
      const nameParts = parts.split(".");
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return parts.slice(0, 2).toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Manage Eligible Voters
          </DialogTitle>
          <DialogDescription>
            Import voter email addresses from CSV file and manage the voter
            list.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* CSV Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Import from CSV</Label>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Upload CSV file</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    CSV should contain one column: <strong>email</strong>
                  </p>
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isUploading || isLoading}
                  className="max-w-xs"
                />
                {isUploading && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Processing CSV file...
                  </div>
                )}
              </div>
            </div>

            {/* Upload Status Messages */}
            {uploadError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {uploadSuccess && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadSuccess}</AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />

          {/* Voters List Section */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-medium">
                Voters List ({voters.length})
              </Label>
            </div>

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Loading voters...
                </div>
              </div>
            ) : voters.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center py-12">
                <div className="space-y-3">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Mail className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">No voters added yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload a CSV file with email addresses to add voters
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="">
                <ScrollArea className="h-[250px] flex-1 border rounded-lg">
                  <div className="space-y-2 p-4">
                    {voters.map((voter) => (
                      <div
                        key={voter.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getEmailInitials(voter.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col gap-2">
                              {voter.name && (
                                <p className="text-sm font-bold truncate">
                                  {voter.name}
                                </p>
                              )}
                              <p className="text-xs truncate">{voter.email}</p>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVoter(voter.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          {voters.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={handleUpdateVoters}
                disabled={isLoading}
              >
                Update All
              </Button>
              <Button onClick={handleAddVoters} disabled={isLoading}>
                Add New
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
