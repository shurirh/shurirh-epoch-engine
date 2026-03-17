# Registro de Cambios (Changelog)

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Versionado Semántico](https://semver.org/).

## [Unreleased]
### Añadido
- Nuevo workflow para Antigravity (`.agents/workflows/generar-contexto-lira.md`) y script en Node.js para generar automáticamente el contexto completo del proyecto para Lira en `doc/context/lira/contexto_proyecto.md`.
- Soporte para Internacionalización (i18n).
- Diccionarios base en Inglés (`en`) y Español (`es`) bajo `src/i18n/locales`.
- Gestor I18nManager (`src/i18n/index.js`) para coordinar mensajes e interpolaciones.
- Workflow para actualizar el CHANGELOG automáticamente mediante Antigravity.

### Cambiado
- Refactorización de las entidades estructurales y motores (`Node`, `Event`, `Edge`, `Graph`, `EpochEngine`) para utilizar el gestor de traducciones pre-configuradas.
- Actualización de los adaptadores IO (`jsonImporter`, `csvAdapter`) y UI (`Renderer`) para soportar mensajes y alertas multilenguaje según la convención de `i18n.t()`.
