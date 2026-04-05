import type { NodeDefinition } from './types'

export const NODE_REGISTRY: NodeDefinition[] = [
  // Triggers
  { nodeType: 'OnChatMessage', type: 'trigger', label: 'Chat Message', description: 'Fires when a chat message is received' },
  { nodeType: 'OnFollow', type: 'trigger', label: 'New Follow', description: 'Fires when someone follows the channel' },
  { nodeType: 'OnSubscription', type: 'trigger', label: 'New Subscription', description: 'Fires when someone subscribes' },
  { nodeType: 'OnRaid', type: 'trigger', label: 'Raid', description: 'Fires when the channel is raided' },
  { nodeType: 'OnCommand', type: 'trigger', label: 'Command', description: 'Fires when a command is used in chat' },
  { nodeType: 'OnTimer', type: 'trigger', label: 'Timer', description: 'Fires on a recurring schedule' },
  // Conditions
  { nodeType: 'IfUserRole', type: 'condition', label: 'User Role Check', description: 'Check if user has a specific role' },
  { nodeType: 'IfCooldown', type: 'condition', label: 'Cooldown Check', description: 'Only proceed if cooldown has expired' },
  { nodeType: 'IfRegex', type: 'condition', label: 'Regex Match', description: 'Check message against a regex pattern' },
  { nodeType: 'IfVariable', type: 'condition', label: 'Variable Check', description: 'Compare a variable against a value' },
  // Actions
  { nodeType: 'SendMessage', type: 'action', label: 'Send Message', description: 'Send a message to chat' },
  { nodeType: 'SendWhisper', type: 'action', label: 'Send Whisper', description: 'Send a whisper to a user' },
  { nodeType: 'TimeoutUser', type: 'action', label: 'Timeout User', description: 'Timeout a user for N seconds' },
  { nodeType: 'BanUser', type: 'action', label: 'Ban User', description: 'Ban a user from the channel' },
  { nodeType: 'PlaySound', type: 'action', label: 'Play Sound', description: 'Play a sound alert in overlay' },
  { nodeType: 'SetVariable', type: 'action', label: 'Set Variable', description: 'Set or update a variable' },
  { nodeType: 'HttpRequest', type: 'action', label: 'HTTP Request', description: 'Make an HTTP request to an external API' },
  { nodeType: 'TriggerAlert', type: 'action', label: 'Trigger Alert', description: 'Show an alert in the overlay' },
]
