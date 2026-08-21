import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'
import * as MindGardenSkills from '@deepseek-ai/dsh-mind-garden/skills'
import { apply as invariantApply } from '@deepseek-ai/dsh-mind-garden/skills/invariant'

const SKILL_NAMES = [
  'mind-garden-companion',
  'mind-garden-continuity',
  'mind-garden-course-planner',
  'mind-garden-curriculum',
  'mind-garden-distillation',
  'mind-garden-guanxin',
  'mind-garden-life-philosophy',
  'mind-garden-life-topics',
  'mind-garden-long-horizon',
  'mind-garden-memory',
  'mind-garden-memory-governance',
  'mind-garden-patterns',
  'mind-garden-practice',
  'mind-garden-principle-review',
  'mind-garden-star-observer',
] as const

describe('Mind Garden bundled skills', () => {
  it('registers, loads, and disposes every packaged definition', async () => {
    const ctx = new Context()
    await ctx.plugin(SkillRegistry)
    const fiber = await ctx.plugin(MindGardenSkills)
    const summaries = await ctx.skills.list()

    expect(summaries.map(skill => skill.name)).toEqual(SKILL_NAMES)
    expect(summaries.every(skill => skill.provider === 'mind-garden'
      && skill.source === 'bundled'
      && skill.invocation.modelInvocable
      && skill.invocation.userInvocable)).toBe(true)

    for (const name of SKILL_NAMES) {
      const loaded = await ctx.skills.get(name)
      expect(loaded).toMatchObject({ name, provider: 'mind-garden', source: 'bundled' })
      expect(loaded?.content).toContain('# ')
      expect(loaded?.content).not.toContain(`name: ${name}`)
      expect(loaded?.resourceBase).toEqual({
        kind: 'directory',
        path: dirname(fileURLToPath(new URL(`../skills/${name}/SKILL.md`, import.meta.url))),
      })
    }

    expect((await ctx.skills.get('mind-garden-course-planner'))?.content).toContain('wang_yangming_knowledge_action')
    expect((await ctx.skills.get('mind-garden-curriculum'))?.content).toContain('sunzi_conditions_before_action')

    await fiber.dispose()
    expect(await ctx.skills.list()).toEqual([])
  })

  it('registers an empty invariant companion owned by the package', async () => {
    const disposer = () => {}
    let installed: InvariantInstaller | undefined
    const register = vi.fn((_packageName: string, installer: InvariantInstaller) => {
      installed = installer
      return disposer
    })

    await expect(invariantApply({ invariants: { register } } as never)).resolves.toBe(disposer)
    expect(register).toHaveBeenCalledWith('@deepseek-ai/dsh-mind-garden/skills', expect.any(Function))
    if (installed === undefined) throw new Error('invariant installer was not registered')
    await installed(new Context(), () => { throw new Error('unused') })
  })
})
