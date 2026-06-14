import fs from 'fs';
const files = [
  'src/App.tsx',
  'src/components/Logo.tsx',
  'src/components/ChatPlayground.tsx',
  'src/components/AdminDashboard.tsx',
  'src/components/LoginRegister.tsx',
  'src/components/CloudflareVerifier.tsx',
  'src/components/InfoCard.tsx',
  'metadata.json',
  'server.ts',
  'index.html'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    const d = fs.readFileSync(f, 'utf8').replace(/CODEINE AI/g, 'CODING AI');
    fs.writeFileSync(f, d);
  }
});
