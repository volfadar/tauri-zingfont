use log::{error, info};
use mouse_position::mouse_position::Mouse;
use serde_json::json;
use tauri::Window;

#[tauri::command]
pub fn get_mouse_position() -> serde_json::Value {
    /*
     * because we set the window to ignore cursor events, we cannot use
     * javascript to get the mouse position, so we use get mouse position manually
     */
    let position = Mouse::get_mouse_position();
    match position {
        Mouse::Position { x, y } => {
            json!({
                "clientX": x,
                "clientY": y
            })
        }
        Mouse::Error => {
            error!("Error getting mouse position");
            println!("Error getting mouse position");
            json!(null)
        }
    }
}

#[tauri::command]
pub fn open_folder(path: &str) {
    match open::that(path) {
        Ok(()) => info!("Open folder: {}", path),
        Err(err) => error!("An error occurred when opening '{}': {}", path, err),
    }
}

#[tauri::command]
pub async fn toggle_cursor_events(window: Window, ignore: bool) {
    window
        .set_ignore_cursor_events(ignore)
        .unwrap_or_else(|err| error!("Failed to toggle cursor events: {}", err));
}
