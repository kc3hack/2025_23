chcp 65001 > NUL
@echo off

pushd %~dp0
.venv\Scripts\python fastapi_server.py

if %errorlevel% neq 0 ( pause & popd & exit /b %errorlevel% )

popd
