'use client'

import React, { useState } from 'react'
import {
  User,
  Mail,
  Shield,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  Ban,
  CheckCircle2,
  Trash2,
  UserCircle,
  Eye
} from 'lucide-react'
import { updateUserStatus, promoteUserToAdmin, deleteUser } from '@/app/actions/admin'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ConfirmationModal from '@/components/common/ConfirmationModal'
import AddUserModal from '@/components/admin/users/AddUserModal'

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: string, name: string }>({
    isOpen: false,
    id: '',
    name: ''
  })
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean, id: string, currentStatus: string, name: string }>({
    isOpen: false,
    id: '',
    currentStatus: '',
    name: ''
  })
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const fetchUsers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    setUsers(data || [])
    setLoading(false)
  }

  React.useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(user => {
    return user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleStatusUpdate = async () => {
    setIsUpdatingStatus(true)
    const { id, currentStatus } = statusModal
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    const res = await updateUserStatus(id, newStatus)
    if (res.success) {
      setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u))
      setFeedback({ type: 'success', message: `User status updated to ${newStatus}` })
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to update user status' })
    }
    setIsUpdatingStatus(false)
    setStatusModal({ isOpen: false, id: '', currentStatus: '', name: '' })
    setTimeout(() => setFeedback(null), 3000)
  }


  const handleDelete = async () => {
    setIsDeleting(true)
    const { id } = deleteModal
    const res = await deleteUser(id)
    if (res.success) {
      setUsers(users.filter(u => u.id !== id))
      setFeedback({ type: 'success', message: 'User deleted successfully' })
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to delete user' })
    }
    setIsDeleting(false)
    setDeleteModal({ isOpen: false, id: '', name: '' })
    setTimeout(() => setFeedback(null), 3000)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Student Management</h1>
          <p className="text-slate-500 font-medium mt-1">View and manage all registered student accounts.</p>
        </div>
        {/* <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-[#152e75] transition-all shrink-0"
        >
          <UserPlus className="w-5 h-5" />
          Add New User
        </button> */}
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-8 duration-300 flex items-center gap-3 border ${
          feedback.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
          <span className="font-black text-sm">{feedback.message}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
          />
        </div>
      </div>

      {/* Users Desktop Table */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-bold text-slate-400">Loading users...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-bold">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold shadow-inner">
                          <UserCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="block font-black text-[#0f172a] text-sm hover:text-primary transition-colors hover:translate-x-1 duration-300 cursor-pointer capitalize"
                          >
                            {user.full_name || 'Anonymous User'}
                          </Link>
                          <p className="text-xs text-slate-500 font-medium">ID: {user.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm font-medium">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.7rem] font-black uppercase tracking-wider ${user.status === 'suspended'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                        }`}>
                        {user.status === 'suspended' ? <Ban className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => setStatusModal({ isOpen: true, id: user.id, currentStatus: user.status || 'active', name: user.full_name || 'this student' })}
                          className={`p-2 rounded-lg transition-all ${user.status === 'suspended' ? 'text-green-600 hover:bg-green-50' : 'text-amber-600 hover:bg-amber-50'}`}
                          title={user.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                        >
                          {user.status === 'suspended' ? <CheckCircle2 className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, id: user.id, name: user.full_name || 'this student' })}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Mobile Card View */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-bold text-slate-400">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center font-bold text-slate-400">
            No users found.
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 transition-all active:scale-[0.98]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                    <UserCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="block font-black text-[#0f172a] text-sm"
                    >
                      {user.full_name || 'Anonymous User'}
                    </Link>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user.email}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-black uppercase tracking-wider ${user.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                  {user.status || 'active'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Actions</p>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="p-2 bg-slate-50 text-slate-400 rounded-lg"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => setStatusModal({ isOpen: true, id: user.id, currentStatus: user.status || 'active', name: user.full_name || 'this student' })}
                    className={`p-2 rounded-lg ${user.status === 'suspended' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}
                  >
                    {user.status === 'suspended' ? <CheckCircle2 className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, id: user.id, name: user.full_name || 'this student' })}
                    className="p-2 bg-red-50 text-red-400 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title={`Delete student ${deleteModal.name}?`}
        message={`Are you sure you want to delete ${deleteModal.name}'s account? This action will permanently remove their access and history. This cannot be undone.`}
        type="danger"
        confirmLabel="Delete User"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
        isLoading={isDeleting}
      />

      <ConfirmationModal
        isOpen={statusModal.isOpen}
        title={`${statusModal.currentStatus === 'active' ? 'Suspend' : 'Reactivate'} student?`}
        message={`Are you sure you want to ${statusModal.currentStatus === 'active' ? 'suspend' : 'reactivate'} ${statusModal.name}? ${statusModal.currentStatus === 'active' ? 'They will no longer be able to log in or take tests.' : 'They will regain access to the platform.'}`}
        type={statusModal.currentStatus === 'active' ? 'danger' : 'info'}
        confirmLabel={statusModal.currentStatus === 'active' ? 'Suspend Account' : 'Reactivate Account'}
        onConfirm={handleStatusUpdate}
        onCancel={() => setStatusModal({ isOpen: false, id: '', currentStatus: '', name: '' })}
        isLoading={isUpdatingStatus}
      />

      {showAddModal && (
        <AddUserModal
          onCancel={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            fetchUsers()
          }}
        />
      )}
    </div>
  )
}
