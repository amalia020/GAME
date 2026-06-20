import { useGame } from '../state/store';

/** The one character for now (badge picker parked until the world looks great). */
const ONLY_INTERN = 0;

/** Cold-open lite: title card → "Enter the Lab" → straight into the world. */
export function TitleScreen() {
  const pickIntern = useGame((s) => s.pickIntern);
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
      <button className="btn-primary" onClick={() => pickIntern(ONLY_INTERN)}>
        ▶ Enter the Lab
      </button>
    </div>
  );
}
