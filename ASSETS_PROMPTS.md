# Navegador Galáctico — Guía de Assets e Image Prompts

Documento maestro. Cubre todos los assets visuales necesarios: cartas, naves, tripulación, reliquias, pantallas, UI, iconos. Cada entrada incluye tamaño, formato y prompt exacto listo para generación con Midjourney / DALL-E / Stable Diffusion.

---

## Estilo Global (base de todos los prompts)

Todos los assets comparten esta dirección de arte. Añadir al final de cualquier prompt de este documento si se necesita reforzar la consistencia:

> **Style suffix (añadir a todo prompt):**
> `dark sci-fi space opera, digital painting, dramatic cinematic lighting, deep space background with nebulae and stars, rich jewel-tone color palette, painterly detail, Slay the Spire card game aesthetic, FTL Faster Than Light art style, 4k resolution`

**Paleta de colores por facción:**
| Facción | Color dominante |
|---|---|
| Neutral | Cyan / azul acero |
| Militar | Rojo / naranja |
| Mercenarios | Amarillo dorado |
| Tecno-Gremio | Verde lima / circuito |
| Hacktivistas | Púrpura neón |
| Academia | Azul cobalto / blanco |
| Comerciante | Dorado / marrón cálido |
| Sombras | Negro / índigo |

**Paleta por rareza de carta:**
| Rareza | Marco / borde |
|---|---|
| Inicial | Gris metálico |
| Common | Blanco / plata |
| Uncommon | Verde esmeralda |
| Rare | Azul zafiro |
| Curse | Rojo sangre / corrupción |
| Boss / Event | Dorado |

---

## 1. NAVES JUGADORAS

**Formato:** PNG con transparencia, fondo neutro oscuro para uso como sprite de mapa y pantalla de hangar.

### Nave completa (pantalla Hangar / Selección)
- Tamaño: **640 × 400 px** landscape
- Vista: 3/4 frontal-lateral, ligeramente elevada
- Sin fondo (PNG transparente o fondo oscuro de espacio profundo)

### Token de mapa (GalacticMap)
- Tamaño: **64 × 64 px**
- Vista: top-down o 3/4 estilizada, icónica, legible a tamaño pequeño

---

### 1.1 El Puño de Hierro (`IRON_FIST`)
**Facción:** Militar | **Dificultad:** ★★☆☆☆

**Descripción:** Nave de combate pesado. Acorazado masivo, angular, blindaje grueso, sin elegancia — pura funcionalidad marcial. Cañones principales prominentes.

**Prompt hangar:**
```
A massive military combat starship called "Iron Fist", heavy armor plating with angular geometry, large visible cannons on both sides, battle-scarred hull with rivet details and warning markings, red and gunmetal grey color scheme, glowing thruster exhausts in orange, floating in deep space, 3/4 front view, dramatic lighting from below, sci-fi space opera digital painting, dark background with faint nebula, FTL Faster Than Light aesthetic, 4k
```

**Prompt token (64px):**
```
Top-down view of a small heavily armored military spaceship, red and grey color, simple iconic silhouette readable at 64px, dark background, minimal detail, flat shading with glow outline
```

---

### 1.2 El Mercader Errante (`MERCHANT`)
**Facción:** Comerciante | **Dificultad:** ★☆☆☆☆

**Descripción:** Nave comercial mediana, algo desgastada, con compartimentos de carga visibles, antenas de comunicación largas, aspecto funcional pero no amenazante. Tonos dorados y marrones.

**Prompt hangar:**
```
A mid-size merchant cargo starship called "Wandering Merchant", visible cargo holds and docking clamps, multiple communication antennae, worn golden and brown hull with trade guild markings, modest but spacious frame, solar panels visible, 3/4 front view, soft warm lighting from star behind, deep space background, sci-fi space opera digital painting, FTL aesthetic, 4k
```

**Prompt token (64px):**
```
Top-down view of a merchant cargo spaceship with visible cargo bays, golden-brown colors, simple iconic silhouette, dark background, small scale legible icon
```

---

### 1.3 El Espectro Silencioso (`SPECTRE`)
**Facción:** Sombras | **Dificultad:** ★★★☆☆

**Descripción:** Nave stealth elegante y delgada. Superficie absorbente de radar, bordes afilados como cuchilla, sin luces exteriores excepto propulsores mínimos. Diseño inquietante, casi invisible en el espacio.

**Prompt hangar:**
```
A sleek stealth spaceship called "Silent Spectre", razor-thin profile, matte black radar-absorbing hull, no external lights except faint indigo thruster glow, angular blade-like wing panels, ghost-like translucent shimmer effect on hull edges, 3/4 front view, near-invisible in dark space background, mysterious dramatic lighting, sci-fi space opera digital painting, FTL aesthetic, 4k
```

**Prompt token (64px):**
```
Top-down view of a stealth spaceship, slim blade-like profile, matte black with indigo glow edges, iconic silhouette, dark background, minimal
```

---

## 2. ENEMIGOS — REGULARES

**Formato:** PNG, tamaño **400 × 300 px** landscape, fondo oscuro semitransparente. Estilo amenazante pero distinguible del jugador.

---

### 2.1 Incursor Pirata (`PIRATE_RAIDER`)
HP: 20 | Escudo: 10 | Daño: 5

**Descripción:** Nave pirata pequeña y rápida, reparada con piezas de chatarra, pinturas rojas y calaveras. Aspecto caótico y amenazante.

**Prompt:**
```
A small pirate raider spaceship, patchwork hull assembled from salvaged parts, skull and crossbones painted in red on the side, jagged irregular silhouette, crude weapon mounts, aggressive forward-leaning posture, glowing red thrusters, space background, sci-fi digital painting, FTL aesthetic, 400x300px
```

---

### 2.2 Dron Pesado (`HEAVY_DRONE`)
HP: 30 | Escudo: 5 | Daño: 7

**Descripción:** Dron de combate autónomo, cuerpo esférico-hexagonal metálico, sin tripulación, ojos de sensor rojos, brazos articulados con cañones.

