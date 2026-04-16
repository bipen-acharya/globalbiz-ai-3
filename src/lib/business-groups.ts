import type { BusinessFormData, BusinessModelType } from '@/types'

export type BusinessGroup =
  | 'food_hospitality'
  | 'retail'
  | 'local_services'
  | 'digital_tech'

type SearchProfile = {
  localCompetitionPrimary: boolean
  directKeywords: string[]
  indirectKeywords: string[]
  placeTypes: string[]
}

const FOOD_HOSPITALITY_PATTERNS = [
  /food truck/i,
  /takeaway/i,
  /fast food/i,
  /cafe/i,
  /café/i,
  /coffee/i,
  /bakery/i,
  /restaurant/i,
]

const RETAIL_PATTERNS = [
  /grocery/i,
  /supermarket/i,
  /convenience/i,
  /pharmacy/i,
  /chemist/i,
  /clothing/i,
  /retail/i,
  /asian grocery/i,
]

const LOCAL_SERVICE_PATTERNS = [
  /cleaning/i,
  /barber/i,
  /beauty/i,
  /salon/i,
  /childcare/i,
  /gym/i,
  /fitness/i,
  /consulting office/i,
  /mobile service/i,
]

const DIGITAL_TECH_PATTERNS = [
  /it \/ tech services/i,
  /saas/i,
  /app/i,
  /online course/i,
  /digital agency/i,
  /marketplace/i,
  /e-commerce/i,
  /software/i,
  /web design/i,
  /managed services/i,
]

function normalizeBusinessType(input: string) {
  return input.trim().toLowerCase()
}

export function getBusinessGroupFromType(
  businessType: string,
  businessModelType?: BusinessModelType
): BusinessGroup {
  const normalized = normalizeBusinessType(businessType)

  if (DIGITAL_TECH_PATTERNS.some(pattern => pattern.test(normalized))) return 'digital_tech'
  if (FOOD_HOSPITALITY_PATTERNS.some(pattern => pattern.test(normalized))) return 'food_hospitality'
  if (RETAIL_PATTERNS.some(pattern => pattern.test(normalized))) return 'retail'
  if (LOCAL_SERVICE_PATTERNS.some(pattern => pattern.test(normalized))) return 'local_services'
  if (businessModelType === 'online') return 'digital_tech'
  return 'local_services'
}

export function getBusinessGroup(
  form: Pick<BusinessFormData, 'business_type' | 'business_type_other' | 'business_model_type'>
): BusinessGroup {
  const businessType = form.business_type === 'Other' && form.business_type_other.trim()
    ? form.business_type_other.trim()
    : form.business_type
  return getBusinessGroupFromType(businessType, form.business_model_type)
}

export function isDigitalTechGroup(group: BusinessGroup) {
  return group === 'digital_tech'
}

export function isFoodHospitalityGroup(group: BusinessGroup) {
  return group === 'food_hospitality'
}

export function isRetailGroup(group: BusinessGroup) {
  return group === 'retail'
}

export function isLocalServicesGroup(group: BusinessGroup) {
  return group === 'local_services'
}

export function getBusinessGroupLabel(group: BusinessGroup) {
  switch (group) {
    case 'food_hospitality':
      return 'Food & hospitality'
    case 'retail':
      return 'Retail'
    case 'local_services':
      return 'Local services'
    case 'digital_tech':
      return 'Digital / tech'
    default:
      return 'Business'
  }
}

