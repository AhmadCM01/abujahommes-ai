import React from 'react'
import { cn } from '@/lib/utils'

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[#EDE0C4]', className)}
      {...props}
    />
  )
}
