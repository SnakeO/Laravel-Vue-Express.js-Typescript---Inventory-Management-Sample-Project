/**
 * Shared validation rules for Vuetify forms
 */
export const rules = {
  required: v => !!v || v === 0 || 'Required',
  positive: v => v > 0 || 'Must be greater than 0',
  nonNegative: v => v >= 0 || 'Must be 0 or greater',
}