**Prompt:**
```
A heavy combat drone in space, spherical metallic chassis with hexagonal plating, no cockpit — fully autonomous, glowing red sensor eyes, articulated weapon arms with twin cannons, industrial grey and black color, menacing floating stance, damaged surface with sparks, sci-fi digital painting, dark space background, 400x300px
```

---

### 2.3 Nave Carroñera (`SCAVENGER_SHIP`)
HP: 25 | Escudo: 8 | Daño: 6

**Descripción:** Nave construida con despojos de otras naves derrotadas. Asimétrica, piezas de diferentes colores ensambladas, ganchos de abordaje visibles.

**Prompt:**
```
A scavenger spaceship made of mismatched salvaged parts from different ships, asymmetrical bulky design, grappling hooks visible on the hull, patchwork metal plating in multiple rust and grey tones, jury-rigged weapons, industrial feel, floating debris nearby, dark space background, sci-fi digital painting, FTL aesthetic, 400x300px
```

---

### 2.4 Fragata Patrullera (`PATROL_FRIGATE`)
HP: 35 | Escudo: 15 | Daño: 6

**Descripción:** Fragata militar de patrulla, diseño limpio y oficial, emblemas de la Hegemonía, color azul marino y blanco, sistemas de escudo visibles.

**Prompt:**
```
A military patrol frigate spaceship, clean official design with Hegemony authority markings, navy blue and white hull, visible shield generator pods on the sides, twin engine nacelles with blue glow, orderly weapon hardpoints, authoritative military presence, deep space background, sci-fi digital painting, FTL aesthetic, 400x300px
```

---

## 3. MINI-BOSS

**Formato:** PNG **480 × 320 px**, iluminación más dramática que regulares, color más saturado.

---

### 3.1 Corbeta de Élite (`MINIBOSS_CORVETTE`)
HP: 50 | Escudo: 25 | Daño: 8

**Descripción:** Corbeta de élite, más grande que una fragata, diseño estilizado y agresivo, colores púrpura y oscuro con acentos dorados, claramente más peligrosa que los enemigos regulares.

**Prompt:**
```
An elite corvette warship, larger and more imposing than a standard frigate, sleek aggressive design with swept-back wing panels, deep purple and black hull with gold trim markings, multiple visible cannon mounts, glowing energy shield aura, dramatic underlighting in gold and purple, ominous presence in dark space, mini-boss feel, sci-fi digital painting, FTL Faster Than Light aesthetic, 480x320px
```

---

## 4. ENEMIGOS — ÉLITES (recompensa reliquia garantizada)

**Formato:** PNG **480 × 320 px**, deben verse notablemente más amenazantes que enemigos regulares.

---

### 4.1 Merodeador de Élite (`ELITE_MARAUDER`)
HP: 45 | Escudo: 15 | Daño: 10

**Descripción:** Nave pirata élite, mucho más grande que el Incursor, blindaje reforzado, múltiples cañones, pinturas tribales de guerra.

**Prompt:**
```
An elite marauder warship, heavily armored and significantly larger than a basic raider, brutal aggressive design, reinforced battle-scarred hull with war paint tribal markings in red and bone-white, multiple heavy cannon mounts glowing with charge, elite pirate captain's vessel, intimidating silhouette, neon-lit weapon systems, deep space background, sci-fi digital painting, boss-level presence, 480x320px
```

---

### 4.2 Nave de Guerra Élite (`ELITE_WARSHIP`)
HP: 60 | Escudo: 20 | Daño: 12

**Descripción:** Nave de guerra de clase destructora, diseño militar superior, colores azul acero oscuro, sistemas de armas múltiples, claramente una amenaza de alto rango.

**Prompt:**
```
An elite military warship, destroyer-class vessel with superior military design, dark steel-blue and black hull with glowing weapon banks, multiple turret emplacements along the hull, massive engine array in the rear with blue-white exhaust, visible shield generator dome, authoritative and deadly presence, dramatic side lighting, elite military rank insignia, deep space background, sci-fi digital painting, FTL aesthetic, 480x320px
```

---

## 5. BOSSES (fin de cada sector)

**Formato:** PNG **640 × 400 px**. Deben dominar visualmente la pantalla. Iluminación de escena dramática. Partículas de energía o efectos especiales.

---

### 5.1 Destructor de la Hegemonía (`BOSS_HEGEMONY_DESTROYER`) — Sector 1
HP: 90 | Escudo: 30 | Daño: 15

**Descripción:** Destructor capital de la Hegemonía. Masivo, imponente, diseño gubernamental oficial pero abrumador. Colores azul imperial y dorado. Armas múltiples cargadas. Jefe del Sector 1.

**Prompt:**
```
A massive Hegemony Destroyer capital ship, boss-level threat, enormous imposing silhouette filling the frame, imperial blue and gold color scheme, massive primary weapon batteries glowing with charge energy, multiple shield projectors active with shimmering blue aura, official military insignia and authority markings, dramatic backlit by a dying star, particle effects and energy discharge around hull, cinematic wide shot, sci-fi space opera digital painting, boss fight atmosphere, FTL aesthetic, 640x400px
```

---

### 5.2 Dreadnought Pirata (`BOSS_PIRATE_DREADNOUGHT`) — Sector 2
HP: 115 | Escudo: 25 | Daño: 18

**Descripción:** Dreadnought pirata descomunal, ensamblado a lo largo de décadas con partes robadas de cientos de naves. Reactor nuclear visible. Caótico y brutal. Jefe del Sector 2.

**Prompt:**
```
A colossal pirate dreadnought boss ship, assembled over decades from hundreds of looted vessels, massive chaotic patchwork hull of different metals and colors, nuclear reactor core visible and glowing dangerously in the center, enormous mismatched weapon batteries, skull and crossbones flag visible, sparks and plasma venting from damaged sections, surrounded by debris field of past victims, terrifying scale dwarfing any other ship, dramatic red and orange glow from reactor, sci-fi digital painting, boss fight atmosphere, 640x400px
```

