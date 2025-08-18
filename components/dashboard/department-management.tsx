"use client"

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { DepartmentService, Department } from "@/lib/services/department-service";

export default function DepartmentsManagement() {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [editDepartmentName, setEditDepartmentName] = useState("");
  const [deletingDepartmentId, setDeletingDepartmentId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await DepartmentService.getDepartments();
      setDepartments(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch departments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Filter departments based on search query
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle create department
  const handleCreateDepartment = async () => {
    if (!newDepartmentName.trim()) {
      toast({
        title: "Error",
        description: "Department name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      await DepartmentService.createDepartment({ name: newDepartmentName.trim() });
      toast({
        title: "Success",
        description: "Department created successfully",
      });
      setNewDepartmentName("");
      setIsCreateDialogOpen(false);
      fetchDepartments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create department",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle edit department
  const handleEditDepartment = async () => {
    if (!editingDepartment || !editDepartmentName.trim()) {
      toast({
        title: "Error",
        description: "Department name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);
      await DepartmentService.updateDepartment(editingDepartment.id, { name: editDepartmentName.trim() });
      toast({
        title: "Success",
        description: "Department updated successfully",
      });
      setEditDepartmentName("");
      setEditingDepartment(null);
      setIsEditDialogOpen(false);
      fetchDepartments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update department",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete department
  const handleDeleteDepartment = async (id: number) => {
    try {
      setIsDeleting(true);
      await DepartmentService.deleteDepartment(id);
      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
      fetchDepartments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete department",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (department: Department) => {
    setEditingDepartment(department);
    setEditDepartmentName(department.name);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <span className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-lg" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-0 sm:justify-between sm:items-center mb-6">
          <div className="w-full sm:w-auto">
            <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">Departments Management</h1>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-center sm:text-left">
                {departments.length} Departments
              </Badge>
            </div>
            <p className="text-gray-600 mt-2 text-center sm:text-left">Manage university departments</p>
          </div>
          <div className="w-full sm:w-auto flex justify-center sm:justify-end">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 mt-2 sm:mt-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Department</DialogTitle>
                  <DialogDescription>
                    Enter the name for the new department.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="department-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Department Name
                    </label>
                    <Input
                      id="department-name"
                      value={newDepartmentName}
                      onChange={(e) => setNewDepartmentName(e.target.value)}
                      placeholder="Enter department name"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleCreateDepartment();
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setNewDepartmentName("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateDepartment} 
                      disabled={isCreating}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      {isCreating ? (
                        <>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                          Creating...
                        </>
                      ) : (
                        "Create Department"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Departments List */}
        <div className="grid gap-6">
          {filteredDepartments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? "No departments found" : "No departments yet"}
                </h3>
                <p className="text-gray-600 text-center">
                  {searchQuery 
                    ? "Try adjusting your search terms"
                    : "Get started by adding your first department"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDepartments.map((department) => (
                <Card key={department.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                  <CardContent className="p-6">
                    {/* Header with Icon */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                          <Building className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                            {department.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Department #{department.id}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Department Info */}
                    <div className="mb-6"></div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Dialog open={isEditDialogOpen && editingDepartment?.id === department.id} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(department)}
                              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Department</DialogTitle>
                              <DialogDescription>
                                Update the department name.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label htmlFor="edit-department-name" className="block text-sm font-medium text-gray-700 mb-2">
                                  Department Name
                                </label>
                                <Input
                                  id="edit-department-name"
                                  value={editDepartmentName}
                                  onChange={(e) => setEditDepartmentName(e.target.value)}
                                  placeholder="Enter department name"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleEditDepartment();
                                    }
                                  }}
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setIsEditDialogOpen(false);
                                    setEditingDepartment(null);
                                    setEditDepartmentName("");
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleEditDepartment} 
                                  disabled={isUpdating}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                >
                                  {isUpdating ? (
                                    <>
                                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                      Updating...
                                    </>
                                  ) : (
                                    "Update Department"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingDepartmentId(department.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Department</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{department.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                if (deletingDepartmentId) {
                                  handleDeleteDepartment(deletingDepartmentId);
                                  setDeletingDepartmentId(null);
                                }
                              }}
                              disabled={isDeleting}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              {isDeleting ? (
                                <>
                                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                  Deleting...
                                </>
                              ) : (
                                "Delete"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Stats removed per request */}
      </main>
    </div>
  );
} 