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
import { useTranslation } from "@/hooks/useTranslation";
import { useLocale } from "@/components/ui/locale-provider";

export default function DepartmentsManagement() {
  const { t } = useTranslation();
  const { currentLocale } = useLocale();
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
        title: t('common.error'),
        description: error.message || t('departmentManagement.failedToFetchDepartments'),
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
        title: t('common.error'),
        description: t('departmentManagement.departmentNameRequired'),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      await DepartmentService.createDepartment({ name: newDepartmentName.trim() });
      toast({
        title: t('common.success'),
        description: t('departmentManagement.departmentCreatedSuccessfully'),
      });
      setNewDepartmentName("");
      setIsCreateDialogOpen(false);
      fetchDepartments();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('departmentManagement.failedToCreateDepartment'),
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
        title: t('common.error'),
        description: t('departmentManagement.departmentNameRequired'),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);
      await DepartmentService.updateDepartment(editingDepartment.id, { name: editDepartmentName.trim() });
      toast({
        title: t('common.success'),
        description: t('departmentManagement.departmentUpdatedSuccessfully'),
      });
      setEditDepartmentName("");
      setEditingDepartment(null);
      setIsEditDialogOpen(false);
      fetchDepartments();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('departmentManagement.failedToUpdateDepartment'),
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
        title: t('common.success'),
        description: t('departmentManagement.departmentDeletedSuccessfully'),
      });
      fetchDepartments();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('departmentManagement.failedToDeleteDepartment'),
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
        <span className="sr-only">{t('common.loading')}</span>
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">{t('departmentManagement.title')}</h1>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-center sm:text-left">
                {t('departmentManagement.departmentsCount').replace('{count}', departments.length.toString())}
              </Badge>
            </div>
            <p className={`text-gray-600 mt-2 text-center  ${currentLocale === 'ar' ? 'sm:text-right' : 'sm:text-left'}`}>{t('departmentManagement.subtitle')}</p>
          </div>
          <div className="w-full sm:w-auto flex justify-center sm:justify-end">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 mt-2 sm:mt-0">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('departmentManagement.addDepartment')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className={`  ${currentLocale === 'ar' ? 'text-right' : 'text-left'}`}>{t('departmentManagement.addNewDepartment')}</DialogTitle>
                  <DialogDescription className={`  ${currentLocale === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('departmentManagement.addNewDepartmentDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="department-name" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('departmentManagement.departmentName')}
                    </label>
                    <Input
                      id="department-name"
                      value={newDepartmentName}
                      onChange={(e) => setNewDepartmentName(e.target.value)}
                      placeholder={t('departmentManagement.departmentNamePlaceholder')}
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
                      {t('common.cancel')}
                    </Button>
                    <Button 
                      onClick={handleCreateDepartment} 
                      disabled={isCreating}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      {isCreating ? (
                        <>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                          {t('departmentManagement.creating')}
                        </>
                      ) : (
                        t('departmentManagement.createDepartment')
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
              placeholder={t('departmentManagement.searchDepartments')}
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
                  {searchQuery ? t('departmentManagement.noDepartmentsFound') : t('departmentManagement.noDepartmentsYet')}
                </h3>
                <p className="text-gray-600 text-center">
                  {searchQuery 
                    ? t('departmentManagement.tryAdjustingSearch')
                    : t('departmentManagement.getStartedAdding')
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
                      <div className="flex gap-2 items-center space-x-3">
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                          <Building className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                            {department.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {t('departmentManagement.departmentNumber').replace('{id}', department.id.toString())}
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
                              {t('common.edit')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className={`  ${currentLocale === 'ar' ? 'text-right' : 'text-left'}`}>{t('departmentManagement.editDepartment')}</DialogTitle>
                              <DialogDescription className={`  ${currentLocale === 'ar' ? 'text-right' : 'text-left'}`}>
                                {t('departmentManagement.editDepartmentDescription')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label htmlFor="edit-department-name" className="block text-sm font-medium text-gray-700 mb-2">
                                  {t('departmentManagement.departmentName')}
                                </label>
                                <Input
                                  id="edit-department-name"
                                  value={editDepartmentName}
                                  onChange={(e) => setEditDepartmentName(e.target.value)}
                                  placeholder={t('departmentManagement.departmentNamePlaceholder')}
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
                                  {t('common.cancel')}
                                </Button>
                                <Button 
                                  onClick={handleEditDepartment} 
                                  disabled={isUpdating}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                >
                                  {isUpdating ? (
                                    <>
                                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                                      {t('departmentManagement.updating')}
                                    </>
                                  ) : (
                                    t('departmentManagement.updateDepartment')
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
                            {t('common.delete')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className={`  ${currentLocale === 'ar' ? 'text-right' : 'text-left'}`}>{t('departmentManagement.deleteDepartment')}</AlertDialogTitle>
                            <AlertDialogDescription className={`  ${currentLocale === 'ar' ? 'text-right' : 'text-left'}`}>
                              {t('departmentManagement.deleteDepartmentConfirm').replace('{name}', department.name)}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="gap-2">
                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
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
                                  {t('departmentManagement.updating')}
                                </>
                              ) : (
                                t('common.delete')
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
