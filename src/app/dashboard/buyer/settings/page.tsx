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
  CurrencyNgn,
  MapPin,
  Buildings,
  ShieldCheck,
  CircleNotch,
} from '@phosphor-icons/react'
import { Card, Input, Button, Switch, Badge, Select, DistrictCombobox } from '@/components/ui'
import { useAuthStore } from '@/store/auth'
import { authClient } from '@/lib/auth/client'
import { useToast } from '@/components/ui/Toast'
import { ABUJA_LGAS, isValidLocationInLGA } from '@/lib/data/locations'
import { formatNGN } from '@/lib/utils'
import { LGA } from '@/types'

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
]

export default function BuyerSettingsPage() {
  const { user, updateUserProfile } = useAuthStore()
  const { addToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Profile Form State
  const [name, setName] = useState(user?.full_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || AVATAR_PRESETS[0])
  const [budgetMin, setBudgetMin] = useState(user?.budget_min?.toString() || '2000000')
  const [budgetMax, setBudgetMax] = useState(user?.budget_max?.toString() || '50000000')
  const [preferredLga, setPreferredLga] = useState<LGA>((user?.preferred_lgas?.[0] as LGA) || 'AMAC')
  const [preferredDistrict, setPreferredDistrict] = useState<string>('')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Alert toggles
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [whatsappAlerts, setWhatsappAlerts] = useState(false)
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
          message: 'Profile photo uploaded to Storage and saved to database.',
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
          budget_min: Number(budgetMin) || undefined,
          budget_max: Number(budgetMax) || undefined,
          preferred_lgas: [preferredLga],
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.profile) {
          updateUserProfile(data.profile)
        }
        addToast({
          title: 'Profile Updated',
          message: 'Your personal settings and preferences have been saved to the database.',
          type: 'success',
        })
      } else {
        const err = await res.json().catch(() => ({}))
        addToast({
          title: 'Save Failed',
          message: err.error || 'Could not update profile',
          type: 'error',
        })
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
        addToast({ title: 'Password Changed', message: 'Your password was updated securely.', type: 'success' })
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
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
          Account &amp; Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#5C5C5C] mt-0.5">
          Manage your personal details, avatar, search preferences, and account security
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Avatar & Quick Summary */}
        <div className="lg:col-span-4 space-y-6">
          <Card elevation="1" className="p-6 bg-white border border-[#D6C9A8] text-center space-y-4">
            <div className="relative inline-block mx-auto">
              <img
                src={avatarUrl}
                alt={name || 'User Avatar'}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#D6C9A8] shadow-md mx-auto"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 p-2 bg-[#2D5A3D] text-white rounded-full hover:bg-[#1E3D29] shadow-md transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center disabled:opacity-75"
                title="Upload Photo"
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
              <h2 className="text-base font-bold text-[#1A1A1A]">{name || 'User'}</h2>
              <p className="text-xs text-[#5C5C5C] truncate">{email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 bg-[#F0F4EC] text-[#2D5A3D] text-[11px] font-bold rounded-full border border-[#A8C192]">
                {user?.role === 'seller' ? 'Verified Seller' : user?.role === 'admin' ? 'System Administrator' : 'Buyer / Investor'}
              </span>
            </div>

            {/* Avatar Presets Gallery */}
            <div className="pt-3 border-t border-[#EDE0C4] text-left">
              <span className="text-[11px] font-bold text-[#5C5C5C] block mb-2">
                Or pick a preset avatar:
              </span>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`rounded-full overflow-hidden border-2 transition-transform hover:scale-105 ${
                      avatarUrl === preset ? 'border-[#2D5A3D] scale-105 ring-2 ring-[#2D5A3D]/30' : 'border-transparent'
                    }`}
                  >
                    <img src={preset} alt={`Preset ${idx + 1}`} className="w-9 h-9 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Profile Edit & Preferences Form */}
        <div className="lg:col-span-8 space-y-6">
          <Card elevation="1" className="p-6 bg-white border border-[#D6C9A8] space-y-6">
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="border-b border-[#EDE0C4] pb-2">
                <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                  <User size={18} className="text-[#2D5A3D]" />
                  <span>Personal Information</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<User size={18} />}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Envelope size={18} />}
                  required
                />
              </div>

              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone size={18} />}
                placeholder="+234 800 000 0000"
              />

              {/* Preferences Section */}
              <div className="border-b border-[#EDE0C4] pt-4 pb-2">
                <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                  <MapPin size={18} className="text-[#2D5A3D]" />
                  <span>Search &amp; Location Preferences</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                    Preferred Area Council (LGA)
                  </label>
                  <Select
                    value={preferredLga}
                    onChange={(e) => {
                      const newLGA = e.target.value as LGA
                      setPreferredLga(newLGA)
                      if (!isValidLocationInLGA(preferredDistrict, newLGA)) {
                        setPreferredDistrict('')
                      }
                    }}
                    className="h-11 text-xs"
                  >
                    {ABUJA_LGAS.map((lgaItem) => (
                      <option key={lgaItem} value={lgaItem}>
                        {lgaItem} Council
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                    Preferred District ({preferredLga} Council)
                  </label>
                  <DistrictCombobox
                    lga={preferredLga}
                    value={preferredDistrict}
                    onChange={setPreferredDistrict}
                    placeholder={`Choose preferred district in ${preferredLga}...`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Target Min Budget (NGN)"
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  leftIcon={<CurrencyNgn size={18} />}
                />
                <Input
                  label="Target Max Budget (NGN)"
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  leftIcon={<CurrencyNgn size={18} />}
                />
              </div>

              {/* Notification Toggles */}
              <div className="border-b border-[#EDE0C4] pt-4 pb-2">
                <h3 className="text-sm font-bold text-[#1A1A1A]">
                  Alert &amp; Match Notifications
                </h3>
              </div>

              <div className="space-y-3">
                <Switch
                  checked={emailAlerts}
                  onChange={setEmailAlerts}
                  label="Instant Property Match Alerts"
                  description="Receive instant alerts when properties matching your budget are listed."
                />
                <Switch
                  checked={whatsappAlerts}
                  onChange={setWhatsappAlerts}
                  label="WhatsApp Price Drop &amp; Distress Alerts"
                  description="Receive real-time notifications for verified price drops."
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  leftIcon={<FloppyDisk size={18} />}
                  className="min-h-[44px]"
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Security & Password Card */}
          <Card elevation="1" className="p-6 bg-white border border-[#D6C9A8] space-y-4">
            <div className="border-b border-[#EDE0C4] pb-2">
              <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                <Lock size={18} className="text-[#2D5A3D]" />
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
