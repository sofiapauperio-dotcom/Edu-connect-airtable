// server.js — EduConnect proxy para Airtable (não exponha o token no frontend)
// Requisitos: npm i express cors node-fetch

import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID; // ex.: appZTKiUOD8mawUmQ
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;     // ex.: patXXXXXXXX
const AIRTABLE_API = "https://api.airtable.com/v0";

if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
  console.warn("[WARN] Defina AIRTABLE_BASE_ID e AIRTABLE_TOKEN em Secrets do Replit.");
}

async function airtableFetch(method, path, body) {
  const url = `${AIRTABLE_API}/${AIRTABLE_BASE_ID}/${path}`; // path já URL-encoded
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) {
    console.error("Airtable error", res.status, json);
    throw { status: res.status, body: json };
  }
  return json;
}

app.get("/api/health", (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Listar registros de uma tabela: /api/table/Table%201/records?view=Grid%20view
app.get("/api/table/:table/records", async (req, res) => {
  try {
    const table = encodeURIComponent(req.params.table);
    const params = new URLSearchParams();
    if (req.query.view) params.set("view", req.query.view);
    if (req.query.maxRecords) params.set("maxRecords", req.query.maxRecords);
    if (req.query.filterByFormula) params.set("filterByFormula", req.query.filterByFormula);
    const data = await airtableFetch("GET", `${table}/?${params.toString()}`);
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json(e.body || { error: "unknown" });
  }
});

// Criar um registro: body { fields: { Name: "...", Notes: "..." } }
app.post("/api/table/:table/records", async (req, res) => {
  try {
    const table = encodeURIComponent(req.params.table);
    let payload;
    // Aceita {fields:{...}} ou objeto simples {Name:"..."}
    if (req.body && req.body.fields) payload = { records: [{ fields: req.body.fields }] };
    else payload = { records: [{ fields: req.body || {} }] };
    const data = await airtableFetch("POST", `${table}`, payload);
    res.status(201).json(data);
  } catch (e) {
    res.status(e.status || 500).json(e.body || { error: "unknown" });
  }
});

// Atualizar parcialmente um registro
app.patch("/api/table/:table/records/:id", async (req, res) => {
  try {
    const table = encodeURIComponent(req.params.table);
    const id = req.params.id;
    const payload = { records: [{ id, fields: req.body.fields || req.body || {} }] };
    const data = await airtableFetch("PATCH", `${table}`, payload);
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json(e.body || { error: "unknown" });
  }
});

// Excluir um registro
app.delete("/api/table/:table/records/:id", async (req, res) => {
  try {
    const table = encodeURIComponent(req.params.table);
    const id = req.params.id;
    const data = await airtableFetch("DELETE", `${table}?records[]=${id}`);
    res.json(data);
  } catch (e) {
    res.status(e.status || 500).json(e.body || { error: "unknown" });
  }
});

// Servir arquivos estáticos (HTML, CSS, JS) DEPOIS das rotas da API
app.use(express.static('.'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`[EduConnect] API on http://0.0.0.0:${PORT}`));
