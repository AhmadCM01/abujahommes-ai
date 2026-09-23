import { LGA, MarketTier } from '@/types'

export const ABUJA_LGAS: LGA[] = [
  'AMAC',
  'Bwari',
  'Gwagwalada',
  'Kuje',
  'Kwali',
  'Abaji',
]

export interface AbujaLocation {
  name: string
  lga: LGA
  tier: MarketTier
  description?: string
}

export const ABUJA_LOCATIONS: AbujaLocation[] = [
  // =========================================================================
  // 1. AMAC (Abuja Municipal Area Council) — HQ Garki
  // 12 Wards: City Centre, Garki, Wuse, Gwarinpa, Kabusa, Jiwa, Gui, Gwagwa,
  // Karu, Nyanya, Karshi, Orozo
  // =========================================================================

  // --- AMAC: Core / Phase 1 ---
  { name: 'Central Business District', lga: 'AMAC', tier: 'Premium', description: 'Federal government ministries and commercial epicenter' },
  { name: 'Three Arms Zone', lga: 'AMAC', tier: 'Premium', description: 'National Assembly and Supreme Court precinct' },
  { name: 'Maitama', lga: 'AMAC', tier: 'Premium', description: 'Ultra-prime diplomatic and executive residential district' },
  { name: 'Asokoro', lga: 'AMAC', tier: 'Premium', description: 'Elite presidential and diplomatic hills corridor' },
  { name: 'Guzape', lga: 'AMAC', tier: 'Prime', description: 'Fast-appreciating hillside luxury neighborhood' },
  { name: 'Guzape Hills', lga: 'AMAC', tier: 'Prime', description: 'Elevated scenic luxury residential zone' },
  { name: 'Wuse 1', lga: 'AMAC', tier: 'Prime', description: 'Central residential zones 1 through 8' },
  { name: 'Wuse 2', lga: 'AMAC', tier: 'Premium', description: 'Vibrant luxury residential and commercial hub' },
  { name: 'Garki 1', lga: 'AMAC', tier: 'Prime', description: 'Established commercial and residential district' },
  { name: 'Garki 2', lga: 'AMAC', tier: 'Prime', description: 'Active residential and corporate office district' },
  { name: 'Diplomatic Zone', lga: 'AMAC', tier: 'Premium', description: 'High-security embassy and consular district' },

  // --- AMAC: Phase 2 ---
  { name: 'Jabi', lga: 'AMAC', tier: 'Prime', description: 'Scenic lakeside luxury residential and lifestyle district' },
  { name: 'Utako', lga: 'AMAC', tier: 'Prime', description: 'Central commercial and modern residential district' },
  { name: 'Mabushi', lga: 'AMAC', tier: 'Prime', description: 'Prime arterial link between Phase 1 and Phase 2' },
  { name: 'Wuye', lga: 'AMAC', tier: 'Prime', description: 'Central high-demand modern residential enclave' },
  { name: 'Kado', lga: 'AMAC', tier: 'Mid', description: 'Serene residential district around Kado Lake' },
  { name: 'Kado Estate', lga: 'AMAC', tier: 'Mid', description: 'Organized gated residential community in Kado' },
  { name: 'Jahi', lga: 'AMAC', tier: 'Mid', description: 'High-growth residential district next to Gwarinpa' },
  { name: 'Life Camp', lga: 'AMAC', tier: 'Mid', description: 'Family-friendly residential area with top amenities' },
  { name: 'Katampe', lga: 'AMAC', tier: 'Mid', description: 'Rapidly modernizing residential district' },
  { name: 'Katampe Extension', lga: 'AMAC', tier: 'Prime', description: 'Diplomatic expansion zone with panoramic views' },
  { name: 'Durumi', lga: 'AMAC', tier: 'Mid', description: 'Central residential district near Area 1' },
  { name: 'Durumi 1', lga: 'AMAC', tier: 'Mid', description: 'Established residential zone in Durumi' },
  { name: 'Durumi 2', lga: 'AMAC', tier: 'Mid', description: 'Modern housing corridor in Durumi' },
  { name: 'Durumi 3', lga: 'AMAC', tier: 'Mid', description: 'Developing residential section in Durumi' },
  { name: 'Gudu', lga: 'AMAC', tier: 'Mid', description: 'Commercial and residential hub with modern apartments' },
  { name: 'Kaura', lga: 'AMAC', tier: 'Mid', description: 'Residential enclave near Games Village' },
  { name: 'Duboyi', lga: 'AMAC', tier: 'Mid', description: 'Quiet residential district bordering Gudu' },

  // --- AMAC: Phase 3 / West ---
  { name: 'Gwarinpa', lga: 'AMAC', tier: 'Mid', description: 'Largest planned residential estate in West Africa' },
  { name: 'Gwarinpa 1st Avenue', lga: 'AMAC', tier: 'Mid', description: 'Exclusive residential avenue in Gwarinpa' },
  { name: 'Gwarinpa 2nd Avenue', lga: 'AMAC', tier: 'Mid', description: 'Commercial and residential artery in Gwarinpa' },
  { name: 'Gwarinpa 3rd Avenue', lga: 'AMAC', tier: 'Mid', description: 'Major commercial and shopping strip in Gwarinpa' },
  { name: 'Gwarinpa 4th Avenue', lga: 'AMAC', tier: 'Mid', description: 'Serene residential avenue in Gwarinpa' },
  { name: 'Gwarinpa 5th Avenue', lga: 'AMAC', tier: 'Mid', description: 'Quiet residential neighborhood in Gwarinpa' },
  { name: 'Gwarinpa 6th Avenue', lga: 'AMAC', tier: 'Mid', description: 'Developing upscale residential sector in Gwarinpa' },
  { name: 'Gwarinpa 7th Avenue', lga: 'AMAC', tier: 'Mid', description: 'Peaceful residential neighborhood in Gwarinpa' },
  { name: 'Dakibiyu', lga: 'AMAC', tier: 'Mid', description: 'Developing residential district near Jabi' },
  { name: 'Dape', lga: 'AMAC', tier: 'Emerging', description: 'Emerging luxury estate enclave bordering Life Camp' },
  { name: 'Karmo', lga: 'AMAC', tier: 'Emerging', description: 'Vibrant commercial and residential district' },
  { name: 'Idu', lga: 'AMAC', tier: 'Emerging', description: 'Transit hub with railway connection and expanding housing' },
  { name: 'Idu Industrial', lga: 'AMAC', tier: 'Emerging', description: 'Abuja central manufacturing and logistics district' },
  { name: 'Idu Station', lga: 'AMAC', tier: 'Emerging', description: 'Railway transit hub with surrounding housing developments' },
  { name: 'Nbora', lga: 'AMAC', tier: 'Emerging', description: 'Developing residential district adjacent to Utako' },

  // --- AMAC: South ---
  { name: 'Apo', lga: 'AMAC', tier: 'Mid', description: 'Strategic residential corridor with legislative quarters' },
  { name: 'Apo Legislative Quarters', lga: 'AMAC', tier: 'Prime', description: 'Secure gated community for federal legislators' },
  { name: 'Apo Resettlement', lga: 'AMAC', tier: 'Mid', description: 'Fast-expanding residential and commercial zone' },
  { name: 'Apo Dutse', lga: 'AMAC', tier: 'Mid', description: 'Modern housing developments along Apo hills' },
  { name: 'Apo Tafyi', lga: 'AMAC', tier: 'Mid', description: 'Residential estate sector in Apo' },
  { name: 'Gaduwa', lga: 'AMAC', tier: 'Mid', description: 'Central residential district bordering Apo and Durumi' },
  { name: 'Lokogoma', lga: 'AMAC', tier: 'Emerging', description: 'Popular residential district with numerous gated estates' },
  { name: 'Galadimawa', lga: 'AMAC', tier: 'Emerging', description: 'Connecting hub between Lokogoma and airport expressway' },
  { name: 'Games Village', lga: 'AMAC', tier: 'Mid', description: 'Premier gated residential estate with sports facilities' },
  { name: 'Sun City Estate', lga: 'AMAC', tier: 'Mid', description: 'Prestigious master-planned gated estate in Lokogoma' },
  { name: 'Sunnyvale Estate', lga: 'AMAC', tier: 'Mid', description: 'Large modern gated estate community in Lokogoma' },
  { name: 'Prince and Princess Estate', lga: 'AMAC', tier: 'Mid', description: 'Upscale gated estate along Duboyi corridor' },
  { name: 'Wumba', lga: 'AMAC', tier: 'Emerging', description: 'Residential district between Lokogoma and Apo' },
  { name: 'Kabusa', lga: 'AMAC', tier: 'Emerging', description: 'Suburban residential community with expanding estates' },
  { name: 'Waru', lga: 'AMAC', tier: 'Emerging', description: 'Developing residential community near Apo' },
  { name: 'Saraji', lga: 'AMAC', tier: 'Emerging', description: 'Suburban residential district in AMAC' },

  // --- AMAC: Airport Road Corridor (Lugbe remains strictly in AMAC) ---
  { name: 'Lugbe', lga: 'AMAC', tier: 'Emerging', description: 'High-volume residential corridor on Airport Road' },
  { name: 'Sabon Lugbe', lga: 'AMAC', tier: 'Emerging', description: 'Developing residential extension in Lugbe' },
  { name: 'Lugbe Federal Housing', lga: 'AMAC', tier: 'Emerging', description: 'Established FHA residential layout in Lugbe' },
  { name: 'Trademore Estate', lga: 'AMAC', tier: 'Emerging', description: 'High-density residential estate in Lugbe' },
  { name: 'River Park Estate', lga: 'AMAC', tier: 'Mid', description: 'Mega mixed-use gated estate on Airport Road' },
  { name: 'Pyakasa', lga: 'AMAC', tier: 'Emerging', description: 'Residential community along Airport Road' },
  { name: 'Chika', lga: 'AMAC', tier: 'Emerging', description: 'Suburban residential neighborhood off Airport Road' },
  { name: 'Piwoyi', lga: 'AMAC', tier: 'Emerging', description: 'Airport Road residential community' },
  { name: 'Kuchigoro', lga: 'AMAC', tier: 'Emerging', description: 'Suburban community along Airport Road' },
  { name: 'Airport Road Corridor', lga: 'AMAC', tier: 'Emerging', description: 'Prime connectivity artery with modern estates' },
  { name: 'Aleyita', lga: 'AMAC', tier: 'Emerging', description: 'Developing suburban zone near Lugbe' },
  { name: 'AMAC Estate', lga: 'AMAC', tier: 'Emerging', description: 'Council housing community in Lugbe' },

  // --- AMAC: East Satellites (FCT AMAC, not Nasarawa) ---
  { name: 'Nyanya', lga: 'AMAC', tier: 'Outer', description: 'High-density commercial and commuter hub in AMAC' },
  { name: 'Karu', lga: 'AMAC', tier: 'Outer', description: 'Major suburban district east of Abuja city center in AMAC' },
  { name: 'Jikwoyi', lga: 'AMAC', tier: 'Outer', description: 'Affordable residential suburb near Karu' },
  { name: 'Kurudu', lga: 'AMAC', tier: 'Outer', description: 'Suburban community with post-service army housing estates' },
  { name: 'Karshi', lga: 'AMAC', tier: 'Outer', description: 'Scenic satellite town with emerging educational institutions' },
  { name: 'Orozo', lga: 'AMAC', tier: 'Outer', description: 'Residential suburb housing Federal Technical College' },

  // --- AMAC: Other Wards ---
  { name: 'Gwagwa', lga: 'AMAC', tier: 'Outer', description: 'Commercial and residential suburb in western AMAC' },
  { name: 'Jiwa', lga: 'AMAC', tier: 'Outer', description: 'Traditional community and expanding residential sector in AMAC' },
  { name: 'Gosa', lga: 'AMAC', tier: 'Emerging', description: 'Community along Airport Road corridor in AMAC' },
  { name: 'Gui', lga: 'AMAC', tier: 'Outer', description: 'Suburban ward in western AMAC' },

  // =========================================================================
  // 2. BWARI AREA COUNCIL
  // Wards: Bwari Central, Kubwa, Dutse Alhaji, Byazhin, Ushafa, Kuduru,
  // Igu, Kawu, Shere, Usuma
  // =========================================================================
  { name: 'Kubwa', lga: 'Bwari', tier: 'Outer', description: 'Largest satellite town in Abuja with complete infrastructure' },
  { name: 'Kubwa Phase 1', lga: 'Bwari', tier: 'Outer', description: 'Central commercial and residential sector in Kubwa' },
  { name: 'Kubwa Phase 2', lga: 'Bwari', tier: 'Outer', description: 'Established residential community in Kubwa' },
  { name: 'Kubwa Phase 3', lga: 'Bwari', tier: 'Outer', description: 'Quiet residential neighborhood in Kubwa' },
  { name: 'Kubwa Phase 4', lga: 'Bwari', tier: 'Outer', description: 'Modern housing developments in Kubwa' },
  { name: 'Kubwa PW', lga: 'Bwari', tier: 'Outer', description: 'Vibrant transit and shopping district in Kubwa' },
  { name: 'Kubwa Arab Road', lga: 'Bwari', tier: 'Outer', description: 'Rapidly growing residential sector in Kubwa' },
  { name: 'Kubwa Byazhin', lga: 'Bwari', tier: 'Outer', description: 'Affordable suburban neighborhood in Kubwa' },
  { name: 'Kubwa FHA', lga: 'Bwari', tier: 'Outer', description: 'Federal Housing Authority planned layout in Kubwa' },
  { name: 'Brick City Kubwa', lga: 'Bwari', tier: 'Outer', description: 'Master-planned Urban Shelter estate in Kubwa' },
  { name: 'Dutse Alhaji', lga: 'Bwari', tier: 'Emerging', description: 'Commercial center and residential neighborhood in Dutse' },
  { name: 'Dutse Makaranta', lga: 'Bwari', tier: 'Outer', description: 'Suburban residential neighborhood in Dutse' },
  { name: 'Dutse Sagwari', lga: 'Bwari', tier: 'Outer', description: 'Hillside residential area in Dutse' },
  { name: 'Dutse Pege', lga: 'Bwari', tier: 'Outer', description: 'Developing residential sector in Dutse' },
  { name: 'Dutse', lga: 'Bwari', tier: 'Emerging', description: 'Busy suburban district along Bwari expressway' },
  { name: 'Dawaki', lga: 'Bwari', tier: 'Emerging', description: 'Modern residential district nestled below Katampe hills' },
  { name: 'Byazhin', lga: 'Bwari', tier: 'Outer', description: 'Suburban community and ward in Bwari Area Council' },
  { name: 'Mpape', lga: 'Bwari', tier: 'Emerging', description: 'Elevated rocky district directly overlooking Maitama' },
  { name: 'Ushafa', lga: 'Bwari', tier: 'Outer', description: 'Historic pottery village with scenic mountain landscapes' },
  { name: 'Peyi', lga: 'Bwari', tier: 'Outer', description: 'Developing residential community in Bwari council' },
  { name: 'Jigo', lga: 'Bwari', tier: 'Rural', description: 'Agrarian and residential community in Bwari council' },
  { name: 'Bwari Central', lga: 'Bwari', tier: 'Outer', description: 'Headquarters of Bwari Area Council' },
  { name: 'Bwari Law School', lga: 'Bwari', tier: 'Outer', description: 'Academic and residential zone surrounding Nigerian Law School' },
  { name: 'Kuduru', lga: 'Bwari', tier: 'Outer', description: 'Peaceful community and ward in Bwari council' },
  { name: 'Igu', lga: 'Bwari', tier: 'Rural', description: 'Agricultural and residential community in Bwari' },
  { name: 'Kawu', lga: 'Bwari', tier: 'Rural', description: 'Agrarian town in northern Bwari council' },
  { name: 'Shere', lga: 'Bwari', tier: 'Rural', description: 'Scenic countryside community and ward in Bwari' },
  { name: 'Usuma', lga: 'Bwari', tier: 'Rural', description: 'Reservoir and hillside community in Bwari council' },
  { name: 'Pambara', lga: 'Bwari', tier: 'Outer', description: 'Developing residential area near Bwari town' },

  // =========================================================================
  // 3. GWAGWALADA AREA COUNCIL
  // =========================================================================
  { name: 'Gwagwalada Central', lga: 'Gwagwalada', tier: 'Outer', description: 'Major university and commercial city center' },
  { name: 'Zuba', lga: 'Gwagwalada', tier: 'Outer', description: 'Key commercial gateway and transit hub into FCT' },
  { name: 'Kutunku', lga: 'Gwagwalada', tier: 'Outer', description: 'Established residential layout in Gwagwalada' },
  { name: 'Tunga Maje', lga: 'Gwagwalada', tier: 'Outer', description: 'Growing suburb along Zuba-Gwagwalada expressway' },
  { name: 'Gwako', lga: 'Gwagwalada', tier: 'Rural', description: 'Quiet community on Gwagwalada expressway' },
  { name: 'Dobi', lga: 'Gwagwalada', tier: 'Rural', description: 'Agrarian residential district in Gwagwalada' },
  { name: 'Giri', lga: 'Gwagwalada', tier: 'Outer', description: 'Major junction community connecting Airport Road and Gwagwalada' },
  { name: 'Paiko', lga: 'Gwagwalada', tier: 'Rural', description: 'Developing residential town in Gwagwalada' },
  { name: 'UNIABUJA Campus Quarters', lga: 'Gwagwalada', tier: 'Outer', description: 'Academic residential community for University of Abuja' },
  { name: 'Teaching Hospital Quarters', lga: 'Gwagwalada', tier: 'Outer', description: 'Medical staff and residential sector in Gwagwalada' },
  { name: 'Dagiri', lga: 'Gwagwalada', tier: 'Outer', description: 'Suburban residential neighborhood in Gwagwalada' },
  { name: 'Ibwa', lga: 'Gwagwalada', tier: 'Rural', description: 'Rural agricultural community in Gwagwalada' },
  { name: 'Passo', lga: 'Gwagwalada', tier: 'Outer', description: 'Residential community near Gwagwalada town' },

  // =========================================================================
  // 4. KUJE AREA COUNCIL
  // =========================================================================
  { name: 'Kuje Town', lga: 'Kuje', tier: 'Outer', description: 'Rapidly growing residential hub known as Food Basket of FCT' },
  { name: 'Gaube', lga: 'Kuje', tier: 'Rural', description: 'Quiet agricultural community in Kuje' },
  { name: 'Chibiri', lga: 'Kuje', tier: 'Outer', description: 'Residential community along Kuje-Gwagwalada road' },
  { name: 'Pegi', lga: 'Kuje', tier: 'Outer', description: 'Major government relocation and housing scheme in Kuje' },
  { name: 'Rubochi', lga: 'Kuje', tier: 'Rural', description: 'Historic town in southern Kuje council' },
  { name: 'Pasali', lga: 'Kuje', tier: 'Outer', description: 'Developing residential neighborhood in Kuje' },
  { name: 'Kiyi', lga: 'Kuje', tier: 'Rural', description: 'Agrarian community in Kuje council' },
  { name: 'Gwargwada', lga: 'Kuje', tier: 'Rural', description: 'Developing community in Kuje council' },
  { name: 'Gidan Mangoro', lga: 'Kuje', tier: 'Rural', description: 'Suburban community in Kuje council' },
  { name: 'Sauka', lga: 'Kuje', tier: 'Emerging', description: 'Strategic corridor housing Immigration HQ and estates' },
  { name: 'Centenary City Corridor', lga: 'Kuje', tier: 'Prime', description: 'Master-planned smart city development zone' },
  { name: 'Kwaku', lga: 'Kuje', tier: 'Rural', description: 'Agrarian town in Kuje council' },
  { name: 'Gudun Karya', lga: 'Kuje', tier: 'Rural', description: 'Country community in Kuje' },
  { name: 'Kabi', lga: 'Kuje', tier: 'Rural', description: 'Agricultural district in Kuje' },

  // =========================================================================
  // 5. KWALI AREA COUNCIL
  // =========================================================================
  { name: 'Kwali Central', lga: 'Kwali', tier: 'Rural', description: 'Administrative headquarters of Kwali council' },
  { name: 'Yangoji', lga: 'Kwali', tier: 'Rural', description: 'Transit community along Lokoja-Abuja expressway' },
  { name: 'Pai', lga: 'Kwali', tier: 'Rural', description: 'Peaceful agrarian district in Kwali' },
  { name: 'Sheda', lga: 'Kwali', tier: 'Rural', description: 'Home to Sheda Science and Technology Complex (SHESTCO)' },
  { name: 'Kilankwa', lga: 'Kwali', tier: 'Rural', description: 'Agricultural town in Kwali' },
  { name: 'Dafa', lga: 'Kwali', tier: 'Rural', description: 'Farming and residential community in Kwali' },
  { name: 'Gumbo', lga: 'Kwali', tier: 'Rural', description: 'Country community in Kwali' },
  { name: 'Ashara', lga: 'Kwali', tier: 'Rural', description: 'Agricultural settlement in Kwali' },
  { name: 'Yebu', lga: 'Kwali', tier: 'Rural', description: 'Rural district in Kwali' },
  { name: 'Leleyi', lga: 'Kwali', tier: 'Rural', description: 'Serene countryside community in Kwali' },

  // =========================================================================
  // 6. ABAJI AREA COUNCIL
  // =========================================================================
  { name: 'Abaji Central', lga: 'Abaji', tier: 'Rural', description: 'Historic gateway city to the Federal Capital Territory' },
  { name: 'Abaji North East', lga: 'Abaji', tier: 'Rural', description: 'Developing residential sector in Abaji council' },
  { name: 'Abaji South East', lga: 'Abaji', tier: 'Rural', description: 'Residential ward in Abaji council' },
  { name: 'Yaba', lga: 'Abaji', tier: 'Rural', description: 'Historic town on the boundary of FCT and Niger State' },
  { name: 'Agyana', lga: 'Abaji', tier: 'Rural', description: 'Farming town in Abaji' },
  { name: 'Pandagi', lga: 'Abaji', tier: 'Rural', description: 'Agrarian community in Abaji' },
  { name: 'Nuku', lga: 'Abaji', tier: 'Rural', description: 'Residential and agricultural community in Abaji' },
  { name: 'Rimba', lga: 'Abaji', tier: 'Rural', description: 'Rural district in Abaji' },
  { name: 'Alu', lga: 'Abaji', tier: 'Rural', description: 'Developing community in Abaji' },
  { name: 'Ebagy', lga: 'Abaji', tier: 'Rural', description: 'Country settlement in Abaji' },
  { name: 'Gurdi', lga: 'Abaji', tier: 'Rural', description: 'Agricultural community in Abaji' },
  { name: 'Gawu', lga: 'Abaji', tier: 'Rural', description: 'Traditional settlement in Abaji' },
]

