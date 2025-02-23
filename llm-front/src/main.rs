use base64::{engine::general_purpose, Engine as _};
use dotenvy::dotenv;
use log::{debug, error, info, warn};
use reqwest;
use rocket::http::Status;
use rocket::{get, post, routes, serde::json::Json, Request, State};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::env;
use std::fs;
use std::io::Cursor;
use thiserror::Error;
use toml;

#[derive(Debug, Deserialize, Serialize)]
struct LlmFrontRequest {
    user_input: String,
    character_id: u64,
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

#[derive(Error, Debug)]
enum LlmFrontError {
    #[error("チャットの取得に失敗しました: {0}")]
    ChatRequestFailed(reqwest::Error),
    #[error("チャットレスポンスの解析に失敗しました: {0}")]
    ChatResponseParseFailed(reqwest::Error),
    #[error("音声レスポンスの取得に失敗しました: {0}")]
    VoiceRequestFailed(reqwest::Error),
    #[error("無効な音声コンテンツタイプです")]
    InvalidVoiceContentType,
    #[error("音声バイトの読み込みに失敗しました: {0}")]
    VoiceReadFailed(reqwest::Error),
    #[error("キャラクターが見つかりません")]
    CharacterNotFound,
    #[error("環境変数の読み込みに失敗しました: {0}")]
    EnvVarLoadFailed(std::env::VarError),
}
impl From<LlmFrontError> for Status {
    fn from(error: LlmFrontError) -> Self {
        error!("Error: {:?}", error);
        match error {
            LlmFrontError::CharacterNotFound => Status::BadRequest,
            _ => Status::InternalServerError,
        }
    }
}

#[macro_use]
extern crate rocket;

#[post("/llm_front", format = "json", data = "<request>")]
async fn llm_front(
    request: Json<LlmFrontRequest>,
    config: &State<Config>,
) -> Result<Json<ResponseData>, Status> {
    let character_id = request.character_id.clone();

    let chat_host = env::var("CHAT_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let chat_port = env::var("CHAT_PORT").unwrap_or_else(|_| "7297".to_string());
    let voice_host = env::var("VOICE_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let voice_port = env::var("VOICE_PORT").unwrap_or_else(|_| "5000".to_string());

    let character_config = config
        .characters
        .values()
        .find(|&character| character.llm_front_id == character_id)
        .ok_or(LlmFrontError::CharacterNotFound)?;

    let chat_url = format!(
        "http://{}:{}/chat?user_input={}&session_uuid={}&character_id={}&user_id={}&user_name={}",
        chat_host, chat_port, request.user_input, request.session_uuid, character_config.chat_id, request.user_id, request.user_name
    );
    debug!("chat_url: {}", chat_url);
    let chat_response = reqwest::get(chat_url)
        .await
        .map_err(LlmFrontError::ChatRequestFailed)?
        .json::<ChatResponse>()
        .await
        .map_err(LlmFrontError::ChatResponseParseFailed)?;

    debug!("chat_response: {:#?}", chat_response.response);

    let voice_url = format!("http://{}:{}/voice?text={}&encoding=utf-8&model_id={}&speaker_id=0&sdp_ratio=0.2&noise=0.6&noisew=0.8&length=1&language=JP&auto_split=true&split_interval=0.5&assist_text_weight=1&style=Neutral&style_weight=5",
        voice_host, voice_port, chat_response.response, character_config.voice_id);

    let voice_response = reqwest::get(voice_url)
        .await
        .map_err(LlmFrontError::VoiceRequestFailed)?;

    if !voice_response
        .headers()
        .get("content-type")
        .map(|ct| ct == "audio/wav")
        .unwrap_or(false)
    {
        return Err(LlmFrontError::InvalidVoiceContentType.into());
    }

    let voice_bytes = voice_response
        .bytes()
        .await
        .map_err(LlmFrontError::VoiceReadFailed)?;

    let base64_audio = general_purpose::STANDARD_NO_PAD.encode(voice_bytes);

    let response_data = ResponseData {
        text: chat_response.response,
        audio_data: base64_audio,
    };

    Ok(Json(response_data))
}

#[launch]
fn rocket() -> _ {
    colog::init();
    dotenv().expect(".env file not found");
    let config_string = fs::read_to_string("config.toml").expect("Failed to read config file");
    let config: Config = toml::from_str(&config_string).expect("Failed to parse config file");
    debug!("#Parsed TOML:\n{:#?}", config);

    rocket::build()
        .mount("/", routes![llm_front])
        .manage(config)
}
