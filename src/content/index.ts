import type { Topic, TopicGroup } from '../types/content'
import { reactPatterns } from './react-patterns'
import { reactDeepDive } from './react-deepdive'
import { jsInternals } from './js-internals'
import { errorsDebugging } from './errors-debugging'
import { authFlows } from './auth-flows'
import { platform } from './platform'

/** Sidebar order = handbook reading order. */
export const GROUPS: TopicGroup[] = [
  reactPatterns,
  reactDeepDive,
  jsInternals,
  errorsDebugging,
  authFlows,
  platform,
]

/** Flat list of every topic, in reading order — used for Prev/Next. */
export const ALL_TOPICS: Topic[] = GROUPS.flatMap((g) => g.topics)

export interface TopicLocation {
  topic: Topic
  group: TopicGroup
  index: number
  prev?: Topic
  next?: Topic
}

const BY_SLUG = new Map<string, TopicLocation>()
ALL_TOPICS.forEach((topic, index) => {
  const group = GROUPS.find((g) => g.topics.includes(topic))!
  BY_SLUG.set(topic.slug, {
    topic,
    group,
    index,
    prev: ALL_TOPICS[index - 1],
    next: ALL_TOPICS[index + 1],
  })
})

export function findTopic(slug: string | undefined): TopicLocation | undefined {
  return slug ? BY_SLUG.get(slug) : undefined
}

/** First topic that actually has content — used for "Start reading". */
export const FIRST_TOPIC: Topic | undefined = ALL_TOPICS[0]
