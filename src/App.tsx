import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Plus, Trash2, Edit3, RefreshCw, X, Save, Package, Upload, Download, Database, FolderOpen, Check, Search, Grid3x3, List, Star, Tag, Code, Sparkles, FileText, Shield, Wrench, Layers, Scan, ChevronLeft, ChevronRight, Settings, Heart, Rocket, Store, Home, Filter, CheckCircle2, AlertTriangle } from "lucide-react";
import PlatformInstallModal from "./components/PlatformInstallModal";

interface Skill {
  name: string;
  description: string;
  author: string;
  version: string;
  content: string;
  path: string;
  category?: string;
  tags?: string[];
}

interface SkillCheckResult {
  skill_name: string;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  issues: string[];
}

type Tab = "local" | "claude" | "create" | "store";
type ViewMode = "grid" | "list";
type Category = "all" | "dev" | "ai" | "data" | "security" | "utils";
type FilterType = "all" | "favorites" | "deployed";

const CATEGORIES = [
  { key: "all" as Category, label: "全部", icon: Grid3x3 },
  { key: "dev" as Category, label: "开发工具", icon: Code },
  { key: "ai" as Category, label: "AI 生成", icon: Sparkles },
  { key: "data" as Category, label: "数据处理", icon: FileText },
  { key: "security" as Category, label: "安全审查", icon: Shield },
  { key: "utils" as Category, label: "实用工具", icon: Wrench },
];

const empty: Skill = { name: "", description: "", author: "", version: "0.1.0", content: "", path: "", category: "dev", tags: [] };

