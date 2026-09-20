/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { 
  Users, 
  Flame, 
  Star, 
  Sparkles, 
  ExternalLink, 
  UserPlus, 
  UserCheck, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter, 
  X, 
  MessageSquare,
  Compass,
  Check,
  Maximize2,
  Minimize2,
  Tv
} from 'lucide-react';
import { FandomMember, ShowFandom, User } from '../types';

interface FandomNetworkGraphProps {
  fandom: ShowFandom;
  allFandoms?: ShowFandom[];
  currentUser?: User | null;
  connectedBuddyIds?: string[];
  theme?: string;
  onSelectMemberBoard: (userId: string) => void;
  onAddBuddy?: (userId: string) => void;
  onCloseModal?: () => void;
}

interface FandomGraphNode extends d3.SimulationNodeDatum {
  id: string;
  type: 'show' | 'user';
  name: string;
  avatarUrl?: string;
  rank?: number;
  rankMedal?: string;
  userScore?: number | null;
  status?: string;
  isOnline?: boolean;
  isSelf?: boolean;
  isBuddy?: boolean;
  activityScore?: number;
  recentTake?: string;
  totalShowsTracked?: number;
  sharedShowsWithSelf?: string[];
  radius: number;
}

interface FandomGraphLink extends d3.SimulationLinkDatum<FandomGraphNode> {
  source: string | FandomGraphNode;
  target: string | FandomGraphNode;
  type: 'core' | 'buddy' | 'taste' | 'score_match';
  sharedShowsCount?: number;
  label?: string;
}

