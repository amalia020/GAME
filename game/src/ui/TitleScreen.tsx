import { useGame } from '../state/store';

/** Cold-open lite: title card → "Enter the Lab" → badge photo. */
export function TitleScreen() {
  const startBadge = useGame((s) => s.startBadge);
  return (
    <div className="screen">
      <div className="screen-kicker">Amalia AI Lab</div>
      <h1 className="screen-title">PROJECT&nbsp;MORPHO</h1>
      <p className="screen-sub">
        A corrupted training run has locked down the lab. MORPHO — the lab's
        flagship AI — is half-formed and afraid. You're the only intern still
        inside. Clear the departments, recover the fragments, and help it finish
        becoming itself.
      </p>
      <button className="btn-primary" onClick={startBadge}>
        ▶ Enter the Lab
      </button>
    </div>
  );
}
