from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from pathlib import Path
from routes import chatbot,resume, contact
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

app = FastAPI()

# Serve the portfolio HTML at the root
BASE_DIR = Path(__file__).resolve().parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")


@app.get("/", include_in_schema=False, response_class=HTMLResponse)
async def serve_portfolio(request: Request):
    return templates.TemplateResponse(
        "index.html", 
        {"request": request, "title": "Dhruvit Portfolio"}
    )

# API routes under /api
app.include_router(resume.router)
app.include_router(contact.router)
app.include_router(chatbot.router)
