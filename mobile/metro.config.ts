import path from 'node:path'
import { getDefaultConfig } from 'expo/metro-config'

const projectRoot = import.meta.dirname
const sharedRoot = path.resolve(projectRoot, '../shared')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [...(config.watchFolders ?? []), sharedRoot]

export default config
