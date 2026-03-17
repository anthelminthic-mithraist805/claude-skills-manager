import { X, AlertTriangle, CheckCircle2, AlertCircle, Info } from "lucide-react";

interface TrapDetail {
  trap_id: string;
  narrow_word: string;
  wide_word: string;
  risk_level: string;
  line_number: number;
  context: string;
  reason: string;
}

interface ReplacementSuggestion {
  line_number: number;
  original: string;
  suggested: string;
  reason: string;
}

interface SkillCheckResult {
  skill_name: string;
  total_keywords: number;
  traps_found: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  details: TrapDetail[];
  suggestions: ReplacementSuggestion[];
}

interface SkillCheckModalProps {
  results: SkillCheckResult[];
  onClose: () => void;
}

export default function SkillCheckModal({ results, onClose }: SkillCheckModalProps) {
  const totalSkills = results.length;
  const totalTraps = results.reduce((sum, r) => sum + r.traps_found, 0);
  const totalHigh = results.reduce((sum, r) => sum + r.high_risk, 0);
  const totalMedium = results.reduce((sum, r) => sum + r.medium_risk, 0);
  const totalLow = results.reduce((sum, r) => sum + r.low_risk, 0);
  const skillsWithIssues = results.filter(r => r.traps_found > 0).length;

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "高危": return <AlertTriangle size={14} className="text-red-400" />;
      case "中危": return <AlertCircle size={14} className="text-yellow-400" />;
      case "低危": return <Info size={14} className="text-blue-400" />;
      default: return null;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "高危": return "text-red-400 bg-red-900/20 border-red-700/50";
      case "中危": return "text-yellow-400 bg-yellow-900/20 border-yellow-700/50";
      case "低危": return "text-blue-400 bg-blue-900/20 border-blue-700/50";
      default: return "text-gray-400 bg-gray-900/20 border-gray-700/50";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-100">语义陷阱检测报告</h2>
            <p className="text-sm text-gray-500 mt-1">基于 Semantic Trap Detector 理论</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 border-b border-gray-800 bg-gray-800/30">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-100">{totalSkills}</div>
              <div className="text-xs text-gray-500 mt-1">检测 Skills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-400">{totalTraps}</div>
              <div className="text-xs text-gray-500 mt-1">发现陷阱</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{totalHigh}</div>
              <div className="text-xs text-gray-500 mt-1">高危</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{totalMedium}</div>
              <div className="text-xs text-gray-500 mt-1">中危</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{totalLow}</div>
              <div className="text-xs text-gray-500 mt-1">低危</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-4">
            {results.map((result, idx) => (
              <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-100">{result.skill_name}</h3>
                    {result.traps_found === 0 ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-900/20 px-2 py-1 rounded-full border border-emerald-700/50">
                        <CheckCircle2 size={12} /> 无陷阱
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
                        {result.traps_found} 个陷阱
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {result.high_risk > 0 && <span className="text-red-400">🔴 {result.high_risk}</span>}
                    {result.medium_risk > 0 && <span className="text-yellow-400">🟡 {result.medium_risk}</span>}
                    {result.low_risk > 0 && <span className="text-blue-400">🟢 {result.low_risk}</span>}
                  </div>
                </div>

                {result.details.length > 0 && (
                  <div className="space-y-2">
                    {result.details.slice(0, 5).map((detail, i) => (
                      <div key={i} className={`p-3 rounded-lg border ${getRiskColor(detail.risk_level)}`}>
                        <div className="flex items-start gap-2 mb-2">
                          {getRiskIcon(detail.risk_level)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm font-semibold">"{detail.wide_word}"</span>
                              <span className="text-xs opacity-60">→</span>
                              <span className="font-mono text-sm text-emerald-400">"{detail.narrow_word}"</span>
                              <span className="text-xs opacity-60">({detail.trap_id})</span>
                            </div>
                            <p className="text-xs opacity-80 mb-2">{detail.reason}</p>
                            <div className="text-xs opacity-60 font-mono bg-black/20 p-2 rounded">
                              第 {detail.line_number} 行: {detail.context.substring(0, 80)}...
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {result.details.length > 5 && (
                      <p className="text-xs text-gray-500 text-center">还有 {result.details.length - 5} 个陷阱...</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 border-t border-gray-800 bg-gray-800/30">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {skillsWithIssues > 0 ? (
                <span>⚠️ {skillsWithIssues} 个 Skills 需要优化</span>
              ) : (
                <span className="text-emerald-400">✅ 所有 Skills 质量良好</span>
              )}
            </div>
            <button onClick={onClose} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors">
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
