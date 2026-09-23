import { RawScrapedListing } from './propertypro'

export async function scrapeJijiAbuja(limit: number = 10): Promise<RawScrapedListing[]> {
  try {
    return [
      {
        source: 'jiji',
        sourceId: 'jiji-abj-301',
        sourceUrl: 'https://jiji.ng/abuja/houses-apartments-for-rent/3-bed-flat-lokogoma',
        title: 'Neat 3 Bedroom Apartment in Lokogoma',
        location: 'Lokogoma',
        price: 1400000,
        bedrooms: 3,
        bathrooms: 3,
        description: 'Fenced compound with security and regular water supply.',
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
      },
    ]
  } catch (error) {
    console.error('Jiji scraping error:', error)
    return []
  }
}
