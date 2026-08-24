import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, ChevronDown, Star, BookmarkPlus, CheckCircle2, UserPlus, 
  Zap, ArrowRight, Sparkles, Activity, MessageSquare, ZoomIn, ZoomOut,
  RotateCcw, Filter, ExternalLink, Check, Tv
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as d3 from 'd3';
import { JULIO_OFFICIAL_AVATAR } from '../../utils/taterAvatarUtils';

interface BuddiesSectionProps {
  isBuddyDropdownOpen: boolean;
  setIsBuddyDropdownOpen: (open: boolean) => void;
  selectedBuddyId: string;
  setSelectedBuddyId: (id: string) => void;
  buddiesList: Array<{
    id: string;
    name: string;
    shortName?: string;
    initials?: string;
    avatarUrl?: string;
    avatarColor: string;
    currentlyWatching: string;
    platform: string;
    progress: string;
    progressPercent: number;
    rating: string;
    take: string;
    sharedCount: number;
    isHost?: boolean;
  }>;
  currentBuddy: {
    id: string;
    name: string;
    shortName?: string;
    initials?: string;
    avatarUrl?: string;
    avatarColor: string;
    currentlyWatching: string;
    platform: string;
    progress: string;
    progressPercent: number;
    rating: string;
    take: string;
    sharedCount: number;
    isHost?: boolean;
  };
  borrowSuccessShow: string | null;
  setBorrowSuccessShow: (show: string | null) => void;
  buddiesModalTab: 'network' | 'buddies' | 'find' | 'invite';
  setBuddiesModalTab: (tab: 'network' | 'buddies' | 'find' | 'invite') => void;
  networkUserTier: 'basic' | 'vip';
  setNetworkUserTier: (tier: 'basic' | 'vip') => void;
  findTatersQuery: string;
  setFindTatersQuery: (q: string) => void;
  copiedKey: string | null;
  handleCopy: (text: string, label: string) => void;
  handleActionClick: (target: any) => void;
}

interface D3GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'user' | 'show';
  isYou?: boolean;
  isOnline?: boolean;
  seed?: string;
  avatarUrl?: string;
  stats?: string;
  currentShow?: string;
  score?: string;
  viewers?: number;
  rt?: string;
  platform?: string;
}

interface D3GraphLink extends d3.SimulationLinkDatum<D3GraphNode> {
  source: string | D3GraphNode;
  target: string | D3GraphNode;
  relationship: 'friend' | 'watch';
  status?: string;
}

