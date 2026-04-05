import { View, type ViewProps } from 'react-native'
import { cn } from '@/lib/utils/cn'

interface CardProps extends ViewProps {
  className?: string
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <View
      className={cn('rounded-xl bg-surface-raised', className)}
      {...props}
    >
      {children}
    </View>
  )
}
