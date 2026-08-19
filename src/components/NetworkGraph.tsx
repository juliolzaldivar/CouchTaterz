/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Users, Tv, Share2, ZoomIn, ZoomOut, RotateCcw, Filter, 
  Search, Shield, Eye, Star, Sparkles, Activity, CheckCircle2, 
  Info, ExternalLink, Maximize2, Minimize2, MessageSquare, Send, Check,
  ChevronDown, ChevronUp
} from 'lucide-react';

interface NetworkGraphProps {
  usersList: any[];
  networkConnections: any[];
  topShowsList?: any[];
  theme?: 'dark' | 'light';
  onInspectUserLibrary?: (userId: string) => void;
  currentUser?: any;
  onSendMessage?: (targetUser: any, messageText: string) => Promise<void> | void;
}

interface NodeData extends d3.SimulationNodeDatum {
  id: string;
  type: 'user' | 'show';
  label: string;
  avatarUrl?: string;
  sublabel?: string;
  status?: string;
  isOnline?: boolean;
  score?: number | null;
  itemCount?: number;
  data?: any;
}

interface LinkData extends d3.SimulationLinkDatum<NodeData> {
  source: string | NodeData;
  target: string | NodeData;
  relationship: 'friend' | 'watch';
  status?: string;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  usersList,
  networkConnections,
  topShowsList = [],
  theme = 'dark',
  onInspectUserLibrary,
  currentUser,
  onSendMessage
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [viewMode, setViewMode] = useState<'all' | 'friends' | 'content'>('all');
  const [contentLimit, setContentLimit] = useState<number>(15);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NodeData | null>(null);

  const [isMessaging, setIsMessaging] = useState<boolean>(false);
  const [messageInput, setMessageInput] = useState<string>('');
  const [sendingMsg, setSendingMsg] = useState<boolean>(false);
  const [msgSentToast, setMsgSentToast] = useState<boolean>(false);

  useEffect(() => {
    setIsMessaging(false);
    setMessageInput('');
    setSendingMsg(false);
    setMsgSentToast(false);
  }, [selectedNode?.id]);

