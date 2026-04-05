import { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'
import { cn } from '@/lib/utils/cn'

interface SkeletonProps {
  className?: string
  count?: number
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    ).start()
  }, [opacity])

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Animated.View
          key={i}
          style={{ opacity }}
          className={cn('rounded-lg bg-surface-overlay', className)}
        />
      ))}
    </>
  )
}
