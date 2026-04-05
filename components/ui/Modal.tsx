import { Modal as RNModal, View, Text, Pressable, type ModalProps as RNModalProps } from 'react-native'
import { X } from 'lucide-react-native'

interface ModalProps extends RNModalProps {
  title?: string
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ title, onClose, children, visible, ...props }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...props}
    >
      <View className="flex-1 items-center justify-center bg-black/60 p-4">
        <View className="w-full max-w-md rounded-2xl bg-surface-raised">
          {title && (
            <View className="flex-row items-center justify-between border-b border-border px-6 py-4">
              <Text className="text-lg font-semibold text-gray-100">{title}</Text>
              <Pressable onPress={onClose} className="p-1">
                <X size={20} color="rgb(156, 163, 175)" />
              </Pressable>
            </View>
          )}
          <View className="p-6">{children}</View>
        </View>
      </View>
    </RNModal>
  )
}