---

### 5.3 Nexo IA Autónomo (`BOSS_AI_NEXUS`) — Sector 3 (FINAL)
HP: 135 | Escudo: 35 | Daño: 20

**Descripción:** Entidad de inteligencia artificial que ha tomado control de una estación-nave. Diseño alienígena y geométrico, no construido por humanos. Pulpos de cables y antenas. Núcleo de IA brillante en el centro. Jefe final del juego.

**Prompt:**
```
An autonomous AI Nexus final boss, a massive alien-geometry station-ship controlled by rogue artificial intelligence, non-human design with perfect geometric symmetry, crystalline neural network structures visible, pulsating central AI core of blinding white-blue light, hundreds of sensor antennae and data cables extending like tentacles, reality-distorting energy field surrounding it, purple and white color scheme with electric arcs, cosmic horror scale, the final enemy of the galaxy, sci-fi digital painting, cinematic final boss atmosphere, nebula background, 640x400px
```

---

## 6. TRIPULACIÓN — RETRATOS

**Formato:** PNG **256 × 256 px**, encuadre busto/retrato. Fondo: panel de nave levemente visible. Estilo semi-realista, expresión definida.

**Style base para todos:**
> `sci-fi character portrait bust shot, space opera aesthetic, dramatic face lighting, dark interior of spaceship visible in background, digital painting, detailed, expressive`

---

### 6.1 Tripulante Novato (`CREW_TRIPULANTE_NOVATO`)
Facción: Neutral | Subtype: Base

**Prompt:**
```
Portrait of a young nervous spaceship crew recruit, androgynous appearance, wearing a basic grey crew uniform with no rank insignia, wide uncertain eyes, slightly disheveled hair, holding a datapad, dim blue lighting of a ship interior, sci-fi character portrait, digital painting, 256x256px
```

---

### 6.2 Kaelen, Ingeniero (`CREW_KAELEN_INGENIERO`)
Facción: Tecno-Gremio | Subtype: Ingeniero

**Prompt:**
```
Portrait of Kaelen, a weathered middle-aged human engineer, gender neutral presentation, wearing a worn Tech-Guild jumpsuit with tool belt, grease smudges on face and hands, goggles pushed up on forehead, confident competent expression, green circuit-board tattoo on neck, spaceship engine compartment behind them with warm orange glow, sci-fi character portrait, digital painting, 256x256px
```

---

### 6.3 Zara, Artillera (`CREW_ZARA_ARTILLERA`)
Facción: Mercenarios | Subtype: Artillero

**Prompt:**
```
Portrait of Zara, a fierce female mercenary gunner, athletic build, short cropped dark hair with a red streak, wearing mercenary armor with targeting monocle over one eye, battle-scarred face with confident dangerous expression, ammunition bandolier visible, warm orange-red lighting from weapon systems behind her, sci-fi character portrait, digital painting, 256x256px
```

---

### 6.4 Glitch, Saboteador (`CREW_GLITCH_SABOTEADOR`)
Facción: Hacktivistas | Subtype: Saboteador

**Prompt:**
```
Portrait of Glitch, a genderless hacktivist saboteur, cybernetic implants over one eye glowing purple, short wild hair dyed in electric blue and purple, wearing dark tactical gear with glowing circuit patterns, sly mischievous smirk, holding a hacking device, purple neon lighting from holographic screens behind, sci-fi character portrait, digital painting, 256x256px
```

---

### 6.5 Dr. Aris Thorn (`CREW_DR_ARIS_THORN`)
Facción: Academia | Subtype: Científico

**Prompt:**
```
Portrait of Dr. Aris Thorn, a calm scholarly scientist in their 40s, slim build, wearing an Academia research coat with medical cross insignia, round spectacles, gentle reassuring expression, medical scanner in one hand, clean white and blue lighting of a medbay behind them, sci-fi character portrait, digital painting, 256x256px
```

---

### 6.6 Capitana Vex (`CREW_CAPITANA_VEX`)
Facción: Mercenarios | Subtype: Comandante

**Prompt:**
```
Portrait of Captain Vex, an imposing female mercenary commander, strong authoritative presence, wearing a modified captain's coat with mercenary rank patches, silver short hair, one cybernetic arm partially visible, commanding intense gaze, standing on a ship bridge with holographic tactical displays behind, sci-fi character portrait, digital painting, 256x256px
```

---

### 6.7 Zyx, Comerciante (`CREW_ZYX_COMERCIANTE`)
Facción: Comerciante | Subtype: Comerciante

**Prompt:**
```
Portrait of Zyx, an alien-human hybrid merchant, unusual skin tone (pale green or lavender), wide friendly eyes, wearing an elaborate merchant's vest with many pockets and gemstone decorations, charming salesperson smile, holding a credit chip, warm golden market lighting behind them, sci-fi character portrait, digital painting, 256x256px
```

---

### 6.8 Echo, Piloto A (`CREW_ECHO_PILOTO`)
Facción: Neutral | Subtype: Piloto

**Prompt:**
```
Portrait of Echo, an ace fighter pilot, young non-binary human, wearing a pilot helmet pushed back, reflective visor up, flight suit with wing insignia, confident fearless grin, pilot seat and ship cockpit displays visible behind, blue-white thruster glow through canopy, sci-fi character portrait, digital painting, 256x256px
```

---

### 6.9 Nyx, Psíquica (`CREW_NYX_PSIQUICA`)
Facción: Academia | Subtype: Psíquico

**Prompt:**
```
Portrait of Nyx, a mysterious telepathic psychic, ethereal androgynous appearance, glowing silver-white eyes without pupils, floating hair suggesting telekinetic force, wearing Academia robes with glowing rune patterns, third eye mark on forehead faintly glowing, cosmic nebula visible through porthole behind them, sci-fi character portrait, digital painting, 256x256px
```

---

## 7. ARTE DE CARTAS

