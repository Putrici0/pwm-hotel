#!/usr/bin/env node

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {
    input: 'public/data/site-data.json',
    collection: 'pages',
    doc: 'main',
    mode: 'split'
  };

  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];

    if (!key.startsWith('--')) {
      continue;
    }

    if (value === undefined || value.startsWith('--')) {
      args[key.slice(2)] = true;
      continue;
    }

    args[key.slice(2)] = value;
    i += 1;
  }

  return args;
}

function printUsage() {
  console.log(`
Uso:
  node scripts/upload-site-data-to-firestore.cjs --serviceAccount ./serviceAccountKey.json [opciones]

Opciones:
  --serviceAccount  Ruta al JSON de Service Account (obligatorio)
  --projectId       Firebase Project ID (opcional si viene en service account)
  --input           JSON local a subir (default: public/data/site-data.json)
  --collection      Colección destino (default: pages)
  --doc             Documento destino (default: main, solo en mode=single)
  --mode            split | single (default: split)
  --skipImages      No genera placeholders/catálogo de imágenes

Ejemplo:
  node scripts/upload-site-data-to-firestore.cjs --serviceAccount ./serviceAccountKey.json --projectId mi-proyecto-123
`);
}

function parseJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const sanitized = raw.replace(/^\uFEFF/, '');
  return JSON.parse(sanitized);
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function extractUrlFromCss(value) {
  const match = String(value || '').match(/url\((['"]?)(.*?)\1\)/i);
  return match ? match[2] : '';
}

function clearUrlInCss(value) {
  return String(value || '').replace(/url\((['"]?)(.*?)\1\)/gi, "url('')");
}

function fileBaseName(input) {
  if (!input) return '';
  const clean = String(input).split('?')[0].split('#')[0];
  const parts = clean.split(/[\\/]/);
  const file = parts[parts.length - 1] || '';
  return file.replace(/\.[a-z0-9]+$/i, '');
}

function buildImageName(pathStack, node, fallback) {
  const label =
    node.title || node.name || node.nombre || node.subtitle || node.id || fallback || 'image';
  const section = pathStack.filter(Boolean).join('-');
  return slugify(`${section}-${label}`) || 'image';
}

function ensureUniqueName(name, usedNames) {
  let candidate = name || 'image';
  let index = 2;
  while (usedNames.has(candidate)) {
    candidate = `${name}-${index}`;
    index += 1;
  }
  usedNames.add(candidate);
  return candidate;
}

function withImagePlaceholders(node) {
  const imageCatalog = {};
  const usedNames = new Set();

  function walk(value, pathStack) {
    if (Array.isArray(value)) {
      return value.map((item, index) => walk(item, [...pathStack, `item-${index + 1}`]));
    }

    if (!value || typeof value !== 'object') {
      return value;
    }

    const out = {};

    for (const [key, raw] of Object.entries(value)) {
      if (key === 'imageGradient' && typeof raw === 'string') {
        const sourceUrl = extractUrlFromCss(raw);
        const fallback = fileBaseName(sourceUrl);
        const imageName = ensureUniqueName(buildImageName(pathStack, value, fallback), usedNames);
        out.imageName = imageName;
        out.imageUrl = '';
        imageCatalog[imageName] = '';
        out[key] = clearUrlInCss(raw);
        continue;
      }

      if (key === 'imagen' && typeof raw === 'string') {
        const fallback = fileBaseName(raw);
        const imageName = ensureUniqueName(buildImageName(pathStack, value, fallback), usedNames);
        out.imageName = imageName;
        out.imageUrl = '';
        imageCatalog[imageName] = '';
        out[key] = '';
        continue;
      }

      if (key === 'imageUrl' && typeof raw === 'string') {
        const fallback = fileBaseName(raw);
        const imageName = ensureUniqueName(buildImageName(pathStack, value, fallback), usedNames);
        out.imageName = imageName;
        out.imageUrl = '';
        imageCatalog[imageName] = '';
        continue;
      }

      out[key] = walk(raw, [...pathStack, key]);
    }

    return out;
  }

  const transformed = walk(node, []);
  transformed.imageCatalog = imageCatalog;
  return transformed;
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function normalizeDocData(value) {
  if (isPlainObject(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    return { items: value };
  }

  return { value };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.h) {
    printUsage();
    process.exit(0);
  }

  if (!args.serviceAccount) {
    console.error('Falta --serviceAccount');
    printUsage();
    process.exit(1);
  }

  let admin;
  try {
    admin = require('firebase-admin');
  } catch {
    console.error('No se encontro "firebase-admin". Ejecuta: npm i -D firebase-admin');
    process.exit(1);
  }

  const serviceAccountPath = path.resolve(process.cwd(), args.serviceAccount);
  if (!fs.existsSync(serviceAccountPath)) {
    console.error(`No existe el archivo de service account: ${serviceAccountPath}`);
    process.exit(1);
  }

  const inputPath = path.resolve(process.cwd(), args.input);
  if (!fs.existsSync(inputPath)) {
    console.error(`No existe el JSON de entrada: ${inputPath}`);
    process.exit(1);
  }

  const serviceAccount = parseJsonFile(serviceAccountPath);
  const projectId = args.projectId || serviceAccount.project_id;
  if (!projectId) {
    console.error('No se pudo resolver projectId. Pasa --projectId o usa un service account valido.');
    process.exit(1);
  }

  const basePayload = parseJsonFile(inputPath);
  const payload = args.skipImages ? basePayload : withImagePlaceholders(basePayload);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId
  });

  const db = admin.firestore();
  if (args.mode === 'single') {
    const targetRef = db.collection(args.collection).doc(args.doc);
    await targetRef.set(payload, { merge: false });
    console.log(`OK: contenido subido a Firestore en ${args.collection}/${args.doc}`);
  } else {
    const entries = Object.entries(payload).filter(([key]) => key !== 'imageCatalog');
    for (const [key, value] of entries) {
      await db.collection(args.collection).doc(key).set(normalizeDocData(value), { merge: false });
    }

    await db.collection('assets').doc('imageCatalog').set(normalizeDocData(payload.imageCatalog || {}), {
      merge: false
    });

    console.log(`OK: contenido subido en modo split`);
    console.log(`Paginas: ${args.collection}/{${entries.map(([k]) => k).join(', ')}}`);
    console.log(`Imagenes: assets/imageCatalog`);
  }

  console.log(`Project: ${projectId}`);
  console.log(`Input:   ${inputPath}`);
}

main().catch((error) => {
  console.error('Error subiendo contenido a Firestore:');
  console.error(error);
  process.exit(1);
});
