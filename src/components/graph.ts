/**
 * Client-side force-directed graph, mounted by `/graph` (one Astro island).
 * Nodes are public notes; edges are resolved wikilinks from `graph-data.ts`.
 */

import type { GraphData, GraphNode } from '../lib/graph-data';
import { CATEGORY_COLOR, NOTEBOOK_COLOR, NOTES_COLOR, TAG_COLOR } from '../lib/graph-colors';

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface SimLink {
  source: SimNode;
  target: SimNode;
}

const REPULSION = 900;
const SPRING_K = 0.045;
const REST_LENGTH = 130;
const DAMPING = 0.85;


export function mountGraph(container: HTMLElement, graph: GraphData): void {
  container.replaceChildren();

  if (graph.nodes.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'graph-empty';
    empty.textContent = 'No public notes yet. Write a note with `status: public` and it appears here.';
    container.appendChild(empty);
    return;
  }

  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  svg.setAttribute('viewBox', '0 0 800 520');
  svg.setAttribute('class', 'graph-svg');
  container.appendChild(svg);

  const world = document.createElementNS(namespace, 'g');
  svg.appendChild(world);
  let scale = 1;
  let tx = 0;
  let ty = 0;

  const applyTransform = (): void => {
    world.setAttribute('transform', `translate(${tx} ${ty}) scale(${scale})`);
  };

  const bySlug = new Map<string, SimNode>();
  const nodes: SimNode[] = graph.nodes.map((node, index) => {
    const angle = (index / Math.max(graph.nodes.length, 1)) * Math.PI * 2;
    const sim: SimNode = {
      ...node,
      x: 400 + Math.cos(angle) * 150,
      y: 260 + Math.sin(angle) * 150,
      vx: 0,
      vy: 0,
    };
    bySlug.set(node.slug, sim);
    return sim;
  });

  const links: SimLink[] = graph.links
    .map((link) => {
      const source = bySlug.get(link.source);
      const target = bySlug.get(link.target);
      return source && target ? { ...link, source, target } : undefined;
    })
    .filter((link): link is SimLink => link !== undefined);

  const linkEls = links.map((link) => {
    const line = document.createElementNS(namespace, 'line');
    line.setAttribute('class', 'graph-link');
    world.appendChild(line);
    return { line, link };
  });

  const nodeEls = nodes.map((node) => {
    const g = document.createElementNS(namespace, 'g');
    g.setAttribute('class', 'graph-node');
    const isNote = node.kind === 'note';
    if (isNote) {
      g.setAttribute('cursor', 'pointer');
      g.setAttribute('role', 'link');
      g.setAttribute('tabindex', '0');
    }
    const fill =
      node.kind === 'tag'
        ? TAG_COLOR
        : node.kind === 'category'
          ? CATEGORY_COLOR
          : node.kind === 'notebook'
            ? NOTEBOOK_COLOR
            : NOTES_COLOR;
    let shape: SVGElement;
    if (node.kind === 'category') {
      shape = document.createElementNS(namespace, 'rect');
      shape.setAttribute('x', String(-node.size));
      shape.setAttribute('y', String(-node.size));
      shape.setAttribute('width', String(node.size * 2));
      shape.setAttribute('height', String(node.size * 2));
      shape.setAttribute('class', 'graph-node-rect');
    } else if (node.kind === 'tag') {
      shape = document.createElementNS(namespace, 'polygon');
      const half = node.size;
      shape.setAttribute('points', `0,${-half} ${half * 0.87},${half * 0.5} ${-half * 0.87},${half * 0.5}`);
      shape.setAttribute('class', 'graph-node-tri');
    } else if (node.kind === 'notebook') {
      shape = document.createElementNS(namespace, 'polygon');
      const half = node.size;
      shape.setAttribute('points', `0,${-half} ${half},0 0,${half} ${-half},0`);
      shape.setAttribute('class', 'graph-node-diamond');
    } else {
      shape = document.createElementNS(namespace, 'circle');
      shape.setAttribute('r', String(node.size));
    }
    shape.setAttribute('fill', fill);
    g.appendChild(shape);
    const label = document.createElementNS(namespace, 'text');
    label.setAttribute('class', 'graph-label');
    label.textContent = node.title;
    g.appendChild(label);
    const title = document.createElementNS(namespace, 'title');
    title.textContent =
      node.kind === 'tag'
        ? `${node.title} (tag)`
        : node.kind === 'category'
          ? `${node.title} (category)`
          : node.kind === 'notebook'
            ? `${node.title} (notebook)`
            : node.title;
    g.appendChild(title);
    world.appendChild(g);

    if (isNote) {
      const openNote = (): void => {
        window.location.href = `/vault/${node.slug}`;
      };
      g.addEventListener('click', openNote);
      g.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') openNote();
      });
    }
    return { g, shape, node };
  });

  // Settled layout: repulsion/spring relaxation plus a hard minimum distance
  // between dots so they never clump (about 80% of the natural link length).
  const MIN_DIST = 60;
  const simulate = (steps: number): void => {
    const repulsion = REPULSION;
    for (let i = 0; i < steps; i++) {
      for (const link of links) {
        const dx = link.target.x - link.source.x;
        const dy = link.target.y - link.source.y;
        const dist = Math.max(Math.hypot(dx, dy), 1);
        const force = (dist - REST_LENGTH) * SPRING_K;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        link.source.vx += fx;
        link.source.vy += fy;
        link.target.vx -= fx;
        link.target.vy -= fy;
      }
      for (const a of nodes) {
        for (const b of nodes) {
          if (a === b) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.max(Math.hypot(dx, dy), 1);
          if (dist < MIN_DIST) {
            // Hard push apart when too close.
            const push = (MIN_DIST - dist) * 0.25;
            a.vx += (dx / dist) * push;
            a.vy += (dy / dist) * push;
            b.vx -= (dx / dist) * push;
            b.vy -= (dy / dist) * push;
          }
          const force = repulsion / (dist * dist);
          a.vx += (dx / dist) * force;
          a.vy += (dy / dist) * force;
        }
      }
      for (const node of nodes) {
        node.vx *= DAMPING;
        node.vy *= DAMPING;
        node.x += node.vx;
        node.y += node.vy;
        node.x = Math.max(20, Math.min(780, node.x));
        node.y = Math.max(20, Math.min(500, node.y));
      }
    }
  };

  const render = (): void => {
    for (const { line, link } of linkEls) {
      line.setAttribute('x1', String(link.source.x));
      line.setAttribute('y1', String(link.source.y));
      line.setAttribute('x2', String(link.target.x));
      line.setAttribute('y2', String(link.target.y));
    }
    for (const { g, node } of nodeEls) {
      g.setAttribute('transform', `translate(${node.x} ${node.y})`);
      const label = g.querySelector('text');
      if (label) label.setAttribute('x', String(node.size + 5));
    }
    applyTransform();
  };

  simulate(300);
  render();

  // Drag: move a node directly; re-render until release.
  let dragging: SimNode | null = null;
  svg.addEventListener('pointerdown', (event) => {
    const target = event.target as Element;
    const g = target.closest('.graph-node') as SVGGElement | null;
    if (!g) return; // background pan handled below
    const index = nodeEls.findIndex((entry) => entry.g === g);
    if (index === -1) return;
    dragging = nodes[index]!;
    const move = (moveEvent: PointerEvent): void => {
      if (!dragging) return;
      const rect = svg.getBoundingClientRect();
      dragging.x = (moveEvent.clientX - rect.left - tx) / scale;
      dragging.y = (moveEvent.clientY - rect.top - ty) / scale;
      render();
    };
    const up = (): void => {
      dragging = null;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    event.preventDefault();
  });

  // Background pan + wheel zoom around the cursor.
  let panning = false;
  let panStart = { x: 0, y: 0, tx, ty };
  svg.addEventListener('pointerdown', (event) => {
    const target = event.target as Element;
    if (target.closest('.graph-node')) return;
    panning = true;
    panStart = { x: event.clientX, y: event.clientY, tx, ty };
    const move = (moveEvent: PointerEvent): void => {
      if (!panning) return;
      tx = panStart.tx + (moveEvent.clientX - panStart.x);
      ty = panStart.ty + (moveEvent.clientY - panStart.y);
      applyTransform();
    };
    const up = (): void => {
      panning = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  });
  svg.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      const rect = svg.getBoundingClientRect();
      const mx = event.clientX - rect.left;
      const my = event.clientY - rect.top;
      const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
      const next = Math.min(Math.max(scale * factor, 0.3), 3);
      const k = next / scale;
      tx = mx - (mx - tx) * k;
      ty = my - (my - ty) * k;
      scale = next;
      applyTransform();
    },
    { passive: false },
  );

  // Fade in once positioned (CSS transition on opacity via class swap).
  requestAnimationFrame(() => {
    svg.style.opacity = '1';
  });
}
