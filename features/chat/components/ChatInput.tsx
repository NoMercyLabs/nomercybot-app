import { View, TextInput, Pressable } from 'react-native'
import { useState, useCallback } from 'react'
import { Send } from 'lucide-react-native'

interface ChatInputProps {
  onSend: (message: string) => Promise<void>
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')

  const handleSend = useCallback(async () => {
    const text = value.trim()
    if (!text || disabled) return
    setValue('')
    await onSend(text)
  }, [value, disabled, onSend])

  return (
    <View
      className="flex-row items-center gap-2 px-4 py-3"
      style={{ borderTopWidth: 1, borderTopColor: '#1e1a35' }}
    >
      <TextInput
        value={value}
        onChangeText={setValue}
        onSubmitEditing={handleSend}
        placeholder="Send a message..."
        placeholderTextColor="#3d3566"
        className="flex-1 rounded-lg px-4 py-3 text-white"
        style={{
          backgroundColor: '#1A1530',
          borderWidth: 1,
          borderColor: '#1e1a35',
          outlineStyle: 'none',
        } as any}
        returnKeyType="send"
        editable={!disabled}
      />
      <Pressable
        onPress={handleSend}
        disabled={disabled || !value.trim()}
        className="rounded-lg p-3"
        style={{ backgroundColor: '#7C3AED', opacity: (disabled || !value.trim()) ? 0.5 : 1 }}
      >
        <Send size={18} color="white" />
      </Pressable>
    </View>
  )
}
