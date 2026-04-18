function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Optional: manual sanity-check (Run → testSendEmailOnce)
// This does NOT test the Web App, but verifies MailApp permissions/delivery.
function testSendEmailOnce() {
  MailApp.sendEmail("cherdaka@gmail.com", "x4e6: test email from Apps Script", "If you see this, MailApp works.");
}

function doPost(e) {
  try {
    // Accept either:
    // 1) form-encoded field "payload" (recommended for browser POSTs)
    // 2) raw JSON body
    var raw = "";
    if (e && e.parameter && e.parameter.payload) {
      raw = String(e.parameter.payload);
    } else if (e && e.postData && e.postData.contents) {
      raw = String(e.postData.contents || "");
      // If someone still POSTs "payload=...." as a raw body, extract it.
      if (raw.indexOf("payload=") === 0) {
        var parts = raw.split("payload=");
        raw = decodeURIComponent(parts.slice(1).join("payload="));
      }
    }

    if (!raw || String(raw).trim() === "") return jsonResponse({ ok: false, error: "empty_payload" });

    var payload = JSON.parse(String(raw));
    var to = "cherdaka@gmail.com";

    var completedAtLocal = (payload && payload.completedAtLocal) ? String(payload.completedAtLocal) : "";
    var subject = completedAtLocal
      ? ("x4e6: результаты теста - " + completedAtLocal)
      : "x4e6: результаты теста";

    // Short human-friendly summary in the email body
    var lines = [];
    lines.push("Результаты теста x4e6");
    if (completedAtLocal) lines.push("Дата/время: " + completedAtLocal);

    if (payload && payload.scores) {
      lines.push("");
      lines.push("Сводка:");
      if (payload.scores.sumA !== undefined) lines.push("sumA: " + payload.scores.sumA);
      if (payload.scores.sumB !== undefined) lines.push("sumB: " + payload.scores.sumB);
      if (payload.scores.index !== undefined) lines.push("index: " + payload.scores.index);
      if (payload.scores.base !== undefined) lines.push("base: " + payload.scores.base);
    }

    lines.push("");
    lines.push("Полные данные — во вложении results.json");

    var bodyText = lines.join("\n");

    // Attach the raw payload as JSON (easier to handle than a huge body)
    var json = JSON.stringify(payload, null, 2);

    // Name attachment results_DD-MM-YYYY.json (best-effort; falls back to results.json)
    var filename = "results.json";
    if (payload && payload.completedAt) {
      var d = new Date(String(payload.completedAt));
      if (!isNaN(d.getTime())) {
        var dd = ("0" + d.getDate()).slice(-2);
        var mm = ("0" + (d.getMonth() + 1)).slice(-2);
        var yyyy = String(d.getFullYear());
        filename = "results_" + dd + "-" + mm + "-" + yyyy + ".json";
      }
    }

    var blob = Utilities.newBlob(json, "application/json", filename);

    MailApp.sendEmail({
      to: to,
      subject: subject,
      body: bodyText,
      attachments: [blob]
    });
    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

