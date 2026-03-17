---
description: Generar un archivo markdown con todo el contexto del proyecto para subir a Lira
---

# Workflow: Generar Contexto para Lira

Este workflow ejecuta un script de automatización que lee la estructura actual de directorios y el código fuente completo del proyecto, recopilándolo en un único archivo Markdown. El objetivo es facilitar la provisión de contexto a Lira.

## Pasos

Ejecuta el siguiente comando para generar el archivo de contexto:

// turbo
1. Generar contexto usando el script de Node.js
   `node .agents/scripts/generar-contexto.js`

El archivo resultante se guardará en `doc/context/lira/contexto_proyecto.md`.
Asegúrate de confirmar al usuario que la operación finalizó con éxito y que el archivo está listo para ser utilizado.