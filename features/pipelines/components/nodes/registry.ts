import type { NodeDefinition } from './types'

export const NODE_REGISTRY: NodeDefinition[] = [
  // Triggers
  {
    nodeType: 'OnChatMessage',
    type: 'trigger',
    label: 'Chat Message',
    description: 'Fires when a chat message is received',
    configSchema: { pattern: { type: 'text', label: 'Message Pattern (regex)', placeholder: '.*' } },
  },
  {
    nodeType: 'OnFollow',
    type: 'trigger',
    label: 'New Follow',
    description: 'Fires when someone follows the channel',
  },
  {
    nodeType: 'OnSubscription',
    type: 'trigger',
    label: 'New Subscription',
    description: 'Fires when someone subscribes',
    configSchema: {
      tier: { type: 'select', label: 'Minimum Tier', options: ['1', '2', '3'], defaultValue: '1' },
    },
  },
  {
    nodeType: 'OnRaid',
    type: 'trigger',
    label: 'Raid',
    description: 'Fires when the channel is raided',
    configSchema: { minViewers: { type: 'number', label: 'Minimum Raiders', defaultValue: 1 } },
  },
  {
    nodeType: 'OnCommand',
    type: 'trigger',
    label: 'Command',
    description: 'Fires when a command is used in chat',
    configSchema: { command: { type: 'text', label: 'Command Name', placeholder: '!hello' } },
  },
  {
    nodeType: 'OnTimer',
    type: 'trigger',
    label: 'Timer',
    description: 'Fires on a recurring schedule',
    configSchema: {
      intervalMinutes: { type: 'number', label: 'Interval (minutes)', defaultValue: 30 },
      minChatLines: { type: 'number', label: 'Min chat lines', defaultValue: 0 },
    },
  },
  {
    nodeType: 'OnRedemption',
    type: 'trigger',
    label: 'Channel Point Redemption',
    description: 'Fires when a channel point reward is redeemed',
    configSchema: { rewardTitle: { type: 'text', label: 'Reward Title (leave blank for any)', placeholder: '' } },
  },
  {
    nodeType: 'OnCheer',
    type: 'trigger',
    label: 'Cheer (Bits)',
    description: 'Fires when someone cheers bits',
    configSchema: { minBits: { type: 'number', label: 'Minimum Bits', defaultValue: 1 } },
  },

  // Conditions
  {
    nodeType: 'IfUserRole',
    type: 'condition',
    label: 'User Role Check',
    description: 'Check if user has a specific role',
    configSchema: {
      role: {
        type: 'select',
        label: 'Required Role',
        options: ['everyone', 'subscriber', 'vip', 'moderator', 'broadcaster'],
        defaultValue: 'everyone',
      },
    },
  },
  {
    nodeType: 'IfCooldown',
    type: 'condition',
    label: 'Cooldown Check',
    description: 'Only proceed if cooldown has expired',
    configSchema: { seconds: { type: 'number', label: 'Cooldown (seconds)', defaultValue: 30 } },
  },
  {
    nodeType: 'IfRegex',
    type: 'condition',
    label: 'Regex Match',
    description: 'Check message against a regex pattern',
    configSchema: { pattern: { type: 'text', label: 'Pattern', placeholder: '.*' } },
  },
  {
    nodeType: 'IfVariable',
    type: 'condition',
    label: 'Variable Check',
    description: 'Compare a variable against a value',
    configSchema: {
      variable: { type: 'text', label: 'Variable Name', placeholder: 'counter' },
      operator: {
        type: 'select',
        label: 'Operator',
        options: ['==', '!=', '>', '<', '>=', '<=', 'contains'],
        defaultValue: '==',
      },
      value: { type: 'text', label: 'Value', placeholder: '0' },
    },
  },

  // Actions
  {
    nodeType: 'SendMessage',
    type: 'action',
    label: 'Send Message',
    description: 'Send a message to chat',
    configSchema: { message: { type: 'text', label: 'Message', placeholder: 'Hello {user}!' } },
  },
  {
    nodeType: 'SendWhisper',
    type: 'action',
    label: 'Send Whisper',
    description: 'Send a whisper to a user',
    configSchema: {
      target: { type: 'text', label: 'Target User', placeholder: '{user}' },
      message: { type: 'text', label: 'Message', placeholder: 'Hello!' },
    },
  },
  {
    nodeType: 'TimeoutUser',
    type: 'action',
    label: 'Timeout User',
    description: 'Timeout a user for N seconds',
    configSchema: {
      duration: { type: 'number', label: 'Duration (seconds)', defaultValue: 60 },
      reason: { type: 'text', label: 'Reason', placeholder: 'Auto-moderation' },
    },
  },
  {
    nodeType: 'BanUser',
    type: 'action',
    label: 'Ban User',
    description: 'Ban a user from the channel',
    configSchema: { reason: { type: 'text', label: 'Reason', placeholder: 'Violation of rules' } },
  },
  {
    nodeType: 'Delay',
    type: 'action',
    label: 'Delay',
    description: 'Wait for a specified amount of time',
    configSchema: { milliseconds: { type: 'number', label: 'Delay (ms)', defaultValue: 1000 } },
  },
  {
    nodeType: 'Loop',
    type: 'action',
    label: 'Loop',
    description: 'Repeat the next action N times',
    configSchema: { count: { type: 'number', label: 'Iterations', defaultValue: 3 } },
  },
  {
    nodeType: 'PlaySound',
    type: 'action',
    label: 'Play Sound',
    description: 'Play a sound alert in overlay',
    configSchema: {
      soundUrl: { type: 'text', label: 'Sound URL', placeholder: 'https://...' },
      volume: { type: 'number', label: 'Volume (0–100)', defaultValue: 80 },
    },
  },
  {
    nodeType: 'SetVariable',
    type: 'action',
    label: 'Set Variable',
    description: 'Set or update a pipeline variable',
    configSchema: {
      name: { type: 'text', label: 'Variable Name', placeholder: 'counter' },
      value: { type: 'text', label: 'Value', placeholder: '0' },
      operation: {
        type: 'select',
        label: 'Operation',
        options: ['set', 'increment', 'decrement', 'append'],
        defaultValue: 'set',
      },
    },
  },
  {
    nodeType: 'HttpRequest',
    type: 'action',
    label: 'HTTP Request',
    description: 'Make an HTTP request to an external API',
    configSchema: {
      url: { type: 'text', label: 'URL', placeholder: 'https://api.example.com/...' },
      method: {
        type: 'select',
        label: 'Method',
        options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        defaultValue: 'GET',
      },
      body: { type: 'text', label: 'Body (JSON)', placeholder: '{"key": "value"}' },
      headers: { type: 'text', label: 'Headers (JSON)', placeholder: '{"Authorization": "Bearer ..."}' },
    },
  },
  {
    nodeType: 'TriggerAlert',
    type: 'action',
    label: 'Trigger Alert',
    description: 'Show an animated alert in the overlay',
    configSchema: {
      alertType: { type: 'text', label: 'Alert Type', placeholder: 'follow' },
      message: { type: 'text', label: 'Custom Message', placeholder: 'Optional override' },
    },
  },
  {
    nodeType: 'RunCommand',
    type: 'action',
    label: 'Run Command',
    description: 'Execute a bot command',
    configSchema: { command: { type: 'text', label: 'Command', placeholder: '!uptime' } },
  },
]
