import { computed } from 'vue'
import { useRegistration } from './useRegistration.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function useValidation() {
  const {
    attendeeInfo,
    ticketTypeId,
    selectedAddons,
    addons,
    conflictingSessionIds,
    hasMerchandise,
  } = useRegistration()

  const step1Errors = computed(() => {
    const e = /** @type {Record<string, string>} */ ({})

    if (!attendeeInfo.fullName.trim()) e.fullName = 'Full name is required'

    if (!attendeeInfo.email.trim()) e.email = 'Email is required'
    else if (!EMAIL_RE.test(attendeeInfo.email)) e.email = 'Please enter a valid email address'

    if (!attendeeInfo.phone.trim()) {
      e.phone = 'Phone number is required'
    } else {
      const digits = attendeeInfo.phone.replace(/\D/g, '')
      if (digits.length < 7 || digits.length > 15) e.phone = 'Please enter a valid phone number'
    }

    if (!attendeeInfo.company.trim()) e.company = 'Company is required'
    if (!attendeeInfo.jobTitle.trim()) e.jobTitle = 'Job title is required'

    if (hasMerchandise.value && !attendeeInfo.shippingAddress.trim()) {
      e.shippingAddress = 'Shipping address is required when merchandise is selected'
    }

    return e
  })

  /** Session time conflicts detected at submit time. */
  const step2Errors = computed(() => {
    const e = /** @type {Record<string, string>} */ ({})
    if (conflictingSessionIds.value.size > 0) {
      e.conflicts = 'You have selected sessions with overlapping time slots. Please resolve the conflicts before submitting.'
    }
    return e
  })

  /** Missing size selections for merchandise items. */
  const step3Errors = computed(() => {
    const e = /** @type {Record<string, string>} */ ({})
    for (const item of selectedAddons.value) {
      const addon = addons.find(a => a.id === item.id)
      if (addon?.sizes?.length && !item.size) {
        e[item.id] = `Please select a size for ${addon.name}`
      }
    }
    return e
  })

  const hasStep1Errors = computed(() => Object.keys(step1Errors.value).length > 0)
  const hasStep2Errors = computed(() => Object.keys(step2Errors.value).length > 0)
  const hasStep3Errors = computed(() => Object.keys(step3Errors.value).length > 0)
  const hasAnyErrors = computed(() =>
    hasStep1Errors.value || hasStep2Errors.value || hasStep3Errors.value
  )

  return {
    step1Errors,
    step2Errors,
    step3Errors,
    hasStep1Errors,
    hasStep2Errors,
    hasStep3Errors,
    hasAnyErrors,
  }
}
