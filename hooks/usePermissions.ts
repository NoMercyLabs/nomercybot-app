import { useAuth } from './useAuth'
import { useChannel } from './useChannel'

type Permission = 'commands.edit' | 'commands.delete' | 'moderation.ban' |
  'settings.manage' | 'pipelines.edit' | 'admin'

export function usePermissions() {
  const { user } = useAuth()
  const { currentChannel } = useChannel()

  function hasPermission(permission: Permission): boolean {
    if (!user || !currentChannel) return false
    if (user.id === currentChannel.twitchId) return true
    if (user.isAdmin) return true
    return user.permissions?.includes(permission) ?? false
  }

  function requirePermission(permission: Permission): void {
    if (!hasPermission(permission)) throw new Error(`Missing permission: ${permission}`)
  }

  return { hasPermission, requirePermission }
}