**Formato:** PNG **340 × 200 px** (zona de ilustración dentro del frame de carta). Fondo de escena espacial o interior de nave. Sin texto — el texto lo pone el engine.

**Categorías por tipo:**
- **Attack** → escenas de combate, disparos, explosiones
- **Skill** → acción técnica, maniobra, habilidad
- **Crew** → retrato de tripulante (ver sección 6)
- **Curse** → corrupción, oscuridad, maldición

---

### 7.A — CARTAS INICIALES

#### Disparo Básico (`BASE_DISPARO01`)
```
A spaceship firing a single bright blue energy bolt cannon shot in the vacuum of space, beam of light traveling toward an enemy silhouette, motion blur on projectile, deep space background, dramatic lighting, sci-fi card art illustration, 340x200px
```

#### Maniobra Rápida (`BASE_MANIOBRA01`)
```
A spaceship performing a sharp evasive maneuver, banking hard to the side with thruster burn streaks, stars as motion blur lines in background, dynamic action composition, cool blue and white tones, sci-fi card art illustration, 340x200px
```

#### Operaciones Novato (`BASE_OPERACIONES01`)
```
Interior of a spaceship operations room, a nervous crew member pressing buttons at a console, holographic credit symbol appearing on screen, dim warm console lighting, sci-fi card art illustration, 340x200px
```

---

### 7.B — ARQUETIPO QUEMADOR 🔥

**Visual base:** Fuego naranja-rojo en espacio negro. Plasma. Incendio de naves.

#### Salva Incendiaria (`ATTACK_INCENDIARY_SALVO`)
```
Two bright incendiary plasma bolts fired simultaneously from a spaceship, orange and red fire trails, enemy ship igniting on impact, flames spreading in zero gravity in impossible beautiful patterns, dark space, sci-fi card art illustration, 340x200px
```

#### Piroclasmo (`ATTACK_PYROCLASM`)
```
A massive pyroclastic plasma cannon blast erupting from a ship weapon, enormous orange fireball spreading outward in space, intense heat distortion visible, enemy hull glowing red-hot on impact, dark space background, epic scale, sci-fi card art illustration, 340x200px
```

#### Rayo Sobrecargado (`ATTACK_OVERHEATING_BEAM`)
```
An overheating energy beam weapon firing a bright white-purple laser, beam edge crackling with plasma leakage electricity, ship weapon barrel visibly glowing and overheating, target ship smoking, sci-fi card art illustration, 340x200px
```

#### Ignición en Cascada (`SKILL_CASCADE_IGNITION`)
```
A spaceship activating a cascade ignition system, flames spreading in a chain across an enemy hull from multiple ignition points, orange fire in zero gravity breaking into floating spheres, dramatic macro view, sci-fi card art illustration, 340x200px
```

#### Lanza de Plasma (`ATTACK_PLASMA_LANCE`)
```
A long coherent plasma lance beam weapon firing twice in rapid succession, bright magenta and orange plasma beam piercing through enemy shields with visible shield ripple effect, high energy dramatic composition, sci-fi card art illustration, 340x200px
```

#### Falla de Disipadores (`SKILL_HEAT_SINK_FAILURE`)
```
A spaceship's heat dissipation system catastrophically failing, coolant venting in white steam, heat sinks glowing red-hot, enemy ship's thermal systems erupting in cascading fires, mechanical failure aesthetic, sci-fi card art illustration, 340x200px
```

#### Bombardeo Volcánico (`ATTACK_VOLCANIC_BARRAGE`)
```
A ship firing three simultaneous heavy incendiary missiles in a spread pattern, missiles leaving bright orange fire trails like a volcanic eruption in space, massive explosions on impact, overwhelming firepower, sci-fi card art illustration, 340x200px
```

#### Maldición: Hemorragia de Plasma (`CURSE_PLASMA_BLEED`)
```
A cracked plasma conduit leaking glowing purple-red plasma inside a ship corridor, ominous corruption glow, damaged hull with dark curse energy seeping through cracks, sinister red vignette, curse card art, sci-fi illustration, 340x200px
```

---

### 7.C — ARQUETIPO FORTALEZA 🛡️

**Visual base:** Escudos azules, blindaje, reparación, estructura.

#### Blindaje Reforzado (`SKILL_BULWARK_PLATING`)
```
A spaceship's hull receiving an emergency plating upgrade, thick reinforced armor sheets sliding into place magnetically, glowing blue shield shimmer activating over the new plates, cool blue and steel tones, defensive fortress aesthetic, sci-fi card art illustration, 340x200px
```

#### Mamparo Reforzado (`SKILL_REINFORCED_BULKHEAD`)
```
The interior of a spaceship with massive reinforced bulkhead doors closing to protect critical sections, thick metal plating with glowing energy-lock seals, crew members visible securing the area, blue emergency lighting, RETAIN keyword feel, sci-fi card art illustration, 340x200px
```

#### Parche de Emergencia (`SKILL_EMERGENCY_PATCH`)
```
A mechanical arm deploying emergency hull patch foam and nano-repair modules on a damaged ship exterior, cracks sealing with glowing orange nanite material, hull integrity restoring in real time, space visible through cracks closing, sci-fi card art illustration, 340x200px
```

#### Protocolo Fantasma (`SKILL_GHOST_PROTOCOL`)
```
A spaceship activating a stealth cloaking device, hull shimmer becoming translucent and nearly invisible against space, ghost-like translucency effect showing stars through the hull, enemy targeting reticle losing lock, blue-white phase effect, sci-fi card art illustration, 340x200px
```

#### Barrera Cinética (`SKILL_KINETIC_BARRIER`)
```
A powerful kinetic energy barrier activating around a spaceship, bright electric blue force field dome crackling with lightning, visible wave distortion, debris and laser bolts deflecting off the barrier surface, maximum shield energy, sci-fi card art illustration, 340x200px
```

#### Embestida de Escudos (`ATTACK_SHIELD_BASH`)
```
A spaceship using its own shield energy as a weapon, bright blue shield charge concentrating at the prow, ramming at enemy with a shockwave of shield energy discharge on impact, shield and collision physics visible, sci-fi card art illustration, 340x200px
```

