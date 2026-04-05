import { Modal, View, Text, Pressable } from 'react-native'

interface ConfirmDialogProps {
  visible: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/60 p-6">
        <View
          className="w-full max-w-sm rounded-2xl p-6 gap-4"
          style={{ backgroundColor: '#1A1530', borderWidth: 1, borderColor: '#1e1a35' }}
        >
          <View className="gap-2">
            <Text className="text-lg font-bold" style={{ color: '#f4f5fa' }}>{title}</Text>
            <Text style={{ color: '#8889a0' }}>{message}</Text>
          </View>
          <View className="flex-row gap-3">
            <Pressable
              onPress={onCancel}
              className="flex-1 rounded-xl py-3 items-center"
              style={{ borderWidth: 1, borderColor: '#1e1a35' }}
            >
              <Text className="font-medium" style={{ color: '#d1d5db' }}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className="flex-1 rounded-xl py-3 items-center"
              style={{ backgroundColor: variant === 'danger' ? '#b91c1c' : '#7C3AED' }}
            >
              <Text className="text-white font-medium">{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
