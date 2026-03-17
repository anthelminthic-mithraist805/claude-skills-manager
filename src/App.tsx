import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Plus, Trash2, Edit3, RefreshCw, X, Save, Package, Upload, Download, Database, FolderOpen, Check } from "lucide-react";

interface Skill {
  name: string;
  description: string;
  author: string;
  version: string;
  content: string;
  path: string;
}

type Tab = "local" | "claude" | "create";

const empty: Skill = { name: "", description: "", author: "", version: "0.1.0", content: "", path: "" };

export default function App() {
  const [tab, setTab] = useState<Tab>("local");
  const [localSkills, setLocalSkills] = useState<Skill[]>([]);
  const [claudeSkills, setClaudeSkills] = useState<Skill[]>([]);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState<Skill>(empty);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState<Record<string, "loading" | "done">>({});

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

  const filteredLocal = localSkills.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredClaude = claudeSkills.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const tabTitle = tab === "local" ? "本地数据库" : tab === "claude" ? "Claude 目录" : editing ? `编辑: ${editing.name}` : "新建 Skill";

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans">
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
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-600">本地: {localSkills.length} | Claude: {claudeSkills.length}</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
          <h1 className="font-semibold text-gray-200">{tabTitle}</h1>
          <div className="flex items-center gap-2">
            {(tab === "local" || tab === "claude") && (
              <>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="搜索 Skills..."
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-violet-500 w-52"
                />
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

        <div className="flex-1 overflow-y-auto p-6">
          {tab === "local" && (
            loading ? (
              <div className="flex items-center justify-center h-full text-gray-600">
                <RefreshCw size={24} className="animate-spin mr-2" /> 加载中...
              </div>
            ) : filteredLocal.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
                <Database size={48} className="text-gray-700" />
                <p className="text-lg">{search ? "没有匹配的 Skills" : "本地数据库为空"}</p>
                <button onClick={() => { setEditing(null); setForm(empty); setTab("create"); }} className="mt-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm transition-colors">
                  创建第一个 Skill
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredLocal.map((s, i) => {
                  const isSynced = claudeNames.has(s.name);
                  const syncState = syncing[s.name];
                  return (
                    <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-violet-700 transition-colors group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-violet-900/50 flex items-center justify-center text-violet-400">
                            <Package size={14} />
                          </div>
                          <span className="font-semibold text-gray-100">{s.name}</span>
                        </div>
                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">v{s.version}</span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-4 leading-relaxed">{s.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-600">👤 {s.author}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-violet-400 transition-colors">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => remove(s)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => syncToClaude(s.name)}
                        disabled={syncState === "loading"}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          syncState === "done"
                            ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30"
                            : isSynced
                              ? "bg-gray-800/50 text-gray-500 border border-gray-700/50"
                              : "bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-600/20"
                        }`}
                      >
                        {syncState === "loading" ? (
                          <><RefreshCw size={12} className="animate-spin" /> 同步中...</>
                        ) : syncState === "done" ? (
                          <><Check size={12} /> 同步成功</>
                        ) : isSynced ? (
                          <><Check size={12} /> 已同步到 Claude</>
                        ) : (
                          <><Upload size={12} /> 同步到 Claude</>
                        )}
                      </button>
                    </div>
                  );
                })}
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
                <p className="text-lg">{search ? "没有匹配的 Skills" : "Claude 目录为空"}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredClaude.map((s, i) => {
                  const isSynced = localNames.has(s.name);
                  const syncState = syncing[`claude_${s.name}`];
                  return (
                    <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-violet-700 transition-colors group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-violet-900/50 flex items-center justify-center text-violet-400">
                            <Package size={14} />
                          </div>
                          <span className="font-semibold text-gray-100">{s.name}</span>
                        </div>
                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">v{s.version}</span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-4 leading-relaxed">{s.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-600">👤 {s.author}</span>
                      </div>
                      <button
                        onClick={() => syncToLocal(s.name)}
                        disabled={syncState === "loading"}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          syncState === "done"
                            ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                            : isSynced
                              ? "bg-gray-800/50 text-gray-500 border border-gray-700/50"
                              : "bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20"
                        }`}
                      >
                        {syncState === "loading" ? (
                          <><RefreshCw size={12} className="animate-spin" /> 同步中...</>
                        ) : syncState === "done" ? (
                          <><Check size={12} /> 同步成功</>
                        ) : isSynced ? (
                          <><Check size={12} /> 已同步到本地</>
                        ) : (
                          <><Download size={12} /> 同步到本地</>
                        )}
                      </button>
                    </div>
                  );
                })}
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
