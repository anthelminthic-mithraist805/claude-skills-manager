import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { X, Check, Loader2 } from "lucide-react";

interface Platform {
  id: string;
  name: string;
  icon: string;
  skills_dir_darwin: string;
  skills_dir_win32: string;
  skills_dir_linux: string;
}

interface PlatformInstallModalProps {
  skillName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PlatformInstallModal({ skillName, onClose, onSuccess }: PlatformInstallModalProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [installedPlatforms, setInstalledPlatforms] = useState<Set<string>>(new Set());
  const [installStatus, setInstallStatus] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    loadData();
  }, [skillName]);

  const loadData = async () => {
    try {
      const [platformsList, installed, status] = await Promise.all([
        invoke<Platform[]>("get_supported_platforms"),
        invoke<string[]>("detect_installed_platforms"),
        invoke<Record<string, boolean>>("get_install_status", { skillName }),
      ]);
      setPlatforms(platformsList);
      setInstalledPlatforms(new Set(installed));
      setInstallStatus(status);
    } catch (e) {
      console.error(e);
    }
  };

  const togglePlatform = (platformId: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(platformId)) {
        next.delete(platformId);
      } else {
        next.add(platformId);
      }
      return next;
    });
  };

  const handleInstall = async () => {
    if (selected.size === 0) return;
    setInstalling(true);

    try {
      for (const platformId of selected) {
        await invoke("install_to_platform", { skillName, platformId });
      }
      onSuccess();
      onClose();
    } catch (e: any) {
      alert("安装失败: " + e);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-100">安装到平台</h2>
            <p className="text-sm text-gray-500 mt-1">选择要安装 "{skillName}" 的平台</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3">
            {platforms.map(platform => {
              const isInstalled = installedPlatforms.has(platform.id);
              const hasSkill = installStatus[platform.id];
              const isSelected = selected.has(platform.id);

              return (
                <button
                  key={platform.id}
                  onClick={() => isInstalled && !hasSkill && togglePlatform(platform.id)}
                  disabled={!isInstalled || hasSkill}
                  className={`p-4 rounded-lg border transition-all text-left ${
                    hasSkill
                      ? "bg-emerald-900/20 border-emerald-700/50 cursor-not-allowed"
                      : isSelected
                        ? "bg-violet-900/30 border-violet-600"
                        : isInstalled
                          ? "bg-gray-800/50 border-gray-700 hover:border-violet-600"
                          : "bg-gray-800/20 border-gray-800 cursor-not-allowed opacity-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-gray-100">{platform.name}</span>
                    {hasSkill ? (
                      <Check size={16} className="text-emerald-400" />
                    ) : isSelected ? (
                      <Check size={16} className="text-violet-400" />
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-500">
                    {hasSkill ? "已安装" : isInstalled ? "可用" : "未检测到"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 border-t border-gray-800 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            已选择 {selected.size} 个平台
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleInstall}
              disabled={selected.size === 0 || installing}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {installing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  安装中...
                </>
              ) : (
                `安装到 ${selected.size} 个平台`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
