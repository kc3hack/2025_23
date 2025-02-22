use base64::{engine::general_purpose, Engine as _};
use reqwest;
use rocket::http::Status;
use rocket::{get, post, routes, serde::json::Json, Request, State};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::io::Cursor;
use toml;

#[derive(Debug, Deserialize, Serialize)]
struct LlmFrontRequest {
    user_input: String,
    character_id: String,
    user_id: u64,
    user_name: String,
    session_uuid: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct ChatResponse {
    response: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct Config {
    characters: HashMap<String, CharacterConfig>,
}

#[derive(Debug, Deserialize, Serialize)]
struct CharacterConfig {
    llm_front_id: u64,
    chat_id: u64,
    voice_id: u64,
}

#[derive(Debug, Deserialize, Serialize)]
struct ResponseData {
    text: String,
    audio_data: String,
}

#[macro_use]
extern crate rocket;

#[post("/llm_front", format = "json", data = "<request>")]
async fn llm_front(
    request: Json<LlmFrontRequest>,
    config: &State<Config>,
) -> Result<Json<ResponseData>, Status> {
    let character_name = request.character_id.clone();

    let character_config = config
        .characters
        .get(&character_name)
        .ok_or(Status::BadRequest)?;

    let chat_url = format!(
        "http://127.0.0.1:7297/chat?user_input={}&session_uuid={}&character_id={}",
        request.user_input, request.session_uuid, character_config.chat_id
    );
    let chat_response = reqwest::get(chat_url)
        .await
        .map_err(|_| Status::InternalServerError)?
        .json::<ChatResponse>()
        .await
        .map_err(|_| Status::InternalServerError)?;

    let voice_url = format!("http://192.168.0.8:59760/voice?text={}&encoding=utf-8&model_id={}&speaker_id=0&sdp_ratio=0.2&noise=0.6&noisew=0.8&length=1&language=JP&auto_split=true&split_interval=0.5&assist_text_weight=1&style=Neutral&style_weight=5",
                           chat_response.response, character_config.voice_id);

    let voice_response = reqwest::get(voice_url)
        .await
        .map_err(|_| Status::InternalServerError)?;

    if !voice_response
        .headers()
        .get("content-type")
        .map(|ct| ct == "audio/wav")
        .unwrap_or(false)
    {
        return Err(Status::InternalServerError);
    }

    let voice_bytes = voice_response
        .bytes()
        .await
        .map_err(|_| Status::InternalServerError)?;

    let base64_audio = general_purpose::STANDARD_NO_PAD.encode(voice_bytes);

    let response_data = ResponseData {
        text: chat_response.response,
        audio_data: base64_audio,
    };

    Ok(Json(response_data))
}

#[launch]
fn rocket() -> _ {
    let config_string = fs::read_to_string("config.toml").expect("Failed to read config file");
    let config: Config = toml::from_str(&config_string).expect("Failed to parse config file");

    rocket::build()
        .mount("/", routes![llm_front])
        .manage(config)
}
