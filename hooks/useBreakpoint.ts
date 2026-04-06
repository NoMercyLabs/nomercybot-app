import { useState, useEffect } from 'react'
import { Dimensions } from 'react-native'
import * as Device from 'expo-device'

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS['2xl']) return '2xl'
  if (width >= BREAKPOINTS.xl) return 'xl'
  if (width >= BREAKPOINTS.lg) return 'lg'
  if (width >= BREAKPOINTS.md) return 'md'
  return 'sm'
}

export function useBreakpoint() {
  const [width, setWidth] = useState(Dimensions.get('window').width)
  const breakpoint = getBreakpoint(width)

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWidth(window.width)
    })
    return () => subscription.remove()
  }, [])

  // Breakpoints are width-based across all platforms.
  // isDesktop must NOT default to true on web — a 360px Android browser is not a desktop.
  const isTablet =
    (Device.deviceType === Device.DeviceType.TABLET) ||
    (width >= BREAKPOINTS.md && width < BREAKPOINTS.lg)

  const isDesktop = width >= BREAKPOINTS.lg

  const isPhone = !isTablet && !isDesktop

  return {
    width,
    breakpoint,
    isPhone,
    isTablet,
    isDesktop,
    isAtLeast: (bp: Breakpoint) => width >= BREAKPOINTS[bp],
  }
}