#### Campo de Regeneración (`SKILL_REGENERATION_FIELD`)
```
A healing regeneration field washing over a damaged spaceship hull, cracks and dents visibly sealing themselves with warm golden-green nanite light, soothing glow against dark space, hull integrity reading 100%, sci-fi card art illustration, 340x200px
```

---

### 7.D — ARQUETIPO SABOTAJE 🔧

**Visual base:** Hacking, circuitos, interferencia, daño a sistemas.

#### Hackeo de Sistemas (`SKILL_SYSTEM_HACK`)
```
A holographic virus code breaking into an enemy ship's computer system, streams of green code corrupting red enemy system displays, a hacker's hands visible at a terminal, digital interference aesthetic, green and black matrix tones, sci-fi card art illustration, 340x200px
```

#### Pulso Disruptor (`SKILL_DISRUPTOR_PULSE`)
```
An EMP pulse disruptor wave emanating from a ship, circular electromagnetic shockwave visible disrupting enemy shields, enemy ship's shield flickering and glitching with purple static interference, cold purple and electric tones, sci-fi card art illustration, 340x200px
```

#### Salva de Precisión (`ATTACK_PRECISION_VOLLEY`)
```
Four highly precise laser bolts fired in perfect sequential formation, each targeting specific weak points on enemy hull in rapid succession, targeting reticle overlay visible, teal and white laser beams, clinical precision aesthetic, sci-fi card art illustration, 340x200px
```

#### Marcador Láser (`SKILL_TARGET_PAINTER`)
```
A laser targeting designator painting weak points on enemy hull in red, multiple targeting markers appearing on enemy ship's critical systems, scanning beam in red-orange, strategic overhead perspective, sci-fi card art illustration, 340x200px
```

#### Golpe Saboteador (`ATTACK_SABOTAGE_STRIKE`)
```
A single precise sabotage strike hitting enemy systems, impact creating both structural breach cracks and visible overheating sparks at the impact point, dual damage effects visible, one targeted devastating hit, sci-fi card art illustration, 340x200px
```

#### Virus de Sobrecarga (`SKILL_OVERLOAD_VIRUS`)
```
An overload virus injection causing multiple enemy ship systems to simultaneously overload, hull breaches forming at stress points, heat sinks exploding, ship visibly straining against cascading system failures, chaos of damage, sci-fi card art illustration, 340x200px
```

#### Descarga en Cadena (`ATTACK_CHAIN_DISCHARGE`)
```
Three chain-lightning electric discharge bolts connecting from ship to enemy in rapid succession, electric arcs jumping between hull contact points, ETHEREAL keyword visualized as the bolts fading ethereally after firing, electric blue and white, sci-fi card art illustration, 340x200px
```

---

### 7.E — ARQUETIPO OPORTUNISTA ✦

#### Descarga de Carga (`SKILL_CARGO_DUMP`)
```
A cargo ship dumping two emergency supply canisters that transform into data streams being absorbed into ship computers, drawing two cards visualized as data packets, utilitarian practical aesthetic, warm gold lighting, sci-fi card art illustration, 340x200px
```

#### Batería Cuántica (`SKILL_QUANTUM_BATTERY`)
```
A quantum energy battery cell activating with impossible brightness, energy surging through ship power conduits in electric blue waves, energy meters spiking to maximum, two energy orbs materializing, sci-fi card art illustration, 340x200px
```

#### Redirección de Combustible (`SKILL_FUEL_REROUTE`)
```
Fuel conduits being physically rerouted in a ship engine room, glowing energy diverted from engines to weapon systems, technician's hands at the controls, orange-gold energy flowing through transparent pipes, sci-fi card art illustration, 340x200px
```

#### Maldición: Peso Muerto (`CURSE_DEAD_WEIGHT`)
```
A broken useless piece of cargo floating dead and inert in a ship corridor, ETHEREAL curse aura making it ghostly and fading, dark oppressive shadow, curse energy seeping from it like black smoke, curse card art, sci-fi illustration, 340x200px
```

---

### 7.F — CARTAS DE SISTEMA (System Strike)

**Visual base:** Vista técnica de sistemas internos. Daño quirúrgico a componentes específicos.

#### Sabotaje de Armamento (`ATTACK_DISABLE_WEAPONS`)
```
A precision strike hitting enemy weapon battery systems, weapon turrets exploding and fusing shut, power conduits to weapon systems severed with sparking damage, enemy ship's cannon ports darkening, surgical destruction, sci-fi card art illustration, 340x200px
```

#### Ruptura de Escudos (`ATTACK_DISABLE_SHIELDS`)
```
A targeted strike overloading and destroying enemy shield generators, shield dome flickering then collapsing with an implosion of blue energy, shield projector nodes on enemy hull visibly destroyed, unprotected hull exposed, sci-fi card art illustration, 340x200px
```

#### Corte de Propulsores (`ATTACK_DISABLE_ENGINES`)
```
A missile strike precisely hitting enemy engine nacelles, thrusters going dark with secondary explosions, engine exhaust cutting out, enemy ship drifting powerless in space, propulsion system disabled, sci-fi card art illustration, 340x200px
```

#### Brecha en el Reactor (`ATTACK_REACTOR_BREACH`)
```
A devastating reactor breach strike, massive explosion at enemy ship's reactor core, nuclear energy erupting through the hull in blinding white light, ship breaking apart at the reactor section, instant kill energy visible, EXHAUST keyword felt in the finality of the blast, epic scale destruction, sci-fi card art illustration, 340x200px
```

#### Escaneo de Sistemas (`SKILL_SYSTEM_SCAN`)
```
A tactical scan beam sweeping across enemy ship exterior, detailed system blueprint overlay appearing in holographic HUD showing all ship components, engine section highlighted in red as weakness, a card being drawn as data flows in, information warfare aesthetic, sci-fi card art illustration, 340x200px
```

