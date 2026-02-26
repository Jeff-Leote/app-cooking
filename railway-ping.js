#!/usr/bin/env node

/**
 * 🚀 Keep-alive ping pour app-cooking (Render)
 * Maintient frontend + backend actifs en envoyant des requêtes périodiques.
 * À exécuter sur un serveur externe ou en local
 */

const https = require('https');
const http = require('http');

// Configuration (modifiable via variables d'environnement)
const FRONTEND_URL = process.env.FRONTEND_PING_URL || 'https://app-cooking-1.onrender.com/healthz';
const BACKEND_URL = process.env.BACKEND_PING_URL || 'https://app-cooking.onrender.com/api/dashboard/summary';
const SITES = [FRONTEND_URL, BACKEND_URL];
const PING_INTERVAL = Number(process.env.PING_INTERVAL_MS || 5 * 60 * 1000); // 5 minutes par défaut

console.log('🚀 Démarrage du keep-alive app-cooking...');
console.log(`⏰ Intervalle: ${PING_INTERVAL / 1000} secondes`);
console.log(`🌐 Sites à pinger: ${SITES.join(', ')}`);

const pingSite = (url) => {
  const startTime = Date.now();
  
  const protocol = url.startsWith('https') ? https : http;
  
  protocol.get(url, (res) => {
    const duration = Date.now() - startTime;
    console.log(`✅ ${url} - ${res.statusCode} - ${duration}ms - ${new Date().toISOString()}`);
  }).on('error', (err) => {
    console.error(`❌ ${url} - Erreur: ${err.message} - ${new Date().toISOString()}`);
  });
};

// Ping initial
console.log('🔄 Ping initial...');
SITES.forEach(pingSite);

// Ping périodique
setInterval(() => {
  console.log('🔄 Ping périodique...');
  SITES.forEach(pingSite);
}, PING_INTERVAL);

console.log('🔄 Keep-alive activé pour app-cooking');
