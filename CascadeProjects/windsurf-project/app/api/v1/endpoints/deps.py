from fastapi import Request

async def get_db(request: Request):
    return request.app.state.db

async def get_llm(request: Request):
    return request.app.state.llm

async def get_audio_model(request: Request):
    return request.app.state.audio_model

async def get_mail(request: Request):
    return request.app.state.mail

