/**
 * Generate per-page OG images (1200x630 PNG) using Satori + resvg.
 * Run: node scripts/generate-og-image.mjs
 *
 * Design inspired by the dnd-kit hero banner — large centered logo,
 * page title, soft lavender gradient background.
 */
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsDir = join(__dirname, '..', 'docs');
const outputDir = join(__dirname, '..', 'public', 'og');

// Load Inter font
const interFont = readFileSync(join(__dirname, '..', 'public', 'fonts', 'inter-latin.ttf'));

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
      // Skip snippets directory
      if (entry === 'snippets') continue;
      findMdxFiles(full, files);
    } else if (entry.endsWith('.mdx')) {
      files.push(full);
    }
  }
  return files;
}

/**
 * The dnd-kit logo as SVG path (arrows icon).
 */
const LogoIcon = {
  type: 'svg',
  props: {
    width: 56,
    height: 56,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'white',
    strokeWidth: 2.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    children: [
      { type: 'polyline', props: { points: '15 3 21 3 21 9' } },
      { type: 'polyline', props: { points: '9 21 3 21 3 15' } },
      { type: 'line', props: { x1: 21, y1: 3, x2: 14, y2: 10 } },
      { type: 'line', props: { x1: 3, y1: 21, x2: 10, y2: 14 } },
    ],
  },
};

/**
 * Build the OG image JSX tree for Satori.
 */
function buildImage(title, description) {
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
        background: 'linear-gradient(135deg, #f0eef8 0%, #e8e4f4 25%, #ddd8f0 50%, #e8e4f4 75%, #f0eef8 100%)',
        fontFamily: 'Inter',
        padding: '60px 80px',
      },
      children: [
        // Logo
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '40px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '88px',
                    height: '88px',
                    backgroundColor: '#000000',
                    borderRadius: '20px',
                    border: '4px solid #7c6bc4',
                  },
                  children: [LogoIcon],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '52px',
                    fontWeight: 700,
                    color: '#1a1a2e',
                    letterSpacing: '-2px',
                  },
                  children: 'dnd kit',
                },
              },
            ],
          },
        },
        // Title
        {
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
        },
        // Description
        ...(description
          ? [
              {
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
              },
            ]
          : []),
      ],
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

    // Derive slug from file path relative to docs dir
    let slug = relative(docsDir, file).replace(/\.mdx$/, '');
    if (slug === 'index') slug = 'index';

    // Use title for the OG image text, strip " - dnd kit" or " | dnd kit" from metaTitle
    const displayTitle =
      (metaTitle?.replace(/\s*[-|]\s*dnd kit$/, '') || title || slug)
        // Strip markdown bold and HTML from description
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
