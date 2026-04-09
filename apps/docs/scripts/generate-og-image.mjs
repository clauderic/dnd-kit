/**
 * Generate per-page OG images (1200x630 PNG) using Satori + resvg.
 * Run: node scripts/generate-og-image.mjs
 *
 * Design inspired by the dnd-kit hero banner — large centered logo,
 * page title, soft lavender gradient background.
 */
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsDir = join(__dirname, '..', 'docs');
const outputDir = join(__dirname, '..', 'public', 'og');

// Load Inter font (TTF required by Satori)
const interFont = readFileSync(join(__dirname, '..', 'public', 'fonts', 'inter-latin.ttf'));

// Convert the real logo SVG to a base64 PNG for embedding in Satori
function createLogoPng() {
  // Try to find the logo SVG — it may be in dist (after a build) or in the mintlify static assets
  const candidates = [
    join(__dirname, '..', 'dist', 'images', 'logo', 'logo.svg'),
    join(__dirname, '..', '..', '..', '.github', 'assets', 'dnd-kit-hero-banner.svg'),
  ];

  // Use the logo.svg from the docs.json config, synced by @mintlify/astro to dist
  let logoSvgPath = candidates.find((p) => existsSync(p));

  if (!logoSvgPath) {
    console.warn('Logo SVG not found, using fallback text logo');
    return null;
  }

  // Read the logo SVG and render it to PNG
  let logoSvg = readFileSync(logoSvgPath, 'utf-8');

  // Remove animation elements that resvg doesn't support
  logoSvg = logoSvg.replace(/<animate[\s\S]*?<\/animate>\s*/g, '');
  logoSvg = logoSvg.replace(/<animate[^>]*\/>\s*/g, '');

  // For the hero banner, we only want the logo portion
  if (logoSvgPath.includes('hero-banner')) {
    return null; // Too complex, use the logo.svg instead
  }

  const resvg = new Resvg(logoSvg, {
    fitTo: { mode: 'width', value: 600 },
    font: { loadSystemFonts: false },
  });
  const png = resvg.render().asPng();
  return `data:image/png;base64,${Buffer.from(png).toString('base64')}`;
}

const logoPngDataUri = createLogoPng();

const WIDTH = 1200;
const HEIGHT = 630;

/**
 * Extract title and description from MDX frontmatter.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const fm = match[1];
  const get = (key) => {
    const m = fm.match(new RegExp(`^${key}:\\s*['"]?(.*?)['"]?\\s*$`, 'm'));
    return m ? m[1] : undefined;
  };

  return {
    title: get('title'),
    description: get('description'),
    metaTitle: get('metaTitle'),
  };
}

/**
 * Recursively find all .mdx files in a directory.
 */
function findMdxFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'snippets') continue;
      findMdxFiles(full, files);
    } else if (entry.endsWith('.mdx')) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Build the OG image element tree for Satori.
 */
function buildImage(title, description) {
  const children = [];

  // Logo
  if (logoPngDataUri) {
    children.push({
      type: 'img',
      props: {
        src: logoPngDataUri,
        width: 380,
        height: 126,
        style: { marginBottom: '36px' },
      },
    });
  } else {
    // Fallback text logo
    children.push({
      type: 'div',
      props: {
        style: {
          fontSize: '52px',
          fontWeight: 700,
          color: '#1a1a2e',
          letterSpacing: '-2px',
          marginBottom: '36px',
        },
        children: 'dnd kit',
      },
    });
  }

  // Title
  children.push({
    type: 'div',
    props: {
      style: {
        fontSize: title.length > 40 ? '40px' : '48px',
        fontWeight: 700,
        color: '#1a1a2e',
        textAlign: 'center',
        lineHeight: 1.2,
        maxWidth: '900px',
      },
      children: title,
    },
  });

  // Description
  if (description) {
    children.push({
      type: 'div',
      props: {
        style: {
          fontSize: '22px',
          color: '#666680',
          textAlign: 'center',
          lineHeight: 1.5,
          maxWidth: '800px',
          marginTop: '20px',
        },
        children:
          description.length > 120
            ? description.slice(0, 117) + '...'
            : description,
      },
    });
  }

  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #f0eef8 0%, #e8e4f4 25%, #ddd8f0 50%, #e8e4f4 75%, #f0eef8 100%)',
        fontFamily: 'Inter',
        padding: '60px 80px',
      },
      children,
    },
  };
}

async function generateImage(slug, title, description) {
  const element = buildImage(title, description);

  const svg = await satori(element, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: 'Inter',
        data: interFont,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Inter',
        data: interFont,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: WIDTH },
  });
  const png = resvg.render().asPng();

  const outPath = join(outputDir, `${slug}.png`);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, png);
  return outPath;
}

async function main() {
  console.log('Generating OG images...');

  const mdxFiles = findMdxFiles(docsDir);
  let count = 0;

  for (const file of mdxFiles) {
    const content = readFileSync(file, 'utf-8');
    const { title, description, metaTitle } = parseFrontmatter(content);

    let slug = relative(docsDir, file).replace(/\.mdx$/, '');
    if (slug === 'index') slug = 'index';

    const displayTitle = (metaTitle?.replace(/\s*[-|]\s*dnd kit$/, '') || title || slug)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/<[^>]+>/g, '');

    const cleanDescription = description
      ?.replace(/\*\*(.*?)\*\*/g, '$1')
      ?.replace(/<[^>]+>/g, '')
      ?.replace(/`([^`]+)`/g, '$1');

    await generateImage(slug, displayTitle, cleanDescription);
    count++;
  }

  console.log(`Generated ${count} OG images in ${outputDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