export const BuddiesSection: React.FC<BuddiesSectionProps> = React.memo(({
  isBuddyDropdownOpen,
  setIsBuddyDropdownOpen,
  selectedBuddyId,
  setSelectedBuddyId,
  buddiesList,
  currentBuddy,
  borrowSuccessShow,
  setBorrowSuccessShow,
  buddiesModalTab,
  setBuddiesModalTab,
  networkUserTier,
  setNetworkUserTier,
  findTatersQuery,
  setFindTatersQuery,
  copiedKey,
  handleCopy,
  handleActionClick
}) => {
  // D3 Network Graph State
  const d3ContainerRef = useRef<HTMLDivElement>(null);
  const d3SvgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'friends' | 'shows'>('all');
  const [inspectedNode, setInspectedNode] = useState<D3GraphNode | null>(null);
  const [graphToast, setGraphToast] = useState<string | null>(null);

  const showGraphToast = (msg: string) => {
    setGraphToast(msg);
    setTimeout(() => setGraphToast(null), 3000);
  };

  const getNodeAvatarUrl = (seedOrLabel: string, isYou?: boolean) => {
    const s = (seedOrLabel || '').trim();
    if (isYou || s.toLowerCase() === 'you' || s.toLowerCase().includes('julio')) {
      return JULIO_OFFICIAL_AVATAR;
    }
    return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(s || 'Spud')}`;
  };

  // Raw Graph Data aligned with avatars
  const rawNodes: D3GraphNode[] = [
    { id: "u_you", label: "You", type: "user", isYou: true, isOnline: true, seed: "Julio", stats: "4 Active Shows • 5 Buddies", score: "Host Account" },
    { id: "u_julio", label: "Julio (JLZ)", type: "user", isOnline: true, seed: "Julio", stats: "Watching Severance S2:E4 • ⭐ 9.8", currentShow: "Severance (Season 2)", score: "9.8", platform: "Apple TV+" },
    { id: "u_annadee", label: "AnnaDee", type: "user", isOnline: true, seed: "AnnaDee", stats: "Watching The Bear S3 • ⭐ 9.5", currentShow: "The Bear (Season 3)", score: "9.5", platform: "Hulu" },
    { id: "u_rafael", label: "Rafael", type: "user", isOnline: false, seed: "Rafael", stats: "Watching White Lotus • ⭐ 9.2", currentShow: "The White Lotus", score: "9.2", platform: "Max" },
    { id: "u_sarah", label: "Sarah M.", type: "user", isOnline: true, seed: "Sarah", stats: "Watching The Last of Us S2 • ⭐ 9.4", currentShow: "The Last of Us", score: "9.4", platform: "HBO Max" },
    { id: "u_marcus", label: "Marcus K.", type: "user", isOnline: true, seed: "Marcus", stats: "Watching Slow Horses S4 • ⭐ 9.9", currentShow: "Slow Horses", score: "9.9", platform: "Apple TV+" },
    
    // Shows
    { id: "s_severance", label: "Severance", type: "show", viewers: 5, rt: "98%", platform: "Apple TV+" },
    { id: "s_bear", label: "The Bear", type: "show", viewers: 4, rt: "99%", platform: "Hulu" },
    { id: "s_slowhorses", label: "Slow Horses", type: "show", viewers: 4, rt: "99%", platform: "Apple TV+" },
    { id: "s_tlou", label: "The Last of Us", type: "show", viewers: 3, rt: "96%", platform: "HBO Max" },
    { id: "s_whitelotus", label: "The White Lotus", type: "show", viewers: 2, rt: "94%", platform: "Max" },
    { id: "s_shogun", label: "Shōgun", type: "show", viewers: 4, rt: "99%", platform: "FX / Hulu" },
  ];

  const rawLinks: D3GraphLink[] = [
    // Friend connections (purple)
    { source: "u_you", target: "u_julio", relationship: "friend" },
    { source: "u_you", target: "u_annadee", relationship: "friend" },
    { source: "u_you", target: "u_rafael", relationship: "friend" },
    { source: "u_you", target: "u_sarah", relationship: "friend" },
    { source: "u_you", target: "u_marcus", relationship: "friend" },
    { source: "u_julio", target: "u_annadee", relationship: "friend" },
    { source: "u_sarah", target: "u_marcus", relationship: "friend" },

    // Show watching connections (dashed teal)
    { source: "u_you", target: "s_severance", relationship: "watch", status: "Watching" },
    { source: "u_julio", target: "s_severance", relationship: "watch", status: "Watching" },
    { source: "u_annadee", target: "s_severance", relationship: "watch", status: "Watching" },
    { source: "u_marcus", target: "s_slowhorses", relationship: "watch", status: "Watching" },
    { source: "u_julio", target: "s_slowhorses", relationship: "watch", status: "Watching" },
    { source: "u_you", target: "s_slowhorses", relationship: "watch", status: "Watching" },
    { source: "u_sarah", target: "s_tlou", relationship: "watch", status: "Watching" },
    { source: "u_you", target: "s_tlou", relationship: "watch", status: "Watching" },
    { source: "u_annadee", target: "s_bear", relationship: "watch", status: "Watching" },
    { source: "u_you", target: "s_bear", relationship: "watch", status: "Watching" },
    { source: "u_rafael", target: "s_whitelotus", relationship: "watch", status: "Watching" },
    { source: "u_julio", target: "s_shogun", relationship: "watch", status: "Watching" },
  ];

  // Initialize and run D3 Force Simulation
  useEffect(() => {
    if (buddiesModalTab !== 'network') return;
    const svgElement = d3SvgRef.current;
    const container = d3ContainerRef.current;
    if (!svgElement || !container) return;

    const width = container.clientWidth || 650;
    const height = 350;

    const svg = d3.select(svgElement);
    svg.selectAll("*").remove();

    // Default inspection node
    if (!inspectedNode) {
      setInspectedNode(rawNodes.find(n => n.id === 'u_julio') || rawNodes[0]);
    }

    // Filter nodes based on activeFilter
    const filteredNodes = rawNodes.filter(n => {
      if (activeFilter === 'friends') return n.type === 'user';
      if (activeFilter === 'shows') return n.type === 'show';
      return true;
    });

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = rawLinks.filter(l => {
      const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      return filteredNodeIds.has(sId) && filteredNodeIds.has(tId);
    });

    // Root zoom group
    const rootG = svg.append("g").attr("class", "d3-root-group");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 2.5])
      .on("zoom", (event) => {
        rootG.attr("transform", event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // D3 Force Simulation
    const simulation = d3.forceSimulation<D3GraphNode>(filteredNodes)
      .force("link", d3.forceLink<D3GraphNode, D3GraphLink>(filteredLinks)
        .id(d => d.id)
        .distance(d => d.relationship === 'friend' ? 95 : 75)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(d => (d as any).type === 'user' ? 30 : 24));

    // Links
    const link = rootG.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(filteredLinks)
      .enter().append("line")
      .attr("stroke", d => d.relationship === 'friend' ? '#818cf8' : '#34d399')
      .attr("stroke-opacity", d => d.relationship === 'friend' ? 0.7 : 0.45)
      .attr("stroke-width", d => d.relationship === 'friend' ? 2 : 1.5)
      .attr("stroke-dasharray", d => d.relationship === 'watch' ? '4,3' : 'none');

    // Nodes group
    const node = rootG.append("g")
      .attr("class", "nodes")
      .selectAll(".node")
      .data(filteredNodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("cursor", "grab")
      .call(d3.drag<SVGGElement, D3GraphNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      )
      .on("click", (event, d) => {
        setInspectedNode(d);
        showGraphToast(`Inspecting ${d.label}`);
      });

    // Render node visuals with DiceBear SVG images or show badges
    node.each(function(d) {
      const el = d3.select(this);

      if (d.type === 'user') {
        // Outer glow/stroke circle
        el.append("circle")
          .attr("r", d.isYou ? 20 : 17)
          .attr("fill", d.isYou ? "#2563eb" : (d.isOnline ? "#0f172a" : "#1e2023"))
          .attr("stroke", d.isYou ? "#60a5fa" : (d.isOnline ? "#10b981" : "#475569"))
          .attr("stroke-width", d.isOnline ? 2.5 : 1.5);

        // Pattern-based or clipped Avatar image
        const patternId = `avatar-pattern-${d.id}`;
        const defs = svg.select("defs").empty() ? svg.append("defs") : svg.select("defs");
        
        const pattern = defs.append("pattern")
          .attr("id", patternId)
          .attr("width", 1)
          .attr("height", 1)
          .attr("patternContentUnits", "objectBoundingBox");

        pattern.append("image")
          .attr("href", getNodeAvatarUrl(d.seed || d.label, d.isYou))
          .attr("width", 1)
          .attr("height", 1)
          .attr("preserveAspectRatio", "xMidYMid slice");

        // Filled circle with DiceBear pixel art
        el.append("circle")
          .attr("r", d.isYou ? 18 : 15)
          .attr("fill", `url(#${patternId})`);

        // Online status dot
        if (d.isOnline) {
          el.append("circle")
            .attr("cx", 12)
            .attr("cy", -12)
            .attr("r", 4)
            .attr("fill", "#10b981")
            .attr("stroke", "#020617")
            .attr("stroke-width", 1.5);
        }

        // Host/You badge
        if (d.isYou) {
          const youBadge = el.append("g").attr("transform", "translate(0, -18)");
          youBadge.append("rect")
            .attr("x", -10)
            .attr("y", -6)
            .attr("width", 20)
            .attr("height", 12)
            .attr("rx", 3)
            .attr("fill", "#2563eb");
          youBadge.append("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("font-size", "7.5px")
            .attr("font-weight", "900")
            .attr("fill", "#fff")
            .text("YOU");
        }

      } else {
        // Show node circle
        el.append("circle")
          .attr("r", 15)
          .attr("fill", "#6366f1")
          .attr("stroke", "#a5b4fc")
          .attr("stroke-width", 2);

        // TV emoji / text
        el.append("text")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .attr("font-size", "10px")
          .text("📺");

        // Viewer count badge
        if (d.viewers) {
          const badgeG = el.append("g").attr("transform", "translate(10, -10)");
          badgeG.append("circle").attr("r", 6).attr("fill", "#ef4444");
          badgeG.append("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("font-size", "8px")
            .attr("font-weight", "900")
            .attr("fill", "#fff")
            .text(d.viewers);
        }
      }

      // Text label below node
      el.append("text")
        .attr("dy", d.type === 'user' ? 26 : 24)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("font-weight", "700")
        .attr("fill", "#f8fafc")
        .attr("paint-order", "stroke")
        .attr("stroke", "#020617")
        .attr("stroke-width", "2.5px")
        .attr("stroke-linejoin", "round")
        .text(d.label);
    });

    // Simulation tick handler
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      node.attr("transform", d => `translate(${d.x}, ${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [buddiesModalTab, activeFilter]);

  const handleZoom = (factor: number) => {
    if (!zoomBehaviorRef.current || !d3SvgRef.current) return;
    d3.select(d3SvgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, factor);
  };

  const handleResetZoom = () => {
    if (!zoomBehaviorRef.current || !d3SvgRef.current) return;
    d3.select(d3SvgRef.current).transition().duration(350).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  return (
    <section id="doc-section-buddies" className="space-y-8 scroll-mt-24">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-wider border border-blue-500/25">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>Section 4</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          4. Social & Binge Buddies
        </h2>
        <p className="text-base text-slate-300 font-medium max-w-3xl leading-relaxed">
          The platform is designed around collaborative social viewing through the Binge Buddy network and interactive D3 force graph.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SUB-SECTION 4.1: BINGE BUDDY DROPDOWN */}
        <div className="lg:col-span-6 bg-slate-900/90 p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl shadow-blue-950/20 space-y-6 flex flex-col justify-between backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                <span>Binge Buddy Dropdown</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 text-[10px] font-black uppercase border border-blue-500/30">
                Top-Left Header
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              <strong>Located in the top-left corner.</strong> View what friends and family are currently watching or planning to watch. Every user starts with <strong>Julio (JLZ)</strong> as a default buddy (5–10 buddy capacity depending on tier). Click any profile to view their dashboard, current episode progress, ratings, and borrow shows directly.
            </p>

            {/* Interactive Binge Buddy Dropdown Demo */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <span>Live Simulator: Top-Left Header Menu</span>
                <span className="text-purple-400 font-bold">Binge Buddy Network ({buddiesList.length})</span>
              </div>

              {/* Real Top-Left Corner Dropdown Trigger & Popover */}
              <div className="relative">
                <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <button
                    onClick={() => setIsBuddyDropdownOpen(!isBuddyDropdownOpen)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-extrabold rounded-xl px-3 py-2 flex items-center gap-2 shadow-md shadow-blue-600/30 border border-blue-500 cursor-pointer active:scale-95 transition"
                  >
                    <Users className="w-3.5 h-3.5 text-white/90 shrink-0" />
                    <span>{selectedBuddyId === 'you' ? 'My TV Shows' : `${currentBuddy.name}'s Shows`}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-white/80 transition-transform duration-200 ${isBuddyDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                  </button>
                  <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">Click button to open real menu</span>
                </div>

                <AnimatePresence>
                  {isBuddyDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-full max-w-sm rounded-2xl bg-slate-900/98 border border-slate-700 shadow-2xl z-40 overflow-hidden backdrop-blur-2xl"
                    >
                      {/* Sticky Top Header: + Add & Manage Buddies */}
                      <div className="p-2.5 border-b border-slate-800 bg-slate-950/80">
                        <button
                          type="button"
                          onClick={() => {
                            setBuddiesModalTab('find');
                            handleActionClick('buddies');
                            setIsBuddyDropdownOpen(false);
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-purple-600/20 border border-purple-400/30 active:scale-95"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-purple-200" />
                          <span>+ Add & Manage Buddies</span>
                        </button>
                      </div>

                      {/* Dropdown Menu Items List */}
                      <div className="max-h-[280px] overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800 text-left">
                        {/* Option 1: My TV Shows (Active User) */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBuddyId('you');
                            setIsBuddyDropdownOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                            selectedBuddyId === 'you'
                              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-xs'
                              : 'text-slate-300 hover:bg-slate-800/80 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="relative">
                              <img
                                src={JULIO_OFFICIAL_AVATAR}
                                alt="My Profile"
                                className="w-7 h-7 rounded-full border border-blue-500/40 object-cover bg-slate-950"
                                referrerPolicy="no-referrer"
                              />
                              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-extrabold text-white text-xs">My TV Shows</span>
                              <span className="text-[10px] text-slate-400 font-normal">Active Personal Queue</span>
                            </div>
                          </div>
                          {selectedBuddyId === 'you' && <Check className="w-4 h-4 text-blue-400" />}
                        </button>

                        {/* Section Divider: Binge Buddies */}
                        <div className="pt-2 pb-1 px-2 flex items-center justify-between text-[10px] font-black text-purple-300 uppercase tracking-wider">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3 h-3 text-purple-400" />
                            <span>Binge Buddies</span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-extrabold border border-purple-500/30">
                            {buddiesList.length} Connected
                          </span>
                        </div>

                        {/* Connected Friends List */}
                        {buddiesList.map(b => {
                          const isSelected = selectedBuddyId === b.id;
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => {
                                setSelectedBuddyId(b.id);
                                setIsBuddyDropdownOpen(false);
                              }}
                              className={`w-full p-2 rounded-xl text-left text-xs transition cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-xs'
                                  : 'text-slate-300 hover:bg-slate-800/80 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="relative shrink-0">
                                  <img
                                    src={b.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(b.name)}`}
                                    alt={b.name}
                                    className="w-7 h-7 rounded-full border border-purple-500/40 object-cover bg-slate-950"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white text-xs truncate">{b.name}'s Shows</span>
                                    {b.isHost && (
                                      <span className="px-1.5 py-0.2 rounded bg-purple-500/25 text-purple-300 text-[8px] font-black border border-purple-500/30">
                                        Host
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {b.currentlyWatching} • {b.progress}
                                  </p>
                                </div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0 ml-1" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Active Buddy Card Preview */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-white">{currentBuddy.currentlyWatching}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{currentBuddy.platform} • Progress: {currentBuddy.progress}</div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-black bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{currentBuddy.rating}</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500 rounded-full"
                    animate={{ width: `${currentBuddy.progressPercent}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <p className="text-xs font-serif italic text-slate-300 leading-snug">
                  &ldquo;{currentBuddy.take}&rdquo;
                </p>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-bold">{currentBuddy.sharedCount} Shared Taste Matches</span>
                  <button
                    onClick={() => {
                      setBorrowSuccessShow(currentBuddy.currentlyWatching);
                      setTimeout(() => setBorrowSuccessShow(null), 3000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1 shadow-sm transition cursor-pointer active:scale-95"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Add Show to My List</span>
                  </button>
                </div>
              </div>

              {borrowSuccessShow && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Added &ldquo;{borrowSuccessShow}&rdquo; directly to your Up Next Queue!</span>
                </motion.div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Default Buddy: Julio (JLZ)</span>
            <span className="text-blue-400 font-bold">1-Click List Borrowing</span>
          </div>
        </div>

        {/* SUB-SECTION 4.2: MANAGE BUDDIES MODAL & INTERACTIVE D3 NETWORK GRAPH */}
        <div className="lg:col-span-6 bg-slate-900/90 p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl shadow-blue-950/20 space-y-6 flex flex-col justify-between backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                <span>Manage Buddies & Network Graph</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-[10px] font-black uppercase border border-indigo-500/30">
                Interactive D3
              </span>
            </div>

            {/* Tab Switcher for the 4 Manage Buddies Features */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
              {[
                { id: 'network', label: 'Network Graph' },
                { id: 'buddies', label: 'Buddies' },
                { id: 'find', label: 'Find Taters' },
                { id: 'invite', label: 'Invite Link' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setBuddiesModalTab(tab.id as any)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer text-center truncate ${
                    buddiesModalTab === tab.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content 1: REAL INTERACTIVE D3 BINGE NETWORK GRAPH */}
            {buddiesModalTab === 'network' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                
                {/* D3 Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Force-Directed Network
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[10px] font-bold">
                      <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-2 py-0.5 rounded transition ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setActiveFilter('friends')}
                        className={`px-2 py-0.5 rounded transition ${activeFilter === 'friends' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        Buddies
                      </button>
                      <button
                        onClick={() => setActiveFilter('shows')}
                        className={`px-2 py-0.5 rounded transition ${activeFilter === 'shows' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        Shows
                      </button>
                    </div>

                    <div className="flex items-center gap-0.5 bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                      <button
                        onClick={() => handleZoom(1.2)}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleZoom(0.8)}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3 h-3" />
                      </button>
                      <button
                        onClick={handleResetZoom}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                        title="Reset Zoom"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* SVG Graph Canvas Container */}
                <div 
                  ref={d3ContainerRef}
                  className="relative w-full h-[280px] bg-slate-900 rounded-xl border border-slate-800 overflow-hidden select-none"
                >
                  <svg 
                    ref={d3SvgRef}
                    className="w-full h-full cursor-grab active:cursor-grabbing"
                  />

                  {/* Toast Alert Inside Graph Canvas */}
                  <AnimatePresence>
                    {graphToast && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-2.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600/90 text-white text-[10px] font-black rounded-full shadow-lg border border-blue-400/40 backdrop-blur-xs flex items-center gap-1.5 pointer-events-none"
                      >
                        <Sparkles className="w-3 h-3 text-blue-200" />
                        <span>{graphToast}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Live Node Inspector Overlay */}
                  {inspectedNode && (
                    <div className="absolute bottom-2 left-2 right-2 p-2.5 rounded-xl bg-slate-950/95 border border-slate-700/80 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {inspectedNode.type === 'user' ? (
                          <img
                            src={getNodeAvatarUrl(inspectedNode.seed || inspectedNode.label, inspectedNode.isYou)}
                            alt={inspectedNode.label}
                            className="w-8 h-8 rounded-lg border border-blue-500/50 bg-slate-900 object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs shrink-0 shadow-xs">
                            📺
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="text-xs font-black text-white flex items-center gap-1.5 truncate">
                            <span>{inspectedNode.label}</span>
                            {inspectedNode.type === 'user' && inspectedNode.isOnline && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Online" />
                            )}
                            {inspectedNode.type === 'show' && (
                              <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-black">
                                {inspectedNode.platform}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {inspectedNode.type === 'user' 
                              ? (inspectedNode.stats || 'Connected Binge Buddy')
                              : `${inspectedNode.viewers} Buddies Watching • 🍅 ${inspectedNode.rt} RT`}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        {inspectedNode.type === 'user' ? (
                          <button
                            onClick={() => showGraphToast(`Pinging ${inspectedNode.label}...`)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span className="hidden sm:inline">Ping Buddy</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setBorrowSuccessShow(inspectedNode.label);
                              showGraphToast(`Added "${inspectedNode.label}" to your queue!`);
                              setTimeout(() => setBorrowSuccessShow(null), 3000);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <BookmarkPlus className="w-3 h-3" />
                            <span className="hidden sm:inline">Add Show</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Graph Legend */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-slate-400 font-medium">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                      <span>Host (You)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      <span>Online Buddy</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                      <span>Tracked TV Show</span>
                    </span>
                  </div>
                  <span className="text-blue-400 font-bold">Drag nodes to physics-simulate</span>
                </div>
              </div>
            )}

            {/* Tab Content 2: Active Buddies List with matching DiceBear avatars */}
            {buddiesModalTab === 'buddies' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-[10px]">Active Buddies (3 of 5)</span>
                  <span className="text-blue-400 font-black">+2 Slots Open</span>
                </div>
                <div className="space-y-1.5">
                  {buddiesList.map(b => (
                    <div key={b.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={b.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(b.name)}`} 
                          alt={b.name} 
                          className="w-8 h-8 rounded-xl border border-blue-500/30 object-cover bg-slate-950 shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1">
                            <span>{b.name}</span>
                            {b.id === 'julio' && (
                              <span className="px-1 py-0.2 rounded bg-blue-600 text-white text-[8px] font-black">
                                JLZ
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">{b.currentlyWatching}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Connected</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Content 3: Find Taters */}
            {buddiesModalTab === 'find' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Community Member Directory
                  </h4>
                  <p className="text-xs text-slate-400">Search members by name, taste affinity, or friend ID.</p>
                </div>
                <input
                  type="text"
                  placeholder="Type name (e.g. Maya, David)..."
                  value={findTatersQuery}
                  onChange={(e) => setFindTatersQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                />
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img 
                      src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Maya" 
                      alt="Maya" 
                      className="w-8 h-8 rounded-xl border border-pink-500/40 bg-slate-950 object-cover shrink-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">Maya Lin</div>
                      <div className="text-[10px] text-blue-300">92% Taste Affinity (Sci-Fi & Noir)</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy("invite-maya-44", "friend_request")}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:bg-blue-500 transition"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Connect</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab Content 4: Invite Link */}
            {buddiesModalTab === 'invite' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Unique Shareable Invite Link
                  </h4>
                  <p className="text-xs text-slate-400">Share your invite link to instantly connect with friends.</p>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <input
                    type="text"
                    readOnly
                    value="https://couchtaterz.com/invite/julio-z-7892"
                    className="w-full bg-transparent text-xs text-slate-200 font-mono focus:outline-hidden"
                  />
                  <button
                    onClick={() => handleCopy("https://couchtaterz.com/invite/julio-z-7892", "invite_link")}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer whitespace-nowrap"
                  >
                    {copiedKey === 'invite_link' ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Instant pairing: Sign-ups through this link bypass friend code entry.</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Manage Buddies Hub</span>
            <button
              onClick={() => handleActionClick('buddies')}
              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Launch Buddies Modal</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
});

BuddiesSection.displayName = 'BuddiesSection';