export default function App() {
  const [tab, setTab] = useState<Tab>("local");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [category, setCategory] = useState<Category>("all");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [localSkills, setLocalSkills] = useState<Skill[]>([]);
  const [claudeSkills, setClaudeSkills] = useState<Skill[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [deployed, setDeployed] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState<Skill>(empty);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState<Record<string, "loading" | "done">>({});
  const [platformModalSkill, setPlatformModalSkill] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [showTagFilter, setShowTagFilter] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [local, claude] = await Promise.all([
        invoke<Skill[]>("get_skills"),
        invoke<Skill[]>("get_claude_skills"),
      ]);
      setLocalSkills(local || []);
      setClaudeSkills(claude || []);

      // Load deployed status for all local skills
      const deployedSet = new Set<string>();
      for (const skill of local || []) {
        try {
          const status = await invoke<Record<string, boolean>>("get_install_status", { skillName: skill.name });
          if (Object.values(status).some(v => v)) {
            deployedSet.add(skill.name);
          }
        } catch (e) {
          console.error(`Failed to get status for ${skill.name}:`, e);
        }
      }
      setDeployed(deployedSet);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const claudeNames = new Set(claudeSkills.map(s => s.name));
  const localNames = new Set(localSkills.map(s => s.name));

  const openEdit = (s: Skill) => { setEditing(s); setForm({ ...s }); setTab("create"); };
  const cancel = () => { setTab("local"); setEditing(null); setForm(empty); };

  const save = async () => {
    try {
      if (editing) {
        await invoke("update_skill", { skill: form });
      } else {
        await invoke("create_skill", { skill: form });
      }
      cancel();
      loadAll();
    } catch (e: any) {
      alert("Error: " + e);
    }
  };

  const remove = async (s: Skill) => {
    if (!confirm(`删除 "${s.name}"?`)) return;
    try {
      await invoke("delete_skill", { path: s.path });
      loadAll();
    } catch (e: any) {
      alert("Error: " + e);
    }
  };

  const syncToClaude = async (skillName: string) => {
    setSyncing(p => ({ ...p, [skillName]: "loading" }));
    try {
      await invoke<string>("sync_to_claude", { skillName });
      setSyncing(p => ({ ...p, [skillName]: "done" }));
      await loadAll();
      setTimeout(() => setSyncing(p => { const n = { ...p }; delete n[skillName]; return n; }), 2000);
    } catch (e: any) {
      setSyncing(p => { const n = { ...p }; delete n[skillName]; return n; });
      alert("同步失败: " + e);
    }
  };

  const syncToLocal = async (skillName: string) => {
    const key = `claude_${skillName}`;
    setSyncing(p => ({ ...p, [key]: "loading" }));
    try {
      await invoke<string>("import_skill_from_claude", { skillName });
      setSyncing(p => ({ ...p, [key]: "done" }));
      await loadAll();
      setTimeout(() => setSyncing(p => { const n = { ...p }; delete n[key]; return n; }), 2000);
    } catch (e: any) {
      setSyncing(p => { const n = { ...p }; delete n[key]; return n; });
      alert("同步失败: " + e);
    }
  };

  const toggleFavorite = (skillName: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(skillName)) {
        next.delete(skillName);
      } else {
        next.add(skillName);
      }
      return next;
    });
  };

  const filterSkills = (skills: Skill[]) => {
    return skills.filter(s => {
      // Search filter
      const matchSearch = search === "" ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        (s.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()));

      // Category filter
      const matchCategory = category === "all" || s.category === category;

      // Type filter (favorites/deployed)
      let matchType = true;
      if (filterType === "favorites") {
        matchType = favorites.has(s.name);
      } else if (filterType === "deployed") {
        matchType = deployed.has(s.name);
      }

      // Tag filter
      const matchTags = selectedTags.size === 0 ||
        (s.tags || []).some(t => selectedTags.has(t));

      return matchSearch && matchCategory && matchType && matchTags;
    });
  };

  // Get all unique tags from skills
  const allTags = Array.from(new Set(
    localSkills.flatMap(s => s.tags || [])
  )).sort();

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const filteredLocal = filterSkills(localSkills);
  const filteredClaude = filterSkills(claudeSkills);

  const tabTitle = tab === "local" ? "本地数据库" : tab === "claude" ? "Claude 目录" : editing ? `编辑: ${editing.name}` : "新建 Skill";

  const SkillCard = ({ skill, index, source }: { skill: Skill; index: number; source: "local" | "claude" }) => {
    const isSynced = source === "local" ? claudeNames.has(skill.name) : localNames.has(skill.name);
    const syncKey = source === "local" ? skill.name : `claude_${skill.name}`;
    const syncState = syncing[syncKey];
    const isFavorite = favorites.has(skill.name);

    return (
      <div
        className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-violet-700 transition-all group"
        style={{ animationDelay: `${index * 30}ms` }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-lg bg-violet-900/50 flex items-center justify-center text-violet-400">
              <Package size={14} />
            </div>
            <span className="font-semibold text-gray-100">{skill.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(skill.name)}
              className={`p-1.5 rounded-lg transition-colors ${isFavorite ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400"}`}
            >
              <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">v{skill.version}</span>
          </div>
        </div>
        <p className="text-sm text-gray-400 line-clamp-2 mb-3 leading-relaxed">{skill.description}</p>
        {skill.tags && skill.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {skill.tags.map((tag, i) => (
              <span key={i} className="text-xs bg-gray-800/50 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-600">👤 {skill.author}</span>
          {source === "local" && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(skill)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-violet-400 transition-colors">
                <Edit3 size={14} />
              </button>
              <button onClick={() => remove(skill)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => source === "local" ? syncToClaude(skill.name) : syncToLocal(skill.name)}
          disabled={syncState === "loading"}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            syncState === "done"
              ? source === "local"
                ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30"
                : "bg-blue-600/20 text-blue-400 border border-blue-600/30"
              : isSynced
                ? "bg-gray-800/50 text-gray-500 border border-gray-700/50"
                : source === "local"
                  ? "bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-600/20"
                  : "bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20"
          }`}
        >
          {syncState === "loading" ? (
            <><RefreshCw size={12} className="animate-spin" /> 同步中...</>
          ) : syncState === "done" ? (
            <><Check size={12} /> 同步成功</>
          ) : isSynced ? (
            <><Check size={12} /> {source === "local" ? "已同步到 Claude" : "已同步到本地"}</>
          ) : (
            <>{source === "local" ? <Upload size={12} /> : <Download size={12} />} {source === "local" ? "同步到 Claude" : "同步到本地"}</>
          )}
        </button>
        {source === "local" && (
          <button
            onClick={() => setPlatformModalSkill(skill.name)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-600/20 mt-2"
          >
            <Layers size={12} /> 安装到多个平台
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans">
      {platformModalSkill && (
        <PlatformInstallModal
          skillName={platformModalSkill}
          onClose={() => setPlatformModalSkill(null)}
          onSuccess={() => loadAll()}
        />
      )}
      <aside className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300`}>
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Package size={16} className="text-white" />
              </div>
              <div>
                <span className="font-bold text-base">Skills Manager</span>
                <p className="text-[10px] text-gray-500">Claude Agent Skills</p>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors" title={sidebarCollapsed ? "展开" : "折叠"}>
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        <nav className="p-3 space-y-1">
          <div className={`text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-2 ${sidebarCollapsed ? "text-center" : "px-3"}`}>
            {!sidebarCollapsed && "主菜单"}
          </div>
          <button onClick={() => { setTab("local"); setFilterType("all"); }} className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm transition-all ${tab === "local" && filterType === "all" ? "bg-violet-600 text-white shadow-lg" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`} title="全部">
            <Home size={16} />
            {!sidebarCollapsed && <span className="flex-1 text-left">全部</span>}
            {!sidebarCollapsed && <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full">{localSkills.length}</span>}
          </button>
          <button onClick={() => { setTab("local"); setFilterType("favorites"); }} className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm transition-all ${tab === "local" && filterType === "favorites" ? "bg-violet-600 text-white shadow-lg" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`} title="收藏">
            <Heart size={16} />
            {!sidebarCollapsed && <span className="flex-1 text-left">收藏</span>}
            {!sidebarCollapsed && <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full">{favorites.size}</span>}
          </button>
          <button onClick={() => { setTab("local"); setFilterType("deployed"); }} className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm transition-all ${tab === "local" && filterType === "deployed" ? "bg-violet-600 text-white shadow-lg" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`} title="已部署">
            <Rocket size={16} />
            {!sidebarCollapsed && <span className="flex-1 text-left">已部署</span>}
            {!sidebarCollapsed && <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full">{deployed.size}</span>}
          </button>
          <div className="h-px bg-gray-800 my-2"></div>
          <button onClick={() => setTab("claude")} className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm transition-all ${tab === "claude" ? "bg-violet-600 text-white shadow-lg" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`} title="Claude 目录">
            <FolderOpen size={16} />
            {!sidebarCollapsed && <span className="flex-1 text-left">Claude 目录</span>}
            {!sidebarCollapsed && <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full">{claudeSkills.length}</span>}
          </button>
          <button onClick={() => { setEditing(null); setForm(empty); setTab("create"); }} className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm transition-all ${tab === "create" ? "bg-violet-600 text-white shadow-lg" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`} title="新建">
            <Plus size={16} />
            {!sidebarCollapsed && <span className="flex-1 text-left">新建 Skill</span>}
          </button>
        </nav>
        {!sidebarCollapsed && tab === "local" && allTags.length > 0 && (
          <div className="px-3 pb-3">
            <button onClick={() => setShowTagFilter(!showTagFilter)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-800 hover:text-gray-400 transition-colors">
              <span className="flex items-center gap-2"><Filter size={12} />标签过滤 {selectedTags.size > 0 && `(${selectedTags.size})`}</span>
              <ChevronRight size={12} className={`transition-transform ${showTagFilter ? "rotate-90" : ""}`} />
            </button>
            {showTagFilter && (
              <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                {allTags.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)} className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${selectedTags.has(tag) ? "bg-violet-600/20 text-violet-400 border border-violet-600/30" : "text-gray-500 hover:bg-gray-800 hover:text-gray-400"}`}>
                    <Tag size={10} />{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="mt-auto p-3 border-t border-gray-800 space-y-2">
          <button onClick={async () => { setLoading(true); try { const scanned = await invoke("scan_all_platforms"); alert(`扫描完成！发现 ${scanned.length} 个 Skills`); loadAll(); } catch (e) { alert("扫描失败: " + e); } finally { setLoading(false); } }} className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2"} px-3 py-2 rounded-lg text-xs transition-colors text-gray-400 hover:bg-gray-800 hover:text-emerald-400 border border-gray-800`} title="扫描">
            <Scan size={14} />{!sidebarCollapsed && "扫描所有平台"}
          </button>
          <button onClick={async () => { setLoading(true); try { const results = await invoke("check_all_skills"); const total = results.length; const hasIssues = results.filter(r => r.high_risk > 0 || r.medium_risk > 0).length; alert(`检查完成！\n\n总计: ${total} 个 Skills\n有问题: ${hasIssues} 个\n\n详细报告请查看控制台`); console.table(results); } catch (e) { alert("检查失败: " + e); } finally { setLoading(false); } }} className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "gap-2"} px-3 py-2 rounded-lg text-xs transition-colors text-gray-400 hover:bg-gray-800 hover:text-blue-400 border border-gray-800`} title="检查质量">
            <CheckCircle2 size={14} />{!sidebarCollapsed && "检查所有 Skills"}
          </button>
          {!sidebarCollapsed && (
            <div className="pt-2 space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-600"><span>本地</span><span className="font-mono">{localSkills.length}</span></div>
              <div className="flex items-center justify-between text-xs text-gray-600"><span>Claude</span><span className="font-mono">{claudeSkills.length}</span></div>
              <div className="flex items-center justify-between text-xs text-gray-600"><span>收藏</span><span className="font-mono">{favorites.size}</span></div>
              <div className="flex items-center justify-between text-xs text-gray-600"><span>已部署</span><span className="font-mono">{deployed.size}</span></div>
            </div>
          )}
        </div>
      </aside>


      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
          <h1 className="font-semibold text-gray-200">{tabTitle}</h1>
          <div className="flex items-center gap-2">
            {(tab === "local" || tab === "claude") && (
              <>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="搜索 Skills..."
                    className="bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-violet-500 w-52"
                  />
                </div>
                <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}
                  >
                    <Grid3x3 size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}
                  >
                    <List size={14} />
                  </button>
                </div>
                <button onClick={loadAll} className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </button>
              </>
            )}
            {tab === "create" && (
              <button onClick={cancel} className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                <X size={16} />
              </button>
            )}
          </div>
        </header>

        {(tab === "local" || tab === "claude") && (
          <div className="border-b border-gray-800 px-6 py-3 flex items-center gap-2 overflow-x-auto">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    category === cat.key
                      ? "bg-violet-600 text-white"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon size={14} /> {cat.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {tab === "local" && (
            loading ? (
              <div className="flex items-center justify-center h-full text-gray-600">
                <RefreshCw size={24} className="animate-spin mr-2" /> 加载中...
              </div>
            ) : filteredLocal.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
                <Database size={48} className="text-gray-700" />
                <p className="text-lg">{search || category !== "all" ? "没有匹配的 Skills" : "本地数据库为空"}</p>
                <button onClick={() => { setEditing(null); setForm(empty); setTab("create"); }} className="mt-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm transition-colors">
                  创建第一个 Skill
                </button>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"}>
                {filteredLocal.map((s, i) => <SkillCard key={i} skill={s} index={i} source="local" />)}
              </div>
            )
          )}

          {tab === "claude" && (
            loading ? (
              <div className="flex items-center justify-center h-full text-gray-600">
                <RefreshCw size={24} className="animate-spin mr-2" /> 加载中...
              </div>
            ) : filteredClaude.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
                <FolderOpen size={48} className="text-gray-700" />
                <p className="text-lg">{search || category !== "all" ? "没有匹配的 Skills" : "Claude 目录为空"}</p>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"}>
                {filteredClaude.map((s, i) => <SkillCard key={i} skill={s} index={i} source="claude" />)}
              </div>
            )
          )}

          {tab === "create" && (
            <div className="max-w-2xl mx-auto space-y-5">
              {(["name", "description", "author", "version"] as const).map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5 capitalize">{field}</label>
                  <input
                    value={form[field]}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                    readOnly={field === "name" && !!editing}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">分类</label>
                <select
                  value={form.category || "dev"}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-violet-500 transition-colors"
                >
                  {CATEGORIES.filter(c => c.key !== "all").map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">标签 (逗号分隔)</label>
                <input
                  value={(form.tags || []).join(", ")}
                  onChange={e => setForm({ ...form, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                  placeholder="例如: react, typescript, hooks"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">内容 (Markdown)</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  rows={14}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-200 font-mono focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={save} className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors">
                  <Save size={15} /> {editing ? "更新" : "创建"}
                </button>
                <button onClick={cancel} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors">
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
