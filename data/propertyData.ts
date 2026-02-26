import { PropertyData } from '@/types/property';

export const propertyTypes = [
  { value: "all", label: "All Types" },
  { value: "rent", label: "For Rent" },
  { value: "house", label: "For Sale (House)" },
  { value: "land", label: "For Sale (Land)" }
];

export const lgas = [
  "AMAC", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Abaji"
];

export const tiers = [
  { value: "premium", label: "Premium Areas" },
  { value: "prime", label: "Prime Areas" },
  { value: "mid", label: "Mid-Range Areas" },
  { value: "emerging", label: "Emerging Areas" },
  { value: "outer", label: "Outer Areas" },
  { value: "rural", label: "Rural Areas" }
];

export const lgaWithSubAreas = {
  "AMAC": [
    "Maitama", "Asokoro", "Wuse 2", "Guzape", "Katampe Extension", "Jabi", "Utako", "Wuye", 
    "Life Camp", "Central Area", "Garki", "Area 1", "Area 2", "Area 3", "Area 7", "Area 8", 
    "Area 10", "Area 11", "Gwarinpa", "Karimo", "Jabi Lake", "Utako Market", "Federal Secretariat", "Eagle Square"
  ],
  "Bwari": [
    "Bwari Town", "Dutse", "Dei-Dei", "Kubwa", "Ushafa", "Congo", "Muko", "Dawaki", 
    "Bwari Market", "Dutse Alhaji", "Kubwa Extension", 
    "Kubwa Phase 1", "Kubwa Phase 2", "Kubwa Phase 3", "Ushafa Village", "Congo Town", 
    "Muko-Shupe", "Bwari Central", "Bwari Extension", "Dawaki Extension"
  ],
  "Gwagwalada": [
    "Gwagwalada Town", "Zuba", "Idu", "Giri", "Tunga Maje", "Lugbe", "Airport Road", 
    "Gwagwalada Extension", "Zuba Extension", "Idu Industrial", "Giri Village", 
    "Tunga Maje Extension", "Lugbe Phase 1", "Lugbe Phase 2", "Airport Road Extension", 
    "Gwagwalada Market", "Zuba Market", "Idu Village", "Giri Settlement", "Tunga Maje Village"
  ],
  "Kuje": [
    "Kuje Town", "Kuje Extension", "Centenary City", "Airport Road", "Lokogoma", 
    "Trademore", "Kuje Market", "Kuje GRA", "Kuje Extension 1", "Kuje Extension 2", 
    "Centenary City Phase 1", "Centenary City Phase 2", "Airport Road Extension", 
    "Lokogoma Extension", "Trademore Extension", "Kuje Industrial", "Kuje New Town"
  ],
  "Kwali": [
    "Kwali Town", "Kwali Extension", "Abaji Road", "Dobi", "Gwagwalada Road", 
    "Kwali Market", "Kwali GRA", "Kwali Extension 1", "Kwali Extension 2", 
    "Abaji Road Extension", "Dobi Village", "Gwagwalada Road Extension", 
    "Kwali New Town", "Kwali Industrial", "Kwali Settlement"
  ],
  "Abaji": [
    "Abaji Town", "Abaji Extension", "Pandagi", "Toto", "Abaji Market", "Abaji GRA", 
    "Abaji Extension 1", "Abaji Extension 2", "Pandagi Village", "Toto Road", 
    "Abaji New Town", "Abaji Industrial", "Abaji Settlement", "Pandagi Extension", 
    "Toto Extension", "Abaji Central", "Abaji North", "Abaji South"
  ]
};

export const bedroomOptions = [
  { value: "selfcontain", label: "Self Contain" },
  { value: 1, label: "1 Bedroom" },
  { value: 2, label: "2 Bedrooms" },
  { value: 3, label: "3 Bedrooms" },
  { value: 4, label: "4 Bedrooms" },
  { value: 5, label: "5 Bedrooms" },
  { value: 6, label: "6 Bedrooms" },
  { value: 7, label: "7 Bedrooms" },
  { value: 8, label: "8 Bedrooms" },
  { value: 9, label: "9 Bedrooms" },
  { value: 10, label: "10 Bedrooms" }
];

