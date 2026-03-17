import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Plus, Trash2, Edit3, RefreshCw, X, Save, Package, Upload, Download, Database, FolderOpen, Check, Search, Grid3x3, List, Star, Tag, Code, Sparkles, FileText, Shield, Wrench, Layers, Scan } from "lucide-react";
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

type Tab = "local" | "claude" | "create";
type ViewMode = "grid" | "list";
type Category = "all" | "dev" | "ai" | "data" | "security" | "utils";

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
  const [localSkills, setLocalSkills] = useState<Skill[]>([]);
  const [claudeSkills, setClaudeSkills] = useState<Skill[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState<Skill>(empty);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState<Record<string, "loading" | "done">>({});
  const [platformModalSkill, setPlatformModalSkill] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [local, claude] = await Promise.all([
        invoke<Skill[]>("get_skills"),
        invoke<Skill[]>("get_claude_skills"),
      ]);
      setLocalSkills(local || []);
      setClaudeSkills(claude || []);
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
      const matchSearch = search === "" ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        (s.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()));

      const matchCategory = category === "all" || s.category === category;

      return matchSearch && matchCategory;
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
      <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Package size={16} />
            </div>
            <span className="font-bold text-lg">Skills Manager</span>
          </div>
          <p className="text-xs text-gray-500 ml-10">Claude Agent Skills</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => setTab("local")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${tab === "local" ? "bg-violet-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
          >
            <Database size={16} /> 本地数据库
          </button>
          <button
            onClick={() => setTab("claude")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${tab === "claude" ? "bg-violet-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
          >
            <FolderOpen size={16} /> Claude 目录
          </button>
          <button
            onClick={() => { setEditing(null); setForm(empty); setTab("create"); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${tab === "create" ? "bg-violet-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
          >
            <Plus size={16} /> 新建 Skill
          </button>
        </nav>
        <div className="p-3 border-t border-gray-800 space-y-2">
          <button
            onClick={async () => {
              setLoading(true);
              try {
                const scanned = await invoke<Skill[]>("scan_all_platforms");
                alert(`扫描完成！发现 ${scanned.length} 个 Skills`);
                loadAll();
              } catch (e: any) {
                alert("扫描失败: " + e);
              } finally {
                setLoading(false);
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-gray-400 hover:bg-gray-800 hover:text-emerald-400 border border-gray-800"
          >
            <Scan size={14} /> 扫描所有平台
          </button>
          <div className="pt-2">
            <p className="text-xs text-gray-600">本地: {localSkills.length} | Claude: {claudeSkills.length}</p>
            <p className="text-xs text-gray-600 mt-1">收藏: {favorites.size}</p>
          </div>
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
