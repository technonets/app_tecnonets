# Integración de Licenciamiento en Google Sheets (Google Apps Script)

Este snippet permite que cualquiera de tus plantillas o sistemas desarrollados en **Google Sheets** consulte en tiempo real la API de Tecnonets para validar si el cliente tiene una licencia activa o en periodo de prueba de 14 días.

---

## 💻 Código para Google Apps Script (`Código.gs`)

Pega este código en el editor de secuencias de comandos de tu Google Sheet (**Extensiones > Apps Script**):

```javascript
// Modulo de validacion de licencias Tecnonets para Google Sheets

const API_ENDPOINT = "https://tecnonets.com/api/v1/licenses/verify";

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Licencia Tecnonets')
    .addItem('Activar / Validar Licencia', 'verificarLicenciaManual')
    .addItem('Estado de la Licencia', 'consultarEstadoLicencia')
    .addToUi();

  validarLicenciaEnSegundoPlano();
}

function validarLicencia(licenseKey) {
  if (!licenseKey) {
    return { valid: false, message: "No se ha ingresado una clave de licencia." };
  }

  const sheetId = SpreadsheetApp.getActiveSpreadsheet().getId();

  const payload = {
    license_key: licenseKey.trim(),
    origin_identifier: sheetId
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(API_ENDPOINT, options);
    const data = JSON.parse(response.getContentText());
    return data;
  } catch (error) {
    return { valid: false, message: "Error de conexión con el servidor de licencias." };
  }
}

function verificarLicenciaManual() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getDocumentProperties();
  const currentKey = props.getProperty("TECNONETS_LICENSE_KEY") || "";

  const prompt = ui.prompt(
    'Validación de Licencia Tecnonets',
    'Ingresa tu clave de licencia (Formato: TEC-XXXX-XXXX-XXXX):',
    ui.ButtonSet.OK_CANCEL
  );

  if (prompt.getSelectedButton() === ui.Button.OK) {
    const keyIngresada = prompt.getResponseText().trim();
    if (!keyIngresada) {
      ui.alert('Error', 'Debes ingresar una clave válida.', ui.ButtonSet.OK);
      return;
    }

    const resultado = validarLicencia(keyIngresada);

    if (resultado.valid) {
      props.setProperty("TECNONETS_LICENSE_KEY", keyIngresada);
      ui.alert('Licencia Validada', resultado.message, ui.ButtonSet.OK);
    } else {
      ui.alert('Licencia No Válida', resultado.message, ui.ButtonSet.OK);
    }
  }
}

function consultarEstadoLicencia() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getDocumentProperties();
  const licenseKey = props.getProperty("TECNONETS_LICENSE_KEY");

  if (!licenseKey) {
    ui.alert('Sin Licencia', 'Esta hoja no tiene una clave registrada. Ve a "Activar / Validar Licencia".', ui.ButtonSet.OK);
    return;
  }

  const resultado = validarLicencia(licenseKey);
  ui.alert(
    resultado.valid ? 'Licencia Válida' : 'Licencia Inactiva',
    `Clave: ${licenseKey}\n\nEstado: ${resultado.status.toUpperCase()}\nDetalle: ${resultado.message}`,
    ui.ButtonSet.OK
  );
}

function validarLicenciaEnSegundoPlano() {
  const props = PropertiesService.getDocumentProperties();
  const licenseKey = props.getProperty("TECNONETS_LICENSE_KEY");

  if (licenseKey) {
    const res = validarLicencia(licenseKey);
    if (!res.valid) {
      SpreadsheetApp.getActiveSpreadsheet().toast(res.message, 'Licencia Tecnonets', 8);
    }
  }
}
```