// ML Model Feature Engineering Configuration
export const mlModelConfig = {
  // Price Prediction Weights (2026 Market Dynamics)
  pricePredictionWeights: {
    location: 0.25,
    infrastructure_score: 0.20,
    title_verified: 0.15,
    developer_rating: 0.15,
    proximity_to_metro: 0.10,
    market_category: 0.10,
    construction_cost_index: 0.05
  },
  
  // Investment Analysis Risk Factors
  investmentRiskFactors: {
    title_type: { // Title verification impact on price
      'C_of_O': 1.0,      // Certificate of Occupancy - 40-55% premium
      'R_of_O': 0.5,      // Right of Occupancy - moderate risk
      'Local_Govt': 0.2    // Local Government papers - highest risk
    },
    developer_premium: {
      'Bilaad_Realty': 1.15,
      'Cosgrove': 1.12,
      'Everview_Properties': 1.08,
      'Urban_Shelter': 1.05,
      'Adron_Homes': 1.03,
      'Local_Developer': 1.0
    },
    infrastructure_lag: {
      announcement_phase: 1.10,  // 5-10% price jump
      completion_phase: 1.25    // 15-30% price jump
    }
  },
  
  // Market Yield Analysis
  yieldAnalysis: {
    high_yield_areas: ['Gwarinpa', 'Lugbe', 'Kubwa'], // 4.5-6.5% rental yields
    appreciation_areas: ['Maitama', 'Asokoro'], // High appreciation, lower yield (~3%)
    balanced_areas: ['Wuye', 'Jabi', 'Katampe'] // Good balance
  }
};

