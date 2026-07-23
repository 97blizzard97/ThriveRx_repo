"""Reminder schedules — med core module."""

from uuid import UUID

from app.schemas.medications import ReminderSchedule


def list_reminders(user_id: UUID) -> list[ReminderSchedule]:
    _ = user_id
    return []


def upsert_reminder(user_id: UUID, schedule: ReminderSchedule) -> ReminderSchedule:
    _ = user_id
    return schedule
