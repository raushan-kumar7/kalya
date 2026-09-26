import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const options = {
  // Base configuration
  app: { type: 'string', short: 'a' },
  dest: { type: 'string', short: 'd' },
  file: { type: 'string', short: 'f' },

  // API Flags (Shortcuts)
  config: { type: 'string' },
  constant: { type: 'string' },
  controller: { type: 'string', short: 'c' },
  db: { type: 'string' },
  error: { type: 'string', short: 'e' },
  lib: { type: 'string' },
  logger: { type: 'string' },
  middleware: { type: 'string', short: 'm' },
  module: { type: 'string' },
  plugin: { type: 'string', short: 'p' },
  repo: { type: 'string' },
  response: { type: 'string' },
  route: { type: 'string', short: 'r' },
  service: { type: 'string', short: 's' },
  type: { type: 'string', short: 't' },
  util: { type: 'string', short: 'u' },

  // Web Flags (Shortcuts)
  component: { type: 'string' }, // Keeping full name to avoid collision with controller -c
  hook: { type: 'string', short: 'h' },
  provider: { type: 'string' },
  store: { type: 'string' },
  style: { type: 'string' },
};

// @ts-ignore
const { values } = parseArgs({ options, strict: false });

const typesMap: Record<string, string> = {
  config: 'configs',
  constant: 'constants',
  controller: 'controllers',
  db: 'db',
  error: 'errors',
  lib: 'libs',
  logger: 'logger',
  middleware: 'middlewares',
  module: 'modules',
  plugin: 'plugins',
  repo: 'repositories',
  response: 'responses',
  route: 'routes',
  service: 'services',
  type: 'types',
  util: 'utils',
  component: 'components',
  hook: 'hooks',
  provider: 'providers',
  store: 'stores',
  style: 'styles',
};

let selectedType = '';
let fileNameInput = '';

// Find if any folder shortcut flag was used
for (const key of Object.keys(typesMap)) {
  if (values[key]) {
    selectedType = key;
    fileNameInput = String(values[key]);
    break;
  }
}

if (!selectedType && (!values.dest || !values.file)) {
  console.error('❌ Error: Missing required arguments.');
  console.error('Usage with app flags: pnpm create:file --app api-server --controller user');
  console.error(
    'Usage with dest:      pnpm create:file --dest apps/api-server/src/controllers --file user-controller.ts'
  );
  process.exit(1);
}

const isComponent = selectedType === 'component';
let finalFileName = fileNameInput;

// Auto-append suffixes (e.g. turning "user" into "user-controller")
if (
  selectedType &&
  !isComponent &&
  !['db', 'logger', 'constant', 'type', 'util', 'config'].includes(selectedType)
) {
  if (!finalFileName.includes(selectedType)) {
    finalFileName = `${finalFileName}-${selectedType}`;
  }
}

if (selectedType && !finalFileName.endsWith('.ts') && !finalFileName.endsWith('.tsx')) {
  finalFileName += isComponent ? '.tsx' : '.ts';
}

// Determine Target Directory
let targetDir = '';
if (values.dest) {
  targetDir = path.resolve(process.cwd(), String(values.dest));
  if (values.file) finalFileName = String(values.file);
} else if (values.app) {
  targetDir = path.resolve(process.cwd(), `apps/${values.app}/src/${typesMap[selectedType]}`);
} else {
  // Default to creating it locally relative if no app provided
  targetDir = path.resolve(process.cwd(), typesMap[selectedType] || '');
}

const targetFile = path.join(targetDir, finalFileName);

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`📁 Created directory: ${targetDir}`);
}

if (fs.existsSync(targetFile)) {
  console.error(`❌ Error: File already exists at ${targetFile}`);
  process.exit(1);
}

// Simple boilerplate: date, time, and an empty module export
const date = new Date().toLocaleDateString();
const time = new Date().toLocaleTimeString();

const boilerplate = `/**
 * Created: ${date} ${time}
 */

export {};
`;

fs.writeFileSync(targetFile, boilerplate, 'utf-8');
console.log(`✅ Successfully created: ${targetFile}`);