// Comprehensive Abuja Property Dataset (2026)
export const abujaPropertyData: PropertyData[] = [
  // AMAC - Premium Areas
  {
    location: "Maitama",
    lga: "AMAC",
    tier: "premium",
    market_category: "Prime (Luxury)",
    developer: "Bilaad Realty",
    title_verified: "C_of_O",
    infrastructure_score: 95,
    proximity_to_metro: 2,
    construction_cost_index: 1.2,
    data_source: "Africanvestor / NPC",
    rent_selfcontain: "2.5M-4M",
    rent_1bed: "3M-6M",
    rent_2bed: "6M-12M",
    rent_3bed: "22M-45M",
    rent_4bed: "28M-55M",
    rent_5bed: "35M-70M",
    rent_6bed: "42M-85M",
    rent_7bed: "49M-95M",
    rent_8bed: "56M-105M",
    rent_9bed: "63M-115M",
    rent_10bed: "70M-125M",
    land_100x100: "600M-1.5B",
    house_1bed: "180M-350M",
    house_2bed: "320M-650M",
    house_3bed: "950M-3.5B",
    house_4bed: "1.8B-4.2B",
    house_5bed: "2.5B-5.5B",
    house_6bed: "3.2B-6.8B",
    house_7bed: "3.9B-8.1B",
    house_8bed: "4.6B-9.4B",
    house_9bed: "5.3B-10.7B",
    house_10bed: "6B-12B"
  },
  {
    location: "Asokoro",
    lga: "AMAC",
    tier: "premium",
    market_category: "Prime (Luxury)",
    developer: "Everview Properties",
    title_verified: "C_of_O",
    infrastructure_score: 92,
    proximity_to_metro: 3,
    construction_cost_index: 1.15,
    data_source: "Africanvestor / Nigeria Housing",
    rent_selfcontain: "2.8M-4M",
    rent_1bed: "3.5M-7M",
    rent_2bed: "7M-14M",
    rent_3bed: "18M-35M",
    rent_4bed: "24M-45M",
    rent_5bed: "30M-55M",
    rent_6bed: "36M-65M",
    rent_7bed: "42M-75M",
    rent_8bed: "48M-85M",
    rent_9bed: "54M-95M",
    rent_10bed: "60M-105M",
    land_100x100: "400M-900M",
    house_1bed: "150M-300M",
    house_2bed: "280M-550M",
    house_3bed: "850M-2.5B",
    house_4bed: "1.6B-3.8B",
    house_5bed: "2.2B-5.1B",
    house_6bed: "2.8B-6.4B",
    house_7bed: "3.4B-7.7B",
    house_8bed: "4B-9B",
    house_9bed: "4.6B-10.3B",
    house_10bed: "5.2B-11.6B"
  },
  {
    location: "Wuse 2",
    lga: "AMAC",
    tier: "premium",
    market_category: "Prime (Commercial)",
    developer: "Urban Shelter",
    title_verified: "C_of_O",
    infrastructure_score: 88,
    proximity_to_metro: 1,
    construction_cost_index: 1.1,
    data_source: "PropertyPro / Jiji",
    rent_selfcontain: "2.2M-3.5M",
    rent_1bed: "2.8M-5M",
    rent_2bed: "5M-10M",
    rent_3bed: "15M-28M",
    rent_4bed: "20M-38M",
    rent_5bed: "25M-48M",
    rent_6bed: "30M-58M",
    rent_7bed: "35M-68M",
    rent_8bed: "40M-78M",
    rent_9bed: "45M-88M",
    rent_10bed: "50M-98M",
    land_100x100: "350M-850M",
    house_1bed: "120M-250M",
    house_2bed: "220M-450M",
    house_3bed: "550M-1.2B",
    house_4bed: "950M-2.1B",
    house_5bed: "1.3B-2.9B",
    house_6bed: "1.65B-3.7B",
    house_7bed: "2B-4.5B",
    house_8bed: "2.35B-5.3B",
    house_9bed: "2.7B-6.1B",
    house_10bed: "3.05B-6.9B"
  },
  // AMAC - Emerging Areas
  {
    location: "Guzape",
    lga: "AMAC",
    tier: "emerging",
    market_category: "Emerging (Premium)",
    developer: "Cosgrove",
    title_verified: "C_of_O",
    infrastructure_score: 78,
    proximity_to_metro: 5,
    construction_cost_index: 1.05,
    data_source: "VDP ROI Report 2026",
    rent_selfcontain: "1.8M-3M",
    rent_1bed: "2.2M-4.5M",
    rent_2bed: "4.5M-9M",
    rent_3bed: "12M-22M",
    rent_4bed: "16M-30M",
    rent_5bed: "20M-38M",
    rent_6bed: "24M-46M",
    rent_7bed: "28M-54M",
    rent_8bed: "32M-62M",
    rent_9bed: "36M-70M",
    rent_10bed: "40M-78M",
    land_100x100: "250M-550M",
    house_1bed: "80M-180M",
    house_2bed: "150M-320M",
    house_3bed: "420M-950M",
    house_4bed: "750M-1.6B",
    house_5bed: "1.05B-2.25B",
    house_6bed: "1.35B-2.9B",
    house_7bed: "1.65B-3.55B",
    house_8bed: "1.95B-4.2B",
    house_9bed: "2.25B-4.85B",
    house_10bed: "2.55B-5.5B"
  },
  {
    location: "Katampe Ext.",
    lga: "AMAC",
    tier: "emerging",
    market_category: "Emerging (Hot)",
    developer: "Cosgrove",
    title_verified: "C_of_O",
    infrastructure_score: 82,
    proximity_to_metro: 4,
    construction_cost_index: 1.08,
    data_source: "Africanvestor / NPC",
    rent_selfcontain: "1.6M-3M",
    rent_1bed: "2M-4M",
    rent_2bed: "4M-8M",
    rent_3bed: "11M-20M",
    rent_4bed: "15M-26M",
    rent_5bed: "19M-34M",
    rent_6bed: "23M-42M",
    rent_7bed: "27M-50M",
    rent_8bed: "31M-58M",
    rent_9bed: "35M-66M",
    rent_10bed: "39M-74M",
    land_100x100: "180M-350M",
    house_1bed: "70M-160M",
    house_2bed: "130M-280M",
    house_3bed: "560M-1.1B",
    house_4bed: "980M-1.95B",
    house_5bed: "1.4B-2.8B",
    house_6bed: "1.82B-3.65B",
    house_7bed: "2.24B-4.5B",
    house_8bed: "2.66B-5.35B",
    house_9bed: "3.08B-6.2B",
    house_10bed: "3.5B-7.05B"
  },
  {
    location: "Jabi / Utako",
    lga: "AMAC",
    tier: "mid",
    market_category: "Established Mid",
    developer: "Urban Shelter",
    title_verified: "R_of_O",
    infrastructure_score: 75,
    proximity_to_metro: 3,
    construction_cost_index: 1.0,
    data_source: "Nigeria Housing Market",
    rent_selfcontain: "1.4M-2.5M",
    rent_1bed: "1.8M-3.5M",
    rent_2bed: "3.5M-7M",
    rent_3bed: "9M-18M",
    rent_4bed: "12M-24M",
    rent_5bed: "15M-30M",
    rent_6bed: "18M-36M",
    rent_7bed: "21M-42M",
    rent_8bed: "24M-48M",
    rent_9bed: "27M-54M",
    rent_10bed: "30M-60M",
    land_100x100: "120M-300M",
    house_1bed: "60M-140M",
    house_2bed: "110M-240M",
    house_3bed: "320M-750M",
    house_4bed: "560M-1.3B",
    house_5bed: "800M-1.85B",
    house_6bed: "1.04B-2.4B",
    house_7bed: "1.28B-2.95B",
    house_8bed: "1.52B-3.5B",
    house_9bed: "1.76B-4.05B",
    house_10bed: "2B-4.6B"
  },
  // AMAC Area Council
  {
    location: "Gwarinpa",
    lga: "AMAC",
    tier: "mid",
    market_category: "Established Mid",
    developer: "Dantata Town Dev.",
    title_verified: "R_of_O",
    infrastructure_score: 72,
    proximity_to_metro: 6,
    construction_cost_index: 0.95,
    data_source: "Nigeria Housing Market",
    rent_selfcontain: "1.2M-2.2M",
    rent_1bed: "1.5M-3M",
    rent_2bed: "3M-6M",
    rent_3bed: "6M-13M",
    rent_4bed: "8M-18M",
    rent_5bed: "10M-23M",
    rent_6bed: "12M-28M",
    rent_7bed: "14M-33M",
    rent_8bed: "16M-38M",
    rent_9bed: "18M-43M",
    rent_10bed: "20M-48M",
    land_100x100: "75M-190M",
    house_1bed: "45M-110M",
    house_2bed: "85M-180M",
    house_3bed: "220M-550M",
    house_4bed: "380M-950M",
    house_5bed: "540M-1.32B",
    house_6bed: "700M-1.69B",
    house_7bed: "860M-2.06B",
    house_8bed: "1.02B-2.43B",
    house_9bed: "1.18B-2.8B",
    house_10bed: "1.34B-3.17B"
  },
  {
    location: "Kubwa",
    lga: "Bwari",
    tier: "outer",
    market_category: "Satellite Town",
    developer: "Adron Homes",
    title_verified: "Local_Govt",
    infrastructure_score: 65,
    proximity_to_metro: 8,
    construction_cost_index: 0.85,
    data_source: "Africanvestor / Jiji",
    rent_selfcontain: "800k-1.5M",
    rent_1bed: "1M-2M",
    rent_2bed: "2M-3.5M",
    rent_3bed: "2.8M-5.5M",
    rent_4bed: "3.8M-7M",
    rent_5bed: "4.8M-8.5M",
    rent_6bed: "5.8M-10M",
    rent_7bed: "6.8M-11.5M",
    rent_8bed: "7.8M-13M",
    rent_9bed: "8.8M-14.5M",
    rent_10bed: "9.8M-16M",
    land_100x100: "15M-55M",
    house_1bed: "12M-30M",
    house_2bed: "22M-50M",
    house_3bed: "70M-120M",
    house_4bed: "120M-210M",
    house_5bed: "170M-300M",
    house_6bed: "220M-390M",
    house_7bed: "270M-480M",
    house_8bed: "320M-570M",
    house_9bed: "370M-660M",
    house_10bed: "420M-750M"
  },
  // Kuje Area Council
  {
    location: "Kuje Town",
    lga: "Kuje",
    tier: "outer",
    market_category: "Emerging (Growth)",
    developer: "Ochacho Real Estate",
    title_verified: "Local_Govt",
    infrastructure_score: 58,
    proximity_to_metro: 12,
    construction_cost_index: 0.75,
    data_source: "El-dorado Homes 2026",
    rent_selfcontain: "600k-1.2M",
    rent_1bed: "800k-1.8M",
    rent_2bed: "1.8M-2.8M",
    rent_3bed: "1.8M-4.5M",
    rent_4bed: "2.5M-6M",
    rent_5bed: "3.2M-7.5M",
    rent_6bed: "3.9M-9M",
    rent_7bed: "4.6M-10.5M",
    rent_8bed: "5.3M-12M",
    rent_9bed: "6M-13.5M",
    rent_10bed: "6.7M-15M",
    land_100x100: "5M-25M",
    house_1bed: "4M-12M",
    house_2bed: "8M-22M",
    house_3bed: "55M-120M",
    house_4bed: "95M-200M",
    house_5bed: "135M-280M",
    house_6bed: "175M-360M",
    house_7bed: "215M-440M",
    house_8bed: "255M-520M",
    house_9bed: "295M-600M",
    house_10bed: "335M-680M"
  },
  // Gwagwalada Area Council
  {
    location: "Gwagwalada",
    lga: "Gwagwalada",
    tier: "outer",
    market_category: "Satellite Town",
    developer: "UPDC / Local",
    title_verified: "Local_Govt",
    infrastructure_score: 62,
    proximity_to_metro: 10,
    construction_cost_index: 0.8,
    data_source: "NPC / PropertyPro",
    rent_selfcontain: "700k-1.5M",
    rent_1bed: "900k-1.8M",
    rent_2bed: "1.8M-2.5M",
    rent_3bed: "1.3M-3M",
    rent_4bed: "1.8M-4M",
    rent_5bed: "2.3M-5M",
    rent_6bed: "2.8M-6M",
    rent_7bed: "3.3M-7M",
    rent_8bed: "3.8M-8M",
    rent_9bed: "4.3M-9M",
    rent_10bed: "4.8M-10M",
    land_100x100: "3M-20M",
    house_1bed: "3.5M-10M",
    house_2bed: "6.5M-18M",
    house_3bed: "45M-95M",
    house_4bed: "75M-150M",
    house_5bed: "105M-205M",
    house_6bed: "135M-260M",
    house_7bed: "165M-315M",
    house_8bed: "195M-370M",
    house_9bed: "225M-425M",
    house_10bed: "255M-480M"
  },
  // Kwali Area Council
  {
    location: "Kwali Town",
    lga: "Kwali",
    tier: "rural",
    market_category: "Frontier Market",
    developer: "Everview / Local",
    title_verified: "Local_Govt",
    infrastructure_score: 45,
    proximity_to_metro: 15,
    construction_cost_index: 0.65,
    data_source: "Jiji / Real Estate Nigeria",
    rent_selfcontain: "500k-1M",
    rent_1bed: "600k-1.2M",
    rent_2bed: "1.2M-1.8M",
    rent_3bed: "600k-1.5M",
    rent_4bed: "800k-2M",
    rent_5bed: "1M-2.5M",
    rent_6bed: "1.2M-3M",
    rent_7bed: "1.4M-3.5M",
    rent_8bed: "1.6M-4M",
    rent_9bed: "1.8M-4.5M",
    rent_10bed: "2M-5M",
    land_100x100: "1.2M-8M",
    house_1bed: "2M-6M",
    house_2bed: "4M-12M",
    house_3bed: "20M-45M",
    house_4bed: "35M-75M",
    house_5bed: "50M-105M",
    house_6bed: "65M-135M",
    house_7bed: "80M-165M",
    house_8bed: "95M-195M",
    house_9bed: "110M-225M",
    house_10bed: "125M-255M"
  },
  // Abaji Area Council
  {
    location: "Abaji Town",
    lga: "Abaji",
    tier: "rural",
    market_category: "Frontier Market",
    developer: "Local Developers",
    title_verified: "Local_Govt",
    infrastructure_score: 42,
    proximity_to_metro: 18,
    construction_cost_index: 0.6,
    data_source: "Africanvestor (Peripheral)",
    rent_selfcontain: "400k-800k",
    rent_1bed: "500k-1M",
    rent_2bed: "1M-1.5M",
    rent_3bed: "500k-1.2M",
    rent_4bed: "700k-1.6M",
    rent_5bed: "900k-2M",
    rent_6bed: "1.1M-2.4M",
    rent_7bed: "1.3M-2.8M",
    rent_8bed: "1.5M-3.2M",
    rent_9bed: "1.7M-3.6M",
    rent_10bed: "1.9M-4M",
    land_100x100: "1M-7M",
    house_1bed: "1.5M-5M",
    house_2bed: "3M-9M",
    house_3bed: "18M-42M",
    house_4bed: "30M-65M",
    house_5bed: "42M-88M",
    house_6bed: "54M-111M",
    house_7bed: "66M-134M",
    house_8bed: "78M-157M",
    house_9bed: "90M-180M",
    house_10bed: "102M-203M"
  },
  
  // Additional AMAC Sub-Areas
  {
    location: "Jabi",
    lga: "AMAC",
    tier: "prime",
    market_category: "Established (Commercial)",
    developer: "Urban Shelter",
    title_verified: "C_of_O",
    infrastructure_score: 85,
    proximity_to_metro: 3,
    construction_cost_index: 1.08,
    data_source: "PropertyPro / Jiji",
    rent_selfcontain: "1.8M-3M",
    rent_1bed: "2.2M-4.5M",
    rent_2bed: "4.5M-9M",
    rent_3bed: "12M-22M",
    rent_4bed: "16M-30M",
    rent_5bed: "20M-38M",
    rent_6bed: "24M-46M",
    rent_7bed: "28M-54M",
    rent_8bed: "32M-62M",
    rent_9bed: "36M-70M",
    rent_10bed: "40M-78M",
    land_100x100: "280M-650M",
    house_1bed: "95M-200M",
    house_2bed: "180M-380M",
    house_3bed: "450M-950M",
    house_4bed: "750M-1.8B",
    house_5bed: "1.1B-2.6B",
    house_6bed: "1.4B-3.4B",
    house_7bed: "1.7B-4.2B",
    house_8bed: "2B-5B",
    house_9bed: "2.3B-5.8B",
    house_10bed: "2.6B-6.6B"
  },
  {
    location: "Utako",
    lga: "AMAC",
    tier: "prime",
    market_category: "Established (Commercial)",
    developer: "Urban Shelter",
    title_verified: "C_of_O",
    infrastructure_score: 82,
    proximity_to_metro: 2,
    construction_cost_index: 1.06,
    data_source: "Private Property Nigeria",
    rent_selfcontain: "1.6M-2.8M",
    rent_1bed: "2M-4M",
    rent_2bed: "4M-8M",
    rent_3bed: "10M-20M",
    rent_4bed: "14M-28M",
    rent_5bed: "18M-36M",
    rent_6bed: "22M-44M",
    rent_7bed: "26M-52M",
    rent_8bed: "30M-60M",
    rent_9bed: "34M-68M",
    rent_10bed: "38M-76M",
    land_100x100: "250M-600M",
    house_1bed: "85M-180M",
    house_2bed: "160M-340M",
    house_3bed: "400M-850M",
    house_4bed: "680M-1.6B",
    house_5bed: "950M-2.3B",
    house_6bed: "1.2B-3B",
    house_7bed: "1.5B-3.7B",
    house_8bed: "1.8B-4.4B",
    house_9bed: "2.1B-5.1B",
    house_10bed: "2.4B-5.8B"
  },
  {
    location: "Wuye",
    lga: "AMAC",
    tier: "prime",
    market_category: "Established (Mixed)",
    developer: "Cosgrove",
    title_verified: "C_of_O",
    infrastructure_score: 80,
    proximity_to_metro: 4,
    construction_cost_index: 1.05,
    data_source: "Jiji / PropertyPro",
    rent_selfcontain: "1.5M-2.5M",
    rent_1bed: "1.8M-3.5M",
    rent_2bed: "3.5M-7M",
    rent_3bed: "9M-18M",
    rent_4bed: "12M-25M",
    rent_5bed: "15M-32M",
    rent_6bed: "18M-39M",
    rent_7bed: "21M-46M",
    rent_8bed: "24M-53M",
    rent_9bed: "27M-60M",
    rent_10bed: "30M-67M",
    land_100x100: "220M-550M",
    house_1bed: "75M-160M",
    house_2bed: "140M-300M",
    house_3bed: "350M-750M",
    house_4bed: "600M-1.4B",
    house_5bed: "850M-2B",
    house_6bed: "1.1B-2.6B",
    house_7bed: "1.35B-3.2B",
    house_8bed: "1.6B-3.8B",
    house_9bed: "1.85B-4.4B",
    house_10bed: "2.1B-5B"
  },
  {
    location: "Life Camp",
    lga: "AMAC",
    tier: "mid",
    market_category: "Established (Residential)",
    developer: "Local Developer",
    title_verified: "R_of_O",
    infrastructure_score: 75,
    proximity_to_metro: 6,
    construction_cost_index: 1.0,
    data_source: "Jiji",
    rent_selfcontain: "1.2M-2M",
    rent_1bed: "1.5M-3M",
    rent_2bed: "3M-6M",
    rent_3bed: "8M-15M",
    rent_4bed: "10M-20M",
    rent_5bed: "12M-25M",
    rent_6bed: "14M-30M",
    rent_7bed: "16M-35M",
    rent_8bed: "18M-40M",
    rent_9bed: "20M-45M",
    rent_10bed: "22M-50M",
    land_100x100: "180M-450M",
    house_1bed: "60M-130M",
    house_2bed: "110M-240M",
    house_3bed: "280M-600M",
    house_4bed: "480M-1.1B",
    house_5bed: "680M-1.5B",
    house_6bed: "880M-1.9B",
    house_7bed: "1.08B-2.3B",
    house_8bed: "1.28B-2.7B",
    house_9bed: "1.48B-3.1B",
    house_10bed: "1.68B-3.5B"
  },
  
  // Bwari Sub-Areas
  {
    location: "Bwari Town",
    lga: "Bwari",
    tier: "mid",
    market_category: "Established (Mixed)",
    developer: "Local Developer",
    title_verified: "R_of_O",
    infrastructure_score: 70,
    proximity_to_metro: 8,
    construction_cost_index: 0.95,
    data_source: "Jiji / Private Property",
    rent_selfcontain: "800K-1.5M",
    rent_1bed: "1M-2.5M",
    rent_2bed: "2.5M-5M",
    rent_3bed: "6M-12M",
    rent_4bed: "8M-16M",
    rent_5bed: "10M-20M",
    rent_6bed: "12M-24M",
    rent_7bed: "14M-28M",
    rent_8bed: "16M-32M",
    rent_9bed: "18M-36M",
    rent_10bed: "20M-40M",
    land_100x100: "120M-350M",
    house_1bed: "45M-100M",
    house_2bed: "85M-180M",
    house_3bed: "220M-480M",
    house_4bed: "380M-850M",
    house_5bed: "540M-1.2B",
    house_6bed: "700M-1.5B",
    house_7bed: "860M-1.8B",
    house_8bed: "1.02B-2.1B",
    house_9bed: "1.18B-2.4B",
    house_10bed: "1.34B-2.7B"
  },
  {
    location: "Dutse",
    lga: "Bwari",
    tier: "mid",
    market_category: "Established (Residential)",
    developer: "Local Developer",
    title_verified: "R_of_O",
    infrastructure_score: 68,
    proximity_to_metro: 9,
    construction_cost_index: 0.92,
    data_source: "Jiji",
    rent_selfcontain: "700K-1.2M",
    rent_1bed: "900K-2M",
    rent_2bed: "2M-4M",
    rent_3bed: "5M-10M",
    rent_4bed: "7M-14M",
    rent_5bed: "9M-18M",
    rent_6bed: "11M-22M",
    rent_7bed: "13M-26M",
    rent_8bed: "15M-30M",
    rent_9bed: "17M-34M",
    rent_10bed: "19M-38M",
    land_100x100: "100M-300M",
    house_1bed: "40M-90M",
    house_2bed: "75M-160M",
    house_3bed: "190M-420M",
    house_4bed: "330M-750M",
    house_5bed: "470M-1.05B",
    house_6bed: "610M-1.35B",
    house_7bed: "750M-1.65B",
    house_8bed: "890M-1.95B",
    house_9bed: "1.03B-2.25B",
    house_10bed: "1.17B-2.55B"
  },
  {
    location: "Dei-Dei",
    lga: "Bwari",
    tier: "emerging",
    market_category: "Emerging (Industrial)",
    developer: "Local Developer",
    title_verified: "Local_Govt",
    infrastructure_score: 55,
    proximity_to_metro: 12,
    construction_cost_index: 0.85,
    data_source: "Jiji",
    rent_selfcontain: "500K-900K",
    rent_1bed: "700K-1.5M",
    rent_2bed: "1.5M-3M",
    rent_3bed: "4M-8M",
    rent_4bed: "5M-11M",
    rent_5bed: "6M-14M",
    rent_6bed: "7M-17M",
    rent_7bed: "8M-20M",
    rent_8bed: "9M-23M",
    rent_9bed: "10M-26M",
    rent_10bed: "11M-29M",
    land_100x100: "80M-220M",
    house_1bed: "30M-70M",
    house_2bed: "55M-120M",
    house_3bed: "140M-320M",
    house_4bed: "240M-580M",
    house_5bed: "340M-840M",
    house_6bed: "440M-1.1B",
    house_7bed: "540M-1.36B",
    house_8bed: "640M-1.62B",
    house_9bed: "740M-1.88B",
    house_10bed: "840M-2.14B"
  },
  {
    location: "Kubwa",
    lga: "Bwari",
    tier: "emerging",
    market_category: "Emerging (Residential)",
    developer: "Adron Homes",
    title_verified: "R_of_O",
    infrastructure_score: 60,
    proximity_to_metro: 10,
    construction_cost_index: 0.88,
    data_source: "Jiji / PropertyPro",
    rent_selfcontain: "600K-1.1M",
    rent_1bed: "800K-1.8M",
    rent_2bed: "1.8M-3.5M",
    rent_3bed: "4.5M-9M",
    rent_4bed: "6M-12M",
    rent_5bed: "7.5M-15M",
    rent_6bed: "9M-18M",
    rent_7bed: "10.5M-21M",
    rent_8bed: "12M-24M",
    rent_9bed: "13.5M-27M",
    rent_10bed: "15M-30M",
    land_100x100: "90M-250M",
    house_1bed: "35M-80M",
    house_2bed: "65M-140M",
    house_3bed: "160M-360M",
    house_4bed: "280M-640M",
    house_5bed: "400M-900M",
    house_6bed: "520M-1.15B",
    house_7bed: "640M-1.4B",
    house_8bed: "760M-1.65B",
    house_9bed: "880M-1.9B",
    house_10bed: "1B-2.15B"
  },
  {
    location: "Ushafa",
    lga: "Bwari",
    tier: "outer",
    market_category: "Satellite Town",
    developer: "Local Developer",
    title_verified: "Local_Govt",
    infrastructure_score: 45,
    proximity_to_metro: 15,
    construction_cost_index: 0.8,
    data_source: "Jiji",
    rent_selfcontain: "400K-700K",
    rent_1bed: "500K-1M",
    rent_2bed: "1M-2M",
    rent_3bed: "2.5M-5M",
    rent_4bed: "3.5M-7M",
    rent_5bed: "4.5M-9M",
    rent_6bed: "5.5M-11M",
    rent_7bed: "6.5M-13M",
    rent_8bed: "7.5M-15M",
    rent_9bed: "8.5M-17M",
    rent_10bed: "9.5M-19M",
    land_100x100: "60M-180M",
    house_1bed: "25M-55M",
    house_2bed: "45M-95M",
    house_3bed: "110M-250M",
    house_4bed: "190M-440M",
    house_5bed: "270M-630M",
    house_6bed: "350M-820M",
    house_7bed: "430M-1.01B",
    house_8bed: "510M-1.2B",
    house_9bed: "590M-1.39B",
    house_10bed: "670M-1.58B"
  },
  {
    location: "Gwarinpa",
    lga: "AMAC",
    tier: "prime",
    market_category: "Established (Residential)",
    developer: "Urban Shelter",
    title_verified: "C_of_O",
    infrastructure_score: 78,
    proximity_to_metro: 7,
    construction_cost_index: 1.02,
    data_source: "PropertyPro / Jiji",
    rent_selfcontain: "1.2M-2.2M",
    rent_1bed: "1.5M-3.2M",
    rent_2bed: "3.2M-6.5M",
    rent_3bed: "8M-16M",
    rent_4bed: "11M-22M",
    rent_5bed: "14M-28M",
    rent_6bed: "17M-34M",
    rent_7bed: "20M-40M",
    rent_8bed: "23M-46M",
    rent_9bed: "26M-52M",
    rent_10bed: "29M-58M",
    land_100x100: "200M-500M",
    house_1bed: "55M-120M",
    house_2bed: "100M-220M",
    house_3bed: "260M-580M",
    house_4bed: "450M-1.05B",
    house_5bed: "640M-1.52B",
    house_6bed: "830M-1.99B",
    house_7bed: "1.02B-2.46B",
    house_8bed: "1.21B-2.93B",
    house_9bed: "1.4B-3.4B",
    house_10bed: "1.59B-3.87B"
  }
];

