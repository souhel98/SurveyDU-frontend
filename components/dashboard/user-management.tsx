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

  useEffect(() => {
    AdminService.getUsers()
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load users");
        setLoading(false);
      });
    
    DepartmentService.getDepartments()
      .then((data) => {
        setDepartments(data);
      })
      .catch(() => {
        toast({ title: "Error", description: "Failed to load departments", variant: "destructive" });
      });

    setCurrentUser(AuthService.getCurrentUser());
  }, [toast]);

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
      toast({ title: "Error", description: "Failed to fetch user details", variant: "destructive" });
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
      toast({ title: "Validation Error", description: "First and last names are required.", variant: "destructive" });
      return;
    }
    if (selectedUser.userType !== 'Admin' && !editData.departmentId) {
      toast({ title: "Validation Error", description: "Department is required for students and teachers.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const updateData = selectedUser.userType === 'Admin'
        ? { firstName: editData.firstName, lastName: editData.lastName }
        : { firstName: editData.firstName, lastName: editData.lastName, departmentId: editData.departmentId };
      await AdminService.updateUser(selectedUser.id, updateData);
      toast({ title: "Success", description: "User updated successfully" });
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
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
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
      toast({ title: "Success", description: "User deleted successfully" });
      setShowDialog(false);
      // Refresh user list
      setLoading(true);
      const data = await AdminService.getUsers();
      setUsers(data);
      setLoading(false);
    } catch {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
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
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
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
      toast({ title: "Success", description: "Teacher registration successful" });
      setShowRegisterModal(false);
      setRegisterData({ firstName: "", lastName: "", email: "", departmentId: "" });
      // Refresh user list
      setLoading(true);
      const data = await AdminService.getUsers();
      setUsers(data);
      setLoading(false);
    } catch {
      toast({ title: "Error", description: "Failed to register teacher", variant: "destructive" });
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
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    setRegisterAdminLoading(true);
    try {
      await AdminService.registerAdmin({
        firstName: registerAdminData.firstName,
        lastName: registerAdminData.lastName,
        email: registerAdminData.email,
      });
      toast({ title: "Success", description: "Admin registration successful" });
      setShowRegisterAdminModal(false);
      setRegisterAdminData({ firstName: '', lastName: '', email: '' });
      // Refresh user list
      setLoading(true);
      const data = await AdminService.getUsers();
      setUsers(data);
      setLoading(false);
    } catch {
      toast({ title: "Error", description: "Failed to register admin", variant: "destructive" });
    } finally {
      setRegisterAdminLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading users...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowRegisterModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 mr-2">
          <Plus className="h-4 w-4" /> Register Teacher
        </Button>
        <Button onClick={() => setShowRegisterAdminModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 focus:ring-2 focus:ring-emerald-300 active:bg-emerald-800 disabled:bg-emerald-400">
          <Plus className="h-4 w-4" /> Register Admin
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.firstName} {user.lastName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.departmentName || "N/A"}</TableCell>
              <TableCell>
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
                  {user.userType}
                </Badge>
              </TableCell>
              <TableCell className="space-x-2">
                <Button size="icon" variant="outline" onClick={() => openUserDetails(user.id, 'view')} title="View">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => openUserDetails(user.id, 'edit')} title="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => { setSelectedUser(user); setShowDeleteConfirm(true); }} title="Delete" disabled={user.id === currentUser?.userId}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* User Details Modal */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {detailsLoading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : selectedUser && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <Input name="firstName" value={editData.firstName} onChange={handleEditChange} disabled={modalMode === 'view'} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <Input name="lastName" value={editData.lastName} onChange={handleEditChange} disabled={modalMode === 'view'} />
                </div>
              </div>
              {selectedUser && selectedUser.userType !== 'Admin' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <Select
                    value={editData.departmentId ? String(editData.departmentId) : ""}
                    onValueChange={handleDepartmentChange}
                    disabled={modalMode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
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
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input value={selectedUser.email} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <Input value={selectedUser.userType} disabled />
              </div>
              {/* Show extra fields for students */}
              {selectedUser.userType === 'Student' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Academic Year</label>
                    <Input value={selectedUser.academicYear || ''} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <Input value={selectedUser.gender ? (selectedUser.gender.charAt(0).toUpperCase() + selectedUser.gender.slice(1)) : ''} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Date of Birth</label>
                    <Input value={selectedUser.dateOfBirth ? String(selectedUser.dateOfBirth).split('T')[0] : ''} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">University ID Number</label>
                    <Input value={selectedUser.universityIdNumber || ''} disabled />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex flex-col md:flex-row gap-2 mt-4">
            {modalMode === 'edit' && (
              <Button onClick={handleSave} disabled={saving || detailsLoading} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">Save</Button>
            )}
            {modalMode === 'edit' && (
              <Button
                onClick={handleDelete}
                disabled={deleting || detailsLoading || selectedUser?.id === currentUser?.userId}
                variant="destructive"
                className="w-full md:w-auto"
              >
                Delete
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
        title="Are you sure you want to delete this user?"
        description="This action cannot be undone. This will permanently delete the user and all associated data."
      />
      {/* Register Teacher Modal */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New Teacher</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegisterTeacher} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input name="firstName" value={registerData.firstName} onChange={handleRegisterChange} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input name="lastName" value={registerData.lastName} onChange={handleRegisterChange} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input name="email" type="email" value={registerData.email} onChange={handleRegisterChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <Select value={registerData.departmentId} onValueChange={handleRegisterDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="flex flex-col md:flex-row gap-2 mt-4">
              <Button type="submit" disabled={registerLoading} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">Register</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Register Admin Modal */}
      <Dialog open={showRegisterAdminModal} onOpenChange={setShowRegisterAdminModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New Admin</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegisterAdmin} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input name="firstName" value={registerAdminData.firstName} onChange={handleRegisterAdminChange} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input name="lastName" value={registerAdminData.lastName} onChange={handleRegisterAdminChange} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input name="email" type="email" value={registerAdminData.email} onChange={handleRegisterAdminChange} />
            </div>
            <DialogFooter className="flex flex-col md:flex-row gap-2 mt-4">
              <Button type="submit" disabled={registerAdminLoading} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">Register</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 