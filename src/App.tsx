import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { BookOpen, Plus, Trash2, Edit3, RefreshCw, X, Save, Package, Upload, Download } from "lucide-react";

interface Skill {
  name: string;
  description: string;
  author: string;
  version: string;
  content: string;
  path: string;
}

const empty: Skill = { name: "", description: "", author: "", version: "0.1.0", content: "", path: "" };

export default function App() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState<Skill>(empty);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const result = await invoke<Skill[]>("get_skills");
      setSkills(result || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setView("form"); };
  const openEdit = (s: Skill) => { setEditing(s); setForm({ ...s }); setView("form"); };
  const cancel = () => { setView("list"); setEditing(null); setForm(empty); };

  const save = async () => {
    try {
      if (editing) {
        await invoke("update_skill", { skill: form });
      } else {
        await invoke("create_skill", { skill: form });
      }
      cancel();
      load();
    } catch (e: any) {
      alert("Error: " + e);
    }
  };

  const remove = async (s: Skill) => {
    if (!confirm(`Delete "${s.name}"?`)) return;
    try {
      await invoke("delete_skill", { path: s.path });
      load();
    } catch (e: any) {
      alert("Error: " + e);
    }
  };

  const syncToClaude = async (skillName: string) => {
    try {
      const result = await invoke<string>("sync_to_claude", { skillName });
      alert(result);
    } catch (e: any) {
      alert("同步失败: " + e);
    }
  };

  const importFromClaude = async () => {
    try {
      const result = await invoke<string>("import_from_claude");
      alert(result);
      load();
    } catch (e: any) {
      alert("导入失败: " + e);
    }
  };

  const filtered = skills.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

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
            onClick={() => { setView("list"); setEditing(null); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${view === "list" ? "bg-violet-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
          >
            <BookOpen size={16} /> Skills 列表
          </button>
          <button
            onClick={openCreate}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${view === "form" && !editing ? "bg-violet-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
          >
            <Plus size={16} /> 创建 Skill
          </button>
          <button
            onClick={importFromClaude}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-gray-400 hover:bg-gray-800 hover:text-emerald-400"
          >
            <Download size={16} /> 从 Claude 导入
          </button>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-600">~/.agents/skills</p>
          <p className="text-xs text-gray-600 mt-1">{skills.length} skills installed</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
          <h1 className="font-semibold text-gray-200">
            {view === "list" ? "Skills 列表" : editing ? `编辑: ${editing.name}` : "创建 Skill"}
          </h1>
          <div className="flex items-center gap-2">
            {view === "list" && (
              <>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="搜索 Skills..."
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-violet-500 w-52"
                />
                <button onClick={load} className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </button>
              </>
            )}
            {view === "form" && (
              <button onClick={cancel} className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                <X size={16} />
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {view === "list" && (
            loading ? (
              <div className="flex items-center justify-center h-full text-gray-600">
                <RefreshCw size={24} className="animate-spin mr-2" /> 加载中...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
                <Package size={48} className="text-gray-700" />
                <p className="text-lg">{search ? "没有匹配的 Skills" : "还没有 Skills"}</p>
                <button onClick={openCreate} className="mt-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm transition-colors">
                  创建第一个 Skill
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((s, i) => (
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
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 rounded-lg text-xs font-medium transition-colors border border-emerald-600/20"
                    >
                      <Upload size={12} /> 同步到 Claude
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {view === "form" && (
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
