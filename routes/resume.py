from fastapi import APIRouter
from database import db
from models import ResumeModel
from pathlib import Path
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

router = APIRouter()

# HTML page (new) — fetches from Mongo and renders Jinja template
TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

@router.get("/resume", response_model=ResumeModel, response_class=HTMLResponse, include_in_schema=False)
async def resume_page(request: Request):
    # Exclude _id for cleaner template context (optional)
    resume = await db["resume"].find_one({}, {"_id": 0})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return templates.TemplateResponse(
        "resume.html",
        {"request": request, "resume": resume, "title": "Resume | Dhruvit"}
    )