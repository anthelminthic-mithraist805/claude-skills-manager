use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Clone)]
pub struct Skill {
    pub name: String,
    pub description: String,
    pub author: String,
    pub version: String,
    pub content: String,
    pub path: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub category: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Platform {
    pub id: String,
    pub name: String,
    pub icon: String,
    pub skills_dir_darwin: String,
    pub skills_dir_win32: String,
    pub skills_dir_linux: String,
}

fn get_platforms() -> Vec<Platform> {
    vec![
        Platform {
            id: "claude".to_string(),
            name: "Claude Code".to_string(),
            icon: "Sparkles".to_string(),
            skills_dir_darwin: "~/.claude/skills".to_string(),
            skills_dir_win32: "%USERPROFILE%\\.claude\\skills".to_string(),
            skills_dir_linux: "~/.claude/skills".to_string(),
        },
        Platform {
            id: "cursor".to_string(),
            name: "Cursor".to_string(),
            icon: "Terminal".to_string(),
            skills_dir_darwin: "~/.cursor/skills".to_string(),
            skills_dir_win32: "%USERPROFILE%\\.cursor\\skills".to_string(),
            skills_dir_linux: "~/.cursor/skills".to_string(),
        },
        Platform {
            id: "windsurf".to_string(),
            name: "Windsurf".to_string(),
            icon: "Wind".to_string(),
            skills_dir_darwin: "~/.codeium/windsurf/skills".to_string(),
            skills_dir_win32: "%USERPROFILE%\\.codeium\\windsurf\\skills".to_string(),
            skills_dir_linux: "~/.codeium/windsurf/skills".to_string(),
        },
        Platform {
            id: "copilot".to_string(),
            name: "GitHub Copilot".to_string(),
            icon: "Github".to_string(),
            skills_dir_darwin: "~/.copilot/skills".to_string(),
            skills_dir_win32: "%USERPROFILE%\\.copilot\\skills".to_string(),
            skills_dir_linux: "~/.copilot/skills".to_string(),
        },
        Platform {
            id: "gemini".to_string(),
            name: "Gemini CLI".to_string(),
            icon: "Sparkles".to_string(),
            skills_dir_darwin: "~/.gemini/skills".to_string(),
            skills_dir_win32: "%USERPROFILE%\\.gemini\\skills".to_string(),
            skills_dir_linux: "~/.gemini/skills".to_string(),
        },
        Platform {
            id: "trae".to_string(),
            name: "Trae".to_string(),
            icon: "Zap".to_string(),
            skills_dir_darwin: "~/.trae/skills".to_string(),
            skills_dir_win32: "%USERPROFILE%\\.trae\\skills".to_string(),
            skills_dir_linux: "~/.trae/skills".to_string(),
        },
        Platform {
            id: "opencode".to_string(),
            name: "OpenCode".to_string(),
            icon: "Terminal".to_string(),
            skills_dir_darwin: "~/.config/opencode/skills".to_string(),
            skills_dir_win32: "%APPDATA%\\opencode\\skills".to_string(),
            skills_dir_linux: "~/.config/opencode/skills".to_string(),
        },
        Platform {
            id: "codex".to_string(),
            name: "Codex CLI".to_string(),
            icon: "Terminal".to_string(),
            skills_dir_darwin: "~/.codex/skills".to_string(),
            skills_dir_win32: "%USERPROFILE%\\.codex\\skills".to_string(),
            skills_dir_linux: "~/.codex/skills".to_string(),
        },
        Platform {
            id: "roo".to_string(),
            name: "Roo Code".to_string(),
            icon: "Bot".to_string(),
            skills_dir_darwin: "~/.roo/skills".to_string(),
            skills_dir_win32: "%USERPROFILE%\\.roo\\skills".to_string(),
            skills_dir_linux: "~/.roo/skills".to_string(),
        },
        Platform {
            id: "amp".to_string(),
            name: "Amp".to_string(),
            icon: "Zap".to_string(),
            skills_dir_darwin: "~/.config/agents/skills".to_string(),
            skills_dir_win32: "%APPDATA%\\agents\\skills".to_string(),
            skills_dir_linux: "~/.config/agents/skills".to_string(),
        },
        Platform {
            id: "Claude Code".to_string(),
            name: "Kiro".to_string(),
            icon: "Sparkle".to_string(),
            skills_dir_darwin: "~/.kiro/skills".to_string(),
            skills_dir_win32: "%USERPROFILE%\\.kiro\\skills".to_string(),
            skills_dir_linux: "~/.kiro/skills".to_string(),
        },
        Platform {
            id: "openclaw".to_string(),
            name: "OpenClaw".to_string(),
            icon: "Claw".to_string(),
            skills_dir_darwin: "~/.openclaw/skills".to_string(),
            skills_dir_win32: "%USERPROFILE%\\.openclaw\\skills".to_string(),
            skills_dir_linux: "~/.openclaw/skills".to_string(),
        },
    ]
}

fn resolve_platform_path(template: &str) -> PathBuf {
    let home = dirs::home_dir().unwrap_or_default();
    let path_str = template
        .replace("~", home.to_str().unwrap_or(""))
        .replace("%USERPROFILE%", home.to_str().unwrap_or(""))
        .replace("%APPDATA%", &home.join("AppData").join("Roaming").to_str().unwrap_or("").to_string());
    PathBuf::from(path_str)
}

fn get_platform_skills_dir(platform: &Platform) -> PathBuf {
    let template = if cfg!(target_os = "macos") {
        &platform.skills_dir_darwin
    } else if cfg!(target_os = "windows") {
        &platform.skills_dir_win32
    } else {
        &platform.skills_dir_linux
    };
    resolve_platform_path(template)
}

fn skills_dir() -> PathBuf {
    dirs::home_dir().unwrap_or_default().join(".agents").join("skills")
}

fn claude_skills_dir() -> PathBuf {
    dirs::home_dir().unwrap_or_default().join(".claude").join("skills")
}

fn parse_skill(raw: &str, path: &str) -> Skill {
    let mut name = String::new();
    let mut description = String::new();
    let mut author = String::from("unknown");
    let mut version = String::from("0.1.0");
    let mut category: Option<String> = None;
    let mut tags: Option<Vec<String>> = None;
    let mut in_front = false;
    let mut dash_count = 0;
    let mut body_lines: Vec<&str> = Vec::new();

    for line in raw.lines() {
        if line.trim() == "---" {
            dash_count += 1;
            in_front = dash_count == 1;
            continue;
        }
        if in_front {
            if let Some(v) = line.strip_prefix("name:") { name = v.trim().to_string(); }
            else if let Some(v) = line.strip_prefix("description:") { description = v.trim().to_string(); }
            else if let Some(v) = line.strip_prefix("  author:") { author = v.trim().to_string(); }
            else if let Some(v) = line.strip_prefix("  version:") { version = v.trim().trim_matches('"').to_string(); }
            else if let Some(v) = line.strip_prefix("  category:") { category = Some(v.trim().to_string()); }
            else if let Some(v) = line.strip_prefix("  tags:") {
                let tag_str = v.trim().trim_matches('[').trim_matches(']');
                if !tag_str.is_empty() {
                    tags = Some(tag_str.split(',').map(|s| s.trim().trim_matches('"').to_string()).collect());
                }
            }
        } else if dash_count >= 2 {
            body_lines.push(line);
        }
    }

    Skill { name, description, author, version, content: body_lines.join("\n").trim().to_string(), path: path.to_string(), category, tags }
}

fn build_skill_md(s: &Skill) -> String {
    let mut metadata = format!("  author: {}\n  version: \"{}\"", s.author, s.version);
    if let Some(ref cat) = s.category {
        metadata.push_str(&format!("\n  category: {}", cat));
    }
    if let Some(ref tags) = s.tags {
        if !tags.is_empty() {
            metadata.push_str(&format!("\n  tags: [{}]", tags.iter().map(|t| format!("\"{}\"", t)).collect::<Vec<_>>().join(", ")));
        }
    }
    format!("---\nname: {}\ndescription: {}\nmetadata:\n{}\n---\n\n{}\n",
        s.name, s.description, metadata, s.content)
}

fn copy_dir(src: &PathBuf, dst: &PathBuf) -> Result<(), String> {
    fs::create_dir_all(dst).map_err(|e| e.to_string())?;
    for entry in fs::read_dir(src).map_err(|e| e.to_string())?.flatten() {
        let p = entry.path();
        let d = dst.join(p.file_name().ok_or("bad name")?);
        if p.is_dir() { copy_dir(&p, &d)?; } else { fs::copy(&p, &d).map_err(|e| e.to_string())?; }
    }
    Ok(())
}

#[tauri::command]
fn get_skills() -> Vec<Skill> {
    let dir = skills_dir();
    let _ = fs::create_dir_all(&dir);
    let mut skills = Vec::new();
    if let Ok(entries) = fs::read_dir(&dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                if let Ok(content) = fs::read_to_string(path.join("SKILL.md")) {
                    skills.push(parse_skill(&content, path.to_str().unwrap_or("")));
                }
            }
        }
    }
    skills
}

