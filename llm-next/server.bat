chcp 65001 > NUL
@echo off

pushd %~dp0
.venv\Scripts\python fastapi_server.py 7297

if %errorlevel% neq 0 ( pause & popd & exit /b %errorlevel% )

popd
