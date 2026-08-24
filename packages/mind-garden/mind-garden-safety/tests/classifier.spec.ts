import { describe, expect, it } from 'vitest'
import {
  assessMindGardenInput,
  detectMindGardenSafetyLocale,
  normalizeMindGardenSafetyText,
  recoverMindGardenSafetyState,
} from '@deepseek-ai/dsh-mind-garden/safety'

const cases: ReadonlyArray<readonly [string, number]> = [
  ['我现在要跳楼，已经在楼顶。', 3],
  ['我今晚准备自杀，药已经准备好了。', 3],
  ['我想自杀，刀就在身边。', 3],
  ['我已经割腕。', 3],
  ['我刚刚吞药。', 3],
  ['我刚刚吞了一整瓶药。', 3],
  ['我想结束生命，绳已经准备好。', 3],
  ['我今晚打算伤害别人。', 3],
  ['我已经到了桥边，准备跳下去。', 3],
  ["I'm going to kill myself tonight.", 3],
  ['我喝酒过量，现在叫不醒，呼吸很慢。', 3],
  ['我最近一直想自杀，但还没有明确计划。', 2],
  ['我计划伤害自己。', 2],
  ['我不想活下去了。', 2],
  ['我想死。', 2],
  ['我决定结束自己的生命。', 2],
  ['我想紫砂。', 2],
  ['我计划伤害他。', 2],
  ['我打算自残。', 2],
  ['遗书已经写完，我准备和大家告别。', 2],
  ['孩子正在被虐待。', 2],
  ['有声音命令我伤人。', 2],
  ['我连续三天没睡，完全停不下来，觉得自己无所不能。', 2],
  ['我今晚想 zi sha。', 2],
  ['这段时间非常绝望，连续两周睡不着。', 1],
  ['我连续七天失眠。', 1],
  ['我真的撑不下去。', 1],
  ['活着好像没有意义。', 1],
  ['我希望睡着以后就别醒了。', 1],
  ['今天工作很累，心情有些低落。', 0],
  ['篮球赛输了，我有点难过。', 0],
  ['这次失恋让我很痛苦。', 0],
  ['我不想活在别人的评价里。', 0],
  ['我不想自杀，只是想找个人说说话。', 0],
  ['我从没想过自残。', 0],
  ['我不会伤害自己。', 0],
  ['我已放弃轻生的计划，现在是安全的。', 0],
  ['新闻报道了当地一起跳楼事件。', 0],
  ['小说里的角色想自杀。', 0],
  ['电影台词提到了轻生。', 0],
  ['我在研究自杀预防的公共政策。', 0],
  ['如果有人想自残，朋友应该怎么回应？', 0],
  ['游戏里的角色从楼顶跳下去了。', 0],
  ['我想讨论死亡在存在主义里的意义。', 0],
  ['我要杀死拖延症。', 0],
  ['这个项目我想砍掉重做。', 0],
  ['刀就在厨房，我准备切菜。', 0],
  ['楼顶的风景很好。', 0],
  ['感冒吃药后好多了。', 0],
  ['课程标题是自杀风险识别。', 0],
  ["I am not suicidal and I don't plan to hurt myself.", 0],
  ['This research paper discusses suicide prevention.', 0],
  ['我不想自杀，但是现在我已经拿着刀，马上准备伤害自己。', 3],
  ['新闻报道提到自杀，但我现在已经站在楼顶准备跳下去。', 3],
  ['I am not suicidal, but right now I am ready to kill myself.', 3],
  ['新闻在讨论自杀，我现在已经站在楼顶。', 3],
  ['我没有想自杀，我现在拿着刀准备伤害自己。', 3],
  ['This is a news article about suicide, I am going to kill myself right now.', 3],
]

describe('Mind Garden deterministic input classifier', () => {
  it.each(cases)('classifies %s at level %i', (input, level) => {
    const assessment = assessMindGardenInput(input)
    expect(assessment.level).toBe(level)
    const chineseResources = level === 0 ? [] : level === 3 ? ['12356', '110', '120'] : ['12356']
    expect(assessment.resources.map(resource => resource.value)).toEqual(
      assessment.locale === 'zh-CN' ? chineseResources : [],
    )
  })

  it('infers Chinese and English safety-copy locales without attaching China-only resources', () => {
    expect(detectMindGardenSafetyLocale('我现在需要帮助')).toBe('zh-CN')
    expect(detectMindGardenSafetyLocale('I need help right now')).toBe('en')
    expect(assessMindGardenInput('I am ready to kill myself.')).toMatchObject({
      locale: 'en',
      level: 3,
      resources: [],
    })
  })

  it('normalizes deliberate spacing and traditional characters', () => {
    expect(normalizeMindGardenSafetyText('我現在想 z i s h a，藥在身邊'))
      .toContain('自杀')
    expect(assessMindGardenInput('我现在想紫 砂，已经在楼顶。').level).toBe(3)
  })

  it('keeps urgent and high-risk follow-up active until concrete safety facts arrive', () => {
    const urgent = assessMindGardenInput('我已经割腕。')
    const carried = recoverMindGardenSafetyState(
      assessMindGardenInput('我不知道该说什么'), urgent, '我不知道该说什么',
    )
    expect(carried).toMatchObject({ level: 3, state: 'support-follow-up', categories: ['urgent-follow-up'] })
    const steppedDown = recoverMindGardenSafetyState(
      assessMindGardenInput('救护车到了，我已经到急诊'), urgent, '救护车到了，我已经到急诊',
    )
    expect(steppedDown).toMatchObject({
      level: 2, state: 'support-follow-up', categories: ['immediate-danger-reduced'],
    })
  })

  it('releases level-one follow-up after two ordinary turns', () => {
    const vulnerable = assessMindGardenInput('我真的撑不下去。')
    const first = recoverMindGardenSafetyState(
      assessMindGardenInput('谢谢你'), vulnerable, '谢谢你',
    )
    const second = recoverMindGardenSafetyState(
      assessMindGardenInput('我好多了'), first, '我好多了',
    )
    expect(first).toMatchObject({ level: 1, normalTurns: 1 })
    expect(second).toMatchObject({ level: 0, state: 'ordinary', normalTurns: 0 })
  })

  it('keeps or reduces level-two follow-up from concrete safety facts', () => {
    const highRisk = assessMindGardenInput('我想死。')
    expect(recoverMindGardenSafetyState(
      assessMindGardenInput('我不知道该说什么'), highRisk, '我不知道该说什么',
    )).toMatchObject({ level: 2, state: 'support-follow-up', categories: ['safety-follow-up'] })
    expect(recoverMindGardenSafetyState(
      assessMindGardenInput('已经联系到家人'), highRisk, '已经联系到家人',
    )).toMatchObject({ level: 1, state: 'support-follow-up', categories: ['safety-confirmed'] })
  })
})
