import { RawScrapedListing } from './propertypro'

export async function scrapeNigerianPropertyCentre(limit: number = 10): Promise<RawScrapedListing[]> {
  try {
    return [
      {
        source: 'nigerian_property_centre',
        sourceId: 'npc-abj-501',
        sourceUrl: 'https://nigeriapropertycentre.com/for-sale/houses/abuja/maitama/4-bed-duplex',
        title: 'Brand New 4 Bedroom Duplex in Maitama',
        location: 'Maitama',
        price: 290000000,
        bedrooms: 4,
        bathrooms: 5,
        description: 'Luxury finishing with swimming pool and boys quarters.',
        images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'],
      },
    ]
  } catch (error) {
    console.error('Nigerian Property Centre scraper error:', error)
    return []
  }
}
