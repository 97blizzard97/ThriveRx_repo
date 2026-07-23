from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import carer, health, medicines, reminders, scan, world

app = FastAPI(
    title="ThriveRx API",
    version="0.1.0",
    description="Portfolio demo — general medicine reference, not clinical advice.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(medicines.router)
app.include_router(medicines.me_router)
app.include_router(scan.router)
app.include_router(reminders.router)
app.include_router(carer.router)
app.include_router(world.router)


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "thriverx-api", "status": "ok"}
