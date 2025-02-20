var express = require('express');

const post_for_llm_front = (app) => {
    app.post('/test/post_for_llmfront', (req, res) => {
        console.log(req.body);
        res.send('Received'); // 応答を返さないとクライアントがハングする
    });
};

module.exports = post_for_llm_front;
