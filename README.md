<div align="center">

# 🚀 Slower Than Light (STL)

### *Un juego roguelike de exploración espacial y combate por cartas*

[![Made with React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[🎮 Jugar Demo](#) • [📖 Documentación](#documentación) • [🐛 Reportar Bug](../../issues) • [💡 Sugerir Feature](../../issues)

![Game Banner](https://via.placeholder.com/1200x400/0a0e27/00d4ff?text=Slower+Than+Light)

</div>

---

## 📝 Descripción

**Slower Than Light (STL)** es un juego roguelike de exploración espacial inspirado en el clásico **FTL: Faster Than Light**, pero con un enfoque único en combate táctico por cartas y narrativa procedural emergente.

Asume el rol de capitán de una nave independiente navegando a través de sectores desconocidos de la galaxia. Cada decisión importa: desde qué tripulación reclutar, hasta cómo responder a transmisiones misteriosas o enfrentarte a naves enemigas.

### ✨ Características Principales

- 🗺️ **Exploración Procedural**: Mapas generados aleatoriamente con múltiples rutas y secretos
- 🃏 **Combate por Cartas**: Sistema de combate táctico con 30+ cartas únicas
- 🚢 **Múltiples Naves**: 3 naves jugables, cada una con habilidades especiales
- 👥 **Gestión de Tripulación**: Recluta tripulantes con sinergias y habilidades únicas
- 📖 **Narrativa Emergente**: Eventos dinámicos con consecuencias permanentes
- 🏆 **Sistema de Progresión**: Niveles, XP, logros y banderas narrativas
- 🎲 **Alta Rejugabilidad**: Generación procedural con semillas deterministas

---

## 🎮 Gameplay

### Navegación Galáctica

Explora un mapa galáctico con diferentes tipos de nodos:

- **⚔️ BATALLA**: Combates contra naves enemigas
- **💬 ENCUENTRO**: Eventos narrativos con opciones y consecuencias
- **🛒 TIENDA**: Compra cartas, mejoras y servicios
- **⚠️ PELIGRO**: Eventos ambientales aleatorios
- **👑 MINI-JEFE**: Combates contra enemigos poderosos
- **✨ EVENTO ESPECIAL**: Contenido narrativo único
- **🏁 FINAL**: Destino del sector

### Combate Táctico

Sistema de combate por turnos con cartas:

- **Energía**: Recurso principal para jugar cartas
- **Fuego**: Recurso especial para ataques devastadores
- **Maniobra**: Recurso para habilidades tácticas
- **Escudos**: Primera línea de defensa
- **Casco**: Salud principal de la nave

### Gestión de Recursos

- **🔥 Combustible**: Necesario para viajar entre nodos
- **💰 Créditos**: Moneda para comprar en tiendas
- **👥 Tripulación**: Cartas de personajes con habilidades únicas
- **❤️ Moral**: Afecta eventos narrativos (sistema futuro)

---

## 🏛️ Facciones

El universo de STL está dividido en 5 facciones principales:

| Facción | Descripción | Especialidad |
|---------|-------------|--------------|
| 🎓 **Academia** | Investigadores científicos | Análisis, decodificación, tecnología |
| ⚔️ **Mercenarios** | Combatientes profesionales | Daño, tácticas militares |
| 🔧 **Tecno-Gremio** | Ingenieros y técnicos | Reparación, mejoras de nave |
| 💻 **Hacktivistas** | Infiltradores digitales | Sabotaje, debuffs enemigos |
| 💼 **Comerciantes** | Intermediarios económicos | Créditos, descuentos, negociación |

### Personajes Destacados

- **Dr. Aris Thorn** (Academia): Experto en decodificación de transmisiones antiguas
- **Capitana Vex** (Mercenarios): Líder táctica misteriosa con conexión al pasado
- **Nyx Psíquica** (Academia): Iniciada con habilidades precognitivas
- **Glitch Saboteador** (Hacktivistas): Infiltrador cibernético clandestino
- **Zara Artillera** (Mercenarios): Veterana de artillería pesada

---

## 🚢 Naves Disponibles

Cada nave tiene estadísticas únicas, mazo inicial diferente y rasgo especial:

1. **Explorador Ágil** - Versátil y equilibrada
2. **Acorazado Pesado** - Alta resistencia, orientado al combate
3. **Crucero Científico** - Enfocado en habilidades y tripulación

---

## 🌌 Worldbuilding

### La Hegemonía Galáctica

Futuro distante donde la humanidad se ha expandido a múltiples sistemas estelares bajo el control de una entidad centralizada llamada "La Hegemonía". Tecnología avanzada coexiste con ruinas de civilizaciones antiguas.

### El Misterio de Vex

Hace décadas, una civilización llamada los **Vex** fue aniquilada por una fuerza desconocida. Sus protocolos de comunicación, códigos antiguos y fragmentos de datos persisten como "transmisiones fantasma". Descubrir estos secretos puede cambiar el destino de tu viaje.

### Banderas Narrativas

El juego utiliza un sistema de **banderas narrativas persistentes** que rastrean tus decisiones:

- `ai_fragment_collected`: Has obtenido fragmentos de IA antigua
- `knows_vex_code`: Conoces el protocolo de comunicación Vex
- `contacted_hegemony`: Has contactado a la Hegemonía
- *...y más por descubrir*

---

## 🛠️ Tecnologías

- **React 19.2** - Framework UI
- **TypeScript 5.8** - Lenguaje tipado
- **Vite 6.2** - Build tool y dev server
- **CSS3** - Estilos y animaciones

### Arquitectura

El juego sigue una arquitectura modular con separación de responsabilidades:

```
navegador/
├── components/        # Componentes React
├── services/         # Lógica de juego (combate, eventos, mapa)
├── data/            # Datos de contenido (cartas, enemigos, naves)
├── types/           # Definiciones de TypeScript
├── hooks/           # Custom React hooks
└── editor/          # Editor de contenido (WIP)
```

### Sistema de Contenido Dinámico

STL implementa un **motor de contenido basado en JSON** que permite:

- ✅ Crear eventos sin tocar código
- ✅ Editar cartas, enemigos y tiendas externamente
- ✅ Cadenas narrativas con ramificaciones
- ✅ Validación de esquemas
- ✅ Hot-reloading de contenido

---

## 🚀 Instalación y Uso

### Requisitos Previos

- **Node.js** (v18 o superior)
- **npm** o **yarn**

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Miltondz/STL.git
cd STL

# Instalar dependencias
npm install

# Configurar variables de entorno (opcional)
# Crear archivo .env.local con tu GEMINI_API_KEY si usas funcionalidades de IA

# Iniciar servidor de desarrollo
npm run dev
```

El juego estará disponible en `http://localhost:5173`

### Build para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en el directorio `dist/`.

### Preview de Build

```bash
npm run preview
```

---

## 📖 Documentación

### Guías Principales

- [📋 Propuesta de Mejoras](GAME_IMPROVEMENTS_PROPOSAL.md) - Roadmap de desarrollo
- [📖 Narrativa y Lore](NARRATIVE_AND_EVENTS_COMPLETE.md) - Worldbuilding completo
- [🏗️ Arquitectura del Sistema](ARCHITECTURE_SUMMARY.md) - Diseño técnico
- [🎴 Catálogo de Cartas](CARDS_CATALOG.md) - Todas las cartas disponibles
- [📊 Log de Mejoras](IMPROVEMENTS_LOG.md) - Historial de cambios

### Para Desarrolladores

- [🔧 Content System Plan](CONTENT_SYSTEM_PLAN.md) - Sistema de contenido dinámico
- [⛓️ Event Chains Design](EVENT_CHAINS_DESIGN.md) - Diseño de cadenas narrativas
- [📝 Audit Report](AUDIT_REPORT.md) - Reporte de auditoría de código

---

## 🎯 Roadmap

### ✅ Completado

- [x] Sistema de combate por cartas funcional
- [x] Generación procedural de mapas
- [x] 30+ cartas únicas con 6 facciones
- [x] Sistema de eventos con consecuencias
- [x] 3 naves jugables
- [x] Sistema de progresión (XP/Niveles)
- [x] Tiendas con inventarios dinámicos
- [x] Banderas narrativas persistentes

### 🚧 En Desarrollo

- [ ] Sistema de persistencia (LocalStorage)
- [ ] Sistema de sinergias entre cartas
- [ ] Múltiples enemigos en combate
- [ ] Jefe final épico con fases
- [ ] Sistema de reliquias/artefactos pasivos

### 📅 Planificado

- [ ] +15 eventos narrativos adicionales
- [ ] Sistema de dificultades (Easy, Normal, Hard, Ascension)
- [ ] Estadísticas y logros detallados
- [ ] Meta-progresión entre partidas
- [ ] Editor visual de contenido (web tool)
- [ ] Modo competitivo local

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres colaborar:

1. **Fork** el proyecto
2. Crea una **rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

### Áreas de Contribución

- 🎨 **Diseño UI/UX**: Mejorar interfaces y animaciones
- 📝 **Contenido Narrativo**: Crear eventos, diálogos y lore
- 🎴 **Diseño de Cartas**: Balancear y crear nuevas cartas
- 🐛 **Bug Fixes**: Reportar y resolver bugs
- 🔧 **Features**: Implementar funcionalidades del roadmap
- 📚 **Documentación**: Mejorar guías y tutoriales

---

## 🐛 Reporte de Bugs

Si encuentras un bug, por favor [abre un issue](../../issues) con:

- **Descripción** clara del problema
- **Pasos** para reproducirlo
- **Comportamiento esperado** vs actual
- **Screenshots** si es posible
- **Información del sistema** (navegador, OS)

---

## 📜 Licencia

Este proyecto está bajo la licencia **MIT**. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- Inspirado por **FTL: Faster Than Light** de Subset Games
- Inspirado por **Slay the Spire** de Mega Crit Games
- Comunidad de desarrolladores indie de roguelikes

---

## 📬 Contacto

**Desarrollador**: Milton  
**Repositorio**: [github.com/Miltondz/STL](https://github.com/Miltondz/STL)  
**Issues**: [github.com/Miltondz/STL/issues](https://github.com/Miltondz/STL/issues)

---

<div align="center">

**Hecho con ❤️ y ☕ por la comunidad**

⭐ Si te gusta el proyecto, dale una estrella en GitHub ⭐

[⬆ Volver arriba](#-slower-than-light-stl)

</div>