export const FandomNetworkGraph: React.FC<FandomNetworkGraphProps> = ({
  fandom,
  allFandoms = [],
  currentUser,
  connectedBuddyIds = [],
  theme = 'dark',
  onSelectMemberBoard,
  onAddBuddy,
  onCloseModal
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [filterMode, setFilterMode] = useState<'all' | 'buddies' | 'online' | 'high_score'>('all');
  const [selectedNode, setSelectedNode] = useState<FandomGraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<FandomGraphNode | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 600, height: 400 });
  const [isExpanded, setIsExpanded] = useState(false);

  // Exit fullscreen on Escape key
  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isExpanded]);

  // Measure container size with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width: Math.floor(width), height: Math.max(340, Math.floor(height)) });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute shared shows for each member relative to currentUser
  const selfMember = useMemo(() => {
    if (!currentUser) return null;
    return fandom.members.find(m => m.userId === currentUser.id);
  }, [currentUser, fandom]);

  // Build list of shows tracked by each user across allFandoms
  const userShowsMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    allFandoms.forEach(f => {
      f.members.forEach(m => {
        if (!map.has(m.userId)) {
          map.set(m.userId, new Set<string>());
        }
        map.get(m.userId)!.add(f.showTitle);
      });
    });
    return map;
  }, [allFandoms]);

  // Compute Nodes and Links
  const { nodes, links } = useMemo(() => {
    const rawMembers = fandom.members.length > 0 ? fandom.members : fandom.topTenMembers;

    const isUserJoined = Boolean(fandom.isUserJoined);

    // Filter members based on selected filterMode
    const filteredMembers = rawMembers.filter(m => {
      const isMemberSelf = Boolean(
        (currentUser && (m.userId === currentUser.id || m.userId === 'default')) ||
        m.userId === 'default'
      );
      // If this member is the current user, but they haven't joined the fandom yet, exclude them
      if (isMemberSelf && !isUserJoined) {
        return false;
      }
      if (filterMode === 'buddies') return connectedBuddyIds.includes(m.userId);
      if (filterMode === 'online') return Boolean(m.isOnline);
      if (filterMode === 'high_score') return (m.userScore || 0) >= 9;
      return true;
    });

    const graphNodes: FandomGraphNode[] = [];
    const graphLinks: FandomGraphLink[] = [];

    // 1. Central Core Node (The Show Fandom Anchor)
    const showNodeId = `show-core-${fandom.normalizedTitle}`;
    graphNodes.push({
      id: showNodeId,
      type: 'show',
      name: fandom.showTitle,
      avatarUrl: fandom.bannerImage,
      radius: 34
    });

    // 2. User Nodes
    filteredMembers.forEach((member, index) => {
      const isSelf = Boolean(
        (currentUser && (member.userId === currentUser.id || member.userId === 'default')) ||
        member.userId === 'default'
      );
      const isBuddy = connectedBuddyIds.includes(member.userId);
      const rank = index + 1;
      const rankMedal = `#${rank}`;

      // Shared shows with current user
      let sharedWithSelf: string[] = [];
      const currentUserId = currentUser?.id || 'default';
      if (userShowsMap.has(currentUserId) && userShowsMap.has(member.userId)) {
        const myShows = userShowsMap.get(currentUserId)!;
        const theirShows = userShowsMap.get(member.userId)!;
        theirShows.forEach(s => {
          if (s !== fandom.showTitle && myShows.has(s)) {
            sharedWithSelf.push(s);
          }
        });
      }

      // Radius scales with activity and importance
      const radius = isSelf ? 26 : isBuddy ? 23 : rank <= 3 ? 22 : 18;

      const avatarUrl = isSelf && currentUser?.avatarUrl
        ? currentUser.avatarUrl
        : (member.userAvatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${member.userName}`);
      const displayName = isSelf && currentUser?.name ? currentUser.name : member.userName;

      graphNodes.push({
        id: member.userId,
        type: 'user',
        name: displayName,
        avatarUrl,
        rank,
        rankMedal,
        userScore: member.userScore,
        status: member.status,
        isOnline: member.isOnline,
        isSelf,
        isBuddy,
        activityScore: member.activityScore,
        recentTake: member.recentTake,
        totalShowsTracked: member.totalShowsTracked,
        sharedShowsWithSelf: sharedWithSelf,
        radius
      });

      // Connect every member to the central show node
      graphLinks.push({
        source: member.userId,
        target: showNodeId,
        type: 'core'
      });
    });

    // 3. Inter-member Links (Buddy links and Shared Show affinity)
    for (let i = 0; i < filteredMembers.length; i++) {
      for (let j = i + 1; j < filteredMembers.length; j++) {
        const u1 = filteredMembers[i];
        const u2 = filteredMembers[j];

        const isBuddyPair = connectedBuddyIds.includes(u1.userId) && connectedBuddyIds.includes(u2.userId);

        // Check shared shows between u1 and u2
        let sharedCount = 0;
        const u1Shows = userShowsMap.get(u1.userId);
        const u2Shows = userShowsMap.get(u2.userId);
        if (u1Shows && u2Shows) {
          u1Shows.forEach(s => {
            if (s !== fandom.showTitle && u2Shows.has(s)) {
              sharedCount++;
            }
          });
        }

        const sameHighRating = (u1.userScore || 0) >= 9 && u1.userScore === u2.userScore;

        if (isBuddyPair) {
          graphLinks.push({
            source: u1.userId,
            target: u2.userId,
            type: 'buddy',
            label: 'Buddies'
          });
        } else if (sharedCount >= 1) {
          graphLinks.push({
            source: u1.userId,
            target: u2.userId,
            type: 'taste',
            sharedShowsCount: sharedCount,
            label: `${sharedCount} shared`
          });
        } else if (sameHighRating) {
          graphLinks.push({
            source: u1.userId,
            target: u2.userId,
            type: 'score_match',
            label: `Both ★${u1.userScore}`
          });
        }
      }
    }

    return { nodes: graphNodes, links: graphLinks };
  }, [fandom, filterMode, connectedBuddyIds, currentUser, userShowsMap]);

  // Reset zoom & pan helper
  const handleResetZoom = useCallback(() => {
    if (!zoomBehaviorRef.current || !svgRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(400)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  }, []);

  const handleZoom = useCallback((factor: number) => {
    if (!zoomBehaviorRef.current || !svgRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(250)
      .call(zoomBehaviorRef.current.scaleBy, factor);
  }, []);

  // Main D3 Simulation Effect
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = dimensions.width;
    const height = dimensions.height;

    // Outer defs for gradients, patterns, and filters
    const defs = svg.append('defs');

    // Glow filter for show core and selected nodes
    const filter = defs.append('filter')
      .attr('id', 'fandom-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'blur');
    filter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');

    // Create Root Group for Pan & Zoom
    const g = svg.append('g').attr('class', 'fandom-graph-root');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Deep clone nodes and links to allow D3 to mutate x/y
    const simNodes: FandomGraphNode[] = nodes.map(d => ({ ...d }));
    const simLinks: FandomGraphLink[] = links.map(d => ({ ...d }));

    // Create Force Simulation
    const simulation = d3.forceSimulation<FandomGraphNode>(simNodes)
      .force('link', d3.forceLink<FandomGraphNode, FandomGraphLink>(simLinks)
        .id(d => d.id)
        .distance(d => {
          const scale = isExpanded ? 1.4 : 1.0;
          if (d.type === 'core') return 110 * scale;
          if (d.type === 'buddy') return 75 * scale;
          return 95 * scale;
        })
        .strength(d => d.type === 'core' ? 0.6 : 0.35)
      )
      .force('charge', d3.forceManyBody().strength(isExpanded ? -340 : -240))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide<FandomGraphNode>().radius(d => (d.radius + (isExpanded ? 24 : 18))).iterations(2));

    // Draw Links
    const linkGroup = g.append('g').attr('class', 'links');
    const linkElements = linkGroup.selectAll('line')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('stroke', d => {
        if (d.type === 'buddy') return '#a855f7'; // Purple for buddy
        if (d.type === 'taste') return '#38bdf8'; // Sky blue for taste overlap
        if (d.type === 'score_match') return '#f59e0b'; // Amber for score match
        return theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
      })
      .attr('stroke-width', d => {
        if (d.type === 'buddy') return 2.2;
        if (d.type === 'taste') return Math.min(3, 1 + (d.sharedShowsCount || 1) * 0.7);
        return 1.2;
      })
      .attr('stroke-dasharray', d => d.type === 'core' ? '3,3' : 'none')
      .attr('opacity', 0.65);

    // Drag behavior
    const drag = d3.drag<SVGGElement, FandomGraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    // Draw Node Groups
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const nodeElements = nodeGroup.selectAll('g')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'node-item')
      .attr('cursor', 'pointer')
      .call(drag)
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(prev => prev?.id === d.id ? null : d);
      })
      .on('mouseenter', (event, d) => {
        setHoveredNode(d);
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
      });

    // Click outside to deselect
    svg.on('click', () => {
      setSelectedNode(null);
    });

    // 1. Draw Circles & Images for Nodes
    nodeElements.each(function(d) {
      const el = d3.select(this);

      if (d.type === 'show') {
        // Show Core Central Anchor Node
        el.append('circle')
          .attr('r', d.radius + 6)
          .attr('fill', 'none')
          .attr('stroke', '#f59e0b')
          .attr('stroke-width', 2.5)
          .attr('opacity', 0.8)
          .attr('filter', 'url(#fandom-glow)');

        el.append('circle')
          .attr('r', d.radius)
          .attr('fill', theme === 'dark' ? '#1c1917' : '#fef3c7')
          .attr('stroke', '#d97706')
          .attr('stroke-width', 3);

        // Center flame icon inside show core
        el.append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('font-size', '20px')
          .text('🔥');

        // Show Title label
        el.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', d.radius + 15)
          .attr('font-size', '11px')
          .attr('font-weight', '900')
          .attr('fill', theme === 'dark' ? '#fbbf24' : '#b45309')
          .text(d.name.length > 18 ? `${d.name.slice(0, 16)}...` : d.name);

      } else {
        // User Member Node
        const clipId = `clip-fandom-${d.id.replace(/[^a-zA-Z0-9]/g, '_')}`;

        // Create clipPath for avatar
        defs.append('clipPath')
          .attr('id', clipId)
          .append('circle')
          .attr('r', d.radius);

        // Glowing outer ring for Self, Buddies, or Top 3
        if (d.isSelf || d.isBuddy || (d.rank && d.rank <= 3)) {
          el.append('circle')
            .attr('r', d.radius + 4)
            .attr('fill', 'none')
            .attr('stroke', d.isSelf ? '#38bdf8' : d.isBuddy ? '#c084fc' : '#fbbf24')
            .attr('stroke-width', 2)
            .attr('opacity', 0.75);
        }

        // Base circle
        el.append('circle')
          .attr('r', d.radius)
          .attr('fill', theme === 'dark' ? '#18181b' : '#f4f4f5')
          .attr('stroke', d.isSelf ? '#0ea5e9' : d.isBuddy ? '#a855f7' : '#71717a')
          .attr('stroke-width', 2);

        // Avatar Image
        if (d.avatarUrl) {
          el.append('image')
            .attr('href', d.avatarUrl)
            .attr('x', -d.radius)
            .attr('y', -d.radius)
            .attr('width', d.radius * 2)
            .attr('height', d.radius * 2)
            .attr('clip-path', `url(#${clipId})`)
            .attr('preserveAspectRatio', 'xMidYMid slice');
        }

        // Online Status Dot
        if (d.isOnline) {
          el.append('circle')
            .attr('cx', d.radius - 3)
            .attr('cy', -d.radius + 3)
            .attr('r', 3.5)
            .attr('fill', '#10b981')
            .attr('stroke', '#09090b')
            .attr('stroke-width', 1.5);
        }

        // Rank Badge on top left
        if (d.rank && (d.rank || 0) <= 5) {
          el.append('text')
            .attr('x', -d.radius + 2)
            .attr('y', -d.radius + 2)
            .attr('font-size', '9px')
            .attr('font-family', 'monospace')
            .attr('font-weight', 'bold')
            .attr('fill', '#f59e0b')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .text(`#${d.rank}`);
        }

        // User Name Label Underneath
        el.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', d.radius + 12)
          .attr('font-size', '10px')
          .attr('font-weight', d.isSelf ? '900' : '700')
          .attr('fill', d.isSelf ? '#38bdf8' : d.isBuddy ? '#c084fc' : theme === 'dark' ? '#e2e8f0' : '#1e293b')
          .text(d.isSelf ? 'YOU' : d.name.length > 10 ? `${d.name.slice(0, 9)}..` : d.name);

        // Score Badge
        if (d.userScore) {
          el.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', d.radius + 22)
            .attr('font-size', '9px')
            .attr('font-weight', '700')
            .attr('fill', '#f59e0b')
            .text(`★${d.userScore}`);
        }
      }
    });

    // Simulation Tick Updates
    simulation.on('tick', () => {
      linkElements
        .attr('x1', d => ((d.source as FandomGraphNode).x || 0))
        .attr('y1', d => ((d.source as FandomGraphNode).y || 0))
        .attr('x2', d => ((d.target as FandomGraphNode).x || 0))
        .attr('y2', d => ((d.target as FandomGraphNode).y || 0));

      nodeElements
        .attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, dimensions, theme, isExpanded]);

  return (
    <>
      {/* Expanded Mode Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[80] transition-opacity"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div 
        className={
          isExpanded 
            ? 'fixed inset-2 sm:inset-4 md:inset-6 z-[90] rounded-2xl overflow-hidden border border-purple-500/40 bg-[#0c0e14] shadow-2xl flex flex-col backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200' 
            : 'relative w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0c0e14] shadow-inner'
        }
      >
        {/* Top Filter Bar & Controls */}
        <div className={`z-10 flex items-center justify-between gap-2 pointer-events-auto flex-wrap ${
          isExpanded ? 'p-3 bg-black/60 border-b border-white/10 backdrop-blur-md' : 'absolute top-2 left-2 right-2'
        }`}>
          {/* Filter Pills & Expanded Title */}
          <div className="flex items-center gap-2 flex-wrap">
            {isExpanded && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-200 text-xs font-black">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-current animate-pulse" />
                <span>{fandom.showTitle} Constellation</span>
              </div>
            )}

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-amber-500 text-black shadow-xs font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                All Members ({nodes.filter(n => n.type === 'user').length})
              </button>
              
              {connectedBuddyIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterMode('buddies')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition cursor-pointer flex items-center gap-1 ${
                    filterMode === 'buddies'
                      ? 'bg-purple-600 text-white shadow-xs font-black'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  <Users className="w-3 h-3" />
                  <span>Buddies</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setFilterMode('online')}
                className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition cursor-pointer flex items-center gap-1 ${
                  filterMode === 'online'
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Online</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('high_score')}
                className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition cursor-pointer flex items-center gap-1 ${
                  filterMode === 'high_score'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-xs'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                <Star className="w-2.5 h-2.5 fill-current text-amber-400" />
                <span>★9+ Only</span>
              </button>
            </div>
          </div>

          {/* Zoom & Reset Controls + Fullscreen Toggle */}
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => handleZoom(1.3)}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(0.7)}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-3.5 bg-white/20 mx-0.5" />

            {/* Expand / Collapse Fullscreen */}
            {isExpanded ? (
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[10px] flex items-center gap-1 transition cursor-pointer shadow-xs active:scale-95"
                title="Exit Fullscreen (Esc)"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Fullscreen</span>
                <kbd className="hidden sm:inline-block text-[9px] font-mono px-1 py-0.2 rounded bg-black/30 text-purple-200">ESC</kbd>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="px-2 py-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-600/30 transition cursor-pointer flex items-center gap-1 font-extrabold text-[10px]"
                title="Expand network graph to Fullscreen / Theater Mode"
              >
                <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Expand</span>
              </button>
            )}
          </div>
        </div>

        {/* SVG Canvas */}
        <div 
          ref={containerRef} 
          className={`w-full ${
            isExpanded ? 'flex-1 h-full min-h-[500px]' : 'h-[400px] sm:h-[460px] md:h-[500px]'
          } cursor-grab active:cursor-grabbing select-none`}
        >
          <svg
            ref={svgRef}
            className="w-full h-full"
          />
        </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-2 left-2 z-10 hidden sm:flex items-center gap-3 bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 text-[10px] text-slate-300 pointer-events-none">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>You</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span>Binge Buddy</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Top Superfan</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-sky-400 inline-block" />
          <span>Taste Overlap</span>
        </span>
      </div>

      {/* Selected Node Inspector Drawer / Card */}
      {selectedNode && (
        <div 
          className="absolute bottom-2 right-2 left-2 sm:left-auto sm:w-80 z-20 bg-[#12151f]/95 border border-amber-500/40 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 space-y-2.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={selectedNode.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${selectedNode.name}`}
                  alt={selectedNode.name}
                  className="w-9 h-9 rounded-full object-cover border border-amber-500/30"
                />
                {selectedNode.isOnline && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#12151f] absolute -bottom-0.5 -right-0.5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-extrabold text-xs text-white truncate">
                    {selectedNode.name}
                  </h4>
                  {selectedNode.isSelf && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400">
                      YOU
                    </span>
                  )}
                  {selectedNode.isBuddy && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400">
                      BUDDY
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span id="selected-node-superfan-badge">
                    {selectedNode.rank ? (selectedNode.rank === 1 ? 'Top Superfan' : `Superfan (#${selectedNode.rank})`) : 'Fandom Member'}
                  </span>
                  {selectedNode.status && (
                    <>
                      <span>•</span>
                      <span className="text-amber-400/90">{selectedNode.status}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Score & Recent Take */}
          {selectedNode.type === 'user' && (
            <div className="space-y-1.5">
              {selectedNode.userScore && (
                <div className="flex items-center justify-between text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <span className="font-medium">Rating for {fandom.showTitle}:</span>
                  <span className="font-black flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current text-amber-400" />
                    {selectedNode.userScore} / 10
                  </span>
                </div>
              )}

              {selectedNode.recentTake && (
                <div className="p-2 rounded-lg bg-black/30 border border-white/5 text-[11px] text-slate-300 italic leading-relaxed">
                  "{selectedNode.recentTake}"
                </div>
              )}

              {/* Shared Shows Overlap */}
              {selectedNode.sharedShowsWithSelf && selectedNode.sharedShowsWithSelf.length > 0 && (
                <div className="text-[10px] text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2 py-1 rounded-lg flex items-center gap-1">
                  <Compass className="w-3 h-3 shrink-0 text-sky-400" />
                  <span className="truncate">
                    Also tracks: {selectedNode.sharedShowsWithSelf.slice(0, 2).join(', ')}
                    {selectedNode.sharedShowsWithSelf.length > 2 ? ` +${selectedNode.sharedShowsWithSelf.length - 2} more` : ''}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1 border-t border-white/10">
            {selectedNode.type === 'user' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    onSelectMemberBoard(selectedNode.id);
                    if (onCloseModal) onCloseModal();
                  }}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View Board</span>
                </button>

                {!selectedNode.isSelf && !selectedNode.isBuddy && onAddBuddy && (
                  <button
                    type="button"
                    onClick={() => onAddBuddy(selectedNode.id)}
                    className="py-1.5 px-2.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 font-extrabold text-xs flex items-center justify-center gap-1 transition cursor-pointer active:scale-95"
                    title="Add as Binge Buddy"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Buddy</span>
                  </button>
                )}
              </>
            )}
            {selectedNode.type === 'show' && (
              <div className="text-[11px] text-slate-300 font-bold text-center w-full">
                🔥 Fandom Core: {fandom.memberCount} Members
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
};
