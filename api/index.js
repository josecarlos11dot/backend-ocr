// api/index.js — Vercel Serverless (Express con basePath '/api')
const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// Middlewares
app.use(express.json({ limit: '15mb' }));
app.use(cors({
  origin: [
    'https://sistema-frontend-seven.vercel.app', // FRONT
    'https://ocr-proautolavado.vercel.app',      // OCR
    'http://127.0.0.1:5500',
    'http://localhost:5500'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: false
}));

// "DB" en memoria (demo)
let pendientes = []; // { id, placa, imagen, hora }

// Health
app.get('/health', (req, res) => {
  res.json({ ok: true, msg: 'Backend vivo', pendientes: pendientes.length });
});

// Webhook OCR
app.post('/stream', (req, res) => {
  try {
    const body = req.body || {};
    const r = Array.isArray(body.results) && body.results.length ? body.results[0] : null;

    let placa = (r?.plate || body?.plate || '').toUpperCase().trim();
    const imagen =
      r?.vehicle?.crop_url ||
      r?.plate_crop ||
      body?.image_url ||
      body?.image ||
      '';

    if (!placa) return res.json({ ok: true, skipped: true });

    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!pendientes.some(p => p.placa === placa)) {
      pendientes.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        placa,
        imagen,
        hora
      });
    }
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Error procesando webhook' });
  }
});

// API de pendientes
app.post('/pendientes', (req, res) => {
  let { placa, imagen, hora } = req.body || {};
  if (!placa) return res.status(400).json({ ok: false, error: 'Falta placa' });

  placa = placa.toUpperCase().trim();
  hora = hora || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (pendientes.some(p => p.placa === placa)) {
    return res.status(409).json({ ok: false, error: 'Placa ya registrada' });
  }

  const item = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    placa,
    imagen: imagen || '',
    hora
  };
  pendientes.push(item);
  res.status(201).json({ ok: true, data: item });
});

app.get('/pendientes', (req, res) => {
  res.json({ ok: true, data: pendientes });
});

app.delete('/pendientes/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = pendientes.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ ok: false, error: 'No encontrado' });

  const [removed] = pendientes.splice(idx, 1);
  res.json({ ok: true, removed });
});

// Exporta como serverless con basePath '/api'
module.exports = serverless(app, { basePath: '/api' });