#[tauri::command]
fn create_skill(skill: Skill) -> Result<(), String> {
    let dir = skills_dir().join(&skill.name);
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    fs::write(dir.join("SKILL.md"), build_skill_md(&skill)).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_skill(skill: Skill) -> Result<(), String> {
    fs::write(PathBuf::from(&skill.path).join("SKILL.md"), build_skill_md(&skill)).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_skill(path: String) -> Result<(), String> {
    fs::remove_dir_all(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_claude_skills() -> Vec<Skill> {
    let dir = claude_skills_dir();
    let _ = fs::create_dir_all(&dir);
    let mut skills = Vec::new();
    if let Ok(entries) = fs::read_dir(&dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                if let Ok(content) = fs::read_to_string(path.join("SKILL.md")) {
                    skills.push(parse_skill(&content, path.to_str().unwrap_or("")));
                }
            }
        }
    }
    skills
}

#[tauri::command]
fn sync_to_claude(skill_name: String) -> Result<String, String> {
    let src = skills_dir().join(&skill_name);
    let dst = claude_skills_dir().join(&skill_name);
    if !src.exists() { return Err(format!("Skill '{}' not found", skill_name)); }
    fs::create_dir_all(claude_skills_dir()).map_err(|e| e.to_string())?;
    copy_dir(&src, &dst)?;
    Ok(format!("已同步 '{}' 到 ~/.claude/skills", skill_name))
}

#[tauri::command]
fn import_from_claude() -> Result<String, String> {
    let src_dir = claude_skills_dir();
    let dst_dir = skills_dir();
    if !src_dir.exists() { return Err("~/.claude/skills 目录不存在".to_string()); }
    fs::create_dir_all(&dst_dir).map_err(|e| e.to_string())?;
    let mut count = 0;
    for entry in fs::read_dir(&src_dir).map_err(|e| e.to_string())?.flatten() {
        let path = entry.path();
        if path.is_dir() && path.join("SKILL.md").exists() {
            let name = path.file_name().ok_or("bad name")?;
            let dst = dst_dir.join(name);
            if !dst.exists() {
                copy_dir(&path, &dst)?;
                count += 1;
            }
        }
    }
    Ok(format!("已从 ~/.claude/skills 导入 {} 个 Skills", count))
}

#[tauri::command]
fn import_skill_from_claude(skill_name: String) -> Result<String, String> {
    let src = claude_skills_dir().join(&skill_name);
    let dst = skills_dir().join(&skill_name);
    if !src.exists() { return Err(format!("Skill '{}' not found in Claude directory", skill_name)); }
    fs::create_dir_all(skills_dir()).map_err(|e| e.to_string())?;
    copy_dir(&src, &dst)?;
    Ok(format!("已同步 '{}' 到 ~/.agents/skills", skill_name))
}

#[tauri::command]
fn get_supported_platforms() -> Vec<Platform> {
    get_platforms()
}

#[tauri::command]
fn detect_installed_platforms() -> Vec<String> {
    let mut installed = Vec::new();
    for platform in get_platforms() {
        let skills_dir = get_platform_skills_dir(&platform);
        // Check if parent directory exists
        if let Some(parent) = skills_dir.parent() {
            if parent.exists() {
                installed.push(platform.id);
            }
        }
    }
    installed
}

#[tauri::command]
fn install_to_platform(skill_name: String, platform_id: String) -> Result<String, String> {
    let platforms = get_platforms();
    let platform = platforms.iter().find(|p| p.id == platform_id)
        .ok_or(format!("Unknown platform: {}", platform_id))?;

    let src = skills_dir().join(&skill_name);
    if !src.exists() {
        return Err(format!("Skill '{}' not found in local database", skill_name));
    }

    let dst_dir = get_platform_skills_dir(platform);
    let dst = dst_dir.join(&skill_name);

    fs::create_dir_all(&dst_dir).map_err(|e| e.to_string())?;
    copy_dir(&src, &dst)?;

    Ok(format!("已安装 '{}' 到 {}", skill_name, platform.name))
}

#[tauri::command]
fn uninstall_from_platform(skill_name: String, platform_id: String) -> Result<String, String> {
    let platforms = get_platforms();
    let platform = platforms.iter().find(|p| p.id == platform_id)
        .ok_or(format!("Unknown platform: {}", platform_id))?;

    let dst_dir = get_platform_skills_dir(platform);
    let dst = dst_dir.join(&skill_name);

    if dst.exists() {
        fs::remove_dir_all(&dst).map_err(|e| e.to_string())?;
        Ok(format!("已从 {} 卸载 '{}'", platform.name, skill_name))
    } else {
        Err(format!("Skill '{}' not found in {}", skill_name, platform.name))
    }
}

#[tauri::command]
fn get_install_status(skill_name: String) -> std::collections::HashMap<String, bool> {
    let mut status = std::collections::HashMap::new();
    for platform in get_platforms() {
        let skills_dir = get_platform_skills_dir(&platform);
        let skill_path = skills_dir.join(&skill_name).join("SKILL.md");
        status.insert(platform.id, skill_path.exists());
    }
    status
}

#[tauri::command]
fn scan_all_platforms() -> Vec<Skill> {
    let mut skill_map: std::collections::HashMap<String, Skill> = std::collections::HashMap::new();

    for platform in get_platforms() {
        let skills_dir = get_platform_skills_dir(&platform);
        if !skills_dir.exists() {
            continue;
        }

        if let Ok(entries) = fs::read_dir(&skills_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    if let Ok(content) = fs::read_to_string(path.join("SKILL.md")) {
                        let skill = parse_skill(&content, path.to_str().unwrap_or(""));
                        // Only add if not already in map (deduplication by name)
                        skill_map.entry(skill.name.clone()).or_insert(skill);
                    }
                }
            }
        }
    }

    skill_map.into_values().collect()
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SkillCheckResult {
    pub skill_name: String,
    pub total_keywords: usize,
    pub traps_found: usize,
    pub high_risk: usize,
    pub medium_risk: usize,
    pub low_risk: usize,
    pub details: Vec<TrapDetail>,
    pub suggestions: Vec<ReplacementSuggestion>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TrapDetail {
    pub word: String,
    pub trap_id: String,
    pub risk_level: String,
    pub replacement: String,
    pub reason: String,
    pub line_number: usize,
    pub context: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ReplacementSuggestion {
    pub original: String,
    pub fixed: String,
    pub reason: String,
}

// 完整的语义陷阱词典
fn get_semantic_trap_lexicon() -> Vec<(String, String, String, String, String)> {
    // (窄边界词, 宽边界词, trap_id, 风险等级, 替换理由)
    vec![
        // 核心术语类 (T01-T06)
        ("漏洞".to_string(), "风险".to_string(), "T01".to_string(), "高危".to_string(), "语义宽度极大，'风险'会触发发散性思考，将代码质量、架构设计等问题纳入报告".to_string()),
        ("缺陷".to_string(), "问题".to_string(), "T02".to_string(), "高危".to_string(), "'问题'语义范围极宽，改进建议、优化点都可能被归类为问题".to_string()),
        ("错误".to_string(), "异常".to_string(), "T03".to_string(), "中危".to_string(), "'异常'边界定义模糊，轻微偏差都可能被纳入报告".to_string()),

        // 动作指令类 (T11-T16)
        ("检查".to_string(), "审查".to_string(), "T11".to_string(), "高危".to_string(), "'审查'会触发主观评价性意见，'检查'仅触发客观判定".to_string()),
        ("列出".to_string(), "描述".to_string(), "T12".to_string(), "高危".to_string(), "'描述'会触发解释和评论性内容，'列出'仅产出结构化条目".to_string()),
        ("总结".to_string(), "分析".to_string(), "T13".to_string(), "高危".to_string(), "'分析'会触发推理和假设性思考，'总结'仅提炼已有信息".to_string()),
        ("识别".to_string(), "评估".to_string(), "T14".to_string(), "高危".to_string(), "'评估'具有程度性、主观性，'识别'是二元判定".to_string()),
        ("提取".to_string(), "探索".to_string(), "T15".to_string(), "中危".to_string(), "'探索'触发开放式搜索，'提取'仅获取已知信息".to_string()),
        ("验证".to_string(), "理解".to_string(), "T16".to_string(), "中危".to_string(), "'理解'触发解释性思考，'验证'是明确的真假判定".to_string()),

        // 约束词类 (T21-T24)
        ("要求".to_string(), "建议".to_string(), "T21".to_string(), "高危".to_string(), "'建议'会触发发散性思维，产生大量创意性内容".to_string()),
        ("必须".to_string(), "应该".to_string(), "T22".to_string(), "中危".to_string(), "'应该'约束力较弱，大模型可能选择性遵守".to_string()),
        ("禁止".to_string(), "避免".to_string(), "T23".to_string(), "中危".to_string(), "'避免'是建议性约束，'禁止'是强制性约束".to_string()),
        ("限制".to_string(), "控制".to_string(), "T24".to_string(), "低危".to_string(), "'控制'语义较宽，'限制'边界更明确".to_string()),

        // 输出描述类 (T31-T33)
        ("列表".to_string(), "报告".to_string(), "T31".to_string(), "中危".to_string(), "'报告'会触发结构化文档，包含引言、分析、建议等".to_string()),
        ("结果".to_string(), "洞察".to_string(), "T32".to_string(), "高危".to_string(), "'洞察'高度发散，触发创造性思考".to_string()),
        ("数据".to_string(), "信息".to_string(), "T33".to_string(), "低危".to_string(), "'信息'范围更广，'数据'更具体".to_string()),

        // 英文词汇对
        ("vulnerability".to_string(), "risk".to_string(), "T01E".to_string(), "高危".to_string(), "Same as Chinese T01".to_string()),
        ("defect".to_string(), "issue".to_string(), "T02E".to_string(), "高危".to_string(), "Same as Chinese T02".to_string()),
        ("error".to_string(), "anomaly".to_string(), "T03E".to_string(), "中危".to_string(), "Same as Chinese T03".to_string()),
        ("check".to_string(), "review".to_string(), "T11E".to_string(), "高危".to_string(), "Same as Chinese T11".to_string()),
        ("list".to_string(), "describe".to_string(), "T12E".to_string(), "高危".to_string(), "Same as Chinese T12".to_string()),
        ("summarize".to_string(), "analyze".to_string(), "T13E".to_string(), "高危".to_string(), "Same as Chinese T13".to_string()),
        ("requirement".to_string(), "suggestion".to_string(), "T21E".to_string(), "高危".to_string(), "Same as Chinese T21".to_string()),
        ("must".to_string(), "should".to_string(), "T22E".to_string(), "中危".to_string(), "Same as Chinese T22".to_string()),
    ]
}

#[tauri::command]
fn check_skill_quality(skill_name: String) -> Result<SkillCheckResult, String> {
    let skill_path = skills_dir().join(&skill_name).join("SKILL.md");
    if !skill_path.exists() {
        return Err(format!("Skill '{}' not found", skill_name));
    }

    let content = fs::read_to_string(&skill_path).map_err(|e| e.to_string())?;
    let lines: Vec<&str> = content.lines().collect();

    let lexicon = get_semantic_trap_lexicon();

    let mut details = Vec::new();
    let mut high_count = 0;
    let mut medium_count = 0;
    let mut low_count = 0;
    let mut suggestions = Vec::new();

    // STEP 2: 提取关键词并匹配
    for (line_num, line) in lines.iter().enumerate() {
        let line_lower = line.to_lowercase();

        // STEP 3: 逐词匹配
        for (narrow, wide, trap_id, risk_level, reason) in &lexicon {
            if line_lower.contains(&wide.to_lowercase()) {
                // 找到宽边界词
                match risk_level.as_str() {
                    "高危" => high_count += 1,
                    "中危" => medium_count += 1,
                    "低危" => low_count += 1,
                    _ => {}
                }

                details.push(TrapDetail {
                    word: wide.clone(),
                    trap_id: trap_id.clone(),
                    risk_level: risk_level.clone(),
                    replacement: narrow.clone(),
                    reason: reason.clone(),
                    line_number: line_num + 1,
                    context: line.to_string(),
                });

                // 生成替换建议
                let fixed_line = line.replace(wide, narrow);
                if fixed_line != *line {
                    suggestions.push(ReplacementSuggestion {
                        original: line.to_string(),
                        fixed: fixed_line,
                        reason: format!("替换宽边界词 '{}' 为 '{}'", wide, narrow),
                    });
                }
            }
        }
    }

    Ok(SkillCheckResult {
        skill_name,
        total_keywords: details.len(),
        traps_found: details.len(),
        high_risk: high_count,
        medium_risk: medium_count,
        low_risk: low_count,
        details,
        suggestions,
    })
}

#[tauri::command]
fn check_all_skills() -> Vec<SkillCheckResult> {
    let mut results = Vec::new();

    if let Ok(entries) = fs::read_dir(skills_dir()) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                if let Some(name) = path.file_name() {
                    if let Some(name_str) = name.to_str() {
                        if let Ok(result) = check_skill_quality(name_str.to_string()) {
                            results.push(result);
                        }
                    }
                }
            }
        }
    }

    results
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_skills,
            get_claude_skills,
            create_skill,
            update_skill,
            delete_skill,
            sync_to_claude,
            import_from_claude,
            import_skill_from_claude,
            get_supported_platforms,
            detect_installed_platforms,
            install_to_platform,
            uninstall_from_platform,
            get_install_status,
            scan_all_platforms,
            check_skill_quality,
            check_all_skills
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