  const handleSendDirectMessage = async () => {
    if (!selectedNode?.data?.id || !messageInput.trim() || sendingMsg) return;
    setSendingMsg(true);

    try {
      if (onSendMessage) {
        await onSendMessage(selectedNode.data, messageInput.trim());
      } else {
        const sender = currentUser || (() => {
          try {
            const saved = localStorage.getItem('coughtater_user');
            return saved ? JSON.parse(saved) : null;
          } catch (e) { return null; }
        })();

        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUserId: selectedNode.data.id,
            notification: {
              id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              senderId: sender?.id || 'guest',
              senderName: sender?.name || 'Binge Buddy',
              senderAvatarUrl: sender?.avatarUrl,
              message: messageInput.trim(),
              timestamp: new Date().toISOString(),
              type: 'message'
            }
          })
        });
      }

      setMsgSentToast(true);
      setMessageInput('');
      setTimeout(() => {
        setMsgSentToast(false);
        setIsMessaging(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to send message from network graph:", err);
    } finally {
      setSendingMsg(false);
    }
  };

  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isLegendMinimized, setIsLegendMinimized] = useState<boolean>(() => {
    return localStorage.getItem('taterz_legend_minimized') === 'true';
  });

  const toggleLegendMinimized = () => {
    setIsLegendMinimized(prev => {
      const next = !prev;
      localStorage.setItem('taterz_legend_minimized', String(next));
      return next;
    });
  };

  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 520 });

  // Handle Resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: clientWidth || 800,
          height: clientHeight || (isMaximized ? 750 : 560)
        });
      }
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [isMaximized]);

  // Process Nodes & Links based on viewMode and filters
  const { nodes, links, connectedNodeIdsMap } = useMemo(() => {
    const nodeMap = new Map<string, NodeData>();
    const linkList: LinkData[] = [];

    // 1. Add User Nodes
    usersList.forEach(u => {
      nodeMap.set(`user_${u.id}`, {
        id: `user_${u.id}`,
        type: 'user',
        label: u.name || 'Watch Buddy',
        avatarUrl: u.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.id}`,
        sublabel: `${u.stats?.totalShows || 0} Shows • ${u.friendsCount || 0} Buddies`,
        isOnline: Boolean(u.isOnline),
        itemCount: u.stats?.totalShows || 0,
        data: u
      });
    });

    // 2. Add Friend Connections (User-to-User links)
    if (viewMode === 'all' || viewMode === 'friends') {
      networkConnections.forEach(conn => {
        const u1Id = `user_${conn.user1Id}`;
        const u2Id = `user_${conn.user2Id}`;

        if (nodeMap.has(u1Id) && nodeMap.has(u2Id)) {
          linkList.push({
            source: u1Id,
            target: u2Id,
            relationship: 'friend'
          });
        }
      });
    }

    // 3. Add Show Nodes and User-to-Show links
    if (viewMode === 'all' || viewMode === 'content') {
      const filteredShows = topShowsList.slice(0, contentLimit);

      filteredShows.forEach(s => {
        const showNodeId = `show_${s.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        
        if (!nodeMap.has(showNodeId)) {
          nodeMap.set(showNodeId, {
            id: showNodeId,
            type: 'show',
            label: s.title,
            sublabel: `${s.count} Users Watch`,
            itemCount: s.count,
            data: s
          });
        }

        // Add links from each user watching this show
        if (Array.isArray(s.users)) {
          s.users.forEach((u: any) => {
            const userNodeId = `user_${u.id}`;
            if (nodeMap.has(userNodeId)) {
              linkList.push({
                source: userNodeId,
                target: showNodeId,
                relationship: 'watch',
                status: u.status || 'Watching'
              });
            }
          });
        }
      });
    }

    const nodeList = Array.from(nodeMap.values());

    // Map connected neighbor node IDs for highlighting
    const connectedMap: Record<string, Set<string>> = {};
    nodeList.forEach(n => {
      connectedMap[n.id] = new Set([n.id]);
    });

    linkList.forEach(l => {
      const srcId = typeof l.source === 'string' ? l.source : (l.source as NodeData).id;
      const tgtId = typeof l.target === 'string' ? l.target : (l.target as NodeData).id;

      if (connectedMap[srcId]) connectedMap[srcId].add(tgtId);
      if (connectedMap[tgtId]) connectedMap[tgtId].add(srcId);
    });

    return { nodes: nodeList, links: linkList, connectedNodeIdsMap: connectedMap };
  }, [usersList, networkConnections, topShowsList, viewMode, contentLimit]);

  // Render D3 Force Layout
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous graph

    const { width, height } = dimensions;

    // Zoom container
    const g = svg.append('g').attr('class', 'graph-container');

    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoomBehavior as any);

    // Simulation Setup
    const simulation = d3.forceSimulation<NodeData>(nodes)
      .force('link', d3.forceLink<NodeData, LinkData>(links)
        .id((d: any) => d.id)
        .distance((d: any) => (d.relationship === 'friend' ? 120 : 85))
      )
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide<NodeData>().radius((d: any) => (d.type === 'user' ? 36 : 28)));

    // Create Pattern Defs for Avatars
    const defs = svg.append('defs');

    // Drop shadow filter for active nodes
    const filter = defs.append('filter')
      .attr('id', 'node-shadow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');
    filter.append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '2')
      .attr('stdDeviation', '4')
      .attr('flood-color', '#3b82f6')
      .attr('flood-opacity', '0.5');

    nodes.forEach(node => {
      if (node.type === 'user' && node.avatarUrl) {
        const patternId = `avatar_${node.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const pattern = defs.append('pattern')
          .attr('id', patternId)
          .attr('width', 1)
          .attr('height', 1)
          .attr('patternContentUnits', 'objectBoundingBox');

        pattern.append('image')
          .attr('href', node.avatarUrl)
          .attr('width', 1)
          .attr('height', 1)
          .attr('preserveAspectRatio', 'xMidYMid slice');
      }
    });

    // Render Links
    const linkGroup = g.append('g').attr('class', 'links');
    const linkElements = linkGroup.selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        if (d.relationship === 'friend') return '#6366f1'; // Indigo for friends
        if (d.status === 'Watching') return '#10b981'; // Green
        if (d.status === 'Completed') return '#3b82f6'; // Blue
        if (d.status === 'Backlog') return '#f59e0b'; // Amber
        return '#f43f5e'; // Rose
      })
      .attr('stroke-opacity', (d) => (d.relationship === 'friend' ? 0.7 : 0.4))
      .attr('stroke-width', (d) => (d.relationship === 'friend' ? 2.5 : 1.5))
      .attr('stroke-dasharray', (d) => (d.relationship === 'watch' ? '4,3' : 'none'));

    // Render Node Group
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const nodeElements = nodeGroup.selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, NodeData>()
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
          })
      )
      .on('mouseenter', (_, d) => setHoveredNode(d))
      .on('mouseleave', () => setHoveredNode(null))
      .on('click', (_, d) => setSelectedNode(d));

    // Circle shape for nodes
    nodeElements.each(function(d) {
      const el = d3.select(this);

      if (d.type === 'user') {
        const patternId = `avatar_${d.id.replace(/[^a-zA-Z0-9]/g, '_')}`;

        // Outer glow/border ring
        el.append('circle')
          .attr('r', 22)
          .attr('fill', d.avatarUrl ? `url(#${patternId})` : '#1e293b')
          .attr('stroke', d.isOnline ? '#10b981' : '#3b82f6')
          .attr('stroke-width', d.isOnline ? 3 : 2)
          .attr('filter', 'url(#node-shadow)');

        // Online status dot
        if (d.isOnline) {
          el.append('circle')
            .attr('cx', 15)
            .attr('cy', -15)
            .attr('r', 5)
            .attr('fill', '#10b981')
            .attr('stroke', '#0f172a')
            .attr('stroke-width', 1.5);
        }
      } else {
        // Show / Content Node
        el.append('circle')
          .attr('r', 16)
          .attr('fill', '#8b5cf6')
          .attr('stroke', '#c084fc')
          .attr('stroke-width', 2);

        // TV icon inside
        el.append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('font-size', '10px')
          .attr('fill', '#ffffff')
          .text('📺');
      }

      // Label text
      el.append('text')
        .attr('dy', d.type === 'user' ? 34 : 28)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .attr('fill', theme === 'dark' ? '#f1f5f9' : '#0f172a')
        .attr('paint-order', 'stroke')
        .attr('stroke', theme === 'dark' ? '#0f172a' : '#ffffff')
        .attr('stroke-width', '3px')
        .attr('stroke-linejoin', 'round')
        .text(d.label.length > 18 ? d.label.slice(0, 16) + '…' : d.label);
    });

    // Tick function
    simulation.on('tick', () => {
      linkElements
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeElements.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    // Cleanup simulation on unmount
    return () => {
      simulation.stop();
    };
  }, [nodes, links, dimensions, theme]);

  // Dynamic Opacity & Highlight effect when searchQuery, hoveredNode, or selectedNode changes
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const q = searchQuery.trim().toLowerCase();

    // Determine matching node IDs for search
    const matchingNodeIds = new Set<string>();
    if (q) {
      nodes.forEach(n => {
        const matchLabel = n.label.toLowerCase().includes(q);
        const matchSublabel = n.sublabel?.toLowerCase().includes(q);
        const matchEmail = n.data?.email?.toLowerCase().includes(q);
        if (matchLabel || matchSublabel || matchEmail) {
          matchingNodeIds.add(n.id);
          const neighbors = connectedNodeIdsMap[n.id];
          if (neighbors) {
            neighbors.forEach(nid => matchingNodeIds.add(nid));
          }
        }
      });
    }

    const activeFocusId = hoveredNode?.id || selectedNode?.id;
    const focusNeighbors = activeFocusId ? connectedNodeIdsMap[activeFocusId] : null;

    // Update Node Opacities & Filter Transitions
    svg.selectAll<SVGGElement, NodeData>('.node')
      .transition()
      .duration(200)
      .style('opacity', (d) => {
        if (focusNeighbors) {
          return focusNeighbors.has(d.id) ? 1 : 0.12;
        }
        if (q) {
          return matchingNodeIds.has(d.id) ? 1 : 0.12;
        }
        return 1;
      });

    // Update Link Opacities
    svg.selectAll<SVGLineElement, LinkData>('.links line')
      .transition()
      .duration(200)
      .style('opacity', (d) => {
        const srcId = typeof d.source === 'string' ? d.source : (d.source as NodeData).id;
        const tgtId = typeof d.target === 'string' ? d.target : (d.target as NodeData).id;

        if (focusNeighbors) {
          return (focusNeighbors.has(srcId) && focusNeighbors.has(tgtId)) ? 0.95 : 0.04;
        }
        if (q) {
          return (matchingNodeIds.has(srcId) && matchingNodeIds.has(tgtId)) ? 0.85 : 0.04;
        }
        return d.relationship === 'friend' ? 0.7 : 0.4;
      });
  }, [searchQuery, hoveredNode, selectedNode, nodes, links, connectedNodeIdsMap]);

  // Count search matches
  const matchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    const q = searchQuery.trim().toLowerCase();
    return nodes.filter(n => 
      n.label.toLowerCase().includes(q) || 
      n.sublabel?.toLowerCase().includes(q) || 
      n.data?.email?.toLowerCase().includes(q)
    ).length;
  }, [searchQuery, nodes]);

  return (
    <div className={
      isMaximized 
        ? "fixed inset-0 z-[1200] p-4 sm:p-6 bg-[#090B10]/95 backdrop-blur-2xl flex flex-col justify-between overflow-hidden h-screen w-screen space-y-3"
        : "space-y-4"
    }>
      {/* Graph Control & Filter Bar */}
      <div className={`p-2.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 ${
        theme === 'dark' ? 'bg-[#151926] border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        {/* Mode Switcher - 3 Category Tabs guaranteed to sit on 1 single line on mobile */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setViewMode('all')}
            className={`flex-1 sm:flex-initial px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap ${
              viewMode === 'all'
                ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Full Graph</span>
            <span className="sm:hidden">All</span>
          </button>

          <button
            onClick={() => setViewMode('friends')}
            className={`flex-1 sm:flex-initial px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap ${
              viewMode === 'friends'
                ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Buddies Only</span>
            <span className="sm:hidden">Buddies</span>
          </button>

          <button
            onClick={() => setViewMode('content')}
            className={`flex-1 sm:flex-initial px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap ${
              viewMode === 'content'
                ? 'bg-purple-600 text-white shadow-sm font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Shows Only</span>
            <span className="sm:hidden">Shows</span>
          </button>
        </div>

        {/* Search, Show Limits & Maximize Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter user or show..."
              className="w-full pl-8 pr-16 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                  matchCount > 0 ? 'bg-blue-500/20 text-blue-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {matchCount}
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-white text-xs font-bold px-1 hover:bg-slate-800 rounded cursor-pointer"
                  title="Clear filter"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {(viewMode === 'all' || viewMode === 'content') && (
            <select
              value={contentLimit}
              onChange={e => setContentLimit(Number(e.target.value))}
              className="py-1.5 px-2.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-slate-200 outline-none cursor-pointer"
            >
              <option value={10}>Top 10 Shows</option>
              <option value={20}>Top 20 Shows</option>
              <option value={40}>Top 40 Shows</option>
            </select>
          )}

          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 cursor-pointer transition shadow-xs"
            title={isMaximized ? "Minimize Graph View" : "Maximize / Fullscreen Graph View"}
          >
            {isMaximized ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-indigo-300" />
                <span className="hidden sm:inline">Minimize</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Expand / Maximize</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Canvas + Legend Overlay Container */}
      <div 
        ref={containerRef}
        className={`relative w-full rounded-2xl border overflow-hidden flex items-center justify-center ${
          isMaximized ? 'h-[calc(100vh-140px)] flex-1' : 'h-[580px]'
        } ${
          theme === 'dark' 
            ? 'bg-[#0B0D14] border-slate-800' 
            : 'bg-slate-900 border-slate-700'
        }`}
      >
        {/* SVG Visualization */}
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
        />

        {/* Floating Legend */}
        {isLegendMinimized ? (
          <button
            onClick={toggleLegendMinimized}
            className="absolute top-3 left-3 px-3 py-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 backdrop-blur-md border border-slate-800 text-xs font-bold text-slate-200 shadow-lg flex items-center gap-2 cursor-pointer transition z-10 group"
            title="Expand Binge Network Legend"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>Legend</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        ) : (
          <div className="absolute top-3 left-3 p-3 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 space-y-1.5 shadow-xl pointer-events-auto max-w-[220px] z-10 transition-all">
            <div className="font-extrabold text-xs text-white flex items-center justify-between gap-1.5 pb-1 border-b border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Binge Network</span>
              </div>
              <button
                onClick={toggleLegendMinimized}
                className="text-slate-400 hover:text-white p-0.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="Minimize Legend"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white/40 shrink-0" />
              <span>User Node</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-white/40 shrink-0" />
              <span>TV Show Node</span>
            </div>
            <div className="pt-1 border-t border-slate-800/80 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px]">
              <span className="flex items-center gap-1 text-indigo-400">
                <span className="w-2.5 h-0.5 bg-indigo-500" /> Buddy
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-0.5 bg-emerald-500" /> Watching
              </span>
              <span className="flex items-center gap-1 text-blue-400">
                <span className="w-2.5 h-0.5 bg-blue-500" /> Completed
              </span>
            </div>
            <div className="pt-1 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-0.5 font-medium">
              <div className="flex items-center gap-1">
                <span className="text-purple-400">•</span> Drag nodes to rearrange
              </div>
              <div className="flex items-center gap-1">
                <span className="text-purple-400">•</span> Click node to inspect/message
              </div>
              <div className="flex items-center gap-1">
                <span className="text-purple-400">•</span> Scroll wheel to zoom
              </div>
            </div>
          </div>
        )}

        {/* Selected / Hovered Node Inspector Detail Modal Card */}
        {selectedNode && (
          <div className="absolute bottom-4 right-4 max-w-xs w-full p-4 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-700 text-white shadow-2xl space-y-3 z-20">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {selectedNode.type === 'user' ? (
                  <img 
                    src={selectedNode.avatarUrl} 
                    alt={selectedNode.label} 
                    className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-lg">
                    📺
                  </div>
                )}
                <div>
                  <h4 className="font-extrabold text-sm leading-tight text-white">{selectedNode.label}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">{selectedNode.sublabel}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {selectedNode.type === 'user' && selectedNode.data && (
              <div className="space-y-2 text-xs border-t border-slate-800 pt-2">
                <div className="flex items-center justify-between text-slate-300 text-[11px]">
                  <span>Email:</span>
                  <span className="font-mono text-slate-400 text-[10px]">{selectedNode.data.email}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 text-[11px]">
                  <span>Watchlist Status:</span>
                  <span className="font-bold text-emerald-400">{selectedNode.data.stats?.watching || 0} Watching</span>
                </div>
                {/* Action Buttons Row: Inspect Queue & Message */}
                <div className="flex items-center gap-2 mt-2">
                  {onInspectUserLibrary && (
                    <button
                      onClick={() => {
                        onInspectUserLibrary(selectedNode.data.id);
                      }}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition truncate"
                      title={`Inspect ${selectedNode.label}'s Queue`}
                    >
                      <Eye className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Inspect Queue</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsMessaging(!isMessaging)}
                    className={`flex-1 py-2 px-2.5 rounded-xl font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition truncate border ${
                      isMessaging 
                        ? 'bg-purple-600 border-purple-400 text-white' 
                        : 'bg-slate-800 hover:bg-purple-600/80 border-slate-700 hover:border-purple-500 text-purple-200 hover:text-white'
                    }`}
                    title={`Message ${selectedNode.label}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                    <span className="truncate">Message</span>
                  </button>
                </div>

                {/* Inline Message Input */}
                {isMessaging && (
                  <div className="space-y-1.5 pt-2 animate-fade-in">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder={`Message ${selectedNode.label}...`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendDirectMessage();
                        }}
                        className="w-full bg-slate-900 border border-purple-500/40 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-400 pr-14"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleSendDirectMessage}
                        disabled={!messageInput.trim() || sendingMsg}
                        className="absolute right-1 px-2 py-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition cursor-pointer"
                      >
                        {sendingMsg ? '...' : (
                          <>
                            <span>Send</span>
                            <Send className="w-2.5 h-2.5" />
                          </>
                        )}
                      </button>
                    </div>
                    {msgSentToast && (
                      <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 animate-fade-in">
                        <Check className="w-3 h-3 stroke-[3]" /> Message sent to {selectedNode.label}!
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedNode.type === 'show' && selectedNode.data && (
              <div className="space-y-2 text-xs border-t border-slate-800 pt-2">
                <p className="text-[11px] text-slate-300 font-bold">Tracked by Binge Buddies:</p>
                <div className="max-h-28 overflow-y-auto space-y-1 scrollbar-thin pr-1">
                  {selectedNode.data.users?.map((u: any, idx: number) => (
                    <div key={`show-user-${u.id || u.name}-${idx}`} className="flex items-center justify-between text-[11px] bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                      <span className="font-extrabold text-blue-300">{u.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                        u.status === 'Watching' ? 'bg-emerald-500/20 text-emerald-400' :
                        u.status === 'Completed' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {u.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