// ML Model Functions for Price Prediction and Analysis
export const mlModelFunctions = {
  // Price Prediction with Infrastructure Lag Feature
  predictPrice: (basePrice: number, features: any) => {
    const config = mlModelConfig.pricePredictionWeights;
    let adjustedPrice = basePrice;
    
    // Infrastructure Lag Adjustment
    if (features.road_status === 'completion') {
      adjustedPrice *= config.infrastructure_score * mlModelConfig.investmentRiskFactors.infrastructure_lag.completion_phase;
    } else if (features.road_status === 'announcement') {
      adjustedPrice *= config.infrastructure_score * mlModelConfig.investmentRiskFactors.infrastructure_lag.announcement_phase;
    }
    
    // Title Verification Premium
    const titleMultiplier = mlModelConfig.investmentRiskFactors.title_type[features.title_verified as keyof typeof mlModelConfig.investmentRiskFactors.title_type] || 1.0;
    adjustedPrice *= titleMultiplier;
    
    // Developer Premium
    const devMultiplier = mlModelConfig.investmentRiskFactors.developer_premium[features.developer as keyof typeof mlModelConfig.investmentRiskFactors.developer_premium] || 1.0;
    adjustedPrice *= devMultiplier;
    
    // Proximity to Metro
    adjustedPrice *= (1 + (features.proximity_to_metro * 0.02));
    
    return Math.round(adjustedPrice);
  },
  
  // Investment Yield Analysis
  calculateRentalYield: (rentalPrice: number, purchasePrice: number) => {
    return ((rentalPrice * 12) / purchasePrice) * 100; // Annual rental yield
  },
  
  // Risk Assessment
  assessRisk: (property: any) => {
    let riskScore = 50; // Base risk
    
    // Title Risk
    const titleRisk: Record<string, number> = {
      'C_of_O': 10,
      'R_of_O': 30,
      'Local_Govt': 60
    };
    riskScore += titleRisk[property.title_verified || 'Local_Govt'];
    
    // Infrastructure Risk
    riskScore += (100 - property.infrastructure_score) * 0.3;
    
    // Location Risk
    const locationRisk: Record<string, number> = {
      'premium': 5,
      'prime': 10,
      'mid': 20,
      'emerging': 35,
      'outer': 50,
      'rural': 65
    };
    riskScore += locationRisk[property.tier] || 35;
    
    return Math.max(0, Math.min(100, riskScore));
  },
  
  // Recommendation Scoring
  scoreRecommendation: (userPrefs: any, property: any) => {
    let score = 0;
    
    // Budget Match (30%)
    if (userPrefs.budget >= property.averagePrice) {
      score += 30;
    } else {
      score += (userPrefs.budget / property.averagePrice) * 30;
    }
    
    // Location Preference (25%)
    if (userPrefs.preferredLGAs.includes(property.lga)) {
      score += 25;
    }
    
    // Property Type Match (20%)
    if (userPrefs.propertyType === property.propertyType || userPrefs.propertyType === 'all') {
      score += 20;
    }
    
    // Investment Potential (15%)
    const rentalYield = ((property.rentalPrice || 0) * 12) / (property.purchasePrice || 1) * 100;
    if (rentalYield > 5) score += 15;
    else if (rentalYield > 3) score += 10;
    else score += 5;
    
    // Risk Assessment (10%)
    const risk = mlModelFunctions.assessRisk(property);
    score += (100 - risk) * 0.1;
    
    return Math.min(100, score);
  }
};
