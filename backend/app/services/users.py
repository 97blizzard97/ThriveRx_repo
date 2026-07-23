from sqlalchemy.orm import Session

from app.constants import STUB_USER_EMAIL, STUB_USER_ID
from app.models import User


def ensure_stub_user(db: Session) -> User:
    user = db.get(User, STUB_USER_ID)
    if user is not None:
        return user
    user = User(id=STUB_USER_ID, email=STUB_USER_EMAIL)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
