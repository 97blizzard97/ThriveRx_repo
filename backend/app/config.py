from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "sqlite:///./thriverx.db"
    cors_origins: str = "*"
    # Optional: Google AI Studio key for Gemini vision OCR (preferred).
    google_api_key: str | None = None
    google_vision_model: str = "gemini-3.1-flash-lite"
    # Optional fallback: OpenAI vision OCR.
    openai_api_key: str | None = None
    openai_vision_model: str = "gpt-4o-mini"

    @property
    def cors_origin_list(self) -> list[str]:
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
