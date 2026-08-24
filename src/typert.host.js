/** Combined Host Typert contribution for the installable single-package build. */

import { TYPERT as core } from '../packages/mind-garden/mind-garden-core/lib/typert.host.js'
import { TYPERT as media } from '../packages/mind-garden/mind-garden-media/lib/typert.host.js'
import { TYPERT as memory } from '../packages/mind-garden/mind-garden-memory/lib/typert.host.js'
import { TYPERT as portability } from '../packages/mind-garden/mind-garden-portability/lib/typert.host.js'
import { TYPERT as reflection } from '../packages/mind-garden/mind-garden-reflection/lib/typert.host.js'
import { TYPERT as starMap } from '../packages/mind-garden/mind-garden-star-map/lib/typert.host.js'

const contributions = [core, media, memory, portability, reflection, starMap]

export const TYPERT = {
  package: '@deepseek-ai/dsh-mind-garden',
  face: 'host',
  schemas: contributions.flatMap(contribution => contribution.schemas),
  invocations: contributions.flatMap(contribution => contribution.invocations),
  model: {
    services: contributions.flatMap(contribution => contribution.model.services),
    events: contributions.flatMap(contribution => contribution.model.events),
    objects: contributions.flatMap(contribution => contribution.model.objects),
  },
}
