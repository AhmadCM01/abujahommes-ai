'use client'

import React, { useState, useRef } from 'react'
import {
  User,
  Phone,
  Envelope,
  FloppyDisk,
  Camera,
  Lock,
  Eye,
  EyeSlash,
  CheckCircle,
  Buildings,
  Certificate,
  MapPin,
  ShieldCheck,
  CircleNotch,
} from '@phosphor-icons/react'
import { Card, Input, Button, Switch, Badge } from '@/components/ui'
import { useAuthStore } from '@/store/auth'
import { authClient } from '@/lib/auth/client'
import { useToast } from '@/components/ui/Toast'

const SELLER_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
]

export default function SellerSettingsPage() {
  const { user, updateUserProfile } = useAuthStore()
  const { addToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Seller Profile Form State
  const [name, setName] = useState(user?.full_name || 'Bilaad Realty Sales')
  const [agencyName, setAgencyName] = useState('Bilaad Realty Ltd')
  const [cacNumber, setCacNumber] = useState('RC-1492041')
  const [officeAddress, setOfficeAddress] = useState('Plot 1042, Diplomatic Zone, Katampe Extension, Abuja')
  const [email, setEmail] = useState(user?.email || 'seller@abujahommes.ai')
  const [phone, setPhone] = useState(user?.phone || '+234 700 222 2111')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || SELLER_AVATARS[0])
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [leadInquiriesAlert, setLeadInquiriesAlert] = useState(true)
  const [inspectionSmsAlert, setInspectionSmsAlert] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isChangingPass, setIsChangingPass] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      addToast({ title: 'File too large', message: 'Please select an image smaller than 5MB.', type: 'error' })
      return
    }

    try {
      setIsUploadingAvatar(true)
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/uploads/avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok && data.avatar_url) {
        setAvatarUrl(data.avatar_url)
        updateUserProfile({ avatar_url: data.avatar_url })
        addToast({
          title: 'Photo Saved',
          message: 'Agency logo uploaded to Storage and saved to database.',
          type: 'success',
        })
      } else {
        addToast({
          title: 'Upload Failed',
          message: data.error || 'Could not upload photo',
          type: 'error',
        })
      }
    } catch {
      addToast({ title: 'Upload Error', message: 'Could not connect to server', type: 'error' })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name.trim(),
          phone: phone.trim(),
          avatar_url: avatarUrl,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.profile) {
          updateUserProfile(data.profile)
        }
        addToast({
          title: 'Seller Profile Saved',
          message: 'Your agency credentials and settings have been saved to the database.',
          type: 'success',
        })
      } else {
        const err = await res.json().catch(() => ({}))
        addToast({ title: 'Save Failed', message: err.error || 'Could not save profile', type: 'error' })
      }
    } catch {
      addToast({ title: 'Network Error', message: 'Could not connect to database', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) {
      addToast({ title: 'Error', message: 'Please complete all password fields.', type: 'error' })
      return
    }
    if (newPassword !== confirmPassword) {
      addToast({ title: 'Error', message: 'New passwords do not match.', type: 'error' })
      return
    }

    setIsChangingPass(true)
    try {
      const res = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      })
      if (res?.error) {
        addToast({ title: 'Update Failed', message: res.error.message || 'Password could not be changed.', type: 'error' })
      } else {
        addToast({ title: 'Password Changed', message: 'Your seller account password has been updated.', type: 'success' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err: any) {
      addToast({ title: 'Update Failed', message: err?.message || 'Password could not be changed.', type: 'error' })
    } finally {
      setIsChangingPass(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left animate-fadeIn pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
          Seller &amp; Agency Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#5C5C5C] mt-0.5">
          Manage developer credentials, business verification, and listing communication channels
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Seller Brand & Verification */}
        <div className="lg:col-span-4 space-y-6">
          <Card elevation="1" className="p-6 bg-white border border-[#D6C9A8] text-center space-y-4">
            <div className="relative inline-block mx-auto">
              <img
                src={avatarUrl}
                alt={agencyName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#F0CC77] shadow-md mx-auto"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 p-2 bg-[#C9962A] text-white rounded-full hover:bg-[#A67A1E] shadow-md transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center disabled:opacity-75"
                title="Upload Agency Logo"
              >
                {isUploadingAvatar ? (
                  <CircleNotch size={18} className="animate-spin text-white" />
                ) : (
                  <Camera size={18} weight="fill" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div>
              <h2 className="text-base font-bold text-[#1A1A1A] flex items-center justify-center gap-1.5">
                <span>{name}</span>
                <CheckCircle size={18} weight="fill" className="text-[#2D6A4F]" />
              </h2>
              <p className="text-xs text-[#C9962A] font-bold">{agencyName}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 bg-[#FDF8EC] text-[#C9962A] text-[11px] font-bold rounded-full border border-[#F0CC77]">
                REDAN &amp; AGIS Verified
              </span>
            </div>

            <div className="pt-3 border-t border-[#EDE0C4] text-left">
              <span className="text-[11px] font-bold text-[#5C5C5C] block mb-2">
                Preset Developer / Broker Avatars:
              </span>
              <div className="grid grid-cols-5 gap-2">
                {SELLER_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`rounded-full overflow-hidden border-2 transition-transform hover:scale-105 ${
                      avatarUrl === preset ? 'border-[#C9962A] scale-105 ring-2 ring-[#C9962A]/30' : 'border-transparent'
                    }`}
                  >
                    <img src={preset} alt={`Preset ${idx + 1}`} className="w-9 h-9 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Agency Details & Security */}
        <div className="lg:col-span-8 space-y-6">
          <Card elevation="1" className="p-6 bg-white border border-[#D6C9A8] space-y-6">
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="border-b border-[#EDE0C4] pb-2">
                <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Buildings size={18} className="text-[#C9962A]" />
                  <span>Agency &amp; Contact Credentials</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Representative Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<User size={18} />}
                  required
                />
                <Input
                  label="Registered Agency / Developer Name"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  leftIcon={<Buildings size={18} />}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Corporate Affairs Commission (CAC) Reg."
                  value={cacNumber}
                  onChange={(e) => setCacNumber(e.target.value)}
                  leftIcon={<Certificate size={18} />}
                  placeholder="RC-1234567"
                />
                <Input
                  label="Official Telephone / Helpline"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone size={18} />}
                  required
                />
              </div>

              <Input
                label="Official Business Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Envelope size={18} />}
                required
              />

              <Input
                label="Physical Office / Gallery Address"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                leftIcon={<MapPin size={18} />}
                placeholder="District, Abuja"
              />

              <div className="border-b border-[#EDE0C4] pt-4 pb-2">
                <h3 className="text-sm font-bold text-[#1A1A1A]">
                  Inquiry &amp; Inspection Lead Notifications
                </h3>
              </div>

              <div className="space-y-3">
                <Switch
                  checked={leadInquiriesAlert}
                  onChange={setLeadInquiriesAlert}
                  label="Instant Live Buyer Inquiry Alerts"
                  description="Receive instant app notifications when a buyer starts a live chat on your listings."
                />
                <Switch
                  checked={inspectionSmsAlert}
                  onChange={setInspectionSmsAlert}
                  label="SMS Inspection Booking Reminders"
                  description="Receive direct SMS reminders 2 hours before scheduled property site visits."
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="amber"
                  size="md"
                  isLoading={isLoading}
                  leftIcon={<FloppyDisk size={18} />}
                  className="min-h-[44px]"
                >
                  Save Agency Profile
                </Button>
              </div>
            </form>
          </Card>

          {/* Security & Password Card */}
          <Card elevation="1" className="p-6 bg-white border border-[#D6C9A8] space-y-4">
            <div className="border-b border-[#EDE0C4] pb-2">
              <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                <Lock size={18} className="text-[#C9962A]" />
                <span>Security &amp; Change Password</span>
              </h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Current Password"
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                />
                <Input
                  label="Confirm New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-[#5C5C5C] hover:text-[#1A1A1A] flex items-center gap-1 min-h-[40px]"
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  <span>{showPassword ? 'Hide' : 'Show'} passwords</span>
                </button>

                <Button
                  type="submit"
                  variant="outline"
                  size="md"
                  isLoading={isChangingPass}
                  leftIcon={<ShieldCheck size={18} />}
                  className="min-h-[44px]"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
