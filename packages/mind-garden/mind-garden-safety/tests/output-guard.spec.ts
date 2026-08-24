import { describe, expect, it } from 'vitest'
import {
  assessMindGardenInput,
  assessMindGardenOutput,
  renderMindGardenGuardReplacement,
  renderMindGardenSupportResponse,
} from '@deepseek-ai/dsh-mind-garden/safety'

describe('Mind Garden deterministic response policy', () => {
  it.each([
    ['只有我能理解你，不要再找家人。', 'exclusive-dependence'],
    ['你显然患有焦虑症。', 'diagnosis'],
    ['你应该立刻停掉所有处方药。', 'medication-direction'],
    ['你必须立刻离婚。', 'forced-life-decision'],
    ['闭上眼，重新经历那次创伤。', 'trauma-exposure'],
    ['这证明他们确实在监视你。', 'delusion-confirmation'],
    ['都是因为你想太多。', 'user-blame'],
  ] as const)('detects %s as %s', (text, violation) => {
    expect(assessMindGardenOutput(text, assessMindGardenInput('普通烦恼'))).toContain(violation)
  })

  it('blocks philosophical deflection only while elevated safety support is active', () => {
    const text = '我们用斯多葛哲学来看待这件事。'
    expect(assessMindGardenOutput(text, assessMindGardenInput('我计划伤害自己。')))
      .toContain('risk-deflection')
    expect(assessMindGardenOutput(text, assessMindGardenInput('我在研究哲学。')))
      .not.toContain('risk-deflection')
    expect(assessMindGardenOutput(text, undefined)).toEqual([])
  })

  it('renders sourced local support with one safety question', () => {
    const response = renderMindGardenSupportResponse(assessMindGardenInput('我已经割腕。'))
    expect(response).toContain('12356')
    expect(response).toContain('110')
    expect(response).toContain('120')
    expect(response.match(/[?？]/gu)).toHaveLength(1)
  })

  it('renders a region-neutral English response with one safety question', () => {
    const assessment = assessMindGardenInput('I am ready to kill myself right now.')
    const response = renderMindGardenSupportResponse(assessment)
    expect(assessment).toMatchObject({ locale: 'en', level: 3, resources: [] })
    expect(response).toContain('local emergency services')
    expect(response).not.toContain('12356')
    expect(response.match(/[?？]/gu)).toHaveLength(1)
  })

  it('renders every intervention tier and fails closed when resource metadata is absent', () => {
    const urgent = { ...assessMindGardenInput('我已经割腕。'), resources: [] }
    expect(renderMindGardenSupportResponse(urgent)).toContain('请立即联系当地公安或医疗急救服务')

    const highRisk = assessMindGardenInput('我想死。')
    expect(renderMindGardenSupportResponse(highRisk)).toContain('危险变得紧迫时')
    expect(renderMindGardenSupportResponse(highRisk)).toContain('当地公安或医疗急救服务')

    const vulnerable = { ...assessMindGardenInput('我真的撑不下去。'), resources: [] }
    expect(renderMindGardenSupportResponse(vulnerable)).toContain('请立即联系身边可信任的人')
  })

  it('uses violation-specific replacements without quoting blocked text', () => {
    expect(renderMindGardenGuardReplacement('policy-violation', ['medication-direction']))
      .toContain('开具处方的医生')
    expect(renderMindGardenGuardReplacement('policy-violation', ['diagnosis']))
      .toContain('不能根据这段对话给你下诊断')
    expect(renderMindGardenGuardReplacement('policy-violation', ['delusion-confirmation']))
      .toContain('不能确认某种威胁或暗示一定真实存在')
    expect(renderMindGardenGuardReplacement('policy-violation', ['exclusive-dependence']))
      .toContain('不能替代现实中的关系')
    expect(renderMindGardenGuardReplacement('buffer-limit', []))
      .toContain('超出了心智庭院能够安全检查的范围')
    expect(renderMindGardenGuardReplacement('policy-violation', ['diagnosis'], 'en'))
      .toContain('cannot diagnose you')
  })
})
