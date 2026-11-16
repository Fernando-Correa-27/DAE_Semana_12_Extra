# DAE Semana 12 (extra) — Servicios web con React: Axios, CORS y los tres estados

**Alumno:** Fernando Correa
**Curso:** Desarrollo de Aplicaciones Empresariales — Sección 4-C24-A
**Docente:** Michael Montgomery Rosell
**Repositorio:** <https://github.com/Fernando-Correa-27/DAE_Semana_12_Extra>

Laboratorio extra de la semana 12: la pantalla de **cuestionarios** de React consume la API del curso (la del
laboratorio 8) con **Axios**. El trabajo completo está implementado, revisado y probado:

| Comando | Resultado |
|---|---|
| `npm test` (código de `src/client/`) | **67 de 67 pruebas en verde** (6 archivos) |
| `npm run test:ai` (cliente «escrito por una IA» de `src/ai/`) | **67 de 67 pruebas en verde** (0 fallos) |
| `npm run build` | compila sin errores |

La línea base de la plantilla, sin implementar, era de **46 pruebas fallidas de 67** (21 en verde). El detalle de cada
estado, las capturas y la explicación paso a paso están en
[`docs/DAE_Semana_12_Extra_Fernando_Correa.docx`](docs/DAE_Semana_12_Extra_Fernando_Correa.docx) y en
[`docs/evidencias/`](docs/evidencias/).

## Qué se implementó

| Parte | Archivo | Contenido |
|---|---|---|
| 1 | `src/client/api.js` | Dirección base en un solo sitio, instancia de Axios con `timeout: 8000`, `listExams` (entrega la señal de cancelación), `createExam`, `deleteExam` y `describeError` con una frase en español por cada tipo de fallo |
| 2 | `src/client/cors.js` | Política de CORS con **un solo origen exacto**: `http://localhost:5173` (sin comodín, sin credenciales, sin barra final) |
| 3 | `src/client/useExams.js` | Los tres estados (`loading`, `ready`, `error`), `reload`, cancelación con `AbortController` y bandera `cancelled`, `remove` con actualización local de la lista y `create` con guarda de doble envío mediante `useRef` |
| 4 | `src/ai/` | Revisión del cliente escrito por una IA: cinco fallos clasificados, corregidos uno por commit, con `npm run test:ai` de 25 fallos a 0 |
| 5 | `cli/examctl.mjs` | Uso del cliente sin pantalla contra `npm run api`: listado, alta, borrado con y sin `--yes`, título vacío, id inexistente y `cors-check` |
| 6 | este README y el `.docx` | Tabla de la pantalla, tabla de uso de IA, conclusiones y evidencias |

## Puesta en marcha

Requiere **Node 20.19 o superior** (o Node 22.12 o superior). En este equipo se usó **Node v26.13.1**.

```powershell
npm install
npm run dev        # http://localhost:5173 (dejarlo corriendo)
```

En otra terminal:

```powershell
npm test           # 67/67 en verde
npm run test:ai    # 67/67 en verde (cliente de la IA ya corregido)
npm run build      # comprobación de compilación
```

### Cliente sin pantalla y CORS

```powershell
npm run api                                              # API simulada en http://127.0.0.1:8800/api
npm run examctl -- list --json                           # JSON en stdout; mensajes en stderr
npm run examctl -- create "Examen final" --json
npm run examctl -- delete 3 --yes
npm run examctl -- cors-check --origin http://localhost:5173
npm run examctl -- cors-check --origin https://sitio-malo.example
```

Códigos de salida comprobados: `list` 0, `create` 0, `delete --yes` 0, `delete` sin `--yes` 8, título vacío 4,
id inexistente 5, `cors-check` con el origen propio 0, con un origen ajeno 7 y con la API en modo `--wildcard` 9.
La transcripción completa está en [`docs/evidencias/14-examctl-comandos.txt`](docs/evidencias/14-examctl-comandos.txt)
y [`docs/evidencias/15-cors-check.txt`](docs/evidencias/15-cors-check.txt).

## Evidencias

Las capturas están en [`docs/capturas/`](docs/capturas) y las salidas de terminal sin formato en
[`docs/evidencias/`](docs/evidencias).

