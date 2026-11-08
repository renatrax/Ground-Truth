//! Desktop shell for Ground Truth. The game itself (UI, simulation, Python)
//! lives in the web frontend; Rust only hosts the window and, later, file
//! saves. Keep game logic out of this crate.

use std::process;

/// Set GT_SMOKE=1 to run the startup smoke test: the frontend loads Python,
/// evaluates `2 + 2`, reports the result here, and the app exits.
/// Exit code 0 = Python answered 4, 1 = anything else.
fn smoke_enabled() -> bool {
    std::env::var("GT_SMOKE").is_ok_and(|v| v == "1")
}

#[tauri::command]
fn smoke_mode() -> bool {
    smoke_enabled()
}

#[tauri::command]
fn smoke_report(ok: bool, detail: String) {
    if !smoke_enabled() {
        return;
    }
    println!("GT_SMOKE {} {}", if ok { "PASS" } else { "FAIL" }, detail);
    process::exit(if ok { 0 } else { 1 });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![smoke_mode, smoke_report])
        .run(tauri::generate_context!())
        .expect("error while running Ground Truth");
}
