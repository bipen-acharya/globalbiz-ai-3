import type { AustraliaSuburb } from '@/types'

type RawSuburbRecord = {
  suburb: string
  postcode: string
  city: string
  state: string
  metro_zone: string
  council: string
  lat: number
  lng: number
  population_band: AustraliaSuburb['population_band']
  business_density_band: AustraliaSuburb['business_density_band']
  aliases?: string[]
}

type LocationIntent = {
  id: string
  label: string
  description: string
  match: (suburb: AustraliaSuburb) => boolean
}

const RAW_SUBURBS: RawSuburbRecord[] = [
  { suburb: 'Adelaide CBD', postcode: '5000', city: 'Adelaide', state: 'South Australia', metro_zone: 'Adelaide CBD', council: 'City of Adelaide', lat: -34.9285, lng: 138.6007, population_band: 'high', business_density_band: 'high', aliases: ['adelaide city', 'cbd'] },
  { suburb: 'North Adelaide', postcode: '5006', city: 'Adelaide', state: 'South Australia', metro_zone: 'Adelaide CBD Surrounds', council: 'City of Adelaide', lat: -34.9075, lng: 138.5947, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Kent Town', postcode: '5067', city: 'Adelaide', state: 'South Australia', metro_zone: 'Adelaide CBD Surrounds', council: 'City of Norwood Payneham & St Peters', lat: -34.9192, lng: 138.619, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Goodwood', postcode: '5034', city: 'Adelaide', state: 'South Australia', metro_zone: 'Inner South', council: 'City of Unley', lat: -34.9517, lng: 138.5799, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Unley', postcode: '5061', city: 'Adelaide', state: 'South Australia', metro_zone: 'Inner South', council: 'City of Unley', lat: -34.95, lng: 138.5933, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Unley Park', postcode: '5061', city: 'Adelaide', state: 'South Australia', metro_zone: 'Inner South', council: 'City of Unley', lat: -34.9562, lng: 138.607, population_band: 'medium', business_density_band: 'low' },
  { suburb: 'Millswood', postcode: '5034', city: 'Adelaide', state: 'South Australia', metro_zone: 'Inner South', council: 'City of Unley', lat: -34.9542, lng: 138.5889, population_band: 'medium', business_density_band: 'low' },
  { suburb: 'Hyde Park', postcode: '5061', city: 'Adelaide', state: 'South Australia', metro_zone: 'Inner South', council: 'City of Unley', lat: -34.9527, lng: 138.6059, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Malvern', postcode: '5061', city: 'Adelaide', state: 'South Australia', metro_zone: 'Inner South', council: 'City of Unley', lat: -34.9598, lng: 138.6088, population_band: 'medium', business_density_band: 'low' },
  { suburb: 'Parkside', postcode: '5063', city: 'Adelaide', state: 'South Australia', metro_zone: 'Inner South East', council: 'City of Unley', lat: -34.9467, lng: 138.6148, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Norwood', postcode: '5067', city: 'Adelaide', state: 'South Australia', metro_zone: 'Inner East', council: 'City of Norwood Payneham & St Peters', lat: -34.9236, lng: 138.6339, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Stepney', postcode: '5069', city: 'Adelaide', state: 'South Australia', metro_zone: 'Inner East', council: 'City of Norwood Payneham & St Peters', lat: -34.9217, lng: 138.6297, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'St Peters', postcode: '5069', city: 'Adelaide', state: 'South Australia', metro_zone: 'Inner East', council: 'City of Norwood Payneham & St Peters', lat: -34.9048, lng: 138.6226, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Prospect', postcode: '5082', city: 'Adelaide', state: 'South Australia', metro_zone: 'Inner North', council: 'City of Prospect', lat: -34.8905, lng: 138.5991, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Sefton Park', postcode: '5083', city: 'Adelaide', state: 'South Australia', metro_zone: 'Inner North', council: 'City of Prospect', lat: -34.8749, lng: 138.6001, population_band: 'medium', business_density_band: 'low' },
  { suburb: 'Burnside', postcode: '5066', city: 'Adelaide', state: 'South Australia', metro_zone: 'Eastern Suburbs', council: 'City of Burnside', lat: -34.9387, lng: 138.6466, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Toorak Gardens', postcode: '5065', city: 'Adelaide', state: 'South Australia', metro_zone: 'Eastern Suburbs', council: 'City of Burnside', lat: -34.9345, lng: 138.6352, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Glenside', postcode: '5065', city: 'Adelaide', state: 'South Australia', metro_zone: 'Eastern Suburbs', council: 'City of Burnside', lat: -34.9375, lng: 138.6268, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Tusmore', postcode: '5065', city: 'Adelaide', state: 'South Australia', metro_zone: 'Eastern Suburbs', council: 'City of Burnside', lat: -34.9383, lng: 138.6503, population_band: 'medium', business_density_band: 'low' },
  { suburb: 'Marion', postcode: '5043', city: 'Adelaide', state: 'South Australia', metro_zone: 'South West', council: 'City of Marion', lat: -35.0049, lng: 138.5536, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Oaklands Park', postcode: '5046', city: 'Adelaide', state: 'South Australia', metro_zone: 'South West', council: 'City of Marion', lat: -35.0105, lng: 138.5444, population_band: 'medium', business_density_band: 'medium', aliases: ['oakland park', 'oaklands'] },
  { suburb: 'Warradale', postcode: '5046', city: 'Adelaide', state: 'South Australia', metro_zone: 'South West', council: 'City of Marion', lat: -35.0026, lng: 138.5354, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Mitchell Park', postcode: '5043', city: 'Adelaide', state: 'South Australia', metro_zone: 'South West', council: 'City of Marion', lat: -35.0078, lng: 138.5678, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Clovelly Park', postcode: '5042', city: 'Adelaide', state: 'South Australia', metro_zone: 'South West', council: 'City of Marion', lat: -35.0098, lng: 138.5698, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Bedford Park', postcode: '5042', city: 'Adelaide', state: 'South Australia', metro_zone: 'South', council: 'City of Mitcham', lat: -35.0229, lng: 138.5962, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Tonsley', postcode: '5042', city: 'Adelaide', state: 'South Australia', metro_zone: 'South', council: 'City of Marion', lat: -35.0068, lng: 138.5789, population_band: 'low', business_density_band: 'medium' },
  { suburb: 'Sturt', postcode: '5047', city: 'Adelaide', state: 'South Australia', metro_zone: 'South West', council: 'City of Marion', lat: -35.016, lng: 138.5545, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Plympton', postcode: '5038', city: 'Adelaide', state: 'South Australia', metro_zone: 'Inner South West', council: 'City of West Torrens', lat: -34.9542, lng: 138.5533, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Plympton Park', postcode: '5038', city: 'Adelaide', state: 'South Australia', metro_zone: 'Inner South West', council: 'City of Marion', lat: -34.9673, lng: 138.5531, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Edwardstown', postcode: '5039', city: 'Adelaide', state: 'South Australia', metro_zone: 'Inner South West', council: 'City of Marion', lat: -34.9796, lng: 138.569, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Ascot Park', postcode: '5043', city: 'Adelaide', state: 'South Australia', metro_zone: 'South West', council: 'City of Marion', lat: -34.9915, lng: 138.5611, population_band: 'medium', business_density_band: 'low' },
  { suburb: 'Morphettville', postcode: '5043', city: 'Adelaide', state: 'South Australia', metro_zone: 'South West', council: 'City of Marion', lat: -34.9836, lng: 138.5323, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Park Holme', postcode: '5043', city: 'Adelaide', state: 'South Australia', metro_zone: 'South West', council: 'City of Marion', lat: -34.9947, lng: 138.5627, population_band: 'medium', business_density_band: 'low' },
  { suburb: 'Brighton', postcode: '5048', city: 'Adelaide', state: 'South Australia', metro_zone: 'Southern Beaches', council: 'City of Holdfast Bay', lat: -35.0186, lng: 138.5236, population_band: 'high', business_density_band: 'medium' },
  { suburb: 'Hove', postcode: '5048', city: 'Adelaide', state: 'South Australia', metro_zone: 'Southern Beaches', council: 'City of Holdfast Bay', lat: -35.021, lng: 138.5215, population_band: 'medium', business_density_band: 'low' },
  { suburb: 'Seacliff', postcode: '5049', city: 'Adelaide', state: 'South Australia', metro_zone: 'Southern Beaches', council: 'City of Holdfast Bay', lat: -35.0343, lng: 138.5234, population_band: 'medium', business_density_band: 'low' },
  { suburb: 'Seacliff Park', postcode: '5049', city: 'Adelaide', state: 'South Australia', metro_zone: 'Southern Beaches', council: 'City of Holdfast Bay', lat: -35.0393, lng: 138.5294, population_band: 'medium', business_density_band: 'low' },
  { suburb: 'Marino', postcode: '5049', city: 'Adelaide', state: 'South Australia', metro_zone: 'Southern Beaches', council: 'City of Marion', lat: -35.0424, lng: 138.5135, population_band: 'medium', business_density_band: 'low' },
  { suburb: 'Glenelg', postcode: '5045', city: 'Adelaide', state: 'South Australia', metro_zone: 'Southern Beaches', council: 'City of Holdfast Bay', lat: -34.9817, lng: 138.5158, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Glenelg East', postcode: '5045', city: 'Adelaide', state: 'South Australia', metro_zone: 'Southern Beaches', council: 'City of Holdfast Bay', lat: -34.9802, lng: 138.5339, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Glenelg North', postcode: '5045', city: 'Adelaide', state: 'South Australia', metro_zone: 'Southern Beaches', council: 'City of Holdfast Bay', lat: -34.9655, lng: 138.5207, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Glenelg South', postcode: '5045', city: 'Adelaide', state: 'South Australia', metro_zone: 'Southern Beaches', council: 'City of Holdfast Bay', lat: -34.9898, lng: 138.5142, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Somerton Park', postcode: '5044', city: 'Adelaide', state: 'South Australia', metro_zone: 'Southern Beaches', council: 'City of Holdfast Bay', lat: -34.9971, lng: 138.5227, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Camden Park', postcode: '5038', city: 'Adelaide', state: 'South Australia', metro_zone: 'Inner South West', council: 'City of West Torrens', lat: -34.9683, lng: 138.5473, population_band: 'medium', business_density_band: 'low' },
  { suburb: 'West Lakes', postcode: '5021', city: 'Adelaide', state: 'South Australia', metro_zone: 'Western Lakes', council: 'City of Charles Sturt', lat: -34.8788, lng: 138.4892, population_band: 'high', business_density_band: 'medium' },
  { suburb: 'West Lakes Shore', postcode: '5020', city: 'Adelaide', state: 'South Australia', metro_zone: 'Western Lakes', council: 'City of Charles Sturt', lat: -34.8638, lng: 138.4841, population_band: 'medium', business_density_band: 'low' },
  { suburb: 'Henley Beach', postcode: '5022', city: 'Adelaide', state: 'South Australia', metro_zone: 'Western Beaches', council: 'City of Charles Sturt', lat: -34.9212, lng: 138.4947, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Henley Beach South', postcode: '5022', city: 'Adelaide', state: 'South Australia', metro_zone: 'Western Beaches', council: 'City of Charles Sturt', lat: -34.9315, lng: 138.4944, population_band: 'medium', business_density_band: 'low' },
  { suburb: 'Port Adelaide', postcode: '5015', city: 'Adelaide', state: 'South Australia', metro_zone: 'North West', council: 'City of Port Adelaide Enfield', lat: -34.8448, lng: 138.5073, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Semaphore', postcode: '5019', city: 'Adelaide', state: 'South Australia', metro_zone: 'North West', council: 'City of Port Adelaide Enfield', lat: -34.8395, lng: 138.4847, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Semaphore South', postcode: '5019', city: 'Adelaide', state: 'South Australia', metro_zone: 'North West', council: 'City of Charles Sturt', lat: -34.8508, lng: 138.4846, population_band: 'medium', business_density_band: 'low' },
  { suburb: 'Salisbury', postcode: '5108', city: 'Adelaide', state: 'South Australia', metro_zone: 'Northern Adelaide', council: 'City of Salisbury', lat: -34.7612, lng: 138.6467, population_band: 'high', business_density_band: 'medium' },
  { suburb: 'Mawson Lakes', postcode: '5095', city: 'Adelaide', state: 'South Australia', metro_zone: 'Northern Adelaide', council: 'City of Salisbury', lat: -34.8143, lng: 138.6118, population_band: 'high', business_density_band: 'medium' },
  { suburb: 'Parafield Gardens', postcode: '5107', city: 'Adelaide', state: 'South Australia', metro_zone: 'Northern Adelaide', council: 'City of Salisbury', lat: -34.7817, lng: 138.6104, population_band: 'high', business_density_band: 'medium' },
  { suburb: 'Golden Grove', postcode: '5125', city: 'Adelaide', state: 'South Australia', metro_zone: 'North East', council: 'City of Tea Tree Gully', lat: -34.7828, lng: 138.73, population_band: 'high', business_density_band: 'medium' },
  { suburb: 'Tea Tree Gully', postcode: '5091', city: 'Adelaide', state: 'South Australia', metro_zone: 'North East', council: 'City of Tea Tree Gully', lat: -34.8268, lng: 138.7282, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Modbury', postcode: '5092', city: 'Adelaide', state: 'South Australia', metro_zone: 'North East', council: 'City of Tea Tree Gully', lat: -34.8332, lng: 138.6846, population_band: 'high', business_density_band: 'medium' },
  { suburb: 'Oakden', postcode: '5086', city: 'Adelaide', state: 'South Australia', metro_zone: 'North East', council: 'City of Port Adelaide Enfield', lat: -34.8574, lng: 138.6486, population_band: 'medium', business_density_band: 'low' },
  { suburb: 'Blackwood', postcode: '5051', city: 'Adelaide', state: 'South Australia', metro_zone: 'Adelaide Hills Fringe', council: 'City of Mitcham', lat: -35.0215, lng: 138.6143, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Belair', postcode: '5052', city: 'Adelaide', state: 'South Australia', metro_zone: 'Adelaide Hills Fringe', council: 'City of Mitcham', lat: -35.0161, lng: 138.6278, population_band: 'medium', business_density_band: 'low' },
  { suburb: 'Pasadena', postcode: '5042', city: 'Adelaide', state: 'South Australia', metro_zone: 'South', council: 'City of Mitcham', lat: -35.0173, lng: 138.5904, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Daw Park', postcode: '5041', city: 'Adelaide', state: 'South Australia', metro_zone: 'South', council: 'City of Mitcham', lat: -34.9986, lng: 138.5805, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Melrose Park', postcode: '5039', city: 'Adelaide', state: 'South Australia', metro_zone: 'South', council: 'City of Mitcham', lat: -34.9882, lng: 138.5752, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Morphett Vale', postcode: '5162', city: 'Adelaide', state: 'South Australia', metro_zone: 'Southern Adelaide', council: 'City of Onkaparinga', lat: -35.1331, lng: 138.5235, population_band: 'high', business_density_band: 'medium' },
  { suburb: 'Old Reynella', postcode: '5161', city: 'Adelaide', state: 'South Australia', metro_zone: 'Southern Adelaide', council: 'City of Onkaparinga', lat: -35.1058, lng: 138.5304, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Noarlunga Centre', postcode: '5168', city: 'Adelaide', state: 'South Australia', metro_zone: 'Southern Adelaide', council: 'City of Onkaparinga', lat: -35.1463, lng: 138.4986, population_band: 'high', business_density_band: 'medium' },
  { suburb: 'Hallett Cove', postcode: '5158', city: 'Adelaide', state: 'South Australia', metro_zone: 'Southern Adelaide', council: 'City of Marion', lat: -35.0764, lng: 138.5141, population_band: 'high', business_density_band: 'medium' },
  { suburb: 'Mount Barker', postcode: '5251', city: 'Mount Barker', state: 'South Australia', metro_zone: 'Adelaide Hills', council: 'District Council of Mount Barker', lat: -35.0667, lng: 138.8667, population_band: 'high', business_density_band: 'medium' },

  { suburb: 'Sydney CBD', postcode: '2000', city: 'Sydney', state: 'New South Wales', metro_zone: 'Sydney CBD', council: 'City of Sydney', lat: -33.8688, lng: 151.2093, population_band: 'high', business_density_band: 'high', aliases: ['sydney city', 'cbd'] },
  { suburb: 'Surry Hills', postcode: '2010', city: 'Sydney', state: 'New South Wales', metro_zone: 'Inner East', council: 'City of Sydney', lat: -33.8862, lng: 151.2113, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Newtown', postcode: '2042', city: 'Sydney', state: 'New South Wales', metro_zone: 'Inner West', council: 'Inner West Council', lat: -33.8981, lng: 151.1794, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Parramatta', postcode: '2150', city: 'Parramatta', state: 'New South Wales', metro_zone: 'Western Sydney', council: 'City of Parramatta', lat: -33.815, lng: 151.0011, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Chatswood', postcode: '2067', city: 'Chatswood', state: 'New South Wales', metro_zone: 'North Shore', council: 'Willoughby City Council', lat: -33.796, lng: 151.1817, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Bondi Junction', postcode: '2022', city: 'Sydney', state: 'New South Wales', metro_zone: 'Eastern Suburbs', council: 'Waverley Council', lat: -33.8928, lng: 151.2475, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Bondi', postcode: '2026', city: 'Sydney', state: 'New South Wales', metro_zone: 'Eastern Suburbs', council: 'Waverley Council', lat: -33.8914, lng: 151.2747, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Marrickville', postcode: '2204', city: 'Sydney', state: 'New South Wales', metro_zone: 'Inner West', council: 'Inner West Council', lat: -33.9112, lng: 151.1575, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Leichhardt', postcode: '2040', city: 'Sydney', state: 'New South Wales', metro_zone: 'Inner West', council: 'Inner West Council', lat: -33.8831, lng: 151.1578, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Burwood', postcode: '2134', city: 'Sydney', state: 'New South Wales', metro_zone: 'Inner West', council: 'Burwood Council', lat: -33.8778, lng: 151.1038, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Bankstown', postcode: '2200', city: 'Sydney', state: 'New South Wales', metro_zone: 'South West Sydney', council: 'City of Canterbury-Bankstown', lat: -33.9172, lng: 151.0333, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Liverpool', postcode: '2170', city: 'Liverpool', state: 'New South Wales', metro_zone: 'South West Sydney', council: 'Liverpool City Council', lat: -33.92, lng: 150.923, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Blacktown', postcode: '2148', city: 'Blacktown', state: 'New South Wales', metro_zone: 'Western Sydney', council: 'Blacktown City Council', lat: -33.7667, lng: 150.9053, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Castle Hill', postcode: '2154', city: 'Sydney', state: 'New South Wales', metro_zone: 'North West Sydney', council: 'The Hills Shire Council', lat: -33.7311, lng: 151.0058, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Crows Nest', postcode: '2065', city: 'Sydney', state: 'New South Wales', metro_zone: 'North Shore', council: 'North Sydney Council', lat: -33.8266, lng: 151.2046, population_band: 'medium', business_density_band: 'high' },
  { suburb: 'Manly', postcode: '2095', city: 'Manly', state: 'New South Wales', metro_zone: 'Northern Beaches', council: 'Northern Beaches Council', lat: -33.7975, lng: 151.2853, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Cronulla', postcode: '2230', city: 'Sydney', state: 'New South Wales', metro_zone: 'Sutherland Shire', council: 'Sutherland Shire Council', lat: -34.0537, lng: 151.1537, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Ryde', postcode: '2112', city: 'Sydney', state: 'New South Wales', metro_zone: 'Northern Sydney', council: 'City of Ryde', lat: -33.8159, lng: 151.1055, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Penrith', postcode: '2750', city: 'Penrith', state: 'New South Wales', metro_zone: 'Western Sydney', council: 'Penrith City Council', lat: -33.751, lng: 150.6942, population_band: 'high', business_density_band: 'medium' },

  { suburb: 'Melbourne CBD', postcode: '3000', city: 'Melbourne', state: 'Victoria', metro_zone: 'Melbourne CBD', council: 'City of Melbourne', lat: -37.8136, lng: 144.9631, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Southbank', postcode: '3006', city: 'Melbourne', state: 'Victoria', metro_zone: 'Inner South', council: 'City of Melbourne', lat: -37.8219, lng: 144.9646, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Carlton', postcode: '3053', city: 'Melbourne', state: 'Victoria', metro_zone: 'Inner North', council: 'City of Melbourne', lat: -37.7963, lng: 144.9681, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Fitzroy', postcode: '3065', city: 'Melbourne', state: 'Victoria', metro_zone: 'Inner North', council: 'City of Yarra', lat: -37.7996, lng: 144.9786, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Collingwood', postcode: '3066', city: 'Melbourne', state: 'Victoria', metro_zone: 'Inner North', council: 'City of Yarra', lat: -37.8024, lng: 144.9888, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Richmond', postcode: '3121', city: 'Melbourne', state: 'Victoria', metro_zone: 'Inner East', council: 'City of Yarra', lat: -37.8182, lng: 144.9987, population_band: 'high', business_density_band: 'high' },
  { suburb: 'St Kilda', postcode: '3182', city: 'Melbourne', state: 'Victoria', metro_zone: 'Bayside South', council: 'City of Port Phillip', lat: -37.8678, lng: 144.9808, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Prahran', postcode: '3181', city: 'Melbourne', state: 'Victoria', metro_zone: 'Inner South', council: 'City of Stonnington', lat: -37.8519, lng: 144.9917, population_band: 'high', business_density_band: 'high' },
  { suburb: 'South Yarra', postcode: '3141', city: 'Melbourne', state: 'Victoria', metro_zone: 'Inner South', council: 'City of Stonnington', lat: -37.8403, lng: 144.9892, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Brunswick', postcode: '3056', city: 'Melbourne', state: 'Victoria', metro_zone: 'Inner North', council: 'Merri-bek City Council', lat: -37.7695, lng: 144.9597, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Footscray', postcode: '3011', city: 'Melbourne', state: 'Victoria', metro_zone: 'Inner West', council: 'City of Maribyrnong', lat: -37.8002, lng: 144.8988, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Moonee Ponds', postcode: '3039', city: 'Melbourne', state: 'Victoria', metro_zone: 'Inner North West', council: 'City of Moonee Valley', lat: -37.7661, lng: 144.919, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Box Hill', postcode: '3128', city: 'Box Hill', state: 'Victoria', metro_zone: 'Eastern Suburbs', council: 'City of Whitehorse', lat: -37.8198, lng: 145.1233, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Camberwell', postcode: '3124', city: 'Melbourne', state: 'Victoria', metro_zone: 'Eastern Suburbs', council: 'City of Boroondara', lat: -37.8373, lng: 145.0597, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Glen Waverley', postcode: '3150', city: 'Melbourne', state: 'Victoria', metro_zone: 'South East', council: 'City of Monash', lat: -37.8794, lng: 145.1633, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Dandenong', postcode: '3175', city: 'Dandenong', state: 'Victoria', metro_zone: 'South East', council: 'City of Greater Dandenong', lat: -37.9877, lng: 145.2152, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Preston', postcode: '3072', city: 'Melbourne', state: 'Victoria', metro_zone: 'North East', council: 'City of Darebin', lat: -37.7387, lng: 145.0002, population_band: 'high', business_density_band: 'high' },

  { suburb: 'Brisbane CBD', postcode: '4000', city: 'Brisbane', state: 'Queensland', metro_zone: 'Brisbane CBD', council: 'Brisbane City Council', lat: -27.4698, lng: 153.0251, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Fortitude Valley', postcode: '4006', city: 'Brisbane', state: 'Queensland', metro_zone: 'Inner North', council: 'Brisbane City Council', lat: -27.4562, lng: 153.0379, population_band: 'high', business_density_band: 'high' },
  { suburb: 'South Brisbane', postcode: '4101', city: 'Brisbane', state: 'Queensland', metro_zone: 'Inner South', council: 'Brisbane City Council', lat: -27.4804, lng: 153.0193, population_band: 'high', business_density_band: 'high' },
  { suburb: 'West End', postcode: '4101', city: 'Brisbane', state: 'Queensland', metro_zone: 'Inner South', council: 'Brisbane City Council', lat: -27.4858, lng: 153.0104, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Paddington', postcode: '4064', city: 'Brisbane', state: 'Queensland', metro_zone: 'Inner West', council: 'Brisbane City Council', lat: -27.4614, lng: 152.9992, population_band: 'medium', business_density_band: 'high' },
  { suburb: 'New Farm', postcode: '4005', city: 'Brisbane', state: 'Queensland', metro_zone: 'Inner East', council: 'Brisbane City Council', lat: -27.4685, lng: 153.0503, population_band: 'medium', business_density_band: 'high' },
  { suburb: 'Woolloongabba', postcode: '4102', city: 'Brisbane', state: 'Queensland', metro_zone: 'Inner South', council: 'Brisbane City Council', lat: -27.4958, lng: 153.0344, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Chermside', postcode: '4032', city: 'Brisbane', state: 'Queensland', metro_zone: 'Northern Brisbane', council: 'Brisbane City Council', lat: -27.3858, lng: 153.0336, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Indooroopilly', postcode: '4068', city: 'Brisbane', state: 'Queensland', metro_zone: 'Inner West', council: 'Brisbane City Council', lat: -27.5035, lng: 152.9758, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Sunnybank', postcode: '4109', city: 'Brisbane', state: 'Queensland', metro_zone: 'South Brisbane', council: 'Brisbane City Council', lat: -27.5801, lng: 153.057, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Nundah', postcode: '4012', city: 'Brisbane', state: 'Queensland', metro_zone: 'Northern Brisbane', council: 'Brisbane City Council', lat: -27.3986, lng: 153.0603, population_band: 'high', business_density_band: 'medium' },

  { suburb: 'Perth CBD', postcode: '6000', city: 'Perth', state: 'Western Australia', metro_zone: 'Perth CBD', council: 'City of Perth', lat: -31.9505, lng: 115.8605, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Northbridge', postcode: '6003', city: 'Perth', state: 'Western Australia', metro_zone: 'Inner North', council: 'City of Perth', lat: -31.9452, lng: 115.8544, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Subiaco', postcode: '6008', city: 'Perth', state: 'Western Australia', metro_zone: 'Inner West', council: 'City of Subiaco', lat: -31.9481, lng: 115.8269, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Leederville', postcode: '6007', city: 'Perth', state: 'Western Australia', metro_zone: 'Inner North', council: 'City of Vincent', lat: -31.9349, lng: 115.8376, population_band: 'medium', business_density_band: 'high' },
  { suburb: 'Fremantle', postcode: '6160', city: 'Fremantle', state: 'Western Australia', metro_zone: 'South West Perth', council: 'City of Fremantle', lat: -32.0569, lng: 115.7439, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Scarborough', postcode: '6019', city: 'Perth', state: 'Western Australia', metro_zone: 'Northern Beaches', council: 'City of Stirling', lat: -31.8951, lng: 115.7583, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Cottesloe', postcode: '6011', city: 'Perth', state: 'Western Australia', metro_zone: 'Western Beaches', council: 'Town of Cottesloe', lat: -31.9946, lng: 115.7567, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Victoria Park', postcode: '6100', city: 'Perth', state: 'Western Australia', metro_zone: 'Inner South East', council: 'Town of Victoria Park', lat: -31.9765, lng: 115.9059, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Morley', postcode: '6062', city: 'Perth', state: 'Western Australia', metro_zone: 'North East Perth', council: 'City of Bayswater', lat: -31.8874, lng: 115.8958, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Joondalup', postcode: '6027', city: 'Joondalup', state: 'Western Australia', metro_zone: 'Northern Corridor', council: 'City of Joondalup', lat: -31.7444, lng: 115.7697, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Rockingham', postcode: '6168', city: 'Rockingham', state: 'Western Australia', metro_zone: 'Southern Corridor', council: 'City of Rockingham', lat: -32.2779, lng: 115.7286, population_band: 'high', business_density_band: 'medium' },

  { suburb: 'Canberra CBD', postcode: '2601', city: 'Canberra', state: 'Australian Capital Territory', metro_zone: 'Canberra Central', council: 'ACT Government', lat: -35.2809, lng: 149.13, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Braddon', postcode: '2612', city: 'Canberra', state: 'Australian Capital Territory', metro_zone: 'Canberra Central', council: 'ACT Government', lat: -35.2733, lng: 149.1388, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Belconnen', postcode: '2617', city: 'Canberra', state: 'Australian Capital Territory', metro_zone: 'Belconnen', council: 'ACT Government', lat: -35.2361, lng: 149.0661, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Woden', postcode: '2606', city: 'Canberra', state: 'Australian Capital Territory', metro_zone: 'Woden Valley', council: 'ACT Government', lat: -35.3469, lng: 149.0844, population_band: 'high', business_density_band: 'high' },

  { suburb: 'Hobart CBD', postcode: '7000', city: 'Hobart', state: 'Tasmania', metro_zone: 'Hobart CBD', council: 'City of Hobart', lat: -42.8821, lng: 147.3272, population_band: 'high', business_density_band: 'high' },
  { suburb: 'North Hobart', postcode: '7000', city: 'Hobart', state: 'Tasmania', metro_zone: 'Inner Hobart', council: 'City of Hobart', lat: -42.8735, lng: 147.3188, population_band: 'medium', business_density_band: 'high' },
  { suburb: 'Sandy Bay', postcode: '7005', city: 'Hobart', state: 'Tasmania', metro_zone: 'Inner Hobart', council: 'City of Hobart', lat: -42.9003, lng: 147.3384, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Battery Point', postcode: '7004', city: 'Hobart', state: 'Tasmania', metro_zone: 'Inner Hobart', council: 'City of Hobart', lat: -42.8882, lng: 147.3318, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Launceston', postcode: '7250', city: 'Launceston', state: 'Tasmania', metro_zone: 'Launceston Region', council: 'City of Launceston', lat: -41.4332, lng: 147.1441, population_band: 'high', business_density_band: 'high' },

  { suburb: 'Darwin CBD', postcode: '0800', city: 'Darwin', state: 'Northern Territory', metro_zone: 'Darwin CBD', council: 'City of Darwin', lat: -12.4634, lng: 130.8456, population_band: 'high', business_density_band: 'high' },
  { suburb: 'Parap', postcode: '0820', city: 'Darwin', state: 'Northern Territory', metro_zone: 'Inner Darwin', council: 'City of Darwin', lat: -12.431, lng: 130.842, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Nightcliff', postcode: '0810', city: 'Darwin', state: 'Northern Territory', metro_zone: 'Northern Suburbs', council: 'City of Darwin', lat: -12.3872, lng: 130.8518, population_band: 'medium', business_density_band: 'medium' },
  { suburb: 'Alice Springs', postcode: '0870', city: 'Alice Springs', state: 'Northern Territory', metro_zone: 'Alice Springs', council: 'Alice Springs Town Council', lat: -23.698, lng: 133.8807, population_band: 'high', business_density_band: 'medium' },
]

const COMMUNITY_HINTS: Record<string, string> = {
  'Adelaide CBD': 'Commuter + office demand',
  'Adelaide CBD Surrounds': 'Mixed professionals and inner-city residents',
  'Inner South': 'Premium locals and repeat service demand',
  'Inner East': 'Affluent locals with steady discretionary spend',
  'South West': 'Family-heavy area',
  'Southern Beaches': 'Lifestyle, family, and commuter demand',
  'Western Beaches': 'Beachside residential demand',
  'North West': 'Mixed residential and destination demand',
  'Northern Adelaide': 'Family-heavy growth corridor',
  'North East': 'Family-heavy suburb',
  'Adelaide Hills Fringe': 'Premium spending area',
  'Southern Adelaide': 'Family-heavy commuter belt',
  'Sydney CBD': 'High foot traffic',
  'Inner West': 'Creative, student, and local repeat demand',
  'Eastern Suburbs': 'Premium spending area',
  'North Shore': 'High-income household demand',
  'Western Sydney': 'Family and value-focused demand',
  'South West Sydney': 'Family-heavy and multicultural demand',
  'Melbourne CBD': 'High foot traffic',
  'Inner North': 'Student-heavy suburb',
  'Brisbane CBD': 'High foot traffic',
  'South Brisbane': 'Family and multicultural demand',
  'Perth CBD': 'High foot traffic',
  'Northern Beaches': 'Lifestyle and family demand',
  'Canberra Central': 'Office workers and professionals',
  'Inner Hobart': 'Tourist and local lifestyle demand',
  'Darwin CBD': 'Commuter and visitor demand',
}

const STATE_POPULAR_NAMES: Record<string, string[]> = {
  'South Australia': ['Adelaide CBD', 'Glenelg', 'Oaklands Park', 'Marion', 'Prospect', 'Norwood', 'Mawson Lakes'],
  'New South Wales': ['Sydney CBD', 'Parramatta', 'Chatswood', 'Newtown', 'Bondi Junction', 'Marrickville', 'Burwood'],
  'Victoria': ['Melbourne CBD', 'South Yarra', 'Richmond', 'Brunswick', 'Box Hill', 'Glen Waverley', 'Footscray'],
  'Queensland': ['Brisbane CBD', 'Fortitude Valley', 'South Brisbane', 'Sunnybank', 'Chermside', 'Indooroopilly'],
  'Western Australia': ['Perth CBD', 'Subiaco', 'Fremantle', 'Scarborough', 'Victoria Park', 'Joondalup'],
  'Australian Capital Territory': ['Canberra CBD', 'Braddon', 'Belconnen', 'Woden'],
  'Tasmania': ['Hobart CBD', 'North Hobart', 'Sandy Bay', 'Launceston'],
  'Northern Territory': ['Darwin CBD', 'Parap', 'Nightcliff', 'Alice Springs'],
}

export const AU_STATES = [
  'New South Wales',
  'Victoria',
  'Queensland',
  'South Australia',
  'Western Australia',
  'Tasmania',
  'Australian Capital Territory',
  'Northern Territory',
]

export const ALL_SUBURBS: AustraliaSuburb[] = RAW_SUBURBS.map(({ aliases: _aliases, ...suburb }) => suburb)

export const LOCATION_INTENT_SUGGESTIONS: LocationIntent[] = [
  {
    id: 'high_foot_traffic',
    label: 'High foot traffic',
    description: 'CBDs, busy strips, and destination precincts.',
    match: suburb => suburb.business_density_band === 'high' && /CBD|Inner|Central|Beach/i.test(suburb.metro_zone),
  },
  {
    id: 'lower_competition',
    label: 'Lower competition',
    description: 'A gentler local competitor field.',
    match: suburb => suburb.business_density_band === 'low',
  },
  {
    id: 'family_heavy',
    label: 'Family-heavy suburb',
    description: 'Residential demand and repeat local spend.',
    match: suburb => /family|growth corridor|residential/i.test(getCommunityHint(suburb)),
  },
  {
    id: 'student_heavy',
    label: 'Student-heavy suburb',
    description: 'Youthful and value-sensitive demand.',
    match: suburb => /student|creative/i.test(getCommunityHint(suburb)),
  },
  {
    id: 'premium_spending',
    label: 'Premium spending area',
    description: 'Higher-income households and premium positioning.',
    match: suburb => /premium|high-income/i.test(getCommunityHint(suburb)),
  },
]

export const RECOMMENDED_SUBURBS_BY_STATE: Record<string, AustraliaSuburb[]> = Object.fromEntries(
  AU_STATES.map(state => [
    state,
    (STATE_POPULAR_NAMES[state] ?? [])
      .map(name => ALL_SUBURBS.find(suburb => suburb.state === state && suburb.suburb === name))
      .filter((suburb): suburb is AustraliaSuburb => Boolean(suburb)),
  ])
)

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function typoFriendlyVariants(value: string): string[] {
  const base = normalize(value)
  return [base, base.replace(/lands/g, 'land'), base.replace(/ park/g, ''), base.replace(/s\b/g, '')].filter(Boolean)
}

function rawForSuburb(suburb: AustraliaSuburb): RawSuburbRecord | undefined {
  return RAW_SUBURBS.find(item => item.suburb === suburb.suburb && item.postcode === suburb.postcode && item.state === suburb.state)
}

function searchText(suburb: AustraliaSuburb): string {
  const raw = rawForSuburb(suburb)
  return normalize([
    suburb.suburb,
    suburb.postcode,
    suburb.council,
    suburb.metro_zone,
    suburb.city,
    ...(raw?.aliases ?? []),
  ].join(' '))
}

export function suburbDisplayLabel(suburb: AustraliaSuburb): string {
  return `${suburb.suburb} • ${suburb.postcode} • ${suburb.council}`
}

export function getCommunityHint(suburb: AustraliaSuburb): string {
  return COMMUNITY_HINTS[suburb.metro_zone] ?? (suburb.population_band === 'high' ? 'Strong local demand' : 'Steady residential demand')
}

export function getDemandHint(suburb: AustraliaSuburb): string {
  if (suburb.business_density_band === 'high') return 'High competition'
  if (suburb.business_density_band === 'medium') return 'Medium competition'
  return 'Lower competition'
}

export function getSuburbsByState(state: string): AustraliaSuburb[] {
  return ALL_SUBURBS.filter(suburb => suburb.state === state).sort((a, b) => a.suburb.localeCompare(b.suburb))
}

export function findSuburb(state: string, suburb: string): AustraliaSuburb | null {
  const query = normalize(suburb)
  return getSuburbsByState(state).find(item => {
    const haystack = searchText(item)
    return haystack === query || normalize(`${item.suburb} ${item.postcode}`) === query || normalize(suburbDisplayLabel(item)) === query
  }) ?? null
}

export function findSuburbByFlexibleQuery(state: string, query: string): AustraliaSuburb | null {
  const normalized = normalize(query)
  if (!normalized) return null
  const variants = typoFriendlyVariants(query)
  return getSuburbsByState(state).find(item => variants.some(variant => searchText(item).includes(variant))) ?? null
}

export function getPopularSuburbSuggestions(state: string): AustraliaSuburb[] {
  return RECOMMENDED_SUBURBS_BY_STATE[state] ?? []
}

export function getLocationIntentResults(state: string, intentId: string): AustraliaSuburb[] {
  const intent = LOCATION_INTENT_SUGGESTIONS.find(item => item.id === intentId)
  if (!intent) return getPopularSuburbSuggestions(state)
  return getSuburbsByState(state).filter(intent.match).slice(0, 10)
}

export function searchSuburbs(state: string, query: string): AustraliaSuburb[] {
  const normalized = normalize(query)
  const stateSuburbs = getSuburbsByState(state)
  if (!normalized) return getPopularSuburbSuggestions(state).length ? getPopularSuburbSuggestions(state) : stateSuburbs.slice(0, 12)

  const variants = typoFriendlyVariants(query)
  return stateSuburbs
    .filter(suburb => variants.some(variant => searchText(suburb).includes(variant)))
    .sort((a, b) => {
      const aText = searchText(a)
      const bText = searchText(b)
      const aStarts = variants.some(variant => aText.startsWith(variant) || normalize(a.suburb).startsWith(variant) || a.postcode.startsWith(variant))
      const bStarts = variants.some(variant => bText.startsWith(variant) || normalize(b.suburb).startsWith(variant) || b.postcode.startsWith(variant))
      if (aStarts && !bStarts) return -1
      if (bStarts && !aStarts) return 1
      const densityRank = { high: 0, medium: 1, low: 2 }
      if (densityRank[a.business_density_band] !== densityRank[b.business_density_band]) {
        return densityRank[a.business_density_band] - densityRank[b.business_density_band]
      }
      return a.suburb.localeCompare(b.suburb)
    })
    .slice(0, 28)
}
