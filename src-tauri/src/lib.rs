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
        } else if dash_count >= 2 {
            body_lines.push(line);
        }
    }

    Skill { name, description, author, version, content: body_lines.join("\n").trim().to_string(), path: path.to_string() }
}

fn build_skill_md(s: &Skill) -> String {
    format!("---\nname: {}\ndescription: {}\nmetadata:\n  author: {}\n  version: \"{}\"\n---\n\n{}\n",
        s.name, s.description, s.author, s.version, s.content)
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_skills, create_skill, update_skill, delete_skill, sync_to_claude, import_from_claude])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
