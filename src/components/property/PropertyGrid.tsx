import React from 'react'
import { PropertyListing } from '@/types'
import { PropertyCard } from './PropertyCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface PropertyGridProps {
  properties: PropertyListing[]
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  onResetFilters?: () => void
  viewMode?: 'grid' | 'list'
  className?: string
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  isLoading = false,
  emptyTitle = 'No properties found',
  emptyDescription = 'Try adjusting your search query, price range, or location filters to see more results.',
  onResetFilters,
  viewMode = 'grid',
  className,
}) => {
  if (isLoading) {
    return (
      <div
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
          className
        )}
      >
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={`skel-${idx}`}
            className="rounded-2xl bg-white border border-[#D6C9A8] overflow-hidden p-4 space-y-4 shadow-1"
          >
            <Skeleton className="h-48 w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        icon={<MagnifyingGlass size={28} />}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onResetFilters ? 'Clear All Filters' : undefined}
        onAction={onResetFilters}
      />
    )
  }

  return (
    <div
      className={cn(
        viewMode === 'list'
          ? 'grid grid-cols-1 gap-4'
          : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
        className
      )}
    >
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}