export const locationAliases: Record<string, string> = {
  // AMAC Aliases
  'wuse': 'Wuse 2',
  'wuse 2': 'Wuse 2',
  'wuse ii': 'Wuse 2',
  'wuse zone 2': 'Wuse 2',
  'wuse 1': 'Wuse 1',
  'wuse i': 'Wuse 1',
  'wuse zone 1': 'Wuse 1',
  'garki': 'Garki 1',
  'garki 1': 'Garki 1',
  'garki 2': 'Garki 2',
  'cbd': 'Central Business District',
  'central business district': 'Central Business District',
  'asokoro extension': 'Guzape',
  'asokoro': 'Asokoro',
  'maitama': 'Maitama',
  'guzape': 'Guzape',
  'guzape hills': 'Guzape Hills',
  'gwarinpa': 'Gwarinpa',
  'jabi': 'Jabi',
  'utako': 'Utako',
  'life camp': 'Life Camp',
  'kado': 'Kado',
  'katampe': 'Katampe',
  'katampe extension': 'Katampe Extension',
  'lokogoma': 'Lokogoma',
  'lugbe': 'Lugbe',
  'lugbe fha': 'Lugbe Federal Housing',
  'sabon lugbe': 'Sabon Lugbe',
  'galadimawa': 'Galadimawa',
  'apo': 'Apo',
  'apo legislative': 'Apo Legislative Quarters',
  'wuye': 'Wuye',
  'mabushi': 'Mabushi',
  'jahi': 'Jahi',
  'durumi': 'Durumi',
  'gudu': 'Gudu',
  'kaura': 'Kaura',
  'gaduwa': 'Gaduwa',
  'games village': 'Games Village',
  'sun city': 'Sun City Estate',
  'sunnyvale': 'Sunnyvale Estate',
  'trademore': 'Trademore Estate',
  'river park': 'River Park Estate',
  'karu': 'Karu',
  'nyanya': 'Nyanya',
  'jikwoyi': 'Jikwoyi',
  'kurudu': 'Kurudu',
  'karshi': 'Karshi',
  'orozo': 'Orozo',
  'idu': 'Idu',
  'karmo': 'Karmo',
  'dape': 'Dape',
  'nbora': 'Nbora',
  'kabusa': 'Kabusa',
  'pyakasa': 'Pyakasa',
  'chika': 'Chika',
  'piwoyi': 'Piwoyi',
  'kuchigoro': 'Kuchigoro',

  // Bwari Aliases
  'kubwa': 'Kubwa',
  'fha kubwa': 'Kubwa FHA',
  'brick city': 'Brick City Kubwa',
  'dawaki': 'Dawaki',
  'dutse': 'Dutse',
  'dutse alhaji': 'Dutse Alhaji',
  'dutse makaranta': 'Dutse Makaranta',
  'bwari': 'Bwari Central',
  'bwari central': 'Bwari Central',
  'bwari town': 'Bwari Central',
  'ushafa': 'Ushafa',
  'mpape': 'Mpape',
  'byazhin': 'Kubwa Byazhin',

  // Gwagwalada Aliases
  'gwagwalada': 'Gwagwalada Central',
  'gwagwalada central': 'Gwagwalada Central',
  'zuba': 'Zuba',
  'tungan maje': 'Tunga Maje',
  'tunga maje': 'Tunga Maje',
  'uniabuja': 'UNIABUJA Campus Quarters',
  'university of abuja': 'UNIABUJA Campus Quarters',

  // Kuje Aliases
  'kuje': 'Kuje Town',
  'kuje town': 'Kuje Town',

  // Kwali Aliases
  'kwali': 'Kwali Central',
  'kwali central': 'Kwali Central',

  // Abaji Aliases
  'abaji': 'Abaji Central',
  'abaji central': 'Abaji Central',
}