---

## 8. RELIQUIAS — ICONOS

**Formato:** PNG **128 × 128 px**, fondo negro o muy oscuro, iconos ornamentados y legibles. Estilo: artefacto espacial antiguo o tecnológico, reliquary feel.

> **Style base para reliquias:**
> `sci-fi artifact icon, highly detailed ornamental design, glowing energy core, dark background, jewel-like quality, collectible item aesthetic, Slay the Spire relic style, 128x128px, icon design`

---

| ID | Nombre | Rareza | Descripción del icono |
|---|---|---|---|
| `REL_NUCLEAR_BATTERY` | Batería Nuclear | Common | Batería cilíndrica con símbolo de radiación amarillo, brillo verde radiactivo |
| `REL_PILOT_REFLEXES` | Reflejos de Piloto | Common | Casco de piloto con visor reflectante, imagen especular azul |
| `REL_AMMO_OVERLOAD` | Sobrecarga de Munición | Uncommon | Cartucho de munición con energía sobrecargada desbordándose en naranja |
| `REL_BLACK_BOX` | Caja Negra | Uncommon | Caja negra de vuelo indestructible con indicador naranja parpadeando |
| `REL_QUANTUM_ENGINE` | Motor Cuántico | Rare | Miniatura de motor que contiene un vórtice cuántico azul dentro de cristal |
| `REL_COMBAT_STIMS` | Estimulantes de Combate | Rare | Jeringa de estimulante con líquido rojo brillante y destellos dorados |
| `REL_PIRATE_FLAG` | Bandera Pirata | Rare | Pequeña bandera con calavera y huesos cruzados en tela negra raída |
| `REL_ION_CAPACITOR` | Capacitor de Iones | Rare | Capacitor hexagonal con iones de plasma atrapados en campos magnéticos |
| `REL_EMP_CAPACITOR` | Capacitor EMP | Rare | Dispositivo EMP con arcos eléctricos dorados emanando de electrodos |
| `REL_HEGEMONY_RELIC` | Reliquia de la Hegemonía | Boss | Medallón oficial con el sello dorado de la Hegemonía, impresionante |
| `REL_PHANTOM_DRIVE` | Motor Fantasma | Boss | Motor holográfico semitransparente, parcialmente en otra dimensión |
| `REL_SMUGGLER_CONTACT` | Contacto Contrabandista | Event | Tarjeta de visita arrugada con símbolo de crédito holográfico |
| `REL_FUSION_CORE` | Núcleo de Fusión | Uncommon | Núcleo esférico de fusión con plasma naranja-rojo rotando en su interior |
| `REL_PYRO_INJECTOR` | Inyector Pirótico | Rare | Inyector industrial con cámara de combustión llameante visible |
| `REL_PLASMA_REGULATOR` | Regulador de Plasma | Rare | Válvula de plasma con flujo turquesa regulado, medidores de presión |
| `REL_AEGIS_PROTOCOL` | Protocolo Égida | Uncommon | Escudo octogonal con runas de protocolo de defensa brillando en azul |
| `REL_DEFLECTOR_ARRAY` | Matriz Deflectora | Rare | Array de paneles deflectores hexagonales en forma de abanico, azul |
| `REL_BULWARK_HEART` | Corazón Bastión | Boss | Corazón geométrico de diamante azul dentro de blindaje de acero |
| `REL_SABOTAGE_KIT` | Kit de Sabotaje | Uncommon | Maletín táctico con herramientas de sabotaje y detonadores visibles |
| `REL_OVERRIDE_KEY` | Llave de Override | Rare | Llave maestra dorada con circuitos integrados y un brillo de override |
| `REL_CHRONOMETER` | Cronómetro de Impacto | Boss | Reloj cronómetro vintage con esfera que muestra impacto final magnificado |
| `REL_SCAVENGER_DRONE` | Dron Carroñero | Uncommon | Pequeño dron carroñero esférico con brazos colectores extendidos |
| `REL_VOID_LEDGER` | Libro del Vacío | Rare | Libro antiguo de cubierta negra con páginas de código de vacío brillando |
| `REL_GHOST_PROTOCOL_RELIC` | Protocolo Espectral | Boss | Disco holográfico de protocolo con imagen fantasma semitransparente |

**Prompts de ejemplo (aplicar mismo formato a todos):**

**REL_NUCLEAR_BATTERY:**
```
A sci-fi nuclear battery relic icon, cylindrical power cell with yellow radiation hazard symbol, glowing green radioactive energy emanating from casing, dark metal housing with warning stripes, collectible item style, Slay the Spire relic aesthetic, dark background, 128x128px icon
```

**REL_HEGEMONY_RELIC:**
```
A boss relic medallion from the Hegemony, ornate golden seal with imperial insignia, intricate authority symbols around the rim, glowing with golden power, museum-quality artifact feeling, heavy and important, dark display case background, 128x128px icon
```

**REL_BULWARK_HEART:**
```
A boss relic called Bulwark Heart, geometric diamond-shaped heart made of reinforced steel armor, pulsing blue energy visible through cracks in the plating, indestructible feeling, fortress aesthetic, dark background with faint energy glow, 128x128px icon
```

---

## 9. PANTALLAS DE UI

**Formato:** JPG/PNG, **1920 × 1080 px** (escalar según necesidad).

---

### 9.1 Pantalla de Inicio (`StartScreen`)

**Descripción:** Fondo épico de espacio profundo con nebulosas y estrellas. Logotipo del juego centrado. Atmosférica y evocadora.

```
Epic deep space panoramic background for a roguelike card game called "Navegador Galáctico", vast galaxy view with colorful nebulae in purple and cyan, billions of stars, a distant spiral galaxy visible on the horizon, a single small spaceship silhouette flying toward the galaxy, sense of infinite journey and adventure, cinematic sci-fi space opera art, suitable as a main menu background, 1920x1080px
```

---

### 9.2 Hangar / Selección de Nave (`HangarScreen`)

