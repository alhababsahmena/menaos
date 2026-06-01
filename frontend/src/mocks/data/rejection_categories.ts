import type { RejectionCategory } from '@types'

// Rejection category IDs use the `00000000-000f-…` namespace. `is_active`
// gates new use: the legacy_format category is preserved on historical
// rejections but cannot be selected on new ones.

export const REJECTION_CATEGORY_INCOMPLETE_DATA = '00000000-000f-4000-9000-000000000001'
export const REJECTION_CATEGORY_OUT_OF_SCOPE = '00000000-000f-4000-9000-000000000002'
export const REJECTION_CATEGORY_QUALITY_BELOW_THRESHOLD = '00000000-000f-4000-9000-000000000003'
export const REJECTION_CATEGORY_DUPLICATE = '00000000-000f-4000-9000-000000000004'
export const REJECTION_CATEGORY_LEGACY_FORMAT = '00000000-000f-4000-9000-000000000005'

export const rejection_categories: readonly RejectionCategory[] = [
  {
    id: REJECTION_CATEGORY_INCOMPLETE_DATA,
    key: 'incomplete_data',
    label: 'Incomplete data',
    description: 'Submission is missing fields the platform requires.',
    is_active: true,
  },
  {
    id: REJECTION_CATEGORY_OUT_OF_SCOPE,
    key: 'out_of_scope',
    label: 'Out of scope',
    description: 'Submission addresses content the project does not cover.',
    is_active: true,
  },
  {
    id: REJECTION_CATEGORY_QUALITY_BELOW_THRESHOLD,
    key: 'quality_below_threshold',
    label: 'Quality below threshold',
    description: 'Submission is on-scope but does not meet the quality bar.',
    is_active: true,
  },
  {
    id: REJECTION_CATEGORY_DUPLICATE,
    key: 'duplicate',
    label: 'Duplicate',
    description: 'Same content already submitted by another task.',
    is_active: true,
  },
  {
    id: REJECTION_CATEGORY_LEGACY_FORMAT,
    key: 'legacy_format',
    label: 'Legacy format (deprecated)',
    description: 'Retired category preserved for historical rejections.',
    is_active: false,
  },
]
