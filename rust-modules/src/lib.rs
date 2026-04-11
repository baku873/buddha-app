use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value;

// =========================================
// STRUCTS
// =========================================

#[derive(Serialize, Deserialize, Debug, Clone)]
struct ScheduleItem {
    day: String,
    active: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Monk {
    #[serde(rename = "_id")]
    id: String,
    #[serde(default)]
    #[serde(rename = "isAvailable")]
    is_available: bool, // Matches JS camelCase
    #[serde(default)]
    schedule: Vec<ScheduleItem>,
    
    // Flatten allows us to keep all other fields dynamically without defining them
    #[serde(flatten)]
    extra: std::collections::HashMap<String, serde_json::Value>,
}

// =========================================
// EXPORTED FUNCTIONS
// =========================================

#[wasm_bindgen]
pub fn filter_monks(json_data: &str, day_name: &str) -> String {
    let monks: Vec<Monk> = match serde_json::from_str(json_data) {
        Ok(m) => m,
        Err(_) => return String::from("[]"),
    };

    let filtered: Vec<Monk> = monks.into_iter().filter(|m| {
        // 1. Global Availability Check
        if !m.is_available {
            return false;
        }

        // 2. Date/Day Filter
        if !day_name.is_empty() {
            // If monk has NO schedule defined, we assume they are generally available
            if m.schedule.is_empty() {
                return true;
            }

            // Check if this day exists and is active in their schedule
            let day_schedule = m.schedule.iter().find(|s| s.day.eq_ignore_ascii_case(day_name));
            
            if let Some(s) = day_schedule {
                return s.active;
            } else {
                return false; 
            }
        }

        true
    }).collect();

    serde_json::to_string(&filtered).unwrap_or_else(|_| String::from("[]"))
}

#[wasm_bindgen]
pub fn fuzzy_search(json_data: &str, query: &str) -> String {
    let items: Vec<serde_json::Value> = match serde_json::from_str(json_data) {
        Ok(v) => v,
        Err(_) => return String::from("[]"),
    };

    if query.is_empty() {
        return json_data.to_string();
    }

    let query_lower = query.to_lowercase();

    let filtered: Vec<&serde_json::Value> = items.iter().filter(|item| {
        value_contains_string(item, &query_lower)
    }).collect();

    serde_json::to_string(&filtered).unwrap_or_else(|_| String::from("[]"))
}

// Recursive helper to search for a string in any JSON value
fn value_contains_string(value: &serde_json::Value, query: &str) -> bool {
    match value {
        Value::String(s) => s.to_lowercase().contains(query),
        Value::Object(map) => map.values().any(|v| value_contains_string(v, query)),
        Value::Array(arr) => arr.iter().any(|v| value_contains_string(v, query)),
        // Numbers, bools, nulls don't match text queries usually, unless we convert them
        _ => false,
    }
}

// Keep the old function for backward compatibility if needed, or update it
#[derive(Serialize, Deserialize, Debug, Clone)]
struct LanguageContent {
    mn: String,
    en: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct MonkOutput {
    id: String,
    arcana: String,
    name: LanguageContent,
    title: LanguageContent,
    video: String,
    score: u32,
}

const RUNES: [&str; 8] = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ"];

#[wasm_bindgen]
pub fn process_monks(json_data: &str) -> String {
   // Re-implement or keep as is. The previous implementation was a simulation.
   // Let's keep it but make it robust.
   // We need a partial struct for this because the input JSON might be complex
   
    #[derive(Serialize, Deserialize, Debug)]
    struct PartialMonk {
        #[serde(rename = "_id")]
        id: String,
        name: LanguageContent,
        title: LanguageContent,
        video: Option<String>,
        #[serde(rename = "monkNumber")]
        monk_number: Option<u32>,
    }

    let monks: Vec<PartialMonk> = match serde_json::from_str(json_data) {
        Ok(m) => m,
        Err(_) => return String::from("[]"),
    };

    let mut processed: Vec<MonkOutput> = monks.iter().enumerate().map(|(i, m)| {
        let monk_num = m.monk_number.unwrap_or(99);
        // Use monk_number for base score, reversed (lower number = higher score)
        let score = 1000 - monk_num;
        
        MonkOutput {
            id: m.id.clone(),
            arcana: RUNES[i % RUNES.len()].to_string(),
            name: m.name.clone(),
            title: m.title.clone(),
            video: m.video.clone().unwrap_or_else(|| "/num1.mp4".to_string()),
            score,
        }
    }).collect();

    processed.sort_by(|a, b| b.score.cmp(&a.score));
    let top_3: Vec<MonkOutput> = processed.into_iter().take(3).collect();
    serde_json::to_string(&top_3).unwrap_or_else(|_| String::from("[]"))
}