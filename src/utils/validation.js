// Form validation utilities
export const validators = {
  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'This field is required'
    }
    return null
  },

  email: (value) => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address'
    }
    return null
  },

  minLength: (min) => (value) => {
    if (!value) return null
    if (value.length < min) {
      return `Must be at least ${min} characters`
    }
    return null
  },

  maxLength: (max) => (value) => {
    if (!value) return null
    if (value.length > max) {
      return `Must be no more than ${max} characters`
    }
    return null
  },

  numeric: (value) => {
    if (!value) return null
    if (isNaN(value)) {
      return 'Must be a number'
    }
    return null
  },

  range: (min, max) => (value) => {
    if (!value) return null
    const num = parseFloat(value)
    if (isNaN(num)) {
      return 'Must be a number'
    }
    if (num < min || num > max) {
      return `Must be between ${min} and ${max}`
    }
    return null
  },

  unique: (existingValues, currentValue) => (value) => {
    if (!value) return null
    if (value !== currentValue && existingValues.includes(value)) {
      return 'This value already exists'
    }
    return null
  }
}

// Validate form data against schema
export function validateForm(data, schema) {
  const errors = {}
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field]
    
    for (const rule of rules) {
      const error = rule(value)
      if (error) {
        errors[field] = error
        break // Stop at first error for this field
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Validate assessment responses
export function validateAssessmentResponse(response, question) {
  const errors = []
  
  if (question.required && (!response || response === '')) {
    errors.push('This question is required')
  }
  
  if (response) {
    switch (question.type) {
      case 'text-short':
      case 'text-long':
        if (question.maxLength && response.length > question.maxLength) {
          errors.push(`Maximum ${question.maxLength} characters allowed`)
        }
        break
        
      case 'numeric':
        const num = parseFloat(response)
        if (isNaN(num)) {
          errors.push('Must be a valid number')
        } else {
          if (question.min !== undefined && num < question.min) {
            errors.push(`Must be at least ${question.min}`)
          }
          if (question.max !== undefined && num > question.max) {
            errors.push(`Must be no more than ${question.max}`)
          }
        }
        break
        
      case 'single-choice':
        if (!question.options.includes(response)) {
          errors.push('Invalid selection')
        }
        break
        
      case 'multi-choice':
        if (!Array.isArray(response)) {
          errors.push('Invalid selection format')
        } else {
          const invalidOptions = response.filter(opt => !question.options.includes(opt))
          if (invalidOptions.length > 0) {
            errors.push('Invalid selection(s)')
          }
        }
        break
    }
  }
  
  return errors
}

// Generate slug from title
export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
}