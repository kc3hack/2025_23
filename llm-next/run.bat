chcp 65001 > NUL
@echo off

pushd %~dp0
.venv\Scripts\python main.py test_01

if %errorlevel% neq 0 ( pause & popd & exit /b %errorlevel% )

popd
