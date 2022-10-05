#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use net2::UdpBuilder;
use serde::Serialize;
use serde_derive::Deserialize;
use std::net::{TcpListener, TcpStream};
use tauri::Manager;
use tauri::{utils::config::AppUrl, window::WindowBuilder, WindowUrl};
use tokio::time::{sleep, Duration};
use warp::Filter;
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn login(app: tauri::AppHandle, url: &str) -> String {
    let windows = app.windows();
    let window = windows.get("login").unwrap();
    window.show().unwrap();
    window
        .eval(format!("window.location.replace('{url}')").as_str())
        .unwrap();
    println!("login");
    "Hello, world!".to_string()
}

#[derive(Deserialize, Debug)]
struct Query {
    code: String,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
struct Beacon {
    name: String,
    base_url: String,
}

fn main() {
    let port = 6789;
    let redirect_port = 6790;

    let mut context = tauri::generate_context!();
    let url = format!("http://localhost:{}", port).parse().unwrap();
    let window_url = WindowUrl::External(url);
    // rewrite the config so the IPC is enabled on this URL
    context.config_mut().build.dist_dir = AppUrl::Url(window_url.clone());
    context.config_mut().build.dev_path = AppUrl::Url(window_url.clone());

    tauri::Builder::default()
        // .register_uri_scheme_protocol("arkitekt", |app, _re| {
        //     println!("Called on page load");
        //     app.windows()
        //         .get("main")
        //         .unwrap()
        //         .emit(
        //             "receive-login",
        //             serde_json::json!({
        //                 "url": "hallo"
        //             }),
        //         )
        //         .unwrap();
        //     ResponseBuilder::new()
        //         .status(202)
        //         .mimetype("text/html")
        //         .body("hello!".as_bytes().to_vec())
        // })
        .plugin(tauri_plugin_localhost::Builder::new(port).build())
        .setup(move |app| {
            WindowBuilder::new(app, "xun".to_string(), window_url)
                .title("Arkitekt")
                .build()?;

            let app_handle = app.handle();
            let next_handle = app.handle();

            let routes = warp::any()
                .and(warp::query::<Query>())
                .map(move |x: Query| {
                    println!("code: {}", x.code);
                    let _window = app_handle.get_window("main").unwrap().emit("code", x.code);
                    let _login = app_handle.get_window("login").unwrap().hide();
                    format!("Hello, World {}!", "nn")
                });

            tauri::async_runtime::spawn(async move {
                // listen for udp broadcasts on port 8080
                let socket = UdpBuilder::new_v4().unwrap().bind("0.0.0.0:45678");

                let socket = match socket {
                    Ok(s) => s,
                    Err(e) => {
                        next_handle
                            .get_window("main")
                            .unwrap()
                            .emit("bind-error", e.to_string())
                            .unwrap();
                        panic!("couldn't bind socket: {:?}", e)
                    }
                };

                // receive a single datagram
                let mut buf = [0u8; 1500];

                while let Ok((amt, src)) = socket.recv_from(&mut buf) {
                    let data = &buf[..amt];
                    let s = std::str::from_utf8(data).unwrap();
                    println!("received {} bytes from {}", amt, src);
                    println!("received {}", s);

                    if s.starts_with("beacon-fakts") {
                        let x: Beacon =
                            serde_json::from_str(s.strip_prefix("beacon-fakts").unwrap()).unwrap();
                        let _window = next_handle.get_window("main").unwrap().emit("fakts", x);
                    }
                    sleep(Duration::from_millis(100)).await;
                }
            });

            tauri::async_runtime::spawn(async move {
                // Check if port is available

                warp::serve(routes)
                    .run(([127, 0, 0, 1], redirect_port))
                    .await;
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![login])
        .on_page_load(|wry_window, _payload| {
            println!("Called on page load");
            if wry_window.label() == "login" {
                wry_window
                    .emit_all(
                        "receive-login",
                        serde_json::json!({
                            "url": _payload.url()
                        }),
                    )
                    .unwrap();
                wry_window.hide().unwrap();
            }
        })
        .run(context)
        .expect("error while running tauri application");
}
