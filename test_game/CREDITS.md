---
noteId: "3d2ffcb0809a11f18ecab983a964deaa"
tags: []

---

# Third-party assets — credits & licenses (IP audit)

Every 3D model / texture bundled in `test_game/public/models/` is listed here with
its source and license, so it can be verified that **no proprietary / stolen IP** is
used. Everything below is **CC0** (public domain, no attribution required) unless
explicitly flagged. Placeholders will be replaced by MORPHO's own original art later.

_Last updated: 2026-07-16 (overnight facelift, milestone M1)._

## Characters — KayKit "Character Pack: Adventurers"
- Files: `public/models/kits/characters/Mage.glb`, `Knight.glb`, `Rogue.glb`,
  `Rogue_Hooded.glb`, `Barbarian.glb`
- Author: **Kay Lousberg (KayKit)** · License: **CC0**
- Source: https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0
- Also on itch.io: https://kaylousberg.itch.io/kaykit-adventurers
- Use: player character (Mage) + NPC placeholders. Weapons hidden at runtime.

## Characters (NPCs) — KayKit "Character Pack: Skeletons"
- Files: `public/models/kits/characters/Skeleton_Warrior.glb`, `Skeleton_Mage.glb`,
  `Skeleton_Rogue.glb`, `Skeleton_Minion.glb`
- Author: **Kay Lousberg (KayKit)** · License: **CC0**
- Source: https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Skeletons-1.0
- Use: NPC variety for the challenge houses (same clip names / rig as Adventurers).

## Buildings — KayKit "City Builder Bits"
- Files: `public/models/kits/buildings/building_A..H.gltf` (+ `.bin`) + `citybits_texture.png`
- Author: **Kay Lousberg (KayKit)** · License: **CC0**
- Source: https://github.com/KayKit-Game-Assets/KayKit-City-Builder-Bits-1.0
- Use: the town's houses (1 main house + 7 challenge houses).

## Interior furniture — KayKit "Furniture Bits"
- Files: `public/models/kits/interior/*.gltf` (+ `.bin`) + `furniturebits_texture.png`
  (armchair, bed_single_A, book_set, cabinet_medium, chair_A, chair_A_wood,
  chair_stool, couch, couch_pillows, lamp_standing, lamp_table, pictureframe_large_A,
  rug_oval_A, rug_rectangle_A, shelf_A_big, table_low, table_medium)
- Author: **Kay Lousberg (KayKit)** · License: **CC0**
- Source: https://github.com/KayKit-Game-Assets/KayKit-Furniture-Bits-1.0
- Use: furnishing the walk-in house interiors.

## Nature / foliage — Quaternius "Ultimate Stylized Nature Pack"
- Files: `public/models/kits/nature/*.glb` (birch-trees, bushes, dead-trees-a/b,
  flower-bushes, flowers, grass, maple-trees, palm-trees, pine-trees, rocks, trees)
- Author: **Quaternius** · License: **CC0**
- Source: https://quaternius.com/packs/ultimatestylizednature.html · https://poly.pizza/
- Use: trees, bushes, rocks scattered around the town.

## three.js example models (placeholders — being phased out)
- Files: `public/models/RobotExpressive.glb`, `Soldier.glb`
- `RobotExpressive.glb` — by Tomás Laulhé, modified by Don McCurdy. License: **CC0**.
- `Soldier.glb` — three.js example. License: **needs verification** → flagged for
  removal; **currently unused** in the game (no rig references it).
- Source: https://github.com/mrdoob/three.js (examples/models/gltf)
- Note: RobotExpressive was the original placeholder character, now replaced by the
  KayKit Mage. Both are unused and can be deleted in cleanup.

---
**Summary:** all actively-used assets are CC0 by KayKit (Kay Lousberg) and Quaternius.
The only non-CC0-verified file (`Soldier.glb`) is unused and slated for removal.
