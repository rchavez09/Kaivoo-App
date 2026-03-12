// Heartbeat Timer — Sprint 37 P1
//
// Background timer that emits 'heartbeat-tick' events at configurable intervals.
// Runs independently of the UI using std::thread + tokio sleep.

use std::sync::{Arc, Mutex, OnceLock};
use std::time::Duration;
use tauri::{AppHandle, Emitter};

// Global state to track the running heartbeat task
static HEARTBEAT_HANDLE: Mutex<Option<std::thread::JoinHandle<()>>> = Mutex::new(None);
static HEARTBEAT_STOP_FLAG: OnceLock<Mutex<Arc<Mutex<bool>>>> = OnceLock::new();

fn get_stop_flag() -> &'static Mutex<Arc<Mutex<bool>>> {
    HEARTBEAT_STOP_FLAG.get_or_init(|| Mutex::new(Arc::new(Mutex::new(false))))
}

#[tauri::command]
pub fn start_heartbeat(app: AppHandle, interval_seconds: u64) -> Result<String, String> {
    // Stop any existing heartbeat first
    stop_heartbeat_internal();

    if interval_seconds == 0 {
        return Err("Interval must be > 0".to_string());
    }

    // Reset stop flag
    let stop_flag = Arc::new(Mutex::new(false));
    {
        let mut global_flag = get_stop_flag().lock().unwrap();
        *global_flag = Arc::clone(&stop_flag);
    }

    let interval = Duration::from_secs(interval_seconds);

    // Spawn background thread
    let handle = std::thread::spawn(move || {
        println!("[Heartbeat] Background thread started (interval: {}s)", interval_seconds);

        loop {
            // Check stop flag
            {
                let should_stop = stop_flag.lock().unwrap();
                if *should_stop {
                    println!("[Heartbeat] Stop flag set, exiting thread");
                    break;
                }
            }

            // Sleep for the interval
            std::thread::sleep(interval);

            // Check stop flag again after sleep
            {
                let should_stop = stop_flag.lock().unwrap();
                if *should_stop {
                    println!("[Heartbeat] Stop flag set after sleep, exiting thread");
                    break;
                }
            }

            // Emit heartbeat-tick event to frontend
            if let Err(e) = app.emit("heartbeat-tick", ()) {
                eprintln!("[Heartbeat] Failed to emit tick event: {}", e);
            } else {
                println!("[Heartbeat] Emitted heartbeat-tick");
            }
        }

        println!("[Heartbeat] Background thread exited");
    });

    // Store the thread handle globally
    {
        let mut global_handle = HEARTBEAT_HANDLE.lock().unwrap();
        *global_handle = Some(handle);
    }

    Ok(format!("Heartbeat started with interval {}s", interval_seconds))
}

#[tauri::command]
pub fn stop_heartbeat() -> Result<String, String> {
    stop_heartbeat_internal();
    Ok("Heartbeat stopped".to_string())
}

fn stop_heartbeat_internal() {
    // Take the handle first to prevent concurrent stops (Agent 7 P1-2)
    let handle = {
        let mut global_handle = HEARTBEAT_HANDLE.lock().unwrap();
        global_handle.take()
    };

    // Only set stop flag if we actually have a thread to stop
    if handle.is_some() {
        let global_flag = get_stop_flag().lock().unwrap();
        let mut flag = global_flag.lock().unwrap();
        *flag = true;
    }

    if let Some(h) = handle {
        println!("[Heartbeat] Waiting for background thread to stop...");
        if h.join().is_err() {
            eprintln!("[Heartbeat] Thread panicked during shutdown");
        }
    }
}
