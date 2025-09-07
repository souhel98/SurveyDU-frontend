"use client";

import { useEffect, useState } from "react";
import { AdminService } from "@/lib/services/admin-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { DepartmentService } from "@/lib/services/department-service";
import { AuthService } from "@/lib/services/auth-service";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocale } from "@/components/ui/locale-provider";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentName: string | null;
  departmentId: number | null;
  userType: 'Admin' | 'Teacher' | 'Student';
  academicYear?: number;
  gender?: string;
  dateOfBirth?: string;
  universityIdNumber?: string;
}

interface Department {
  id: number;
  name: string;
}

export default function UserManagement() {
  const { t } = useTranslation();
  const { currentLocale } = useLocale();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [editData, setEditData] = useState<{ firstName: string; lastName: string; departmentId: number | null }>({ firstName: '', lastName: '', departmentId: null });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>("view");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerData, setRegisterData] = useState({ firstName: "", lastName: "", email: "", departmentId: "" });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showRegisterAdminModal, setShowRegisterAdminModal] = useState(false);
  const [registerAdminData, setRegisterAdminData] = useState({ firstName: '', lastName: '', email: '' });
  const [registerAdminLoading, setRegisterAdminLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    AdminService.getUsers()
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(t('userManagement.failedToLoadUsers'));
        setLoading(false);
      });
    
    DepartmentService.getDepartments()
      .then((data) => {
        setDepartments(data);
      })
      .catch(() => {
        toast({ title: t('common.error'), description: t('userManagement.failedToLoadDepartments'), variant: "destructive" });
      });

    setCurrentUser(AuthService.getCurrentUser());
  }, [toast, t]);

  const openUserDetails = async (id: string, mode: 'view' | 'edit' = 'view') => {
    setDetailsLoading(true);
    setShowDialog(true);
    setModalMode(mode);
    try {
      const user = await AdminService.getUserById(id);
      setSelectedUser(user);
      setEditData({
        firstName: user.firstName,
        lastName: user.lastName,
        departmentId: user.departmentId ?? null,
      });
    } catch {
      toast({ title: t('common.error'), description: t('userManagement.failedToFetchUserDetails'), variant: "destructive" });
      setShowDialog(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleDepartmentChange = (value: string) => {
    setEditData({ ...editData, departmentId: value ? Number(value) : null });
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    // Validation
    if (!editData.firstName || !editData.lastName) {
      toast({ title: t('userManagement.validationError'), description: t('userManagement.firstNameRequired'), variant: "destructive" });
      return;
    }
    if (selectedUser.userType !== 'Admin' && !editData.departmentId) {
      toast({ title: t('userManagement.validationError'), description: t('userManagement.departmentRequired'), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const updateData = selectedUser.userType === 'Admin'
        ? { firstName: editData.firstName, lastName: editData.lastName }
        : { firstName: editData.firstName, lastName: editData.lastName, departmentId: editData.departmentId };
      await AdminService.updateUser(selectedUser.id, updateData);
      toast({ title: t('common.success'), description: t('userManagement.userUpdatedSuccessfully') });
      setShowDialog(false);
      // Refresh user list
      setLoading(true);
      const data = await AdminService.getUsers();
      setUsers(data);
      setLoading(false);
      // If the current user is editing their own admin profile, dispatch profile-updated event
      if (
        selectedUser.userType === 'Admin' &&
        currentUser &&
        (selectedUser.id === currentUser.userId || selectedUser.email === currentUser.email)
      ) {
        window.dispatchEvent(new Event('profile-updated'));
      }
    } catch {
      toast({ title: t('common.error'), description: t('userManagement.failedToUpdateUser'), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    setDeleting(true);
    try {
      await AdminService.deleteUser(selectedUser.id);
      toast({ title: t('common.success'), description: t('userManagement.userDeletedSuccessfully') });
      setShowDialog(false);
      // Refresh user list
      setLoading(true);
      const data = await AdminService.getUsers();
      setUsers(data);
      setLoading(false);
    } catch {
      toast({ title: t('common.error'), description: t('userManagement.failedToDeleteUser'), variant: "destructive" });
    } finally {
      setDeleting(false);
    }
    setShowDeleteConfirm(false);
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };
  const handleRegisterDepartment = (value: string) => {
    setRegisterData({ ...registerData, departmentId: value });
  };
  const handleRegisterTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.firstName || !registerData.lastName || !registerData.email || !registerData.departmentId) {
      toast({ title: t('userManagement.validationError'), description: t('userManagement.allFieldsRequired'), variant: "destructive" });
      return;
    }
    setRegisterLoading(true);
    try {
      await AdminService.registerTeacher({
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        departmentId: Number(registerData.departmentId),
      });
      toast({ title: t('common.success'), description: t('userManagement.teacherRegistrationSuccessful') });
      setShowRegisterModal(false);
      setRegisterData({ firstName: "", lastName: "", email: "", departmentId: "" });
      // Refresh user list
      setLoading(true);
      const data = await AdminService.getUsers();
      setUsers(data);
      setLoading(false);
    } catch {
      toast({ title: t('common.error'), description: t('userManagement.failedToRegisterTeacher'), variant: "destructive" });
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleRegisterAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterAdminData({ ...registerAdminData, [e.target.name]: e.target.value });
  };
  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerAdminData.firstName || !registerAdminData.lastName || !registerAdminData.email) {
      toast({ title: t('userManagement.validationError'), description: t('userManagement.allFieldsRequired'), variant: "destructive" });
      return;
    }
    setRegisterAdminLoading(true);
    try {
      await AdminService.registerAdmin({
        firstName: registerAdminData.firstName,
        lastName: registerAdminData.lastName,
        email: registerAdminData.email,
      });
      toast({ title: t('common.success'), description: t('userManagement.adminRegistrationSuccessful') });
      setShowRegisterAdminModal(false);
      setRegisterAdminData({ firstName: '', lastName: '', email: '' });
      // Refresh user list
      setLoading(true);
      const data = await AdminService.getUsers();
      setUsers(data);
      setLoading(false);
    } catch {
      toast({ title: t('common.error'), description: t('userManagement.failedToRegisterAdmin'), variant: "destructive" });
    } finally {
      setRegisterAdminLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">{t('userManagement.loadingUsers')}</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  // Filter users based on role filter
  const filteredUsers = users.filter(user => 
    roleFilter === 'all' || user.userType === roleFilter
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Register Buttons and Filters Section */}
      <div className="mb-6">
        {/* Desktop: Single row layout */}
        <div className="hidden sm:flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="roleFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('userManagement.filterByRole')}</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('userManagement.allRoles')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('userManagement.allRoles')}</SelectItem>
                  <SelectItem value="Admin">{t('userManagement.roles.Admin', currentLocale)}</SelectItem>
                  <SelectItem value="Teacher">{t('userManagement.roles.Teacher', currentLocale)}</SelectItem>
                  <SelectItem value="Student">{t('userManagement.roles.Student', currentLocale)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {roleFilter !== 'all' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setRoleFilter('all')}
                className="text-gray-600 hover:text-gray-800"
              >
                {t('userManagement.clearFilter')}
              </Button>
            )}
            <span className="text-sm text-gray-500">
              {t('userManagement.showingUsers').replace('{count}', filteredUsers.length.toString()).replace('{total}', users.length.toString())}
            </span>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowRegisterModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <Plus className="h-4 w-4" /> {t('userManagement.registerTeacher')}
            </Button>
            <Button onClick={() => setShowRegisterAdminModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 focus:ring-2 focus:ring-emerald-300 active:bg-emerald-800 disabled:bg-emerald-400">
              <Plus className="h-4 w-4" /> {t('userManagement.registerAdmin')}
            </Button>
          </div>
        </div>

        {/* Mobile: Stacked layout */}
        <div className="sm:hidden space-y-4">
          <div className="flex flex-col gap-2">
            <Button onClick={() => setShowRegisterModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 w-full">
              <Plus className="h-4 w-4" /> {t('userManagement.registerTeacher')}
            </Button>
            <Button onClick={() => setShowRegisterAdminModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 focus:ring-2 focus:ring-emerald-300 active:bg-emerald-800 disabled:bg-emerald-400 w-full">
              <Plus className="h-4 w-4" /> {t('userManagement.registerAdmin')}
            </Button>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3">
              <label htmlFor="roleFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('userManagement.filterByRole')}</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('userManagement.allRoles')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('userManagement.allRoles')}</SelectItem>
                  <SelectItem value="Admin">{t('userManagement.roles.Admin', currentLocale)}</SelectItem>
                  <SelectItem value="Teacher">{t('userManagement.roles.Teacher', currentLocale)}</SelectItem>
                  <SelectItem value="Student">{t('userManagement.roles.Student', currentLocale)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {roleFilter !== 'all' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setRoleFilter('all')}
                className="text-gray-600 hover:text-gray-800 w-full"
              >
                {t('userManagement.clearFilter')}
              </Button>
            )}
            <div className="text-sm text-gray-500">
              {t('userManagement.showingUsers').replace('{count}', filteredUsers.length.toString()).replace('{total}', users.length.toString())}
            </div>
          </div>
        </div>
      </div>
      {/* Responsive Table: Desktop only */}
      <div className="hidden lg:block overflow-x-auto">
        <Table  dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">{t('userManagement.name')}</TableHead>
              <TableHead className="text-left">{t('userManagement.email')}</TableHead>
              <TableHead className="text-left">{t('userManagement.department')}</TableHead>
              <TableHead className="text-left">{t('userManagement.role')}</TableHead>
              <TableHead className="text-left">{t('userManagement.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="text-left">{user.firstName} {user.lastName}</TableCell>
                <TableCell className="text-left">{user.email}</TableCell>
                <TableCell className="text-left">{user.departmentName || t('userManagement.notAvailable')}</TableCell>
                <TableCell className="text-left">
                  <Badge
                    className={
                      `px-3 py-1 rounded-full font-semibold ` +
                      (user.userType === 'Admin'
                        ? 'bg-red-100 text-red-700'
                        : user.userType === 'Teacher'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700')
                    }
                  >
                    {user.userType === 'Admin' ? t('userManagement.roles.Admin', currentLocale) : user.userType === 'Teacher' ? t('userManagement.roles.Teacher', currentLocale) : t('userManagement.roles.Student', currentLocale)}
                  </Badge>
                </TableCell>
                <TableCell className="text-left">
                  <div className={`flex gap-2 ${currentLocale === 'ar' ? 'justify-end' : 'justify-start'}`}>
                    <Button size="icon" variant="outline" onClick={() => openUserDetails(user.id, 'view')} title={t('userManagement.view')}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => openUserDetails(user.id, 'edit')} title={t('userManagement.edit')}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => { setSelectedUser(user); setShowDeleteConfirm(true); }} title={t('userManagement.delete')} disabled={user.id === currentUser?.userId}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Responsive Cards: Mobile/Tablet only */}
      <div className="space-y-4 lg:hidden">
        {filteredUsers.map((user) => (
          <div key={user.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{user.firstName} {user.lastName}</h4>
                <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                <p className="text-sm text-gray-600 mt-1">{t('userManagement.department')}: {user.departmentName || t('userManagement.notAvailable')}</p>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">{t('userManagement.role')}: <Badge className={
                  `px-2 py-0.5 rounded-full font-semibold text-xs ` +
                  (user.userType === 'Admin'
                    ? 'bg-red-100 text-red-700'
                    : user.userType === 'Teacher'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700')
                }>{user.userType === 'Admin' ? t('userManagement.roles.Admin', currentLocale) : user.userType === 'Teacher' ? t('userManagement.roles.Teacher', currentLocale) : t('userManagement.roles.Student', currentLocale)}</Badge></p>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Button size="icon" variant="outline" onClick={() => openUserDetails(user.id, 'view')} title={t('userManagement.view')}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => openUserDetails(user.id, 'edit')} title={t('userManagement.edit')}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => { setSelectedUser(user); setShowDeleteConfirm(true); }} title={t('userManagement.delete')} disabled={user.id === currentUser?.userId}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* User Details Modal */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-full p-4 max-h-[90vh] overflow-y-auto sm:max-w-md sm:p-6">
          <DialogHeader>
            <DialogTitle>{t('userManagement.userDetails')}</DialogTitle>
          </DialogHeader>
          {detailsLoading ? (
            <div className="p-4 text-center">{t('common.loading')}</div>
          ) : selectedUser && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">{t('userManagement.firstName')}</label>
                  <Input name="firstName" value={editData.firstName} onChange={handleEditChange} disabled={modalMode === 'view'} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">{t('userManagement.lastName')}</label>
                  <Input name="lastName" value={editData.lastName} onChange={handleEditChange} disabled={modalMode === 'view'} />
                </div>
              </div>
              {selectedUser && selectedUser.userType !== 'Admin' && (
                <div>
                  <label className="block text-sm font-medium mb-1">{t('userManagement.department')}</label>
                  <Select
                    value={editData.departmentId ? String(editData.departmentId) : ""}
                    onValueChange={handleDepartmentChange}
                    disabled={modalMode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('userManagement.selectDepartment')} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">{t('userManagement.email')}</label>
                <Input value={selectedUser.email} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('userManagement.role')}</label>
                <Input value={selectedUser.userType === 'Admin' ? t('userManagement.roles.Admin', currentLocale) : selectedUser.userType === 'Teacher' ? t('userManagement.roles.Teacher', currentLocale) : t('userManagement.roles.Student', currentLocale)} disabled />
              </div>
              {/* Show extra fields for students */}
              {selectedUser.userType === 'Student' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('userManagement.academicYear')}</label>
                    <Input value={selectedUser.academicYear || ''} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('userManagement.gender')}</label>
                    <Input value={selectedUser.gender ? (selectedUser.gender.charAt(0).toUpperCase() + selectedUser.gender.slice(1)) : ''} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('userManagement.dateOfBirth')}</label>
                    <Input value={selectedUser.dateOfBirth ? String(selectedUser.dateOfBirth).split('T')[0] : ''} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('userManagement.universityIdNumber')}</label>
                    <Input value={selectedUser.universityIdNumber || ''} disabled />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex flex-col md:flex-row gap-2 mt-4">
            {modalMode === 'edit' && (
              <Button onClick={handleSave} disabled={saving || detailsLoading} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">{t('common.save')}</Button>
            )}
            {modalMode === 'edit' && (
              <Button
                onClick={handleDelete}
                disabled={deleting || detailsLoading || selectedUser?.id === currentUser?.userId}
                variant="destructive"
                className="w-full md:w-auto"
              >
                {t('userManagement.delete')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={confirmDelete}
        title={t('userManagement.deleteUserConfirmTitle')}
        description={t('userManagement.deleteUserConfirmDescription')}
      />
      {/* Register Teacher Modal */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent className="w-full p-4 max-h-[90vh] overflow-y-auto sm:max-w-md sm:p-6">
          <DialogHeader>
            <DialogTitle>{t('userManagement.registerNewTeacher')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegisterTeacher} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">{t('userManagement.firstName')}</label>
                <Input name="firstName" value={registerData.firstName} onChange={handleRegisterChange} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">{t('userManagement.lastName')}</label>
                <Input name="lastName" value={registerData.lastName} onChange={handleRegisterChange} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('userManagement.email')}</label>
              <Input name="email" type="email" value={registerData.email} onChange={handleRegisterChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('userManagement.department')}</label>
              <Select value={registerData.departmentId} onValueChange={handleRegisterDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder={t('userManagement.selectDepartment')} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="flex flex-col md:flex-row gap-2 mt-4">
              <Button type="submit" disabled={registerLoading} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">{t('userManagement.register')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Register Admin Modal */}
      <Dialog open={showRegisterAdminModal} onOpenChange={setShowRegisterAdminModal}>
        <DialogContent className="w-full p-4 max-h-[90vh] overflow-y-auto sm:max-w-md sm:p-6">
          <DialogHeader>
            <DialogTitle>{t('userManagement.registerNewAdmin')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegisterAdmin} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">{t('userManagement.firstName')}</label>
                <Input name="firstName" value={registerAdminData.firstName} onChange={handleRegisterAdminChange} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">{t('userManagement.lastName')}</label>
                <Input name="lastName" value={registerAdminData.lastName} onChange={handleRegisterAdminChange} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('userManagement.email')}</label>
              <Input name="email" type="email" value={registerAdminData.email} onChange={handleRegisterAdminChange} />
            </div>
            <DialogFooter className="flex flex-col md:flex-row gap-2 mt-4">
              <Button type="submit" disabled={registerAdminLoading} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">{t('userManagement.register')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
