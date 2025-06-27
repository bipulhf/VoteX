"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  createElectionType,
  deleteElectionType,
  updateElectionType,
} from "@/actions/electionType.action";
import { toast } from "sonner";
import { ElectionType } from "@/lib/type";

type ElectionTypesTableProps = {
  initialElectionTypes: ElectionType[];
};

export function ElectionTypesTable({
  initialElectionTypes,
}: ElectionTypesTableProps) {
  const [electionTypes, setElectionTypes] =
    useState<ElectionType[]>(initialElectionTypes);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof ElectionType>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedElectionType, setSelectedElectionType] =
    useState<ElectionType | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  // Filter election types based on search query
  const filteredElectionTypes = electionTypes.filter((electionType) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      electionType.name.toLowerCase().includes(searchLower) ||
      (electionType.description &&
        electionType.description.toLowerCase().includes(searchLower))
    );
  });

  // Sort election types based on column and direction
  const sortedElectionTypes = [...filteredElectionTypes].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === "asc"
      ? (aValue as any) - (bValue as any)
      : (bValue as any) - (aValue as any);
  });

  // Handle sort
  const handleSort = (column: keyof ElectionType) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (id: string, newStatus: boolean) => {
    toast.loading("Updating election type status...");

    const resp = await updateElectionType(
      id,
      electionTypes.find((e) => e.id === id)?.name || "",
      electionTypes.find((e) => e.id === id)?.description || "",
      newStatus
    );
    if (resp.error) {
      toast.dismiss();
      toast.error(resp.error);
    } else {
      toast.dismiss();
      toast.success("Election type status updated successfully");
      setElectionTypes(
        electionTypes.map((electionType) =>
          electionType.id === id
            ? { ...electionType, isActive: newStatus }
            : electionType
        )
      );
    }
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: "",
      description: "",
      isActive: true,
    });
  };

  // Handle create
  const handleCreate = async () => {
    toast.loading("Creating election type...");
    const resp = await createElectionType(
      formData.name,
      formData.description,
      formData.isActive
    );
    if (resp.error) {
      toast.dismiss();
      toast.error(resp.error);
    } else {
      toast.dismiss();
      toast.success("Election type created successfully");
      setIsCreateModalOpen(false);
      resetFormData();
      window.location.reload();
    }
  };

  // Handle edit
  const handleEdit = async () => {
    toast.loading("Updating election type...");
    if (selectedElectionType) {
      setElectionTypes(
        electionTypes.map((electionType) =>
          electionType.id === selectedElectionType.id
            ? {
                ...electionType,
                name: formData.name,
                description: formData.description || null,
                isActive: formData.isActive,
                updatedAt: new Date().toISOString(),
              }
            : electionType
        )
      );

      const resp = await updateElectionType(
        selectedElectionType.id,
        formData.name,
        formData.description,
        formData.isActive
      );

      if (resp.error) {
        toast.dismiss();
        toast.error(resp.error);
      } else {
        toast.dismiss();
        toast.success("Election type updated successfully");
        setIsEditModalOpen(false);
        setSelectedElectionType(null);
        resetFormData();
        window.location.reload();
      }
    }
  };

  // Handle delete
  const handleDelete = async () => {
    toast.loading("Deleting election type...");
    if (selectedElectionType) {
      const resp = await deleteElectionType(selectedElectionType.id);
      if (resp.error) {
        toast.dismiss();
        toast.error(resp.error);
      } else {
        toast.dismiss();
        toast.success("Election type deleted successfully");
        setIsDeleteModalOpen(false);
        setSelectedElectionType(null);
        resetFormData();
        window.location.reload();
      }
    }
  };

  // Open edit modal
  const openEditModal = (electionType: ElectionType) => {
    setSelectedElectionType(electionType);
    setFormData({
      name: electionType.name,
      description: electionType.description || "",
      isActive: electionType.isActive,
    });
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (electionType: ElectionType) => {
    setSelectedElectionType(electionType);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Election Types</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search election types..."
              className="w-full rounded-md pl-8 md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Type
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Name
                  {sortColumn === "name" && (
                    <span>
                      {sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("isActive")}
              >
                <div className="flex items-center gap-1">
                  Status
                  {sortColumn === "isActive" && (
                    <span>
                      {sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead>Elections</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center gap-1">
                  Created
                  {sortColumn === "createdAt" && (
                    <span>
                      {sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedElectionTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No election types found.
                </TableCell>
              </TableRow>
            ) : (
              sortedElectionTypes.map((electionType) => (
                <TableRow key={electionType.id}>
                  <TableCell className="font-medium">
                    {electionType.name}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {electionType.description ? (
                      <span className="truncate">
                        {electionType.description}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">
                        No description
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={electionType.isActive}
                        onCheckedChange={(checked) =>
                          handleStatusToggle(electionType.id, checked)
                        }
                      />
                      <Badge
                        variant={
                          electionType.isActive ? "default" : "secondary"
                        }
                      >
                        {electionType.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {electionType._count.elections}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(electionType.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openEditModal(electionType)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteModal(electionType)}
                          className="text-destructive focus:text-destructive"
                          disabled={electionType._count.elections > 0}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Election Type</DialogTitle>
            <DialogDescription>
              Add a new election type to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter election type name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter description (optional)"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="create-active"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="create-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Election Type</DialogTitle>
            <DialogDescription>
              Update the election type information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter election type name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter description (optional)"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!formData.name.trim()}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Election Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the election type{" "}
              <span className="font-medium">
                "{selectedElectionType?.name}"
              </span>
              ? This action cannot be undone.
              {selectedElectionType &&
                selectedElectionType._count.elections > 0 && (
                  <div className="mt-2 p-2 bg-destructive/10 text-destructive text-sm rounded">
                    This election type is currently used by{" "}
                    {selectedElectionType._count.elections} election(s) and
                    cannot be deleted.
                  </div>
                )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                selectedElectionType
                  ? selectedElectionType._count.elections > 0
                  : false
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