export function getCompetitorSearchProfile(
  businessType: string,
  productsServices = '',
  businessModelType?: BusinessModelType
): SearchProfile {
  const normalized = `${businessType} ${productsServices}`.toLowerCase()
  const group = getBusinessGroupFromType(normalized, businessModelType)

  if (/food truck/i.test(normalized)) {
    return {
      localCompetitionPrimary: true,
      directKeywords: ['restaurant', 'cafe', 'takeaway', 'fast food', 'burger', 'kebab', 'food court', 'lunch bar'],
      indirectKeywords: ['shopping centre', 'shopping center', 'markets', 'food court', 'lunch cafe'],
      placeTypes: ['restaurant', 'cafe', 'meal_takeaway'],
    }
  }

  if (/grocery|supermarket|asian grocery|indian grocery|nepali grocery|chinese grocery|korean grocery/i.test(normalized)) {
    return {
      localCompetitionPrimary: true,
      directKeywords: ['supermarket', 'grocery store', 'asian grocery', 'indian grocery', 'nepali grocery', 'chinese grocery', 'korean grocery', 'convenience store'],
      indirectKeywords: ['Coles', 'Woolworths', 'Aldi', 'Foodland', 'IGA'],
      placeTypes: ['supermarket', 'grocery_or_supermarket', 'convenience_store'],
    }
  }

  if (/cleaning/i.test(normalized)) {
    return {
      localCompetitionPrimary: true,
      directKeywords: ['cleaning service', 'house cleaning', 'commercial cleaning', 'office cleaning', 'carpet cleaning'],
      indirectKeywords: ['facility services', 'property maintenance'],
      placeTypes: ['point_of_interest', 'establishment'],
    }
  }

  if (/it \/ tech services|managed services|software|web design|digital solutions|computer support|cybersecurity/i.test(normalized)) {
    return {
      localCompetitionPrimary: false,
      directKeywords: ['it services', 'computer repair', 'managed services', 'software company', 'cybersecurity', 'digital agency', 'web design', 'consulting'],
      indirectKeywords: ['business consulting', 'automation agency', 'computer support'],
      placeTypes: ['electronics_store', 'store', 'point_of_interest'],
    }
  }

  if (/digital agency/i.test(normalized)) {
    return {
      localCompetitionPrimary: false,
      directKeywords: ['marketing agency', 'seo agency', 'web design', 'social media agency'],
      indirectKeywords: ['branding agency', 'digital consultant'],
      placeTypes: ['point_of_interest', 'establishment'],
    }
  }

  if (/saas|online course|marketplace|app|e-commerce/i.test(normalized) || group === 'digital_tech') {
    return {
      localCompetitionPrimary: false,
      directKeywords: ['digital agency', 'software company', 'web design', 'business consulting', 'marketing agency'],
      indirectKeywords: ['online tools', 'automation platform', 'service provider'],
      placeTypes: ['point_of_interest', 'establishment'],
    }
  }

  if (/gym|fitness/i.test(normalized)) {
    return {
      localCompetitionPrimary: true,
      directKeywords: ['gym', 'fitness center', 'pilates', 'yoga studio', 'personal trainer'],
      indirectKeywords: ['personal trainer', 'wellness studio'],
      placeTypes: ['gym'],
    }
  }

  if (/pharmacy|chemist|drugstore|health store/i.test(normalized)) {
    return {
      localCompetitionPrimary: true,
      directKeywords: ['pharmacy', 'chemist', 'drugstore', 'health store'],
      indirectKeywords: ['medical centre', 'wellness store'],
      placeTypes: ['pharmacy'],
    }
  }

  if (/barber|beauty|salon/i.test(normalized)) {
    return {
      localCompetitionPrimary: true,
      directKeywords: ['barber', 'hair salon', 'beauty salon'],
      indirectKeywords: ['skin clinic', 'nail salon'],
      placeTypes: ['hair_care', 'beauty_salon'],
    }
  }

  if (group === 'food_hospitality') {
    return {
      localCompetitionPrimary: true,
      directKeywords: ['restaurant', 'cafe', 'takeaway', 'fast food'],
      indirectKeywords: ['food court', 'meal delivery'],
      placeTypes: ['restaurant', 'cafe', 'meal_takeaway'],
    }
  }

  if (group === 'retail') {
    return {
      localCompetitionPrimary: true,
      directKeywords: ['retail store', 'specialty shop', 'convenience store'],
      indirectKeywords: ['shopping centre', 'department store'],
      placeTypes: ['store', 'shopping_mall', 'convenience_store'],
    }
  }

  if (group === 'local_services') {
    return {
      localCompetitionPrimary: true,
      directKeywords: [businessType || 'local service'],
      indirectKeywords: ['service provider', 'local business'],
      placeTypes: ['point_of_interest', 'establishment'],
    }
  }

  return {
    localCompetitionPrimary: businessModelType !== 'online',
    directKeywords: [businessType || 'business'],
    indirectKeywords: productsServices ? [productsServices] : [],
    placeTypes: ['point_of_interest', 'establishment'],
  }
}