**Descripción:** Interior de hangar espacial, alto y cavernoso, con espacio para mostrar las tres naves en plataformas iluminadas.

```
Interior of a futuristic space hangar bay, vast industrial space with high ceilings, three illuminated ship display platforms on a polished floor reflecting neon lights, mechanics working in background, holographic ship stat displays on walls, atmospheric blue and orange industrial lighting, sense of scale with tiny workers near massive ship docking clamps, sci-fi space opera aesthetic, 1920x1080px
```

---

### 9.3 Pantalla de Combate — Fondo (`CombatInterface`)

**Descripción:** Vista espacial desde cabina durante combate. No muy distractora — debe funcionar como backdrop.

```
Space combat arena background, viewed from inside a spaceship cockpit looking out at open space, enemy approach vector visible, dramatic star field, faint nebula in background providing color variation, subtle atmospheric battle lighting, dark enough to not distract from UI elements, sci-fi combat aesthetic, 1920x1080px
```

---

### 9.4 Sector 1 — Zona Fronteriza

**Descripción:** Región espacial de fronteras coloniales. Asteroides, estaciones mineras, luz de estrella amarilla.

```
Sector 1 space region background, frontier colonial zone, rocky asteroid fields in foreground, distant mining stations with warm yellow star light, orange-yellow color temperature, colonial outpost atmosphere, sense of wild frontier space, dark space with golden warm light sources, sci-fi space opera, 1920x1080px
```

---

### 9.5 Sector 2 — Territorio Pirata

**Descripción:** Zona caótica de piratas. Restos de naves destruidas, colores rojos y naranjas, sensación de peligro.

```
Sector 2 pirate territory space background, wreckage of destroyed ships floating as debris field, burning hulks with orange fire trailing in space, warning beacon lights flashing red, crimson nebula in background, dangerous chaotic atmosphere, pirate skull flags visible on distant stations, dark and menacing, sci-fi space opera, 1920x1080px
```

---

### 9.6 Sector 3 — Espacio Profundo / IA

**Descripción:** Zona final, espacio profundo intacto por humanos. Colores fríos, azul y blanco. Estructuras geométricas perfectas de la IA.

```
Sector 3 deep space AI territory background, cold pristine deep space never touched by humans, perfect geometric AI megastructures visible in background, crystalline lattice patterns and impossible perfect architecture, cold blue and white color palette with electric purple accents, unsettling alien mathematical perfection, final frontier atmosphere, sci-fi space opera, 1920x1080px
```

---

### 9.7 Pantalla de Victoria (`GameOverScreen — isVictory`)

**Descripción:** Nebulosa dorada y estrellas en explosión de celebración. Épica y emotiva.

```
Victory screen background for a space roguelike game, triumphant golden explosion of light and stars, massive nebula in warm gold and white, sense of cosmic achievement and peace restored to the galaxy, celebratory light rays, hero's journey completed aesthetic, emotional and epic, sci-fi space opera, 1920x1080px
```

---

### 9.8 Pantalla de Derrota (`GameOverScreen — defeat`)

**Descripción:** Espacio frío y vacío. Restos de la nave del jugador a la deriva.

```
Game over defeat screen background for a space roguelike, cold dark deep space, wreckage of a destroyed spaceship drifting in silence, fragments tumbling in zero gravity, distant stars cold and indifferent, crushing loneliness of space, somber red and dark navy color palette, emotional weight of failure, sci-fi aesthetic, 1920x1080px
```

---

### 9.9 Pantalla de Sector Completo (`SectorCompleteScreen`)

**Descripción:** Nave del jugador saliendo del sistema después de derrotar al jefe. Warp jump inminente.

```
Sector complete screen background, a victorious spaceship preparing for warp jump at the edge of a star system, glowing warp drive charging up in bright cyan-white, stars beginning to streak as FTL travel initiates, sense of triumph and forward momentum, bright hopeful color palette, cinematic composition, sci-fi space opera, 1920x1080px
```

---

### 9.10 Sitio de Descanso (`RestSiteModal`)

**Descripción:** Estación espacial de descanso, cálida y acogedora. Contrastante con la hostilidad del espacio.

```
Interior of a space rest station, warm and cozy lighting contrasting with cold space outside the windows, repair drones visible working on ship hulls outside, a small cafe or lounge area visible, amber and cream warm lighting, relief and safety atmosphere, travelers resting in background, sci-fi aesthetic but homey, 1280x720px
```

---

## 10. NODOS DEL MAPA — ICONOS

**Formato:** PNG **48 × 48 px** con transparencia. Estilo: icono simple y legible sobre el mapa galáctico.

| NodeType | Color | Descripción del icono |
|---|---|---|
| START | Verde | Escudo con estrella — punto de partida |
| BATTLE | Rojo | Dos naves cruzadas en combate |
| ELITE | Rosa | Calavera con aura de poder |
| ENCOUNTER | Amarillo | Burbuja de diálogo con estrella |
| HAZARD | Naranja | Señal de advertencia triangular |
| SHOP | Azul | Crédito galáctico o moneda espacial |
| REST | Teal | Símbolo de ancla o estación de atraque |
| MINI_BOSS | Púrpura | Corona con espadas |
| SPECIAL_EVENT | Cyan | Signo de interrogación con halo |
| END | Verde claro | Portal o vórtice de salida de sector |

**Prompt base para todos:**
```
Tiny flat-design sci-fi icon for a galactic map node, [DESCRIPTION], [COLOR] color scheme, pixel-perfect at 48x48px, transparent background, clean vector-like icon, minimal detail readable at small size, sci-fi roguelike game aesthetic
```

---

## 11. ICONOS DE ESTADOS DE ALTERACIÓN (Status Effects)

**Formato:** PNG **32 × 32 px**, estilo iconos de buff/debuff de RPG.

