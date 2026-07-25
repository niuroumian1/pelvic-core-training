import { describe, expect, it } from 'vitest'
import {
  deploymentBase,
  resolveDeploymentBase,
  toDeploymentPath,
} from './deployment'

describe('GitHub Pages deployment paths', () => {
  it('uses the repository project path as the deployment base', () => {
    expect(deploymentBase).toBe('/pelvic-core-training/')
  })

  it('places app-relative paths below the deployment base', () => {
    expect(toDeploymentPath('app-icon.svg')).toBe(
      '/pelvic-core-training/app-icon.svg',
    )
  })

  it('keeps local development at the site root', () => {
    expect(resolveDeploymentBase()).toBe('/')
    expect(resolveDeploymentBase('github-pages')).toBe(deploymentBase)
  })
})
