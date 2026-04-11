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

// Load fonts (TTF required by Satori)
const poppinsLight = readFileSync(join(__dirname, '..', 'public', 'fonts', 'poppins-light.ttf'));
const poppinsRegular = readFileSync(join(__dirname, '..', 'public', 'fonts', 'poppins-regular.ttf'));

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
    // Handle single-line values: key: 'value' or key: value
    const singleLine = fm.match(new RegExp(`^${key}:\\s*['"](.*)['"]\\s*$`, 'm'));
    if (singleLine) return singleLine[1].replace(/\\n/g, '\n');

    const unquoted = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
    if (unquoted) {
      const val = unquoted[1].trim();
      // Handle YAML multiline indicators (>-, |-, >, |)
      if (/^[>|]-?\s*$/.test(val)) {
        const keyIndex = fm.indexOf(unquoted[0]);
        const afterKey = fm.slice(keyIndex + unquoted[0].length);
        const lines = afterKey.split('\n');
        const continued = [];
        for (const line of lines) {
          if (line.match(/^\s+\S/)) {
            continued.push(line.trim());
          } else if (continued.length > 0) {
            break;
          }
        }
        return continued.join(' ').replace(/\\n/g, '\n');
      }
      return val.replace(/\\n/g, '\n');
    }
    return undefined;
  };

  return {
    title: get('title'),
    description: get('description'),
    metaTitle: get('metaTitle'),
    ogTitle: get('ogTitle'),
    ogDescription: get('ogDescription'),
    icon: get('icon'),
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
function buildImage(title, description, icon) {
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

  // Title (supports \n line breaks)
  const titleLines = title.split('\n');
  const titleFontSize = title.replace(/\n/g, '').length > 40 ? '52px' : '60px';

  children.push({
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: titleFontSize,
        fontWeight: 300,
        color: '#4a4670',
        textAlign: 'center',
        lineHeight: 1.3,
        maxWidth: '950px',
        letterSpacing: '-0.5px',
      },
      children: titleLines.map((line) => ({
        type: 'div',
        props: { children: line },
      })),
    },
  });

  // Description
  if (description) {
    children.push({
      type: 'div',
      props: {
        style: {
          fontSize: '32px',
          fontWeight: 300,
          color: '#8580a8',
          textAlign: 'center',
          lineHeight: 1.5,
          maxWidth: '65%',
          marginTop: '16px',
        },
        children:
          description.length > 120
            ? description.slice(0, 117) + '...'
            : description,
      },
    });
  }

  // Background: light center, color around edges
  const orbs = [
    // Center lightening — bright white wash behind text
    {
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          top: '80px',
          left: '200px',
          width: '800px',
          height: '470px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 70%)',
        },
      },
    },
    // Purple — top-left corner
    {
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          top: '-200px',
          left: '-150px',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(95,106,242,0.18) 0%, transparent 65%)',
        },
      },
    },
    // Cyan — top-right corner
    {
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          top: '-180px',
          right: '-120px',
          width: '580px',
          height: '580px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(86,255,245,0.12) 0%, transparent 65%)',
        },
      },
    },
    // Pink — bottom-right corner
    {
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          bottom: '-200px',
          right: '-80px',
          width: '620px',
          height: '620px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(242,95,208,0.12) 0%, transparent 65%)',
        },
      },
    },
    // Blue — bottom-left corner
    {
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          bottom: '-180px',
          left: '-100px',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,26,255,0.10) 0%, transparent 65%)',
        },
      },
    },
  ];

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
        background: 'linear-gradient(145deg, #e4dff4 0%, #ddd6f0 25%, #e2dcf2 50%, #dbd4ee 75%, #e0d9f0 100%)',
        fontFamily: 'Poppins',
        padding: '60px 80px',
        position: 'relative',
        overflow: 'hidden',
      },
      children: [...orbs, ...children],
    },
  };
}

async function generateImage(slug, title, description, icon) {
  const element = buildImage(title, description, icon);

  const svg = await satori(element, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: 'Poppins',
        data: poppinsLight,
        weight: 300,
        style: 'normal',
      },
      {
        name: 'Poppins',
        data: poppinsRegular,
        weight: 400,
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
    const { title, description, metaTitle, ogTitle, ogDescription, icon } = parseFrontmatter(content);

    let slug = relative(docsDir, file).replace(/\.mdx$/, '');
    if (slug === 'index') slug = 'index';

    // ogTitle overrides everything. Otherwise use the simple page title,
    // prefixed with the framework name for framework-specific pages.
    let displayTitle = ogTitle;
    if (!displayTitle) {
      const cleanTitle = title || slug.split('/').pop() || slug;
      const framework = slug.match(/^(react|vue|svelte|solid)\//)?.[1];
      if (framework && !cleanTitle.toLowerCase().includes(framework)) {
        const frameworkName = framework.charAt(0).toUpperCase() + framework.slice(1);
        displayTitle = `${cleanTitle} — ${frameworkName}`;
      } else {
        displayTitle = cleanTitle;
      }
    }
    displayTitle = displayTitle
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/<[^>]+>/g, '');

    const cleanDescription = ogDescription !== undefined
      ? (ogDescription || undefined)
      : description
          ?.replace(/\*\*(.*?)\*\*/g, '$1')
          ?.replace(/<[^>]+>/g, '')
          ?.replace(/`([^`]+)`/g, '$1');

    await generateImage(slug, displayTitle, cleanDescription, icon);
    count++;
  }

  console.log(`Generated ${count} OG images in ${outputDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
