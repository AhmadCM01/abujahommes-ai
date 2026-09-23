'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  HouseSimple,
  Buildings,
  Door,
  Tree,
  Storefront,
  UploadSimple,
  CheckCircle,
  ShieldCheck,
  Sparkle,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  X,
  Star,
  LinkSimple,
  CircleNotch,
} from '@phosphor-icons/react'
import {
  Card,
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Progress,
  Modal,
  DistrictCombobox,
} from '@/components/ui'
import { ABUJA_LGAS, POPULAR_LOCATIONS, getLocationNamesByLGA, isValidLocationInLGA } from '@/lib/data/locations'
import { ALL_AMENITIES } from '@/lib/data/premiums'
import { formatNGN, cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { LGA, PropertyType, TitleType, TransactionType } from '@/types'

export default function NewListingPage() {
  const router = useRouter()
  const { addToast } = useToast()

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)

  // Step 1: Basics
  const [transactionType, setTransactionType] = useState<TransactionType>('rent')
  const [propertyType, setPropertyType] = useState<PropertyType>('flat')
  const [lga, setLGA] = useState<LGA>('AMAC')
  const [location, setLocation] = useState('Gwarinpa')
  const [address, setAddress] = useState('')

  // Step 2: Details
  const [title, setTitle] = useState('Spacious 3-Bedroom Serviced Apartment')
  const [hasEditedTitle, setHasEditedTitle] = useState(false)
  const [bedrooms, setBedrooms] = useState(3)
  const [bathrooms, setBathrooms] = useState(3)
  const [titleType, setTitleType] = useState<TitleType>('C of O')
  const [landSize, setLandSize] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Security / CCTV',
    'Water / Borehole',
    'Parking Space',
    'Generator',
  ])
  const [description, setDescription] = useState(
    'Beautifully finished 3-bedroom serviced flat in a secure gated estate with 24/7 borehole water, backup generator, dedicated parking space, and perimeter security fencing.'
  )
  const [hasEditedDescription, setHasEditedDescription] = useState(false)

  // Step 3: Pricing
  const [askingPrice, setAskingPrice] = useState(2500000)

  // Step 4: Photos
  const [photos, setPhotos] = useState<string[]>([])
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step 5: Review
  const [confirmedAccurate, setConfirmedAccurate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const propertyTypes: { type: PropertyType; label: string; icon: React.ReactNode }[] = [
    { type: 'flat', label: 'Flat / Apartment', icon: <Door size={24} /> },
    { type: 'detached', label: 'Detached House', icon: <HouseSimple size={24} /> },
    { type: 'semi-detached', label: 'Semi-Detached', icon: <Buildings size={24} /> },
    { type: 'duplex', label: 'Duplex', icon: <Buildings size={24} /> },
    { type: 'terrace', label: 'Terrace House', icon: <Buildings size={24} /> },
    { type: 'bungalow', label: 'Bungalow', icon: <HouseSimple size={24} /> },
    { type: 'commercial', label: 'Commercial Office', icon: <Storefront size={24} /> },
    { type: 'land', label: 'Land Plot', icon: <Tree size={24} /> },
  ]

  const isLand = propertyType === 'land'
  const isCommercial = propertyType === 'commercial'
  const isHouse = ['detached', 'semi-detached', 'duplex', 'terrace', 'bungalow'].includes(propertyType)

  // Dynamic configuration for Step 2 based on selected property type
  const typeConfig = React.useMemo(() => {
    if (isLand) {
      return {
        category: 'land' as const,
        headlinePlaceholder: 'e.g. 750 SQM Prime Residential Plot in Guzape District',
        descriptionHint: 'Describe plot topography, road access, beacon numbers, surrounding developments, and statutory title.',
        descriptionPlaceholder: 'Describe the plot topography (e.g. flat, elevated, or gentle slope), tarred or gravel road access, perimeter fencing, electricity, water connection, nearby landmarks, and statutory title approval...',
        sizeLabel: 'Plot / Land Size (SQM) *',
        sizePlaceholder: 'e.g. 750 (Required)',
        sizeHelper: 'Total plot size in square meters (Required for land listings)',
        sizeRequired: true,
        showBedrooms: false,
        showBathrooms: false,
        bathroomLabel: 'Bathrooms',
        amenitiesLabel: 'Plot Infrastructure & Access',
        amenities: [
          'Perimeter Fence',
          'Water / Borehole',
          'Tarred Road Access',
          'Gated Access',
          'Electricity / Transformer',
          'Security / CCTV',
        ],
      }
    }

    if (isCommercial) {
      return {
        category: 'commercial' as const,
        headlinePlaceholder: 'e.g. Grade-A Open Plan Office Space in Central Business District (CBD)',
        descriptionHint: 'Detail usable floor layout, elevator/stairwell access, backup generator capacity, and parking slots.',
        descriptionPlaceholder: 'Detail total usable floor layout, partitioned executive suites, conference facilities, elevator access, central HVAC, generator run schedule, water supply, and designated parking bays...',
        sizeLabel: 'Usable Floor Size (SQM) *',
        sizePlaceholder: 'e.g. 350 (Required)',
        sizeHelper: 'Total usable floor space in square meters (Required for commercial listings)',
        sizeRequired: true,
        showBedrooms: false,
        showBathrooms: true,
        bathroomLabel: 'Restrooms / Toilets',
        amenitiesLabel: 'Commercial Facilities & Infrastructure',
        amenities: [
          'Parking Space',
          'Generator',
          'Security / CCTV',
          'Fibre Internet',
          'Air Conditioning',
          'Water / Borehole',
          'Solar Power',
          'Perimeter Fence',
        ],
      }
    }

    if (isHouse) {
      const houseHeadlineMap: Record<string, string> = {
        duplex: 'e.g. Luxury 5-Bedroom Fully Detached Duplex with BQ in Maitama',
        terrace: 'e.g. Contemporary 4-Bedroom Terrace Duplex with BQ in Jabi',
        bungalow: 'e.g. Tastefully Finished 3-Bedroom Bungalow with BQ in Kubwa',
        'semi-detached': 'e.g. Contemporary 4-Bedroom Semi-Detached House with BQ in Guzape',
        detached: 'e.g. Executive 5-Bedroom Detached House with BQ in Asokoro',
      }

      return {
        category: 'house' as const,
        headlinePlaceholder: houseHeadlineMap[propertyType] || 'e.g. Executive 5-Bedroom Detached House with BQ in Asokoro',
        descriptionHint: 'Highlight compound space, Boys Quarters (BQ), gatehouse, power backup, and interior specifications.',
        descriptionPlaceholder: 'Describe the compound size, Boys Quarters (BQ) details, private gatehouse, parking capacity for multiple cars, borehole water, standby generator, and quality of interior fittings...',
        sizeLabel: 'Plot / Compound Size (SQM - Optional)',
        sizePlaceholder: 'e.g. 650',
        sizeHelper: 'Total compound ground area in square meters (Optional)',
        sizeRequired: false,
        showBedrooms: true,
        showBathrooms: true,
        bathroomLabel: 'Bathrooms',
        amenitiesLabel: 'Home Amenities & Estate Features',
        amenities: [
          'Boys Quarters',
          'Security / CCTV',
          'Water / Borehole',
          'Generator',
          'Solar Power',
          'Parking Space',
          'Perimeter Fence',
          'Swimming Pool',
          'Gym',
          'Air Conditioning',
          'Fibre Internet',
          'DSTV / Cable',
        ],
      }
    }

    // Default: flat / apartment
    return {
      category: 'flat' as const,
      headlinePlaceholder: 'e.g. Modern 3-Bedroom Serviced Apartment in Gwarinpa',
      descriptionHint: 'Detail floor level, interior finishing, service charge details, backup power hours, and compound security.',
      descriptionPlaceholder: 'Beautifully finished 3-bedroom serviced flat in a secure gated estate with 24/7 borehole water, backup generator, dedicated parking space, and perimeter security fencing...',
      sizeLabel: 'Floor Area (SQM - Optional)',
      sizePlaceholder: 'e.g. 150',
      sizeHelper: 'Interior floor space in square meters (Optional)',
      sizeRequired: false,
      showBedrooms: true,
      showBathrooms: true,
      bathroomLabel: 'Bathrooms',
      amenitiesLabel: 'Apartment Amenities & Services',
      amenities: [
        'Security / CCTV',
        'Water / Borehole',
        'Generator',
        'Parking Space',
        'Air Conditioning',
        'Fibre Internet',
        'Solar Power',
        'Swimming Pool',
        'Gym',
        'DSTV / Cable',
      ],
    }
  }, [propertyType, isLand, isCommercial, isHouse])

  const handlePropertyTypeChange = (newType: PropertyType) => {
    setPropertyType(newType)

    const isTargetLand = newType === 'land'
    const isTargetCommercial = newType === 'commercial'
    const isTargetHouse = ['detached', 'semi-detached', 'duplex', 'terrace', 'bungalow'].includes(newType)

    if (isTargetLand) {
      setBedrooms(0)
      setBathrooms(0)
      setSelectedAmenities(['Perimeter Fence', 'Water / Borehole', 'Tarred Road Access', 'Gated Access'])
      if (!hasEditedTitle) {
        setTitle('Prime 750 SQM Residential Plot')
      }
      if (!hasEditedDescription) {
        setDescription('Well positioned dry residential plot in a fast developing neighborhood. Accessible via tarred road with clean title documents, ready for immediate construction.')
      }
    } else if (isTargetCommercial) {
      setBedrooms(0)
      if (bathrooms === 0) setBathrooms(2)
      setSelectedAmenities(['Parking Space', 'Generator', 'Security / CCTV', 'Fibre Internet'])
      if (!hasEditedTitle) {
        setTitle('Grade-A Open Plan Commercial Office Space')
      }
      if (!hasEditedDescription) {
        setDescription('Prime commercial office space in a well-managed building with dedicated parking, backup generator, 24/7 security, high-speed connectivity, and passenger elevators.')
      }
    } else if (isTargetHouse) {
      if (bedrooms === 0) setBedrooms(4)
      if (bathrooms === 0) setBathrooms(4)
      setSelectedAmenities(['Boys Quarters', 'Security / CCTV', 'Water / Borehole', 'Generator', 'Perimeter Fence'])
      if (!hasEditedTitle) {
        const titleMap: Record<string, string> = {
          duplex: 'Luxury 5-Bedroom Fully Detached Duplex with BQ',
          terrace: 'Modern 4-Bedroom Terrace Duplex with BQ',
          bungalow: 'Tastefully Finished 3-Bedroom Bungalow with BQ',
          'semi-detached': 'Contemporary 4-Bedroom Semi-Detached House with BQ',
          detached: 'Executive 5-Bedroom Detached House with BQ',
        }
        setTitle(titleMap[newType] || 'Executive 5-Bedroom Detached House with BQ')
      }
      if (!hasEditedDescription) {
        setDescription('Luxury contemporary residence featuring all en-suite bedrooms, spacious compound, dedicated 1-room Boys Quarters (BQ), perimeter fencing, borehole, and reliable power backup.')
      }
    } else {
      // flat
      if (bedrooms === 0) setBedrooms(3)
      if (bathrooms === 0) setBathrooms(3)
      setSelectedAmenities(['Security / CCTV', 'Water / Borehole', 'Parking Space', 'Generator'])
      if (!hasEditedTitle) {
        setTitle('Spacious 3-Bedroom Serviced Apartment')
      }
      if (!hasEditedDescription) {
        setDescription('Beautifully finished 3-bedroom serviced flat in a secure gated estate with 24/7 borehole water, backup generator, dedicated parking space, and perimeter security fencing.')
      }
    }
  }

  // Calculated market baseline for Step 3 visual indicator
  const marketMin = transactionType === 'rent' ? 2000000 : 70000000
  const marketMax = transactionType === 'rent' ? 3200000 : 120000000
  const isFairPrice = askingPrice >= marketMin && askingPrice <= marketMax

  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return

    if (photos.length + files.length > 10) {
      addToast({
        title: 'Limit Exceeded',
        message: `Maximum 10 photos per listing. You currently have ${photos.length}.`,
        type: 'error',
      })
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setIsUploadingPhotos(true)
    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Client-side validations
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        addToast({
          title: 'Unsupported Format',
          message: `${file.name} is not JPEG, PNG, or WebP`,
          type: 'error',
        })
        continue
      }

      if (file.size > 8 * 1024 * 1024) {
        addToast({
          title: 'File Too Large',
          message: `${file.name} exceeds 8MB`,
          type: 'error',
        })
        continue
      }

      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch('/api/uploads/listing-photo', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          const data = await res.json()
          uploadedUrls.push(data.url)
          addToast({
            title: 'Uploaded',
            message: `${file.name} added successfully`,
            type: 'success',
          })
        } else {
          const err = await res.json().catch(() => ({}))
          addToast({
            title: 'Upload Failed',
            message: err.error || `Failed to upload ${file.name}`,
            type: 'error',
          })
        }
      } catch {
        addToast({
          title: 'Network Error',
          message: `Could not connect to upload server for ${file.name}`,
          type: 'error',
        })
      }
    }

    if (uploadedUrls.length > 0) {
      setPhotos((prev) => [...prev, ...uploadedUrls])
    }

    setIsUploadingPhotos(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadFiles(e.target.files)
    }
  }

  const handleSetCover = (idx: number) => {
    if (idx === 0) return
    setPhotos((prev) => {
      const copy = [...prev]
      const [selected] = copy.splice(idx, 1)
      return [selected, ...copy]
    })
    addToast({ title: 'Cover Updated', message: 'First photo is now the cover photo', type: 'info' })
  }

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleAddUrlPhoto = () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      addToast({ title: 'Invalid URL', message: 'URL must start with http:// or https://', type: 'error' })
      return
    }
    if (photos.length >= 10) {
      addToast({ title: 'Limit Reached', message: 'Maximum 10 photos per listing', type: 'error' })
      return
    }
    setPhotos((prev) => [...prev, trimmed])
    setUrlInput('')
    addToast({ title: 'Photo Added', message: 'Image URL added to photos', type: 'success' })
  }

  const handleSubmitListing = async () => {
    if (!confirmedAccurate) return
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          property_type: propertyType,
          transaction_type: transactionType,
          lga,
          location,
          address,
          bedrooms: isLand || isCommercial ? 0 : bedrooms,
          bathrooms: isLand ? 0 : bathrooms,
          land_size_sqm: landSize ? Number(landSize) : null,
          asking_price: askingPrice,
          description,
          title_type: titleType,
          amenities: selectedAmenities,
          images: photos,
        }),
      })

      if (res.ok) {
        setIsSubmitting(false)
        setIsSubmitted(true)
        addToast({ title: 'Listing Published', message: 'Your listing is live on AbujaHommes AI', type: 'success' })
      } else {
        const errorData = await res.json().catch(() => ({}))
        setIsSubmitting(false)
        addToast({
          title: 'Failed to create listing',
          message: errorData.error || 'An unexpected error occurred',
          type: 'error',
        })
      }
    } catch (err) {
      setIsSubmitting(false)
      addToast({
        title: 'Network Error',
        message: 'Could not connect to the server',
        type: 'error',
      })
    }
  }

  if (isSubmitted) {
    return (
      <Card elevation="2" className="max-w-xl mx-auto p-8 bg-white border border-[#D6C9A8] text-center space-y-5 animate-fadeIn">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-[#E8F5EF] text-[#2D6A4F] flex items-center justify-center text-3xl shadow-sm animate-bounce">
            <CheckCircle size={42} weight="fill" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-[#1A1A1A]">
          Listing Published Live!
        </h1>
        <p className="text-xs text-[#5C5C5C] max-w-md mx-auto leading-relaxed">
          Your property &quot;{title}&quot; is active and publicly searchable across AbujaHommes AI.
        </p>

        <div className="p-4 bg-[#F0F4EC] rounded-xl text-xs text-[#2D5A3D] font-semibold text-left space-y-1">
          <div className="flex justify-between">
            <span>Location:</span>
            <span className="font-bold text-[#1A1A1A]">{location}, {lga}</span>
          </div>
          <div className="flex justify-between">
            <span>Asking Price:</span>
            <span className="font-bold text-[#2D5A3D]">{formatNGN(askingPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Safety Pre-Check:</span>
            <span className="font-bold text-[#2D6A4F]">Passed (Low Risk Score 8/100)</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/dashboard/seller/listings" className="flex-1">
            <Button variant="primary" size="lg" className="w-full">
              View My Listings
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => {
              setIsSubmitted(false)
              setStep(1)
            }}
          >
            Add Another Property
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left animate-fadeIn">
      {/* Top Breadcrumb & Step Title */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/seller"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D5A3D] hover:underline"
        >
          <ArrowLeft size={16} />
          <span>Cancel &amp; Return</span>
        </Link>
        <span className="text-xs font-bold text-[#5C5C5C]">
          Step {step} of 5
        </span>
      </div>

      {/* 5-Step Segmented Progress Bar */}
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all duration-300 ${
              step >= s ? 'bg-[#2D5A3D]' : 'bg-[#EDE0C4]'
            }`}
          />
        ))}
      </div>

      {/* STEP 1: Property Basics */}
      {step === 1 && (
        <Card elevation="1" className="p-6 bg-white border border-[#D6C9A8] space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">Property Basics</h2>
            <p className="text-xs text-[#5C5C5C] mt-0.5">
              Select the listing type and exact Abuja location
            </p>
          </div>

          {/* Transaction Type */}
          <div>
            <label className="text-xs font-bold text-[#1A1A1A] block mb-2">Listing Type</label>
            <div className="grid grid-cols-2 gap-3">
              {(['rent', 'sale'] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTransactionType(t)}
                  className={cn(
                    'py-3 rounded-xl font-bold text-xs uppercase tracking-wider border-2 transition-all',
                    transactionType === t
                      ? 'border-[#2D5A3D] bg-[#F0F4EC] text-[#2D5A3D]'
                      : 'border-[#D6C9A8] bg-white text-[#5C5C5C]'
                  )}
                >
                  For {t === 'rent' ? 'Rent / Lease' : 'Outright Sale'}
                </button>
              ))}
            </div>
          </div>

          {/* Property Type Grid */}
          <div>
            <label className="text-xs font-bold text-[#1A1A1A] block mb-2">Property Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {propertyTypes.map((pt) => {
                const isSelected = propertyType === pt.type
                return (
                  <div
                    key={pt.type}
                    onClick={() => handlePropertyTypeChange(pt.type)}
                    className={cn(
                      'p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2',
                      isSelected
                        ? 'border-[#2D5A3D] bg-[#F0F4EC] text-[#2D5A3D]'
                        : 'border-[#D6C9A8] bg-white text-[#5C5C5C] hover:border-[#2D5A3D]'
                    )}
                  >
                    {pt.icon}
                    <span className="text-xs font-bold">{pt.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* LGA & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Area Council (LGA)"
              value={lga}
              onChange={(e) => {
                const newLGA = e.target.value as LGA
                setLGA(newLGA)
                if (!isValidLocationInLGA(location, newLGA)) {
                  setLocation('')
                }
              }}
              required
            >
              {ABUJA_LGAS.map((lgaItem) => (
                <option key={lgaItem} value={lgaItem}>
                  {lgaItem} Council
                </option>
              ))}
            </Select>

            <DistrictCombobox
              lga={lga}
              value={location}
              onChange={setLocation}
              label={`District / Area (${lga} Council)`}
              placeholder={`Search districts in ${lga}...`}
              required
            />
          </div>

          <Input
            label="Street Address / Landmark (Optional)"
            placeholder="e.g. 3rd Avenue, Gwarinpa Estate"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="pt-4 border-t border-[#EDE0C4] flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => {
                if (!isValidLocationInLGA(location, lga)) {
                  addToast({
                    title: 'Invalid District',
                    message: `${location} is not a valid district in ${lga} Council`,
                    type: 'error',
                  })
                  return
                }
                setStep(2)
              }}
              rightIcon={<ArrowRight size={18} />}
            >
              Continue to Details
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Property Details */}
      {step === 2 && (
        <Card elevation="1" className="p-6 bg-white border border-[#D6C9A8] space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">Property Details</h2>
            <p className="text-xs text-[#5C5C5C] mt-0.5">
              {isLand
                ? 'Specify plot size, statutory title, and plot infrastructure'
                : isCommercial
                ? 'Specify usable floor area, statutory title, and commercial facilities'
                : 'Specify bedroom count, statutory title, and amenities'}
            </p>
          </div>

          <Input
            label="Listing Headline Title"
            placeholder={typeConfig.headlinePlaceholder}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setHasEditedTitle(true)
            }}
            required
          />

          {/* Steppers */}
          {(typeConfig.showBedrooms || typeConfig.showBathrooms) && (
            <div className={cn('grid gap-4', typeConfig.showBedrooms && typeConfig.showBathrooms ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2')}>
              {typeConfig.showBedrooms && (
                <div>
                  <label className="text-xs font-bold text-[#1A1A1A] block mb-1.5">Bedrooms</label>
                  <div className="flex items-center gap-3 bg-[#F5EDD6] p-2 rounded-xl border border-[#D6C9A8]">
                    <button
                      type="button"
                      onClick={() => setBedrooms(Math.max(1, bedrooms - 1))}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-[#2D5A3D] shadow-xs hover:bg-[#F0F4EC] transition-colors"
                    >
                      <Minus size={14} weight="bold" />
                    </button>
                    <span className="flex-1 text-center font-extrabold text-sm">{bedrooms}</span>
                    <button
                      type="button"
                      onClick={() => setBedrooms(Math.min(20, bedrooms + 1))}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-[#2D5A3D] shadow-xs hover:bg-[#F0F4EC] transition-colors"
                    >
                      <Plus size={14} weight="bold" />
                    </button>
                  </div>
                </div>
              )}

              {typeConfig.showBathrooms && (
                <div>
                  <label className="text-xs font-bold text-[#1A1A1A] block mb-1.5">{typeConfig.bathroomLabel}</label>
                  <div className="flex items-center gap-3 bg-[#F5EDD6] p-2 rounded-xl border border-[#D6C9A8]">
                    <button
                      type="button"
                      onClick={() => setBathrooms(Math.max(1, bathrooms - 1))}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-[#2D5A3D] shadow-xs hover:bg-[#F0F4EC] transition-colors"
                    >
                      <Minus size={14} weight="bold" />
                    </button>
                    <span className="flex-1 text-center font-extrabold text-sm">{bathrooms}</span>
                    <button
                      type="button"
                      onClick={() => setBathrooms(Math.min(20, bathrooms + 1))}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-[#2D5A3D] shadow-xs hover:bg-[#F0F4EC] transition-colors"
                    >
                      <Plus size={14} weight="bold" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Title Document"
              value={titleType}
              onChange={(e) => setTitleType(e.target.value as TitleType)}
              required
            >
              <option value="C of O">Certificate of Occupancy (C of O)</option>
              <option value="Right of Occupancy">Right of Occupancy (R of O)</option>
              <option value="Governors Consent">Governor&apos;s Consent</option>
              <option value="Deed of Assignment">Deed of Assignment</option>
              <option value="FCDA Allocation">FCDA Allocation</option>
              <option value="FHA Allocation">FHA Allocation</option>
              <option value="Survey">Registered Survey Plan</option>
              <option value="Other">Other / Customary</option>
            </Select>

            <Input
              label={typeConfig.sizeLabel}
              type="number"
              placeholder={typeConfig.sizePlaceholder}
              helperText={typeConfig.sizeHelper}
              value={landSize}
              onChange={(e) => setLandSize(e.target.value)}
              required={typeConfig.sizeRequired}
            />
          </div>

          {/* Amenities Grid */}
          <div>
            <label className="text-xs font-bold text-[#1A1A1A] block mb-2">
              {typeConfig.amenitiesLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {typeConfig.amenities.map((item) => (
                <Checkbox
                  key={item}
                  checked={selectedAmenities.includes(item)}
                  onChange={() =>
                    setSelectedAmenities((prev) =>
                      prev.includes(item)
                        ? prev.filter((a) => a !== item)
                        : [...prev, item]
                    )
                  }
                  label={item}
                />
              ))}
            </div>
          </div>

          {/* Description with Character Counter */}
          <Textarea
            label="Detailed Description"
            rows={4}
            placeholder={typeConfig.descriptionPlaceholder}
            helperText={typeConfig.descriptionHint}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              setHasEditedDescription(true)
            }}
            charCount={description.length}
            minChars={80}
            required
          />

          <div className="pt-4 border-t border-[#EDE0C4] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setStep(1)} leftIcon={<ArrowLeft size={16} />}>
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              disabled={description.length < 80}
              onClick={() => {
                if (typeConfig.sizeRequired && (!landSize || Number(landSize) <= 0)) {
                  addToast({
                    title: 'Size Required',
                    message: isLand
                      ? 'Please enter the plot size in SQM for this land listing'
                      : 'Please enter the usable floor size in SQM for this commercial listing',
                    type: 'error',
                  })
                  return
                }
                setStep(3)
              }}
              rightIcon={<ArrowRight size={18} />}
            >
              Continue to Pricing
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Pricing & AI Valuation */}
      {step === 3 && (
        <Card elevation="1" className="p-6 bg-white border border-[#D6C9A8] space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">Set Your Price</h2>
            <p className="text-xs text-[#5C5C5C] mt-0.5">
              {transactionType === 'rent'
                ? 'Enter your annual rent and check fair market alignment'
                : 'Enter your asking price and check fair market alignment'}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-[#1A1A1A] block mb-1.5">
              {transactionType === 'rent' ? 'Annual rent (NGN)' : 'Asking price (NGN)'}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-bold text-[#2D5A3D]">NGN</span>
              <input
                type="number"
                value={askingPrice}
                onChange={(e) => setAskingPrice(Number(e.target.value))}
                className="w-full h-14 pl-16 pr-4 text-xl font-extrabold text-[#2D5A3D] rounded-xl border-2 border-[#D6C9A8] focus:border-[#2D5A3D] outline-none"
              />
            </div>
          </div>

          {/* AI Price Suggestion Card */}
          <div className="p-5 bg-[#F0F4EC] rounded-2xl border border-[#A8C192] space-y-3">
            <div className="flex items-center gap-2 text-[#2D5A3D]">
              <Sparkle size={20} weight="fill" />
              <h3 className="text-sm font-bold">AI Fair Market Valuation</h3>
            </div>
            <p className="text-xs text-[#5C5C5C]">
              Similar properties in {location} typically list for{' '}
              <strong className="text-[#1A1A1A]">
                {formatNGN(marketMin, true)} to {formatNGN(marketMax, true)}
              </strong>
              .
            </p>

            {/* Visual Zone Indicator */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-[#5C5C5C]">Fair Zone: {formatNGN(marketMin, true)} to {formatNGN(marketMax, true)}</span>
                <span className={isFairPrice ? 'text-[#2D6A4F]' : 'text-[#C9962A]'}>
                  {isFairPrice ? '✓ Well Priced' : 'Outside Median'}
                </span>
              </div>
              <div className="w-full h-3 bg-[#EDE0C4] rounded-full overflow-hidden flex">
                <div className="w-1/4 bg-[#FEE2E2]" />
                <div className="w-1/2 bg-[#2D6A4F]" />
                <div className="w-1/4 bg-[#FDF8EC]" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#EDE0C4] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setStep(2)} leftIcon={<ArrowLeft size={16} />}>
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => setStep(4)}
              rightIcon={<ArrowRight size={18} />}
            >
              Continue to Photos
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: Photos */}
      {step === 4 && (
        <Card elevation="1" className="p-6 bg-white border border-[#D6C9A8] space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">Property Photos</h2>
            <p className="text-xs text-[#5C5C5C] mt-0.5">
              Upload up to 10 photos of this property (JPG, PNG, WebP · Max 8MB each)
            </p>
          </div>

          {/* Hidden native file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
          />

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleUploadFiles(e.dataTransfer.files)
              }
            }}
            className={cn(
              "border-2 border-dashed border-[#D6C9A8] hover:border-[#2D5A3D] bg-[#FDFAF4] rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group",
              isUploadingPhotos && "opacity-70 pointer-events-none"
            )}
          >
            <div className="w-12 h-12 rounded-full bg-[#F0F4EC] text-[#2D5A3D] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              {isUploadingPhotos ? (
                <CircleNotch size={24} weight="bold" className="animate-spin text-[#2D5A3D]" />
              ) : (
                <UploadSimple size={24} weight="bold" />
              )}
            </div>
            <span className="text-sm font-bold text-[#1A1A1A]">
              {isUploadingPhotos ? 'Uploading photo(s) to Supabase Storage...' : 'Click to select photos or drag & drop'}
            </span>
            <span className="text-xs text-[#5C5C5C]">
              {photos.length} / 10 photos uploaded · First photo is cover · Max 8MB/photo
            </span>
          </div>

          {/* Photo Previews */}
          {photos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#5C5C5C]">
                <span>Listing Photos ({photos.length}/10)</span>
                <span className="text-[11px] text-[#2D5A3D] font-medium">Click &quot;Make Cover&quot; on any photo to set it as cover</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="relative h-28 rounded-xl overflow-hidden bg-[#EDE0C4] border border-[#D6C9A8] group"
                  >
                    <Image
                      src={photo}
                      alt={`Listing photo ${idx + 1}`}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                    {idx === 0 ? (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#2D5A3D] text-white text-[10px] font-bold rounded-md shadow-xs flex items-center gap-1">
                        <Star size={10} weight="fill" /> Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSetCover(idx)
                        }}
                        className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 hover:bg-[#2D5A3D] text-white text-[10px] font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                        title="Set as cover photo"
                      >
                        <Star size={10} /> Make Cover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemovePhoto(idx)
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-[#C1121F] transition-colors"
                      aria-label="Remove photo"
                    >
                      <X size={12} weight="bold" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Secondary URL paste */}
          <div className="pt-2 border-t border-[#EDE0C4]">
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-xs font-semibold text-[#2D5A3D] hover:underline flex items-center gap-1.5"
            >
              <LinkSimple size={14} />
              <span>{showUrlInput ? 'Hide image URL paste' : 'Or paste image URL (Optional secondary)'}</span>
            </button>

            {showUrlInput && (
              <div className="mt-3 flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 h-10 px-3 text-xs bg-white rounded-lg border border-[#D6C9A8] focus:border-[#2D5A3D] outline-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddUrlPhoto}
                  disabled={!urlInput.trim() || photos.length >= 10}
                >
                  Add URL
                </Button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#EDE0C4] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setStep(3)} leftIcon={<ArrowLeft size={16} />}>
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              disabled={photos.length === 0 || isUploadingPhotos}
              onClick={() => setStep(5)}
              rightIcon={<ArrowRight size={18} />}
            >
              Review &amp; Safety Check
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 5: Review & Safety Check */}
      {step === 5 && (
        <Card elevation="1" className="p-6 bg-white border border-[#D6C9A8] space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">Review Your Listing</h2>
            <p className="text-xs text-[#5C5C5C] mt-0.5">
              Confirm details and run the automated safety pre-check
            </p>
          </div>

          {/* Listing Summary Card */}
          <div className="p-4 bg-[#F5EDD6] rounded-2xl border border-[#D6C9A8] space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1A1A1A] text-sm">{title}</span>
              <button
                onClick={() => setStep(1)}
                className="font-bold text-[#2D5A3D] hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[#5C5C5C]">
              <div>
                <span className="block text-[10px] uppercase font-bold">Type:</span>
                <span className="font-bold text-[#1A1A1A] capitalize">{propertyType} ({transactionType})</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold">Location:</span>
                <span className="font-bold text-[#1A1A1A]">{location}, {lga}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold">Price:</span>
                <span className="font-bold text-[#2D5A3D]">{formatNGN(askingPrice)}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold">Title:</span>
                <span className="font-bold text-[#1A1A1A]">{titleType}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-[#D6C9A8]/40 text-xs text-[#2D5A3D] font-semibold">
              {isLand && (
                <span>Plot Area: <strong className="text-[#1A1A1A]">{landSize || '0'} SQM</strong> · Land Plot (No residential structures)</span>
              )}
              {isCommercial && (
                <span>Usable Space: <strong className="text-[#1A1A1A]">{landSize || '0'} SQM</strong> · <strong className="text-[#1A1A1A]">{bathrooms} Restrooms / Toilets</strong></span>
              )}
              {!isLand && !isCommercial && (
                <span>Specs: <strong className="text-[#1A1A1A]">{bedrooms} Beds · {bathrooms} Baths</strong>{landSize ? ` · ${landSize} SQM` : ''}</span>
              )}
            </div>
          </div>

          {/* Safety Pre-Check Card */}
          <div className="p-4 bg-[#F0F4EC] rounded-2xl border border-[#A8C192] flex items-start gap-3">
            <ShieldCheck size={28} weight="fill" className="text-[#2D5A3D] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#2D5A3D]">Automated Safety Screening</h4>
              <p className="text-xs text-[#5C5C5C] mt-0.5 leading-relaxed">
                Your listing will be evaluated against market pricing benchmarks and title indicators upon submission.
              </p>
            </div>
          </div>

          <Checkbox
            checked={confirmedAccurate}
            onChange={(e) => setConfirmedAccurate(e.target.checked)}
            label="I confirm all information and photos provided in this listing are accurate, legitimate, and authorized."
          />

          <div className="pt-4 border-t border-[#EDE0C4] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setStep(4)} leftIcon={<ArrowLeft size={16} />}>
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              disabled={!confirmedAccurate}
              isLoading={isSubmitting}
              onClick={handleSubmitListing}
            >
              Submit Listing
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