// Generate lookup maps automatically from the authoritative dataset
export const locationTierMap: Record<string, MarketTier> = ABUJA_LOCATIONS.reduce(
  (acc, item) => ({ ...acc, [item.name]: item.tier }),
  {} as Record<string, MarketTier>
)

export const locationLGAMap: Record<string, LGA> = ABUJA_LOCATIONS.reduce(
  (acc, item) => ({ ...acc, [item.name]: item.lga }),
  {} as Record<string, LGA>
)

// Curated popular locations for high-level prompts & highlights
export const POPULAR_LOCATIONS = [
  'Maitama',
  'Asokoro',
  'Wuse 2',
  'Guzape',
  'Jabi',
  'Gwarinpa',
  'Katampe Extension',
  'Wuye',
  'Utako',
  'Mabushi',
  'Life Camp',
  'Lokogoma',
  'Lugbe',
  'Apo',
  'Dawaki',
  'Kubwa',
  'Kuje Town',
  'Gwagwalada Central',
]

// =========================================================================
// Authoritative Helper Functions
// =========================================================================

/**
 * Normalizes user input or aliases into the canonical Abuja location name
 */
export function normalizeLocation(rawLocation: string): string {
  if (!rawLocation) return ''
  const cleaned = rawLocation.trim().toLowerCase().replace(/\s+/g, ' ')
  return locationAliases[cleaned] || rawLocation.trim()
}

/**
 * Resolves the single authoritative Area Council (LGA) for a given location or alias
 */
export function getLocationLGA(location: string): LGA | undefined {
  if (!location) return undefined
  const canonical = normalizeLocation(location)
  if (locationLGAMap[canonical]) {
    return locationLGAMap[canonical]
  }
  const found = ABUJA_LOCATIONS.find(
    (loc) => loc.name.toLowerCase() === canonical.toLowerCase()
  )
  return found?.lga
}

/**
 * Returns all location objects belonging strictly to a specific Area Council (LGA)
 */
export function getLocationsByLGA(lga: LGA): AbujaLocation[] {
  return ABUJA_LOCATIONS.filter((loc) => loc.lga === lga)
}

/**
 * Returns the list of canonical location names belonging strictly to a specific Area Council (LGA)
 */
export function getLocationNamesByLGA(lga: LGA): string[] {
  return getLocationsByLGA(lga).map((loc) => loc.name)
}

/**
 * Validates whether a location (or alias) strictly belongs to the specified Area Council (LGA)
 */
export function isValidLocationInLGA(location: string, lga: LGA): boolean {
  if (!location || !lga) return false
  const resolvedLGA = getLocationLGA(location)
  return resolvedLGA === lga
}
