---
description: Mantener actualizado el CHANGELOG del proyecto automáticamente
---

# Workflow: Actualizar Changelog

Cada vez que finalices una tarea, implementes una nueva funcionalidad, arregles un bug significativo, o generes un "walkthrough" sobre los cambios recientes en tu plan de implementación, DEBES asegurarte de que el archivo `CHANGELOG.md` en la raíz del proyecto esté actualizado con tus cambios antes de dar por completada la interacción con el usuario.

## Pasos obligatorios a seguir al finalizar una tarea:

1.  **Revisar los cambios realizados:** Haz un resumen mental de todo el código o archivos que modificaste durante la sesión que acaba de terminar.
2.  **Abrir el CHANGELOG:** Utiliza las herramientas de lectura de archivos para obtener el contenido actual de `d:\-WWW-\JS\shurirh-epoch-engine\CHANGELOG.md`.
3.  **Identificar la sección correcta:** Localiza la sección `## [Unreleased]` (No publicado) o la versión actual en la que se esté trabajando.
4.  **Insertar la descripción:** 
    *   Inserta tus cambios utilizando el formato de [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
    *   Categoriza tus cambios en grupos como: `### Added` (Añadido), `### Changed` (Cambiado), `### Deprecated` (Obsoleto), `### Removed` (Eliminado), `### Fixed` (Arreglado), `### Security` (Seguridad).
    *   Escribe el resumen de manera concisa y clara, orientado a desarrolladores y usuarios.
5.  **Guardar los cambios:** Escribe y guarda la actualización en el archivo `CHANGELOG.md` utilizando la herramienta adecuada para editar archivos (`multi_replace_file_content` o `replace_file_content`).
6.  **(Opcional) Notificar al usuario:** Mencionar brevemente en tu última respuesta que el CHANGELOG ha sido debidamente actualizado con los cambios recientes.
