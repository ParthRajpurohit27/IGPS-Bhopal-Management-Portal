
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Trash2, Edit2, Loader2, UserCog, Link as LinkIcon, Check, X, AlertTriangle, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useFirestore, useCollection, useUser } from '@/firebase';
import { collection, query, doc, deleteDoc, updateDoc, getDocs, writeBatch } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function ManageUsersPage() {
  const db = useFirestore();
  const { user: currentUser } = useUser();
  const usersQuery = useMemo(() => query(collection(db, 'users')), [db]);
  const { data: users, loading } = useCollection(usersQuery);
  const [searchQuery, setSearchQuery] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  
  // Edit State
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmpId, setEditEmpId] = useState('');

  const handleCopyRegisterLink = () => {
    const link = `${window.location.origin}/register`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link Copied", description: "Share this link with new staff members privately." });
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast({ title: "Role Updated", description: `User role changed to ${newRole}.` });
    } catch (error) {
      toast({ title: "Failed", variant: "destructive", description: "Insufficient permissions to update role." });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.uid) {
      toast({ title: "Action Blocked", variant: "destructive", description: "For security, you cannot delete your own active session." });
      return;
    }
    
    if (confirm("Are you sure you want to permanently remove this staff member from the school records?")) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        toast({ title: "User Removed", description: "The staff record has been successfully deleted from the database." });
      } catch (error) {
        toast({ title: "Delete Failed", variant: "destructive", description: "Check your database permissions (Rules) in the Firebase Console." });
      }
    }
  };

  const handleFullReset = async () => {
    if (!confirm("CRITICAL ACTION: This will delete ALL teacher profiles and ALL attendance records from the database. This cannot be undone. Do you want to proceed with a fresh production start?")) {
      return;
    }

    setIsResetting(true);
    try {
      const batch = writeBatch(db);
      
      // Clear Users (Except yourself to avoid getting locked out immediately)
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.docs.forEach(d => {
        if (d.id !== currentUser?.uid) batch.delete(d.ref);
      });

      // Clear Attendance
      const attendanceSnap = await getDocs(collection(db, 'attendance'));
      attendanceSnap.docs.forEach(d => batch.delete(d.ref));

      await batch.commit();
      toast({ title: "System Reset Complete", description: "All testing data has been purged. Only your account remains." });
    } catch (error) {
      toast({ title: "Reset Failed", variant: "destructive", description: "Could not clear all data. Check Firebase permissions." });
    } finally {
      setIsResetting(false);
    }
  };

  const openEditDialog = (user: any) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmpId(user.employeeId);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    try {
      await updateDoc(doc(db, 'users', editingUser.id), {
        name: editName,
        employeeId: editEmpId
      });
      setIsEditDialogOpen(false);
      toast({ title: "Profile Updated", description: "Staff information has been saved successfully." });
    } catch (error) {
      toast({ title: "Update Failed", variant: "destructive", description: "Unable to save changes." });
    }
  };

  const filteredUsers = users.filter((u: any) => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.mobile?.includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Personnel Management</h1>
          <p className="text-muted-foreground">Admin-only portal for faculty coordination and role assignment.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="destructive" onClick={handleFullReset} disabled={isResetting} className="font-bold">
            {isResetting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RotateCcw className="h-4 w-4 mr-2" />}
            Purge All Testing Data
          </Button>
          <Button variant="outline" onClick={handleCopyRegisterLink} className="font-bold border-primary text-primary hover:bg-primary/5">
            <LinkIcon className="mr-2 h-4 w-4" /> Copy Reg. Link
          </Button>
          <Button onClick={() => window.open('/register', '_blank')} className="font-bold shadow-lg">
            <Plus className="mr-2 h-4 w-4" /> Add New Staff
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search name, ID or mobile..." 
              className="pl-10 h-10 border-none bg-background shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Staff Details</TableHead>
                  <TableHead className="font-bold">Mobile</TableHead>
                  <TableHead className="font-bold">Role</TableHead>
                  <TableHead className="text-right font-bold px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">No matching staff records found.</TableCell>
                  </TableRow>
                ) : filteredUsers.map((user: any) => (
                  <TableRow key={user.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <p className="font-bold text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground uppercase font-bold">{user.employeeId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm text-primary">{user.mobile}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 p-0 px-2 font-bold hover:bg-muted">
                            <Badge variant={user.role === 'owner' ? 'default' : 'outline'} className="capitalize cursor-pointer">
                              {user.role} <UserCog className="ml-1.5 h-3 w-3" />
                            </Badge>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'teacher')}>Set as Teacher</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'admin')}>Set as Admin</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'owner')}>Set as Owner</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-amber-600 hover:bg-amber-50" 
                          title="Edit Profile"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">Edit Staff Profile</DialogTitle>
            <DialogDescription>
              Update information for {editingUser?.name}. Changes will reflect instantly on the roster.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Full Name</Label>
              <Input 
                id="name" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
                className="h-11 rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="empId" className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Employee ID</Label>
              <Input 
                id="empId" 
                value={editEmpId} 
                onChange={(e) => setEditEmpId(e.target.value)} 
                className="h-11 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl flex-1">
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="rounded-xl flex-1 font-bold">
              <Check className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
