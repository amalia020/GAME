/**
 * Tier-1 rule engine — pure, deterministic, €0 (no API). Scores a block
 * assembly against a level's rule spec: drives the live signal-strength meter
 * and decides which canned device response to show.
 *
 * pass = all required categories present, no forbidden, order satisfied.
 * signal (0–100) is the "how good is this combo" meter, charging as it improves.
 */
import type { Block, BlockCategory, RuleSpec } from '../content/schema';

export interface Score {
  signal: number;
  pass: boolean;
  /** key into level.botVariants — 'success' | 'forbidden' | 'missing:FORMAT' | 'order' | 'weak' */
  variantKey: string;
  missing: BlockCategory[];
  forbiddenPresent: BlockCategory[];
  orderOk: boolean;
}

/** Is `order` a subsequence of the assembled categories? */
function orderSatisfied(assembly: Block[], order?: BlockCategory[]): boolean {
  if (!order || order.length === 0) return true;
  let i = 0;
  for (const block of assembly) {
    if (block.category === order[i]) i++;
    if (i === order.length) return true;
  }
  return i === order.length;
}

export function scoreAssembly(assembly: Block[], rule: RuleSpec): Score {
  const present = new Set(assembly.map((b) => b.category));

  const missing = rule.required.filter((c) => !present.has(c));
  const forbiddenPresent = (rule.forbidden ?? []).filter((c) => present.has(c));
  const bonusPresent = (rule.bonus ?? []).filter((c) => present.has(c));
  const orderOk = orderSatisfied(assembly, rule.order);

  const reqTotal = rule.required.length || 1;
  const reqMet = rule.required.length - missing.length;

  let signal = (reqMet / reqTotal) * 80;
  signal += bonusPresent.length * 10;
  signal -= forbiddenPresent.length * 30;
  if (!orderOk) signal -= 20;
  signal = Math.max(0, Math.min(100, Math.round(signal)));

  const pass = missing.length === 0 && forbiddenPresent.length === 0 && orderOk;

  let variantKey: string;
  if (pass) variantKey = 'success';
  else if (forbiddenPresent.length > 0) variantKey = 'forbidden';
  else if (missing.length > 0) variantKey = `missing:${missing[0]}`;
  else if (!orderOk) variantKey = 'order';
  else variantKey = 'weak';

  return { signal, pass, variantKey, missing, forbiddenPresent, orderOk };
}

/** Pick the device response text for a score, with sensible fallbacks. */
export function responseFor(
  botVariants: Record<string, string>,
  score: Score,
): string {
  return (
    botVariants[score.variantKey] ??
    botVariants.weak ??
    botVariants.default ??
    '…input unclear.'
  );
}
