export const deploymentBase = '/pelvic-core-training/' as const

export function resolveDeploymentBase(target?: string): string {
  return target === 'github-pages' ? deploymentBase : '/'
}

export function toDeploymentPath(
  path: string,
  base = deploymentBase,
): string {
  return `${base}${path.replace(/^\/+/, '')}`
}
