---
title: "¿Cómo enviar datos desde Excel a Google Sheets?"
description: "Guía Pro: Aprende a sincronizar tus datos de Excel directamente con Google Sheets usando VBA y Google Apps Script. Sistema de envío automático."
date: "2026-02-14"
author: "Victor Hortua"
category: "Automatización"
image: "/images/guides/vba-google-sheets-hero.png"
---

# 🚀 ¿Cómo enviar datos desde Excel a Google Sheets?

Sincronizar datos entre Excel y Google Sheets es una de las automatizaciones más potentes para flujos de trabajo colaborativos. En esta guía, aprenderás a configurar un sistema que envía datos desde una hoja de Excel directamente a una hoja de Google en la nube utilizando **Google Apps Script** como puente.

---

## 📑 Índice de Contenidos

1. [Paso 1: Configuración en Google Sheets (Apps Script)](#paso-1-configuración-en-google-sheets-apps-script)
2. [Paso 2: Configuración en Microsoft Excel (VBA)](#paso-2-configuración-en-microsoft-excel-vba)
3. [Paso 3: Cómo usar el sistema](#paso-3-cómo-usar-el-sistema)
4. [Consideraciones de Seguridad](#consideraciones-de-seguridad)

---

## Paso 1: Configuración en Google Sheets (Apps Script)

Primero, necesitamos crear el "receptor" en la nube que recibirá los datos de Excel e insertará las filas en tu hoja de cálculo de Google.

> [!IMPORTANT]
> **Nombre de la Hoja**: Para que el código funcione sin cambios, la pestaña de tu Google Sheet donde se guardarán los registros debe llamarse exactamente **"Datos"**. Si prefieres otro nombre, deberás modificarlo en la variable `NOMBRE_HOJA_DATOS` del script.

1. Abre tu Google Sheet y ve a **Extensiones > Apps Script**.
2. Copia y pega el siguiente código en el editor:

> [!TIP]
> **¿Cómo obtener el ID de tu hoja?**
> Lo encuentras en la URL de tu navegador, entre `/d/` y `/edit`.
> Ejemplo: `https://docs.google.com/spreadsheets/d/1z6...98I/edit` -> El ID es **`1z6...98I`**.

```javascript
/**
 * Procesa solicitudes POST enviadas desde Excel VBA y agrega los datos a Google Sheets.
 */
function doPost(solicitud) {
  // 1. REEMPLAZA ESTO CON EL ID DE TU GOOGLE SHEET (lo obtuviste arriba)
  const ID_HOJA_CALCULO = "TU_ID_DE_HOJA_AQUI";

  const NOMBRE_HOJA_DATOS = "Datos";
  const NOMBRE_HOJA_LOGS = "Logs";

  let registro = [];
  const fechaHora = new Date();

  try {
    if (!solicitud || !solicitud.postData || !solicitud.postData.contents) {
      throw new Error("No se recibieron datos en la solicitud POST.");
    }

    const datosRecibidos = JSON.parse(solicitud.postData.contents);
    registro.push(
      `${fechaHora.toISOString()} | Datos recibidos: ${datosRecibidos.length} filas`,
    );

    if (!Array.isArray(datosRecibidos) || datosRecibidos.length === 0) {
      throw new Error("El cuerpo JSON debe ser un arreglo de filas.");
    }

    const hojaCalculo = SpreadsheetApp.openById(ID_HOJA_CALCULO);
    const hojaDatos = hojaCalculo.getSheetByName(NOMBRE_HOJA_DATOS);
    if (!hojaDatos)
      throw new Error(`Hoja '${NOMBRE_HOJA_DATOS}' no encontrada.`);

    let filasAgregadas = 0;

    datosRecibidos.forEach((fila, indice) => {
      if (Array.isArray(fila) && fila.length === 5) {
        hojaDatos.appendRow(fila);
        filasAgregadas++;
      } else {
        registro.push(
          `${fechaHora.toISOString()} | Fila ${indice + 1} ignorada (columnas: ${fila.length || 0})`,
        );
      }
    });

    // Registro en hoja de logs
    const hojaLogs =
      hojaCalculo.getSheetByName(NOMBRE_HOJA_LOGS) ||
      hojaCalculo.insertSheet(NOMBRE_HOJA_LOGS);
    hojaLogs.appendRow([
      fechaHora,
      "POST recibido",
      `Filas agregadas: ${filasAgregadas}`,
      registro.join("\n"),
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({
        estado: "exito",
        filasAgregadas: filasAgregadas,
        mensaje: "Datos agregados correctamente.",
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    registro.push(`${fechaHora.toISOString()} | ERROR: ${error.message}`);

    try {
      const hojaCalculo = SpreadsheetApp.openById(ID_HOJA_CALCULO);
      const hojaLogs =
        hojaCalculo.getSheetByName(NOMBRE_HOJA_LOGS) ||
        hojaCalculo.insertSheet(NOMBRE_HOJA_LOGS);
      hojaLogs.appendRow([
        fechaHora,
        "ERROR",
        error.message,
        registro.join("\n"),
      ]);
    } catch (errorSecundario) {
      registro.push(
        `${fechaHora.toISOString()} | ERROR al registrar log: ${errorSecundario.message}`,
      );
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        estado: "error",
        mensaje: error.message,
        registros: registro,
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Haz clic en **Implementar > Nueva implementación**.
4. Selecciona **Aplicación web**.
5. En "Quién puede acceder", selecciona **Cualquier persona**.
6. Copia la **URL de la aplicación web** generada. La necesitaremos para que Excel sepa a dónde enviar los datos.

> [!TIP]
> **Ejemplo de URL**: `https://script.google.com/macros/s/AKfycb...J2UZJ/exec`
> Esta URL es la "dirección" de tu receptor en la nube. **Sin ella, la conexión no funcionará.**

---

## Paso 2: Configuración en Microsoft Excel (VBA)

Para que Excel pueda comunicarse con el mundo exterior, necesitamos configurar el motor de peticiones HTTP.

> [!IMPORTANT]
> **Nombre de la Hoja en Excel**: Tu libro de Excel debe tener una pestaña llamada exactamente **"Info"**, que es donde el código buscará los datos para enviar.

### ⚙️ Preparación del Entorno en Excel

Para que Excel pueda conectarse con Google Sheets, necesitamos habilitar la comunicación HTTP. Aquí te explico qué debes configurar antes de usar el código:

> [!TIP]
> **Elección de Referencia**: Recomendamos activar la referencia manual. Esto permite que Excel "entienda" mejor las peticiones y sea más rápido al procesar los datos.

#### Cómo activar la Referencia (Muy Recomendado)

1. En el editor de VBA (`Alt + F11`), dirígete al menú superior en **Herramientas > Referencias**.
2. Desliza la lista hasta encontrar **Microsoft XML, v6.0** y marca la casilla.
3. Haz clic en **Aceptar**. Esto activará el soporte nativo para peticiones web de alto rendimiento.

---

### 💻 Implementación del Código

1. En el editor de VBA, ve a **Insertar > Módulo**.
2. Copia y pega el código base. Hemos preparado una versión híbrida que detecta si tienes la referencia activa o no:

```vba
Sub EnviarDatosAGoogleSheets()

    Dim ws As Worksheet
    Set ws = ThisWorkbook.Sheets("Info")

    Dim ultimaFila As Long
    ultimaFila = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row

    If ultimaFila < 2 Then
        MsgBox "No hay datos para enviar.", vbExclamation
        Exit Sub
    End If

    ' === Recopilar filas pendientes + guardar su número de fila ===
    Dim filasAEnviar As Collection
    Set filasAEnviar = New Collection

    Dim filasEnviadas As Collection       ' ? nuevo: guarda los números de fila enviados
    Set filasEnviadas = New Collection

    Dim i As Long
    For i = 2 To ultimaFila
        If Trim(CStr(ws.Cells(i, "F").Value)) <> "Exportado" Then
            Dim fila(1 To 5) As Variant
            fila(1) = ws.Cells(i, 1).Value
            fila(2) = ws.Cells(i, 2).Value
            fila(3) = ws.Cells(i, 3).Value
            fila(4) = ws.Cells(i, 4).Value
            fila(5) = ws.Cells(i, 5).Value

            filasAEnviar.Add fila
            filasEnviadas.Add i               ' ? guardamos el número de fila original
        End If
    Next i

    If filasAEnviar.Count = 0 Then
        MsgBox "Todas las filas ya están exportadas.", vbInformation
        Exit Sub
    End If

    ' === Convertir a JSON (sin cambios) ===
    Dim json As String
    json = "["
    For i = 1 To filasAEnviar.Count
        Dim filaActual As Variant
        filaActual = filasAEnviar(i)
        json = json & "["
        Dim j As Integer
        For j = 1 To 5
            Dim valor As Variant
            valor = filaActual(j)
            if IsEmpty(valor) Or IsNull(valor) Then
                json = json & "null"
            Else
                Dim strVal As String
                strVal = CStr(valor)
                strVal = Replace(strVal, """", "\""")
                strVal = Replace(strVal, "\", "\\")
                strVal = Replace(strVal, vbCrLf, " ")
                json = json & """" & strVal & """"
            End If
            If j < 5 Then json = json & ","
        Next j
        json = json & "]"
        If i < filasAEnviar.Count Then json = json & ","
    Next i
    json = json & "]"

    ' === URL del WebApp (REEMPLAZA ESTO) ===
    Dim url As String
    url = "TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI"

    ' === Enviar petición POST ===
    Dim http As Object
    Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")

    On Error GoTo ErrorHandler

    http.Open "POST", url, False
    http.setRequestHeader "Content-Type", "application/json"
    http.Send json

    Dim respuestaCompleta As String
    respuestaCompleta = http.responseText

    If http.Status = 200 Then
        If InStr(1, respuestaCompleta, """estado"":""exito""", vbTextCompare) > 0 Then   ' ? adaptado al español del GAS
            ' Solo marcamos las filas que realmente enviamos
            For i = 1 To filasEnviadas.Count
                Dim numFila As Long
                numFila = filasEnviadas(i)
                ws.Cells(numFila, "F").Value = "Exportado"
            Next i

            MsgBox "Se enviaron y marcaron correctamente " & filasAEnviar.Count & " fila(s).", vbInformation
        Else
            MsgBox "La respuesta no fue exitosa:" & vbCrLf & respuestaCompleta, vbExclamation
        End If
    Else
        MsgBox "Error HTTP " & http.Status & vbCrLf & respuestaCompleta, vbCritical
    End If

    Exit Sub

ErrorHandler:
    MsgBox "Error al conectar con el servidor: " & Err.Description, vbCritical

End Sub
```

> [!IMPORTANT]
> **Vínculo Crítico**: Debes copiar la URL que obtuviste en el **Paso 1** y pegarla dentro de las comillas en la variable `url` del código VBA que acabas de insertar. Si la URL no es correcta o le falta el `/exec` al final, recibirás un error de conexión.

---

## Paso 3: Cómo usar el sistema

1. **Estructura**: Tu hoja de Excel debe llamarse **"Info"**.
2. **Datos**: Coloca tus datos en las columnas A a E.
3. **Control**: La columna **F** se usará para marcar qué filas ya han sido enviadas (se escribirá "Exportado" automáticamente).
4. **Ejecución**: Ejecuta la macro y verás cómo los datos aparecen instantáneamente en tu Google Sheets.

---

## Consideraciones de Seguridad

- **URL Pública**: Al elegir "Cualquier persona" en Google Script, cualquiera con el link podría enviar datos. Para producción, considera añadir una clave de validación (`API_KEY`) en los headers.
- **Límites**: Google Apps Script tiene límites diarios de cuota (normalmente suficientes para miles de envíos).

---

¡Felicidades! Has creado un puente robusto entre el escritorio y la nube. 🚀
