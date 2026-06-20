/**
 * Content schemas (Zod) — validated on load so a malformed level fails loudly
 * instead of silently breaking a classroom. Lives in `game` (not `shared`)
 * because Zod is a game dependency. Types are inferred from the schemas.
 */
import { z } from 'zod';

export const BLOCK_CATEGORIES = [
  'ROLE',
  'TASK',
  'CONTEXT',
  'FORMAT',
  'CONSTRAINT',
  'TONE',
] as const;

export const BlockCategorySchema = z.enum(BLOCK_CATEGORIES);
export type BlockCategory = z.infer<typeof BlockCategorySchema>;

export const BlockSchema = z.object({
  id: z.string(),
  category: BlockCategorySchema,
  text: z.string(),
});
export type Block = z.infer<typeof BlockSchema>;

export const RuleSpecSchema = z.object({
  /** categories that MUST be present to pass */
  required: z.array(BlockCategorySchema),
  /** categories that must NOT be present */
  forbidden: z.array(BlockCategorySchema).default([]),
  /** present → extra signal (not required) */
  bonus: z.array(BlockCategorySchema).default([]),
  /** optional required relative order (as a subsequence) */
  order: z.array(BlockCategorySchema).optional(),
});
export type RuleSpec = z.infer<typeof RuleSpecSchema>;

export const LevelSchema = z.object({
  id: z.string(),
  floor: z.number(),
  tier: z.number(),
  scene: z.string(),
  title: z.string(),
  learning_goal_id: z.string(),
  mechanic: z.literal('block-assembly'),
  /** the in-fiction puzzle instruction shown to the player */
  prompt: z.string(),
  /** the device the player is prompting (e.g. "DOOR PANEL") */
  target: z.string(),
  /** the tray of available blocks */
  blocks: z.array(BlockSchema),
  rule: RuleSpecSchema,
  /** canned device responses keyed by variantKey (e.g. success, missing:FORMAT) */
  botVariants: z.record(z.string()),
  dialogue: z.object({
    enter: z.string(),
    success: z.string(),
    fail: z.string(),
  }),
  reward: z.object({ xp: z.number() }),
});
export type Level = z.infer<typeof LevelSchema>;
