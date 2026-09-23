import { TitleType } from '@/types'

export const titlePremium: Record<TitleType, number> = {
  'C of O': 1.5,
  'Governors Consent': 1.35,
  'Right of Occupancy': 1.2,
  'FCDA Allocation': 1.15,
  'FHA Allocation': 1.1,
  'Deed of Assignment': 1.1,
  Survey: 1.05,
  Other: 1.0,
}

export const amenityScores: Record<string, number> = {
  'Swimming Pool': 15,
  Gym: 12,
  'Security / CCTV': 10,
  Generator: 10,
  'Water / Borehole': 8,
  'Boys Quarters': 8,
  'Solar Power': 7,
  'Fibre Internet': 6,
  'Parking Space': 6,
  'Air Conditioning': 5,
  'Perimeter Fence': 5,
  'DSTV / Cable': 3,
}

export const ALL_AMENITIES = Object.keys(amenityScores)
