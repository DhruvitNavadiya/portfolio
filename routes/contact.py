from fastapi import APIRouter
from database import db
from models import ContactModel
from datetime import datetime

router = APIRouter()

@router.post("/contact")
async def create_contact(contact: ContactModel):
    contact_doc = contact.dict()
    contact_doc["created_at"] = datetime.utcnow()  # timestamp
    if len(contact.message) > 500:
        return {"error": "Message too long. Max 500 characters."}
    else:
        result = await db["contacts"].insert_one(contact_doc)
        return {"id": str(result.inserted_id), "message": "Contact information received."}

