'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Heart,
  ShareNetwork,
  MapPin,
  Bed,
  Shower,
  Certificate,
  HouseSimple,
  ShieldCheck,
  ShieldWarning,
  Sparkle,
  Calculator,
  CheckCircle,
  WarningCircle,
  CaretDown,
  CaretUp,
  User,
  PaperPlaneTilt,
  ChatCircleDots,
  Door,
  Tree,
  Buildings,
  Storefront,
} from '@phosphor-icons/react'
import { PropertyListing } from '@/types'
import { ALL_AMENITIES } from '@/lib/data/premiums'
import { Button, Card, Badge, Progress, Textarea, Input, Avatar } from '@/components/ui'
import { PropertyCard } from '@/components/property/PropertyCard'
import { ConfidenceChip } from '@/components/property/ConfidenceChip'
import { PriceRangeDisplay } from '@/components/property/PriceRangeDisplay'
import { formatNGN } from '@/lib/utils'
import { useSearchStore } from '@/store/search'
import { useToast } from '@/components/ui/Toast'

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { savedListings, toggleSaveListing } = useSearchStore()
  const { addToast } = useToast()

  const [property, setProperty] = useState<PropertyListing | null>(null)
  const [similarProperties, setSimilarProperties] = useState<PropertyListing[]>([])
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    async function loadListing() {
      try {
        setLoading(true)
        const res = await fetch(`/api/listings/${id}`)
        if (res.ok) {
          const data = await res.json()
          if (data.listing) {
            setProperty(data.listing)
            setCalculatorBase(data.listing.asking_price)
            setEnquiryMsg(`Hello, I would like to schedule an inspection for "${data.listing.title}" in ${data.listing.location}.`)

            // Fetch similar active listings in same LGA
            try {
              const simRes = await fetch(`/api/listings?lga=${encodeURIComponent(data.listing.lga)}&limit=3`)
              if (simRes.ok) {
                const simData = await simRes.json()
                const sims = (simData.listings || []).filter((l: PropertyListing) => l.id !== id).slice(0, 2)
                setSimilarProperties(sims)
              }
            } catch (simErr) {
              console.warn('[PROPERTY DETAIL] Could not fetch similar properties:', simErr)
            }
          }
        }
      } catch (err) {
        console.error('[PROPERTY DETAIL] Error fetching listing:', err)
      } finally {
        setLoading(false)
      }
    }
    loadListing()
  }, [id])

  const isSaved = property ? savedListings.includes(property.id) : false

  const [activePhotoIdx, setActivePhotoIdx] = useState(0)
  const [heroImageError, setHeroImageError] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const [showHowCalculated, setShowHowCalculated] = useState(false)

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'detached':
        return <HouseSimple size={14} />
      case 'semi-detached':
        return <Buildings size={14} />
      case 'flat':
        return <Door size={14} />
      case 'terrace':
        return <Buildings size={14} />
      case 'duplex':
        return <HouseSimple size={14} />
      case 'bungalow':
        return <HouseSimple size={14} />
      case 'land':
        return <Tree size={14} />
      case 'commercial':
        return <Storefront size={14} />
      default:
        return <HouseSimple size={14} />
    }
  }

  const getBuyerFacingRecommendation = (recommendation?: string, risk?: string) => {
    if (!recommendation) {
      if (risk === 'critical' || risk === 'high') {
        return 'Independent physical inspection and legal title search recommended before proceeding.'
      }
      return 'Verified property documentation.'
    }
    // Convert internal admin phrasing like "before publishing" into buyer-facing copy
    return recommendation.replace(/before publishing/gi, 'before proceeding with transaction')
  }

  // Chat & Enquiry states
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [enquiryMsg, setEnquiryMsg] = useState(
    property ? `Hello, I would like to schedule an inspection for "${property.title}" in ${property.location}.` : ''
  )
  const [buyerPhone, setBuyerPhone] = useState('')
  const [isSendingEnquiry, setIsSendingEnquiry] = useState(false)

  const handleMessageSeller = async () => {
    if (!property) return
    setIsStartingChat(true)
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: property.id }),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/dashboard/buyer/chat?conversationId=${data.conversation.id}`)
      } else {
        const err = await res.json().catch(() => ({}))
        addToast({
          title: 'Could not open chat',
          message: err.error || 'Please sign in with a buyer account.',
          type: 'error',
        })
      }
    } catch {
      addToast({
        title: 'Network error',
        message: 'Failed to connect to chat service.',
        type: 'error',
      })
    } finally {
      setIsStartingChat(false)
    }
  }

  // Cost calculator state
  const [calculatorBase, setCalculatorBase] = useState(property ? property.asking_price : 0)

  const agencyFee =
    property?.transaction_type === 'rent'
      ? Math.round(calculatorBase * 0.1)
      : Math.round(calculatorBase * 0.05)
  const legalFee =
    property?.transaction_type === 'rent'
      ? Math.round(calculatorBase * 0.05)
      : Math.round(calculatorBase * 0.03)
  const stampDuty =
    property?.transaction_type === 'sale'
      ? Math.round(calculatorBase * 0.015)
      : 0
  const totalCost = calculatorBase + agencyFee + legalFee + stampDuty

  const handleToggleSave = async () => {
    if (!property) return
    toggleSaveListing(property.id)
    try {
      await fetch('/api/favourites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: property.id }),
      })
      addToast({
        title: isSaved ? 'Removed from favourites' : 'Saved to favourites',
        message: property.title,
        type: 'info',
      })
    } catch {
      // Optimistic state retained
    }
  }

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!property) return
    setIsSendingEnquiry(true)
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: property.id,
          message: enquiryMsg,
          buyer_phone: buyerPhone,
        }),
      })

      if (res.ok) {
        addToast({
          title: 'Enquiry Dispatched',
          message: 'Your inquiry has been sent to the property owner.',
          type: 'success',
        })
      } else {
        const err = await res.json().catch(() => ({}))
        addToast({ title: 'Failed to send enquiry', message: err.error, type: 'error' })
      }
    } catch {
      addToast({ title: 'Error', message: 'Could not send enquiry', type: 'error' })
    } finally {
      setIsSendingEnquiry(false)
    }
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      addToast({ title: 'Link copied', message: 'Property link copied to clipboard.', type: 'info' })
    }
  }

  if (loading && !property) {
    return (
      <div className="p-16 text-center text-xs text-[#5C5C5C] bg-white rounded-2xl border border-[#D6C9A8]">
        Loading property details from registry...
      </div>
    )
  }

  if (!property) {
    return (
      <div className="p-16 text-center space-y-3 bg-white rounded-2xl border border-[#D6C9A8]">
        <h2 className="text-lg font-bold text-[#1A1A1A]">Property Not Found</h2>
        <p className="text-xs text-[#5C5C5C]">This listing may have been removed or does not exist.</p>
        <Link href="/dashboard/buyer/search" className="inline-block pt-2">
          <Button variant="primary" size="sm">
            Back to Search
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/buyer/search"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#2D5A3D] hover:underline bg-white px-3 py-1.5 rounded-lg border border-[#D6C9A8] shadow-xs"
        >
          <ArrowLeft size={16} />
          <span>Back to Search Results</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSave}
            className="p-2 rounded-lg bg-white border border-[#D6C9A8] text-[#1A1A1A] hover:text-[#C9962A] shadow-xs"
            aria-label="Save listing"
          >
            <Heart
              size={20}
              weight={isSaved ? 'fill' : 'bold'}
              className={isSaved ? 'text-[#C9962A]' : ''}
            />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-lg bg-white border border-[#D6C9A8] text-[#1A1A1A] hover:text-[#2D5A3D] shadow-xs"
            aria-label="Share listing"
          >
            <ShareNetwork size={20} />
          </button>
        </div>
      </div>

      {/* Top Status Banner if Paused or Sold */}
      {property.status === 'sold' && (
        <div className="bg-[#1A1A1A] text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md border border-[#333]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C1121F] text-white flex items-center justify-center font-black text-xs shrink-0 tracking-wider">
              SOLD
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">This Property is Marked as Sold</h2>
              <p className="text-xs text-[#A8A8A8] mt-0.5">
                This transaction has concluded and the listing is no longer available on the active Abuja market.
              </p>
            </div>
          </div>
          <Link href="/dashboard/buyer/search">
            <Button variant="secondary" size="sm">
              Explore Active Listings
            </Button>
          </Link>
        </div>
      )}

      {property.status === 'paused' && (
        <div className="bg-[#FFF8E7] text-[#8F6B10] p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs border border-[#F0CC77]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9962A] text-white flex items-center justify-center font-bold text-xs shrink-0 tracking-wider">
              PAUSED
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1A1A1A]">Listing Temporarily Paused</h2>
              <p className="text-xs text-[#5C5C5C] mt-0.5">
                The owner has paused this listing. Inquiries and inspections are currently suspended.
              </p>
            </div>
          </div>
          <Link href="/dashboard/buyer/search">
            <Button variant="outline" size="sm">
              Search Alternatives
            </Button>
          </Link>
        </div>
      )}

      {/* Image Gallery */}
      <div className="space-y-3">
        <div className="relative h-72 sm:h-96 md:h-[420px] w-full rounded-2xl overflow-hidden bg-[#EDE0C4] border border-[#D6C9A8] shadow-2">
          {property.images && property.images.length > 0 && property.images[activePhotoIdx] && !heroImageError ? (
            <Image
              src={property.images[activePhotoIdx] || property.images[0]}
              alt={property.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
              onError={() => setHeroImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#8F8165]">
              <HouseSimple size={56} weight="light" className="mb-2 text-[#8F8165]" />
              <span className="text-sm font-semibold text-[#8F8165]">No photo available</span>
            </div>
          )}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
            {property.status === 'sold' && (
              <span className="px-3 py-1 bg-[#C1121F] text-white text-xs font-black rounded-full shadow-md uppercase tracking-wider">
                SOLD
              </span>
            )}
            {property.status === 'paused' && (
              <span className="px-3 py-1 bg-[#C9962A] text-white text-xs font-black rounded-full shadow-md uppercase tracking-wider">
                PAUSED
              </span>
            )}
            <span className="px-3 py-1 bg-[#2D5A3D] text-white text-xs font-bold rounded-full shadow-md">
              {property.lga} Council
            </span>
            <span className="px-3 py-1 bg-white/95 text-[#1A1A1A] text-xs font-bold rounded-full shadow-md capitalize backdrop-blur-xs">
              For {property.transaction_type}
            </span>
            <span className="px-3 py-1 bg-white/95 text-[#1A1A1A] text-xs font-bold rounded-full shadow-md capitalize backdrop-blur-xs flex items-center gap-1">
              {getTypeIcon(property.property_type)}
              <span>{property.property_type ? property.property_type.replace('-', ' ') : 'Property'}</span>
            </span>
          </div>
        </div>

        {/* Thumbnails row */}
        {property.images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
            {property.images.map((img, idx) => {
              if (!img || typeof img !== 'string' || img.trim() === '') return null
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActivePhotoIdx(idx)
                    setHeroImageError(false)
                  }}
                  className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activePhotoIdx === idx
                      ? 'border-[#2D5A3D] ring-2 ring-[#2D5A3D]/20 scale-105'
                      : 'border-[#D6C9A8] opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header & Price Card */}
          <Card elevation="1" className="p-6 bg-white border border-[#D6C9A8] space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5EDD6] text-[#1A1A1A] text-xs font-bold rounded-full border border-[#D6C9A8] capitalize">
                {getTypeIcon(property.property_type)}
                <span>{property.property_type ? property.property_type.replace('-', ' ') : 'Property'}</span>
              </span>
              <Badge tier={property.market_tier} />
              <ConfidenceChip
                confidence={property.price_confidence}
                fraudRiskLevel={property.fraud_risk_level}
                askingPrice={property.asking_price}
                aiPriceMin={property.ai_price_min}
                aiPriceMax={property.ai_price_max}
              />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tracking-tight">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#2D5A3D]">
                  {formatNGN(property.asking_price)}
                </span>
                {property.transaction_type === 'rent' && (
                  <span className="text-sm font-semibold text-[#5C5C5C]">/ year</span>
                )}
              </div>
              <PriceRangeDisplay
                minPrice={property.ai_price_min}
                maxPrice={property.ai_price_max}
                askingPrice={property.asking_price}
                confidence={property.price_confidence}
                fraudRiskLevel={property.fraud_risk_level}
                transactionType={property.transaction_type}
                className="mt-1 text-sm font-medium"
              />
            </div>

            {/* Key details specs row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#EDE0C4]">
              <div className="flex items-center gap-2 bg-[#F5EDD6] p-2.5 rounded-xl">
                <Bed size={20} className="text-[#2D5A3D]" weight="fill" />
                <div>
                  <span className="text-[10px] text-[#5C5C5C] uppercase font-bold block">Bedrooms</span>
                  <span className="text-xs font-bold text-[#1A1A1A]">{property.bedrooms || 'Studio'} Beds</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#F5EDD6] p-2.5 rounded-xl">
                <Shower size={20} className="text-[#2D5A3D]" weight="fill" />
                <div>
                  <span className="text-[10px] text-[#5C5C5C] uppercase font-bold block">Bathrooms</span>
                  <span className="text-xs font-bold text-[#1A1A1A]">{property.bathrooms} Baths</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#F5EDD6] p-2.5 rounded-xl">
                <MapPin size={20} className="text-[#2D5A3D]" weight="fill" />
                <div>
                  <span className="text-[10px] text-[#5C5C5C] uppercase font-bold block">Council</span>
                  <span className="text-xs font-bold text-[#1A1A1A]">{property.lga}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#F5EDD6] p-2.5 rounded-xl">
                <Certificate size={20} className="text-[#C9962A]" weight="fill" />
                <div>
                  <span className="text-[10px] text-[#5C5C5C] uppercase font-bold block">Title</span>
                  <span className="text-xs font-bold text-[#1A1A1A]">{property.title_type}</span>
                </div>
              </div>
            </div>

            {/* Location & Maps link */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 text-xs text-[#5C5C5C]">
                <MapPin size={16} className="text-[#2D5A3D]" weight="fill" />
                <span>{property.address || `${property.location}, ${property.lga}, Abuja`}</span>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  `${property.location} Abuja Nigeria`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#2D5A3D] hover:underline"
              >
                View on Google Maps ↗
              </a>
            </div>
          </Card>

          {/* Safety & Fraud Analysis Card */}
          <Card
            elevation="1"
            className={`p-6 bg-white border ${
              property.fraud_risk_level === 'critical'
                ? 'border-[#FCA5A5] bg-[#FEE2E2]/20'
                : 'border-[#D6C9A8]'
            } space-y-4`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E8F5EF] text-[#2D6A4F] flex items-center justify-center">
                  <ShieldCheck size={20} weight="fill" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A1A]">
                    Listing Safety &amp; Title Analysis
                  </h3>
                  <p className="text-xs text-[#5C5C5C]">
                    Multi-vector risk checks against distress fraud signatures and price deviation
                  </p>
                </div>
              </div>
              <Badge risk={property.fraud_risk_level} />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#1A1A1A]">
                <span>Fraud Risk Score</span>
                <span>{property.fraud_score} / 100</span>
              </div>
              <Progress
                value={property.fraud_score}
                variant="risk"
                height="md"
              />
            </div>

            {property.fraud_red_flags && property.fraud_red_flags.length > 0 && (
              <div className="p-3 bg-[#FEE2E2] rounded-xl border border-[#FCA5A5] space-y-1.5 text-xs text-[#C1121F]">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldWarning size={16} weight="fill" />
                  Flags Detected:
                </span>
                <ul className="list-disc list-inside space-y-0.5">
                  {property.fraud_red_flags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                property.fraud_risk_level === 'critical' || property.fraud_risk_level === 'high'
                  ? 'bg-[#FEE2E2] text-[#C1121F] border border-[#FCA5A5]'
                  : property.fraud_risk_level === 'medium'
                  ? 'bg-[#FDF8EC] text-[#C9962A] border border-[#F0CC77]'
                  : 'bg-[#F0F4EC] text-[#2D5A3D]'
              }`}
            >
              {property.fraud_risk_level === 'critical' || property.fraud_risk_level === 'high' ? (
                <ShieldWarning size={18} weight="fill" className="shrink-0 text-[#C1121F]" />
              ) : property.fraud_risk_level === 'medium' ? (
                <WarningCircle size={18} weight="fill" className="shrink-0 text-[#C9962A]" />
              ) : (
                <CheckCircle size={18} weight="fill" className="shrink-0 text-[#2D6A4F]" />
              )}
              <span>{getBuyerFacingRecommendation(property.fraud_recommendation, property.fraud_risk_level)}</span>
            </div>

            <button
              onClick={() => setShowHowCalculated(!showHowCalculated)}
              className="text-xs font-semibold text-[#5C5C5C] hover:text-[#1A1A1A] flex items-center gap-1"
            >
              <span>How is safety scored?</span>
              {showHowCalculated ? <CaretUp size={12} /> : <CaretDown size={12} />}
            </button>

            {showHowCalculated && (
              <p className="text-xs text-[#5C5C5C] bg-[#F5EDD6] p-3 rounded-lg leading-relaxed animate-fadeIn">
                Our model assesses multi-point risk vectors: price deviation from district medians, documentation consistency, pressure language algorithms, and multi-source cross referencing.
              </p>
            )}
          </Card>

          {/* Description Card */}
          <Card elevation="1" className="p-6 bg-white border border-[#D6C9A8] space-y-3">
            <h3 className="text-sm font-bold text-[#1A1A1A]">Property Description</h3>
            <p
              className={`text-xs sm:text-sm text-[#5C5C5C] leading-relaxed ${
                !descExpanded ? 'line-clamp-3' : ''
              }`}
            >
              {property.description}
            </p>
            <button
              onClick={() => setDescExpanded(!descExpanded)}
              className="text-xs font-bold text-[#2D5A3D] hover:underline"
            >
              {descExpanded ? 'Read less' : 'Read more'}
            </button>
          </Card>

          {/* Amenities Grid */}
          <Card elevation="1" className="p-6 bg-white border border-[#D6C9A8] space-y-3">
            <h3 className="text-sm font-bold text-[#1A1A1A]">Amenities &amp; Features</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ALL_AMENITIES.map((amenity) => {
                const isAvailable = property.amenities.includes(amenity)
                return (
                  <div
                    key={amenity}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                      isAvailable
                        ? 'bg-[#F0F4EC] text-[#2D5A3D] border-[#A8C192]'
                        : 'bg-[#FDFAF4] text-[#9A9A9A] border-[#EDE0C4] line-through opacity-60'
                    }`}
                  >
                    <CheckCircle
                      size={14}
                      weight={isAvailable ? 'fill' : 'regular'}
                      className={isAvailable ? 'text-[#2D6A4F]' : 'text-[#9A9A9A]'}
                    />
                    <span className="truncate">{amenity}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* AI Property Insights Card */}
          <Card elevation="1" className="p-6 bg-white border border-[#D6C9A8] space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FDF8EC] text-[#C9962A] flex items-center justify-center">
                <Sparkle size={20} weight="fill" />
              </div>
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                AI Property Intelligence Breakdown
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F5EDD6] border border-[#D6C9A8] space-y-1">
                <span className="font-bold text-[#2D5A3D] block">Price Assessment</span>
                <p className="text-[#5C5C5C]">
                  {property.price_confidence === 'low' ||
                  (property.ai_price_min && property.asking_price < property.ai_price_min * 0.5) ||
                  (property.ai_price_max && property.asking_price > property.ai_price_max * 2.0)
                    ? `Asking price deviates substantially from estimated area baselines for ${property.location}. Independent valuation recommended.`
                    : property.ai_price_min && property.ai_price_max
                    ? `Asking price aligns with current comparable district market baselines in ${property.location}.`
                    : `Statistical baseline pricing for ${property.location}; district comps updating.`}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F5EDD6] border border-[#D6C9A8] space-y-1">
                <span className="font-bold text-[#C9962A] block">
                  {property.transaction_type === 'rent' ? 'Rental Market Dynamics' : 'Investment Potential'}
                </span>
                <p className="text-[#5C5C5C]">
                  {property.transaction_type === 'rent'
                    ? `Active tenant demand in ${property.location} (${property.lga}) with standard annual renewal cycles.`
                    : `Projected capital appreciation corridor in ${property.location} supported by infrastructure access.`}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F5EDD6] border border-[#D6C9A8] space-y-1">
                <span className="font-bold text-[#2D5A3D] block">Title Security</span>
                <p className="text-[#5C5C5C]">
                  {property.title_type === 'C of O' ||
                  property.title_type === 'Right of Occupancy' ||
                  property.title_type === 'Governors Consent' ||
                  property.title_type === 'FCDA Allocation' ||
                  property.title_type === 'FHA Allocation'
                    ? `Statutory title (${property.title_type}) provides primary institutional legal backing.`
                    : `Title recorded as ${property.title_type || 'Unspecified'}. Statutory lands search advised before committing funds.`}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F5EDD6] border border-[#D6C9A8] space-y-1">
                <span className="font-bold text-[#1A1A1A] block">Corridor Growth</span>
                <p className="text-[#5C5C5C]">
                  District infrastructure investments projected to support steady capital growth.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (Sidebar Desktop) */}
        <div className="lg:col-span-1 space-y-6 sticky top-20">
          {/* Seller Contact Card */}
          <Card elevation="2" className="p-6 bg-white border border-[#D6C9A8] space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#EDE0C4]">
              <Avatar
                src={property.seller_avatar}
                fallback={property.seller_name || 'Owner'}
                size="md"
                className="w-12 h-12 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="text-sm font-bold text-[#1A1A1A] truncate">
                    {property.seller_name || 'Property Owner'}
                  </h4>
                  {property.seller_verified && (
                    <CheckCircle size={14} weight="fill" className="text-[#2D6A4F] shrink-0" />
                  )}
                </div>
                <span className="text-[11px] font-semibold text-[#5C5C5C]">
                  {property.seller_verified ? (
                    <span className="text-[#2D6A4F] font-bold">Verified Listing Owner</span>
                  ) : (
                    <span>Listing Owner</span>
                  )}
                </span>
              </div>
            </div>

            {property.status !== 'active' ? (
              <div className="p-4 rounded-xl bg-[#F5EDD6] border border-[#D6C9A8] text-center space-y-2">
                <span className="text-xs font-bold text-[#1A1A1A] block">
                  {property.status === 'sold'
                    ? 'Listing Concluded'
                    : 'Listing Currently Inactive'}
                </span>
                <p className="text-[11px] text-[#5C5C5C]">
                  {property.status === 'sold'
                    ? 'This property has been marked as sold. Direct messaging and new inquiries are disabled.'
                    : 'This listing has been paused by the seller. Direct inquiries are temporarily unavailable.'}
                </p>
              </div>
            ) : (
              <>
                {/* Primary CTA: Message Seller */}
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full bg-[#2D5A3D] hover:bg-[#1E3D29] font-bold shadow-sm"
                  onClick={handleMessageSeller}
                  isLoading={isStartingChat}
                  leftIcon={<ChatCircleDots size={20} weight="fill" />}
                >
                  Message seller
                </Button>

                <form onSubmit={handleSendEnquiry} className="space-y-3">
                  <Textarea
                    label="Direct Message"
                    rows={3}
                    value={enquiryMsg}
                    onChange={(e) => setEnquiryMsg(e.target.value)}
                    required
                  />
                  <Input
                    label="Your Phone Number"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    required
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    isLoading={isSendingEnquiry}
                    rightIcon={<PaperPlaneTilt size={16} weight="fill" />}
                  >
                    Send Inquiry
                  </Button>
                </form>
              </>
            )}
          </Card>

          {/* Interactive Cost Estimator */}
          <Card elevation="1" className="p-6 bg-white border border-[#D6C9A8] space-y-4">
            <div className="flex items-center gap-2">
              <Calculator size={20} className="text-[#2D5A3D]" />
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                Cost &amp; Fee Breakdown
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#5C5C5C]">
                <span>Base Price:</span>
                <span className="font-bold text-[#1A1A1A]">{formatNGN(calculatorBase)}</span>
              </div>
              <div className="flex justify-between text-[#5C5C5C]">
                <span>Agency Fee ({property.transaction_type === 'rent' ? '10%' : '5%'}):</span>
                <span>{formatNGN(agencyFee)}</span>
              </div>
              <div className="flex justify-between text-[#5C5C5C]">
                <span>Legal Documentation ({property.transaction_type === 'rent' ? '5%' : '3%'}):</span>
                <span>{formatNGN(legalFee)}</span>
              </div>
              {stampDuty > 0 && (
                <div className="flex justify-between text-[#5C5C5C]">
                  <span>Stamp Duty (1.5%):</span>
                  <span>{formatNGN(stampDuty)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#EDE0C4] flex justify-between text-sm font-extrabold text-[#2D5A3D]">
                <span>Estimated Total:</span>
                <span>{formatNGN(totalCost)}</span>
              </div>
            </div>
          </Card>

          {/* Similar Properties */}
          {similarProperties.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                Similar Properties Nearby
              </h3>
              <div className="space-y-4">
                {similarProperties.map((sim) => (
                  <PropertyCard key={sim.id} property={sim} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
