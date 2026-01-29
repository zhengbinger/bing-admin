/**
 * Router Integration for Request Cancellation
 * Automatically cancels pending requests when navigation occurs
 */

import { Router } from 'vue-router'
import { httpClient } from './client'

/**
 * Setup request cancellation on route changes
 * This ensures that pending API requests are cancelled when user navigates away
 */
export function setupRequestCancellation(router: Router): void {
  // Cancel all pending requests before each route change
  router.beforeEach((to, from, next) => {
    // Only cancel requests if actually changing routes
    if (to.path !== from.path) {
      httpClient.cancelAllRequests()
    }
    next()
  })

  // Optional: Cancel requests on browser back/forward navigation
  window.addEventListener('beforeunload', () => {
    httpClient.cancelAllRequests()
  })

  // Optional: Cancel requests when page becomes hidden (tab switching)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      httpClient.cancelAllRequests()
    }
  })
}

/**
 * Composable for manual request cancellation in components
 */
export function useRequestCancellation() {
  const cancelRequest = (url: string, method: string = 'GET', params?: any) => {
    httpClient.cancelRequest(url, method, params)
  }

  const cancelAllRequests = () => {
    httpClient.cancelAllRequests()
  }

  return {
    cancelRequest,
    cancelAllRequests
  }
}

export default setupRequestCancellation