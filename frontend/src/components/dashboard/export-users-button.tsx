"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { User } from "@/lib/type";

interface ExportUsersButtonProps {
  users: User[];
}

export function ExportUsersButton({ users }: ExportUsersButtonProps) {
  const exportToCSV = () => {
    // Define CSV headers
    const headers = ["email"];

    // Convert users data to CSV rows
    const csvRows = users.map((user) => [user.email]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `users_export_${new Date().toISOString()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={exportToCSV} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Export as CSV
    </Button>
  );
}
