import { useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react-native'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Timer, TimerCreate, TimerUpdate } from '../types'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  messages: z.array(z.string().min(1, 'Message cannot be empty')).min(1, 'Add at least one message'),
  intervalMinutes: z.number().min(1, 'Minimum 1 minute').max(1440, 'Maximum 24 hours'),
  minChatLines: z.number().min(0).max(1000),
  isEnabled: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface TimerFormProps {
  timer?: Timer
  onSubmit: (data: TimerCreate | TimerUpdate) => Promise<unknown>
  isSubmitting?: boolean
}

export function TimerForm({ timer, onSubmit, isSubmitting }: TimerFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: timer?.name ?? '',
      messages: timer?.messages?.length ? timer.messages : [''],
      intervalMinutes: timer?.intervalMinutes ?? 30,
      minChatLines: timer?.minChatLines ?? 0,
      isEnabled: timer?.isEnabled ?? true,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'messages' as any,
  })

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="gap-4">
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Timer Name"
              placeholder="e.g. Social Links"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
            />
          )}
        />

        {/* Messages */}
        <View className="gap-2">
          <Text className="text-sm font-medium text-gray-300">Messages</Text>
          <Text className="text-xs text-gray-500">
            The bot will cycle through these messages in order.
          </Text>
          {fields.map((field, index) => (
            <View key={field.id} className="flex-row items-start gap-2">
              <View className="flex-1">
                <Controller
                  control={control}
                  name={`messages.${index}` as any}
                  render={({ field: { onChange, value } }) => (
                    <Textarea
                      placeholder={`Message ${index + 1}...`}
                      value={value as string}
                      onChangeText={onChange}
                      rows={2}
                    />
                  )}
                />
              </View>
              {fields.length > 1 && (
                <Pressable
                  onPress={() => remove(index)}
                  className="mt-1 rounded-md p-2 active:bg-surface-overlay"
                >
                  <Trash2 size={16} color="#ef4444" />
                </Pressable>
              )}
            </View>
          ))}
          {errors.messages && (
            <Text className="text-xs text-red-400">{errors.messages.message as string}</Text>
          )}
          <Button
            variant="ghost"
            size="sm"
            onPress={() => append('')}
            leftIcon={<Plus size={14} color="#8889a0" />}
            label="Add Message"
          />
        </View>

        <Card className="gap-4">
          <Text className="text-sm font-semibold text-gray-300">Schedule</Text>

          <Controller
            control={control}
            name="intervalMinutes"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Interval (minutes)"
                placeholder="30"
                value={String(value)}
                onChangeText={(v) => onChange(parseInt(v, 10) || 1)}
                keyboardType="numeric"
                error={errors.intervalMinutes?.message}
                description="How often to post a message"
              />
            )}
          />

          <Controller
            control={control}
            name="minChatLines"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Minimum chat lines"
                placeholder="0"
                value={String(value)}
                onChangeText={(v) => onChange(parseInt(v, 10) || 0)}
                keyboardType="numeric"
                description="Minimum chat activity required before posting (0 = always post)"
              />
            )}
          />
        </Card>

        <Controller
          control={control}
          name="isEnabled"
          render={({ field: { onChange, value } }) => (
            <Toggle
              label="Enabled"
              description="Timer will post messages automatically"
              value={value}
              onValueChange={onChange}
            />
          )}
        />

        <Button
          label={isSubmitting ? 'Saving...' : 'Save Timer'}
          onPress={handleSubmit(onSubmit as any)}
          loading={isSubmitting}
          className="mt-2"
        />
      </View>
    </ScrollView>
  )
}