| Status | Tipo | Color | Icono |
|---|---|---|---|
| BURN | Debuff | Naranja | Llama |
| JAMMED | Debuff | Rojo | Señal bloqueada / interferencia |
| HULL_BREACH | Debuff | Rojo oscuro | Casco agrietado |
| OVERHEAT | Debuff | Rojo | Termómetro al máximo |
| OVERCHARGE | Buff | Amarillo | Rayo eléctrico |
| REGENERATE | Buff | Verde | Cruz médica con brillo |
| STEALTH | Buff | Índigo | Silueta fantasma |
| PLASMA_LEAK | Debuff | Púrpura | Fuga de plasma |

**Prompt base:**
```
Small 32x32px status effect icon for a sci-fi card game, [NAME] effect, [COLOR] primary color, flat but expressive icon design, dark background, buff/debuff badge style, readable at small size
```

---

## 12. FONDOS DE PLANETAS / ESTACIONES (GalacticMap)

Cada nodo del mapa muestra un planet o estación como fondo en el `NodeViewer`. Se necesitan al menos **10 variantes** de planetas/estaciones.

**Formato:** JPG **512 × 512 px** o **1024 × 1024 px**, cuadrado.

**Style base:**
> `beautiful sci-fi planet or space station, painterly digital art, dramatic space lighting, high detail, FTL aesthetic`

```
[1] Gas giant planet in amber and orange tones with visible storm bands, dramatic side lighting from nearby star, sci-fi 512x512px
[2] Rocky barren planet in grey and brown, ancient crater-covered surface, harsh unforgiving, sci-fi 512x512px
[3] Frozen ice planet, pale blue and white, glacial surface with thin atmosphere, distant cold star, sci-fi 512x512px
[4] Lush jungle planet in vibrant greens, cloud cover with lightning visible, surprisingly alive, sci-fi 512x512px
[5] Desert planet in gold and red, massive sand dunes, twin moons visible, sci-fi 512x512px
[6] Space mining station, industrial ring structure with tethered asteroids, orange work lights, sci-fi 512x512px
[7] Derelict space station, dark and abandoned, collision damage visible, haunting atmosphere, sci-fi 512x512px
[8] Pirate outpost asteroid base, fortified into a rocky asteroid, red warning lights, sci-fi 512x512px
[9] Corporate research station, clean white modules in orbit, official and sterile, sci-fi 512x512px
[10] Ancient alien megastructure, impossible geometry, glowing runes, pre-dating humans by millions of years, sci-fi 512x512px
```

---

## 13. RESUMEN DE ASSETS

| Categoría | Cantidad | Formato | Tamaño |
|---|---|---|---|
| Naves jugadoras (full) | 3 | PNG | 640×400 |
| Naves jugadoras (token) | 3 | PNG | 64×64 |
| Enemigos regulares | 4 | PNG | 400×300 |
| Mini-boss | 1 | PNG | 480×320 |
| Élites | 2 | PNG | 480×320 |
| Bosses | 3 | PNG | 640×400 |
| Retratos de tripulación | 9 | PNG | 256×256 |
| Arte de cartas | 36 | PNG | 340×200 |
| Iconos de reliquias | 24 | PNG | 128×128 |
| Pantallas UI | 10 | JPG/PNG | 1920×1080 |
| Iconos de nodos | 10 | PNG | 48×48 |
| Iconos de estados | 8 | PNG | 32×32 |
| Planetas / Estaciones | 10 | JPG | 512×512 |
| **TOTAL** | **123** | | |

---

## 13B. UI COMPONENT VISUAL DESIGNS (sin asset externo — diseño CSS/SVG)

Estos elementos son partes de la interfaz que necesitan dirección visual clara pero no requieren imágenes externas — se implementan como componentes.

### Relic Strip (banda de reliquias en combate)
- **Posición:** barra horizontal entre la fila de combatientes y la mano de cartas
- **Diseño:** iconos circulares 28px, fondo `bg-gray-800/80`, borde `border-yellow-600/40`, hover resalta en dorado
- **Tooltip al hover:** nombre + descripción de la reliquia
- **Cuando no hay reliquias:** no renderizar nada

### Damage Preview Badge (estimación de daño en mano)
- **Posición:** pequeño badge encima de cada carta de Ataque en la mano
- **Contenido:** `⚔ ~Xdmg` (daño estimado incluyendo artillero + affix)
- **Para multi-hit:** mostrar `⚔ Xdmg×N`
- **Color:** rojo para daño, cyan para escudo, verde para heal
- **No mostrar** para cartas que no tienen valor de daño

### Boss Phase 2 Indicator (indicador de fase del boss)
- **Posición:** encima del panel del enemigo, visible solo en combates contra jefe
- **Fase 1 (HP > 50%):** barra de fase en gris
- **Fase 2 (HP ≤ 50%):** barra roja pulsante + texto "FASE 2 — ENRARECIDO"
- **Transición:** flash rojo de pantalla + sonido al cambiar de fase

### Node Type Badge (badge de tipo en mapa galáctico)
- **Posición:** texto SVG debajo de cada planeta en el mapa
- **Diseño:** símbolo de 1-2 chars en color del tipo de nodo
- **Símbolos:** ⚔ batalla, ★ élite, ? encuentro, ⚠ peligro, ⬡ tienda, + descanso, ☠ mini-boss, ◈ evento, ▶ inicio, ↑ fin

---

## 14. PRIORIDAD DE IMPLEMENTACIÓN

**Crítico (afecta jugabilidad visible):**
1. Arte de cartas — Attack / Skill (26 cartas) — actualmente placeholders
2. Naves jugadoras (3) — pantalla de hangar es primera impresión
3. Bosses (3) — momento más épico del juego
4. Pantalla de Inicio — primera impresión absoluta

**Alto (mejora la experiencia):**
5. Enemigos regulares (4) + Élites (2)
6. Retratos de tripulación (9)
7. Reliquias — iconos (24)
8. Pantallas de Sector Completo + Derrota/Victoria

**Medio:**
9. Fondos de planetas/estaciones (10)
10. Mini-boss (1)
11. Iconos de estados (8)

**Bajo:**
12. Iconos de nodos del mapa (10) — actualmente texto con color funciona bien
