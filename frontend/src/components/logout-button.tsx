"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form >
      <Button variant="outline" type="submit">
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </form>
  );
}
