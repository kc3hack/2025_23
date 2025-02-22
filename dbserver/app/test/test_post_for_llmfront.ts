const express = require('express');
const fs = require('fs');
const path = require('path');

const text = "朝から会えたんめっちゃ嬉しい～ ぎゅーしてもええ？";

const post_for_llm_front = (app) => {
    app.post('/test/post_for_llmfront', (req, res) => {

        // 音声ファイルのパス
        const audioPath = path.join(__dirname, 'audio.wav');

        fs.readFile(audioPath, (err, audioData) => {
            if (err) {
                console.error('Error reading audio file:', err);
                return res.status(500).send('Internal server error');
            }

            // 音声データをBase64エンコードしてJSONに含める
            const base64Audio = audioData.toString('base64');

            // テキストとエンコードした音声データをJSONで返す
            const responseData = {
                text: text,
                audioData: base64Audio
            };

            res.json(responseData);
        });
    });
};

module.exports = post_for_llm_front;
