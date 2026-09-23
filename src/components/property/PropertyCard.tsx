'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Heart,
  MapPin,
  Bed,
  Shower,
  HouseSimple,
  Certificate,
  ChatCircle,
  Buildings,
  Door,
  Tree,
  Storefront,
} from '@phosphor-icons/react'
import { PropertyListing } from '@/types'
import { formatNGN, cn } from '@/lib/utils'
import { FraudScoreChip } from './FraudScoreChip'
import { ConfidenceChip } from './ConfidenceChip'
import { PriceRangeDisplay } from './PriceRangeDisplay'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Textarea, Input } from '@/components/ui'
import { useSearchStore } from '@/store/search'
import { useToast } from '@/components/ui/Toast'

export interface PropertyCardProps {
  property: PropertyListing
  className?: string
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  className,
}) => {
  const { savedListings, toggleSaveListing } = useSearchStore()
  const { addToast } = useToast()

  const isSaved = savedListings.includes(property.id)
  const [imageError, setImageError] = useState(false)
  const [showEnquiryModal, setShowEnquiryModal] = useState(false)
  const [enquiryMessage, setEnquiryMessage] = useState(
    `Hello, I am interested in "${property.title}" in ${property.location}. Please let me know when an inspection is available.`
  )
  const [enquiryPhone, setEnquiryPhone] = useState('')
  const [isSendingEnquiry, setIsSendingEnquiry] = useState(false)

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleSaveListing(property.id)
    addToast({
      title: isSaved ? 'Removed from favourites' : 'Saved to favourites',
      message: property.title,
      type: 'info',
    })
    try {
      await fetch('/api/favourites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: property.id }),
      })
    } catch {
      // Optimistic update retained
    }
  }

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSendingEnquiry(true)
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: property.id,
          message: enquiryMessage,
          buyer_phone: enquiryPhone,
        }),
      })

      if (res.ok) {
        setShowEnquiryModal(false)
        addToast({
          title: 'Enquiry sent',
          message: 'The seller has been notified and will contact you shortly.',
          type: 'success',
        })
      } else {
        const err = await res.json().catch(() => ({}))
        addToast({ title: 'Failed to send enquiry', message: err.error, type: 'error' })
      }
    } catch {
      addToast({ title: 'Error', message: 'Failed to send enquiry', type: 'error' })
    } finally {
      setIsSendingEnquiry(false)
    }
  }

  const getTypeIcon = () => {
    switch (property.property_type) {
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

  const hasValidImage = Boolean(
    property.images &&
    property.images.length > 0 &&
    typeof property.images[0] === 'string' &&
    property.images[0].trim() !== '' &&
    !imageError
  )

  return (
    <>
      <div
        className={cn(
          'group flex flex-col bg-white rounded-2xl border border-[#D6C9A8] overflow-hidden shadow-1 hover:shadow-3 hover:-translate-y-1 transition-all duration-250 min-w-[280px] select-none text-left',
          className
        )}
      >
        {/* Image Section (200px height) */}
        <div className="relative h-48 w-full bg-[#EDE0C4] overflow-hidden">
          {hasValidImage ? (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#8F8165] bg-[#EDE0C4]">
              <HouseSimple size={36} weight="light" className="mb-1 text-[#8F8165]" />
              <span className="text-xs font-semibold text-[#8F8165]">No photo available</span>
            </div>
          )}

          {/* Top-left: LGA & Transaction Tag */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#2D5A3D] text-white shadow-xs">
              {property.lga}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/90 text-[#1A1A1A] capitalize shadow-xs backdrop-blur-xs">
              {property.transaction_type}
            </span>
          </div>

          {/* Top-right: Save Button */}
          <button
            type="button"
            onClick={handleSaveClick}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#1A1A1A] hover:text-[#C9962A] shadow-md transition-all active:scale-90 z-10"
            aria-label="Save listing"
          >
            <Heart
              size={20}
              weight={isSaved ? 'fill' : 'bold'}
              className={isSaved ? 'text-[#C9962A] scale-110 transition-transform' : ''}
            />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col justify-between gap-3">
          {/* Row 1: Price & Fair Range */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xl font-extrabold text-[#2D5A3D] tracking-tight">
                  {formatNGN(property.asking_price)}
                </span>
                {property.transaction_type === 'rent' && (
                  <span className="text-xs font-medium text-[#5C5C5C]">/year</span>
                )}
              </div>
              <ConfidenceChip
                confidence={property.price_confidence}
                fraudRiskLevel={property.fraud_risk_level}
                askingPrice={property.asking_price}
                aiPriceMin={property.ai_price_min}
                aiPriceMax={property.ai_price_max}
              />
            </div>
            <PriceRangeDisplay
              minPrice={property.ai_price_min}
              maxPrice={property.ai_price_max}
              askingPrice={property.asking_price}
              confidence={property.price_confidence}
              fraudRiskLevel={property.fraud_risk_level}
              transactionType={property.transaction_type}
              className="mt-0.5"
            />
          </div>

          {/* Row 2: Title & Details Chips Row */}
          <div>
            <h3 className="text-sm font-bold text-[#1A1A1A] line-clamp-1 group-hover:text-[#2D5A3D] transition-colors">
              {property.title}
            </h3>

            <div className="flex items-center flex-wrap gap-2 mt-2 text-xs text-[#5C5C5C]">
              {property.bedrooms > 0 && (
                <span className="inline-flex items-center gap-1 bg-[#F5EDD6] px-2 py-0.5 rounded-md font-semibold text-[#1A1A1A]">
                  <Bed size={14} className="text-[#2D5A3D]" />
                  <span>{property.bedrooms} Bed</span>
                </span>
              )}
              {property.bathrooms > 0 && (
                <span className="inline-flex items-center gap-1 bg-[#F5EDD6] px-2 py-0.5 rounded-md font-semibold text-[#1A1A1A]">
                  <Shower size={14} className="text-[#2D5A3D]" />
                  <span>{property.bathrooms} Bath</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1 bg-[#F5EDD6] px-2 py-0.5 rounded-md font-semibold text-[#1A1A1A] capitalize">
                {getTypeIcon()}
                <span>{property.property_type ? property.property_type.replace('-', ' ') : 'Property'}</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-[#F5EDD6] px-2 py-0.5 rounded-md font-semibold text-[#1A1A1A]">
                <Certificate size={14} className="text-[#C9962A]" />
                <span>{property.title_type}</span>
              </span>
            </div>
          </div>

          {/* Row 3: Location */}
          <div className="flex items-center gap-1.5 text-xs text-[#5C5C5C]">
            <MapPin size={16} className="text-[#2D5A3D] shrink-0" weight="fill" />
            <span className="truncate font-medium">
              {property.location}, {property.lga}
            </span>
          </div>

          {/* Row 4: Fraud Score Chip (Full Width) */}
          <FraudScoreChip
            score={property.fraud_score}
            riskLevel={property.fraud_risk_level}
            showScore
          />

          {/* Row 5: Action Row */}
          <div className="flex items-center gap-2 pt-1 border-t border-[#EDE0C4]">
            <Link
              href={`/dashboard/buyer/property/${property.id}`}
              className="flex-1"
            >
              <Button variant="secondary" size="md" className="w-full">
                View Details
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowEnquiryModal(true)}
              aria-label="Send direct enquiry"
            >
              <ChatCircle size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Direct Enquiry Modal */}
      <Modal
        isOpen={showEnquiryModal}
        onClose={() => setShowEnquiryModal(false)}
        title="Send Property Enquiry"
        description={`Send a direct message to the seller of "${property.title}"`}
      >
        <form onSubmit={handleSendEnquiry} className="space-y-4">
          <div className="p-3 bg-[#F0F4EC] rounded-lg text-xs text-[#2D5A3D] font-semibold">
            Listed by: {property.seller_name || 'Verified Seller Partner'}
          </div>

          <Textarea
            label="Your Message"
            rows={4}
            value={enquiryMessage}
            onChange={(e) => setEnquiryMessage(e.target.value)}
            required
          />

          <Input
            label="Your Phone Number"
            type="tel"
            placeholder="+234 800 000 0000"
            value={enquiryPhone}
            onChange={(e) => setEnquiryPhone(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEnquiryModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSendingEnquiry}
            >
              Send Enquiry
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
