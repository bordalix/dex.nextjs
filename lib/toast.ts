import { toast, setDefaults } from 'bulma-toast'

/**
 * Shows a toast on the UI
 * @param err error object or string
 * @param options optional
 * @returns void
 */
export function showToast(err: any, options = {}) {
  // try to get a string from the error object
  const message = err.message || err.toString()
  console.error(message)

  // options will be merged with these and the defaults
  // will be used if the fields are not provided.
  setDefaults({
    closeOnClick: true,
    dismissible: true,
    duration: 2000,
    opacity: 1,
    position: 'top-left',
    type: 'is-warning',
  })

  // show toast to user
  toast({
    ...options,
    message,
  })
}