| Captura | Contenido |
|---|---|
| `01-inicial-atascado.png` | La pantalla se queda en «Cargando cuestionarios…» con la plantilla sin implementar |
| `02-estado-carga.png` | Estado `loading` con el código final |
| `03-estado-tabla.png` | Estado `ready` con la tabla de cuestionarios |
| `04-estado-error.png` | Estado `error` con el servidor apagado y la frase para la persona |
| `05-error-servidor-apagado.png` | Error de red al intentar borrar con el servidor apagado |
| `06-error-500.png` | Error 500 provocado desde el panel «Red simulada» |
| `07-error-validacion.png` | Mensaje de validación de la API al enviar un título vacío |
| `08-error-cors.png` | Bloqueo de CORS al retirar el origen de la política |
| `09-lista-tras-crear.png` | La fila nueva aparece sin recargar la página |
| `10-lista-tras-borrar.png` | La fila borrada desaparece sin recargar la página |
| `11-estructura-proyecto.png` | Estructura del proyecto |
| `16`–`25` | Terminal: línea base, final, etapas de la IA, `examctl` y `cors-check` |
| `26`–`30` | Terminal: pruebas por paso (`api`, `cors` y las tres etapas de `useExams`) |

## Decisiones del equipo

- **CORS:** solo `http://localhost:5173`, con esquema, host y puerto exactos, sin comodín y sin credenciales.
- **Borrado (paso 7):** cuando el `DELETE` se confirma, la fila se **filtra en local**; no se vuelve a pedir la lista.
  Así la lista refleja el cambio sin recargar y sin un `GET` extra. Es una **decisión a confirmar** por el equipo.
- **Doble envío:** la guarda es un `useRef` (`creatingRef`), porque el estado todavía vale `false` durante el segundo
  clic del mismo render.
- **Cancelación:** cada `useEffect` que lista crea un `AbortController` y una bandera `cancelled`; la limpieza aborta
  y marca la respuesta como obsoleta.

## Cliente «escrito por una IA»

Los cinco fallos de `src/ai/` se corrigieron uno por commit, ejecutando `npm run test:ai` después de cada arreglo:

| Fallo | Commit | `test:ai` antes → después |
|---|---|---|
| CORS con comodín `"*"` | `629b63d` | 25 → 20 fallos |
| Errores tragados (`console.error`, estado `ready`) | `15c6c59` | 20 → 12 fallos |
| Petición sin cancelación ni control de la carrera | `b6f4db1` | 12 → 6 fallos |
| Lista que no se refresca tras borrar | `334fad5` | 6 → 4 fallos |
| Doble envío sin guarda | `fd17b78` | 4 → 0 fallos |
| Rechazos de cancelación no observados (ambos clientes) | `154cf94` | 0 → 0 fallos (sin `unhandled rejection`) |

El estado original de `src/ai/` quedó guardado en el commit `43ab18c`, antes de cualquier corrección.

## Nota sobre `AGENTS.md`

`AGENTS.md` limita las ediciones del agente a `src/client/` y `src/components/`. El **paso 13 de la guía** exige
corregir `src/ai/`; se siguió la guía del laboratorio en ese paso, dejando el estado original en un commit y
corrigiendo un fallo por commit. No se modificaron `src/test/`, `src/lib/`, `cli/`, `package.json`, `vite.config.js`
ni los `.env.*`.

## Estructura

```
src/client/     módulo de la API, política de CORS y hook del listado (implementados)
src/ai/         los mismos tres archivos «escritos por una IA» (revisados y corregidos)
src/components/ ExamList y NetworkPanel (ya escritos, sin cambios)
src/lib/        red simulada y contrato de la API (sin cambios)
src/test/       pruebas (sin cambios)
cli/            examctl y la API simulada por HTTP (sin cambios)
docs/           capturas, evidencias y este entregable
```

## Reproducir las capturas

1. `npm install`
2. `npm run dev` y abrir <http://localhost:5173>
3. Para los errores: usar el panel «Red simulada» («Apagar el servidor», «La próxima petición devuelve 500») y el
   formulario con un título vacío.
4. Para CORS: quitar temporalmente `http://localhost:5173` de `src/client/cors.js`, recargar, provocar la petición y
   volver a ponerlo.
5. `npm run api` y `npm run examctl -- ...` para las capturas de terminal.
