import path from 'node:path'
import { getDefaultConfig } from 'expo/metro-config'

const projectRoot = import.meta.dirname
const sharedRoot = path.resolve(projectRoot, '../shared')
const projectEntry = path.join(projectRoot, 'index.ts')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [...(config.watchFolders ?? []), sharedRoot]

const isReact = (moduleName: string): boolean => moduleName === 'react' || moduleName.startsWith('react/')

type ResolveRequest = NonNullable<typeof config.resolver.resolveRequest>

const resolveRequest: ResolveRequest = (context, moduleName, platform) =>
  context.resolveRequest(isReact(moduleName) ? { ...context, originModulePath: projectEntry } : context, moduleName, platform)

export default { ...config, resolver: { ...config.resolver, resolveRequest } }
