import { describe, expect, it } from 'vitest'
import {
  decodeStoredReflection,
  storedCheckinSchema,
  storedContemplationSchema,
  storedConcernSchema,
  storedExperimentSchema,
  storedJournalSchema,
  storedOpenQuestionSchema,
  storedPeriodReviewSchema,
  storedPrincipleProposalSchema,
  storedPrincipleSchema,
} from '../src/records.ts'

const common = {
  formatVersion: 1 as const,
  id: '10000000-0000-4000-8000-000000000001',
  stamp: { localDate: '2026-08-18', timeZone: 'Asia/Shanghai', utcOffsetMinutes: 480 },
  sourceSessionId: 'reflection-records',
  createdAt: 100,
}

const principleContent = {
  expression: 'Speak honestly.',
  formationContext: '',
  userQuote: 'I can speak honestly.',
  supportingExperiences: [{ summary: 'A conversation.', sourceContemplationId: null }],
  counterexample: '',
  appliesTo: [],
  notAppliesTo: [],
  lastChallenged: '',
  status: 'trying' as const,
}

describe('Mind Garden reflection record codecs', () => {
  it('strictly dispatches check-ins and journals', () => {
    const checkin = storedCheckinSchema.parse({
      ...common,
      recordType: 'checkin',
      mood: -2,
      energy: 5,
      emotionWords: ['平静'],
      phase: 'standalone',
    })
    const journal = storedJournalSchema.parse({
      ...common,
      recordType: 'journal',
      version: '20000000-0000-4000-8000-000000000002',
      title: '',
      body: 'A private reflection.',
      allowRetrieval: false,
      updatedAt: 100,
    })
    expect(decodeStoredReflection(checkin)).toEqual(checkin)
    expect(decodeStoredReflection(journal)).toEqual(journal)
    const concern = storedConcernSchema.parse({
      formatVersion: 1,
      id: '30000000-0000-4000-8000-000000000003',
      version: '40000000-0000-4000-8000-000000000004',
      recordType: 'concern',
      content: 'Something to revisit.',
      status: 'active',
      createdStamp: common.stamp,
      reminder: null,
      convertedJournalId: null,
      conversion: null,
      sourceSessionId: common.sourceSessionId,
      createdAt: common.createdAt,
      updatedAt: common.createdAt,
    })
    expect(decodeStoredReflection(concern)).toEqual(concern)
    const contemplation = storedContemplationSchema.parse({
      formatVersion: 1,
      id: '50000000-0000-4000-8000-000000000005',
      version: '60000000-0000-4000-8000-000000000006',
      recordType: 'contemplation',
      markdown: 'A private note.',
      status: 'draft',
      sourceSessionId: common.sourceSessionId,
      createdAt: common.createdAt,
      updatedAt: common.createdAt,
      confirmedAt: null,
    })
    expect(decodeStoredReflection(contemplation)).toEqual(contemplation)
    const proposal = storedPrincipleProposalSchema.parse({
      formatVersion: 1,
      id: '70000000-0000-4000-8000-000000000007',
      version: '80000000-0000-4000-8000-000000000008',
      recordType: 'principle-proposal',
      status: 'proposed',
      targetPrincipleId: null,
      targetVersion: null,
      content: principleContent,
      sourceContemplationId: contemplation.id,
      sourceSessionId: common.sourceSessionId,
      createdAt: 100,
      updatedAt: 100,
      rejectedAt: null,
    })
    expect(decodeStoredReflection(proposal)).toEqual(proposal)
    const principle = storedPrincipleSchema.parse({
      formatVersion: 1,
      id: '90000000-0000-4000-8000-000000000009',
      version: 'a0000000-0000-4000-8000-00000000000a',
      recordType: 'principle',
      status: 'trying',
      current: principleContent,
      versions: [{
        number: 1,
        content: principleContent,
        sourceProposalId: proposal.id,
        sourceContemplationId: contemplation.id,
        stamp: common.stamp,
        createdAt: 100,
      }],
      createdAt: 100,
      updatedAt: 100,
    })
    expect(decodeStoredReflection(principle)).toEqual(principle)
    expect(() => decodeStoredReflection({ recordType: 'unknown' })).toThrow("unknown Mind Garden reflection record type 'unknown'")
    expect(() => decodeStoredReflection({})).toThrow()
  })

  it('rejects malformed durable timestamps and strict extra fields', () => {
    expect(() => storedJournalSchema.parse({
      ...common,
      recordType: 'journal',
      version: '20000000-0000-4000-8000-000000000002',
      title: '',
      body: 'Reflection.',
      allowRetrieval: false,
      updatedAt: 99,
    })).toThrow('journal updatedAt precedes createdAt')
    expect(() => storedCheckinSchema.parse({
      ...common,
      recordType: 'checkin',
      mood: 0,
      energy: 3,
      emotionWords: [],
      phase: 'standalone',
      unexpected: true,
    })).toThrow()
  })

  it('rejects concern lifecycle states that cannot be recovered deterministically', () => {
    const base = {
      formatVersion: 1 as const,
      id: '30000000-0000-4000-8000-000000000003',
      version: '40000000-0000-4000-8000-000000000004',
      recordType: 'concern' as const,
      content: 'Something to revisit.',
      createdStamp: common.stamp,
      reminder: null,
      convertedJournalId: null,
      conversion: null,
      sourceSessionId: common.sourceSessionId,
      createdAt: common.createdAt,
      updatedAt: common.createdAt,
    }
    expect(() => storedConcernSchema.parse({ ...base, status: 'completed', reminder: common.stamp }))
      .toThrow('completed concern carries a reminder')
    expect(() => storedConcernSchema.parse({ ...base, status: 'converted' }))
      .toThrow('converted concern has an invalid journal link')
    expect(() => storedConcernSchema.parse({ ...base, status: 'converting' }))
      .toThrow('converting concern has an invalid recovery plan')
    expect(() => storedConcernSchema.parse({
      ...base,
      status: 'active',
      convertedJournalId: '50000000-0000-4000-8000-000000000005',
    })).toThrow('unconverted concern carries conversion state')
    expect(() => storedConcernSchema.parse({
      ...base,
      status: 'converting',
      conversion: {
        journalId: '50000000-0000-4000-8000-000000000005',
        journalVersion: '60000000-0000-4000-8000-000000000006',
        finalConcernVersion: '70000000-0000-4000-8000-000000000007',
        stamp: common.stamp,
        allowRetrieval: false,
        createdAt: 99,
      },
    })).toThrow('converting concern timestamps differ from its recovery plan')
    expect(() => storedConcernSchema.parse({
      ...base,
      status: 'converting',
      conversion: {
        journalId: '50000000-0000-4000-8000-000000000005',
        journalVersion: '60000000-0000-4000-8000-000000000006',
        finalConcernVersion: '70000000-0000-4000-8000-000000000007',
        stamp: { ...common.stamp, localDate: '2026-08-17' },
        allowRetrieval: false,
        createdAt: 100,
      },
    })).toThrow('concern conversion precedes its creation date')
    expect(() => storedConcernSchema.parse({
      ...base,
      status: 'active',
      reminder: { ...common.stamp, localDate: '2026-08-17' },
    })).toThrow('concern reminder precedes creation date')
    expect(() => storedConcernSchema.parse({ ...base, status: 'active', updatedAt: 99 }))
      .toThrow('concern updatedAt precedes createdAt')
  })

  it('rejects inconsistent contemplation lifecycle timestamps', () => {
    const base = {
      formatVersion: 1 as const,
      id: '50000000-0000-4000-8000-000000000005',
      version: '60000000-0000-4000-8000-000000000006',
      recordType: 'contemplation' as const,
      markdown: 'A private note.',
      sourceSessionId: common.sourceSessionId,
      createdAt: 100,
      updatedAt: 100,
      confirmedAt: null,
    }
    expect(() => storedContemplationSchema.parse({ ...base, status: 'draft', updatedAt: 99 }))
      .toThrow('contemplation updatedAt precedes createdAt')
    expect(() => storedContemplationSchema.parse({ ...base, status: 'draft', confirmedAt: 100 }))
      .toThrow('draft contemplation carries confirmation time')
    expect(() => storedContemplationSchema.parse({ ...base, status: 'confirmed' }))
      .toThrow('confirmed contemplation has invalid confirmation time')
    expect(() => storedContemplationSchema.parse({
      ...base, status: 'confirmed', updatedAt: 101, confirmedAt: 100,
    })).toThrow('confirmed contemplation has invalid confirmation time')
    expect(() => storedContemplationSchema.parse({
      ...base, status: 'confirmed', updatedAt: 99, confirmedAt: 99,
    })).toThrow('confirmed contemplation has invalid confirmation time')
  })

  it('rejects malformed principle histories and proposal decisions', () => {
    const version = {
      number: 1,
      content: principleContent,
      sourceProposalId: null,
      sourceContemplationId: null,
      stamp: common.stamp,
      createdAt: 100,
    }
    const principle = {
      formatVersion: 1 as const,
      id: '90000000-0000-4000-8000-000000000009',
      version: 'a0000000-0000-4000-8000-00000000000a',
      recordType: 'principle' as const,
      status: 'trying' as const,
      current: principleContent,
      versions: [version],
      createdAt: 100,
      updatedAt: 100,
    }
    expect(() => storedPrincipleSchema.parse({ ...principle, updatedAt: 99 }))
      .toThrow('principle updatedAt precedes createdAt')
    expect(() => storedPrincipleSchema.parse({ ...principle, versions: [{ ...version, number: 2 }] }))
      .toThrow('principle versions are not contiguous')
    expect(() => storedPrincipleSchema.parse({ ...principle, versions: [{ ...version, createdAt: 99 }] }))
      .toThrow('principle version timestamps are not monotonic')
    expect(() => storedPrincipleSchema.parse({
      ...principle,
      versions: [version, { ...version, number: 2, createdAt: 99 }],
    })).toThrow('principle version timestamps are not monotonic')
    expect(() => storedPrincipleSchema.parse({
      ...principle, current: { ...principleContent, expression: 'Different.' },
    })).toThrow('principle current state differs from its latest version')
    expect(() => storedPrincipleSchema.parse({
      ...principle, status: 'adopted',
    })).toThrow('principle current state differs from its latest version')
    expect(() => storedPrincipleSchema.parse({
      ...principle, updatedAt: 101,
    })).toThrow('principle current state differs from its latest version')

    const proposal = {
      formatVersion: 1 as const,
      id: '70000000-0000-4000-8000-000000000007',
      version: '80000000-0000-4000-8000-000000000008',
      recordType: 'principle-proposal' as const,
      status: 'proposed' as const,
      targetPrincipleId: null,
      targetVersion: null,
      content: principleContent,
      sourceContemplationId: '50000000-0000-4000-8000-000000000005',
      sourceSessionId: common.sourceSessionId,
      createdAt: 100,
      updatedAt: 100,
      rejectedAt: null,
    }
    expect(() => storedPrincipleProposalSchema.parse({ ...proposal, updatedAt: 99 }))
      .toThrow('principle proposal updatedAt precedes createdAt')
    expect(() => storedPrincipleProposalSchema.parse({
      ...proposal, targetPrincipleId: principle.id,
    })).toThrow('principle proposal target is incomplete')
    expect(() => storedPrincipleProposalSchema.parse({ ...proposal, rejectedAt: 100 }))
      .toThrow('open principle proposal carries rejection time')
    expect(() => storedPrincipleProposalSchema.parse({ ...proposal, status: 'rejected' }))
      .toThrow('rejected principle proposal has invalid rejection time')
    expect(() => storedPrincipleProposalSchema.parse({
      ...proposal, status: 'rejected', updatedAt: 101, rejectedAt: 99,
    })).toThrow('rejected principle proposal has invalid rejection time')
    expect(() => storedPrincipleProposalSchema.parse({
      ...proposal, status: 'rejected', updatedAt: 101, rejectedAt: 100,
    })).toThrow('rejected principle proposal has invalid rejection time')
  })

  it('rejects experiment histories that cannot be recovered deterministically', () => {
    const observation = {
      id: 'b0000000-0000-4000-8000-00000000000b',
      happened: '',
      action: 'Walk outside.',
      observation: 'I felt calmer.',
      mood: 4 as const,
      energy: null,
      stamp: common.stamp,
      createdAt: 101,
    }
    const base = {
      formatVersion: 1 as const,
      id: 'c0000000-0000-4000-8000-00000000000c',
      version: 'd0000000-0000-4000-8000-00000000000d',
      recordType: 'experiment' as const,
      title: 'Take a short walk',
      hypothesis: 'A small pause may make the afternoon feel lighter.',
      action: 'Walk outside for five minutes.',
      reviewStamp: null,
      status: 'observed' as const,
      result: observation.observation,
      judgment: '',
      sourceMessageId: null,
      evidenceQuote: '',
      observations: [observation],
      createdStamp: common.stamp,
      sourceSessionId: common.sourceSessionId,
      createdAt: 100,
      startedAt: 100,
      stoppedAt: null,
      updatedAt: 101,
    }
    const experiment = storedExperimentSchema.parse(base)
    expect(decodeStoredReflection(experiment)).toEqual(experiment)
    expect(() => storedExperimentSchema.parse({ ...base, updatedAt: 99 }))
      .toThrow('experiment updatedAt precedes createdAt')
    expect(() => storedExperimentSchema.parse({ ...base, sourceMessageId: 'message-1' }))
      .toThrow('experiment evidence source is incomplete')
    expect(() => storedExperimentSchema.parse({ ...base, evidenceQuote: 'I will walk.' }))
      .toThrow('experiment evidence source is incomplete')
    expect(() => storedExperimentSchema.parse({ ...base, startedAt: 99 }))
      .toThrow('experiment start precedes creation')
    expect(() => storedExperimentSchema.parse({
      ...base,
      observations: [observation, { ...observation, createdAt: 102 }],
      updatedAt: 102,
    })).toThrow('experiment observation ids are duplicated')
    expect(() => storedExperimentSchema.parse({
      ...base, observations: [{ ...observation, createdAt: 99 }],
    })).toThrow('experiment observation timestamps are invalid')
    expect(() => storedExperimentSchema.parse({
      ...base, observations: [{ ...observation, createdAt: 102 }],
    })).toThrow('experiment observation timestamps are invalid')
    expect(() => storedExperimentSchema.parse({
      ...base,
      observations: [observation, {
        ...observation,
        id: 'e0000000-0000-4000-8000-00000000000e',
        createdAt: 100,
      }],
    })).toThrow('experiment observation timestamps are invalid')
    expect(() => storedExperimentSchema.parse({
      ...base,
      status: 'proposed',
      result: '',
      observations: [],
      startedAt: 100,
      updatedAt: 100,
    })).toThrow('proposed experiment carries progress state')
    expect(() => storedExperimentSchema.parse({
      ...base, status: 'trying', observations: [], result: '', startedAt: null, updatedAt: 100,
    })).toThrow('trying experiment has invalid lifecycle state')
    expect(() => storedExperimentSchema.parse({ ...base, observations: [] }))
      .toThrow('observed experiment has invalid observation state')
    expect(() => storedExperimentSchema.parse({ ...base, result: 'Different.' }))
      .toThrow('observed experiment has invalid observation state')
    expect(() => storedExperimentSchema.parse({ ...base, reviewStamp: common.stamp }))
      .toThrow('observed experiment has invalid observation state')
    expect(() => storedExperimentSchema.parse({ ...base, status: 'revised' }))
      .toThrow('revised experiment has invalid judgment state')
    expect(() => storedExperimentSchema.parse({
      ...base, status: 'stopped', stoppedAt: null,
    })).toThrow('stopped experiment has invalid stop time')
    expect(() => storedExperimentSchema.parse({
      ...base, status: 'stopped', stoppedAt: 99, updatedAt: 99,
    })).toThrow('stopped experiment has invalid stop time')
    expect(() => storedExperimentSchema.parse({
      ...base, status: 'stopped', stoppedAt: 101, updatedAt: 102,
    })).toThrow('stopped experiment has invalid stop time')
    expect(() => storedExperimentSchema.parse({
      ...base, status: 'stopped', reviewStamp: common.stamp, stoppedAt: 101,
    })).toThrow('stopped experiment has invalid stop time')
    expect(() => storedExperimentSchema.parse({ ...base, stoppedAt: 101 }))
      .toThrow('active experiment carries stop time')
  })

  it('rejects open-question histories that cannot be recovered deterministically', () => {
    const firstTransition = {
      id: '10000000-0000-4000-8000-000000000001',
      status: 'open' as const,
      stamp: common.stamp,
      createdAt: 100,
    }
    const secondTransition = {
      id: '20000000-0000-4000-8000-000000000002',
      status: 'resolved' as const,
      stamp: { ...common.stamp, localDate: '2026-08-19' },
      createdAt: 101,
    }
    const base = {
      formatVersion: 1 as const,
      id: '30000000-0000-4000-8000-000000000003',
      version: '40000000-0000-4000-8000-000000000004',
      recordType: 'open-question' as const,
      question: 'What still needs observation?',
      status: 'resolved' as const,
      source: {
        kind: 'journal' as const,
        journalId: '50000000-0000-4000-8000-000000000005',
        journalVersion: '60000000-0000-4000-8000-000000000006',
        evidenceQuote: 'I am still unsure.',
      },
      transitions: [firstTransition, secondTransition],
      createdStamp: common.stamp,
      sourceSessionId: common.sourceSessionId,
      createdAt: 100,
      updatedAt: 101,
    }
    const question = storedOpenQuestionSchema.parse(base)
    expect(decodeStoredReflection(question)).toEqual(question)
    expect(() => storedOpenQuestionSchema.parse({ ...base, updatedAt: 99 }))
      .toThrow('open question updatedAt precedes createdAt')
    expect(() => storedOpenQuestionSchema.parse({
      ...base, transitions: [{ ...firstTransition, status: 'resolved' }], status: 'resolved', updatedAt: 100,
    })).toThrow('open question has invalid creation transition')
    expect(() => storedOpenQuestionSchema.parse({
      ...base, transitions: [{ ...firstTransition, stamp: secondTransition.stamp }], status: 'open', updatedAt: 100,
    })).toThrow('open question has invalid creation transition')
    expect(() => storedOpenQuestionSchema.parse({
      ...base, transitions: [firstTransition, { ...secondTransition, id: firstTransition.id }],
    })).toThrow('open question transition ids are duplicated')
    expect(() => storedOpenQuestionSchema.parse({
      ...base, transitions: [firstTransition, { ...secondTransition, createdAt: 99 }],
    })).toThrow('open question transition timestamps are not monotonic')
    expect(() => storedOpenQuestionSchema.parse({
      ...base, transitions: [firstTransition, { ...secondTransition, createdAt: 102 }],
    })).toThrow('open question transition timestamps are not monotonic')
    expect(() => storedOpenQuestionSchema.parse({
      ...base,
      transitions: [firstTransition, { ...secondTransition, status: 'open' }],
      status: 'open',
    })).toThrow('open question repeats a lifecycle transition')
    expect(() => storedOpenQuestionSchema.parse({ ...base, status: 'dismissed' }))
      .toThrow('open question status differs from its latest transition')
  })

  it('strictly validates period-review ranges, source ordering, and source dates', () => {
    const firstSource = {
      id: '10000000-0000-4000-8000-000000000001',
      sourceType: 'checkin' as const,
      fingerprint: 'a'.repeat(64),
      localDates: ['2026-08-18'],
    }
    const secondSource = {
      id: '20000000-0000-4000-8000-000000000002',
      sourceType: 'journal' as const,
      fingerprint: 'b'.repeat(64),
      localDates: ['2026-08-18', '2026-08-19'],
    }
    const base = {
      formatVersion: 1 as const,
      id: '30000000-0000-4000-8000-000000000003',
      version: '40000000-0000-4000-8000-000000000004',
      recordType: 'period-review' as const,
      periodType: 'week' as const,
      startStamp: common.stamp,
      endStamp: { ...common.stamp, localDate: '2026-08-20' },
      status: 'proposed' as const,
      content: 'A source-bound review.',
      sources: [firstSource, secondSource],
      sourceHash: 'c'.repeat(64),
      sourceSessionId: common.sourceSessionId,
      createdAt: 100,
      updatedAt: 100,
    }
    const review = storedPeriodReviewSchema.parse(base)
    expect(decodeStoredReflection(review)).toEqual(review)
    const legacySource = {
      id: '05000000-0000-4000-8000-000000000005',
      sourceType: 'legacy-original' as const,
      legacyType: 'journal',
      fingerprint: 'd'.repeat(64),
      localDates: ['2026-08-18'],
    }
    expect(storedPeriodReviewSchema.parse({ ...base, sources: [legacySource] }).sources)
      .toEqual([legacySource])
    expect(() => storedPeriodReviewSchema.parse({
      ...base,
      sources: [{ ...legacySource, legacyType: undefined }],
    })).toThrow()
    expect(() => storedPeriodReviewSchema.parse({ ...base, updatedAt: 99 }))
      .toThrow('period review updatedAt precedes createdAt')
    expect(() => storedPeriodReviewSchema.parse({
      ...base, startStamp: { ...common.stamp, localDate: '2026-08-21' },
    })).toThrow('period review date range is reversed')
    expect(() => storedPeriodReviewSchema.parse({
      ...base, endStamp: { ...base.endStamp, timeZone: 'UTC' },
    })).toThrow('period review range mixes time zones')
    expect(() => storedPeriodReviewSchema.parse({ ...base, sources: [firstSource, firstSource] }))
      .toThrow('period review sources are duplicated')
    expect(() => storedPeriodReviewSchema.parse({ ...base, sources: [secondSource, firstSource] }))
      .toThrow('period review sources are not ordered')
    expect(() => storedPeriodReviewSchema.parse({
      ...base,
      sources: [{ ...firstSource, localDates: ['2026-08-18', '2026-08-18'] }, secondSource],
    })).toThrow('period review source dates are duplicated')
    expect(() => storedPeriodReviewSchema.parse({
      ...base,
      sources: [{ ...firstSource, localDates: ['2026-08-19', '2026-08-18'] }, secondSource],
    })).toThrow('period review source dates are not ordered')
    expect(() => storedPeriodReviewSchema.parse({
      ...base,
      sources: [{ ...firstSource, localDates: ['2026-08-17'] }, secondSource],
    })).toThrow('period review source date is outside its range')
  })
})
