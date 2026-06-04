"""Application settings, sourced from the environment / `.env`.

Field names map case-insensitively to env vars (e.g. ``postgres_user`` <- ``POSTGRES_USER``).
No credentials are hardcoded here: DB user/password/name are **required** env vars
(the app fails loudly at startup if they are missing), and the connection URL is
assembled from them. Real secrets live only in the gitignored ``.env`` / the
platform's secret store. Entra/OIDC values are stubbed and wired into auth later.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Database (Postgres 16, psycopg v3, synchronous) ---
    # Credentials come from the environment — never hardcoded. user/password/db
    # have no defaults on purpose, so a misconfigured deploy fails fast.
    postgres_user: str
    postgres_password: str
    postgres_db: str
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_test_db: str = "menaos_test"

    # --- Object storage (S3 / MinIO) — signed URLs only ---
    s3_endpoint_url: str | None = None
    s3_access_key_id: str | None = None
    s3_secret_access_key: str | None = None
    s3_region: str = "us-east-1"
    s3_bucket: str = "menaos"
    s3_signed_url_ttl_seconds: int = 900

    # --- CORS (comma-separated string in env; see cors_origins_list) ---
    cors_origins: str = "http://localhost:5173"

    # --- Microsoft Entra (OIDC) — stubbed; not yet wired into auth ---
    entra_issuer: str | None = None
    entra_audience: str | None = None
    entra_jwks_url: str | None = None

    # --- App ---
    debug: bool = False

    def _build_dsn(self, db_name: str) -> str:
        return (
            f"postgresql+psycopg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{db_name}"
        )

    @property
    def database_url(self) -> str:
        return self._build_dsn(self.postgres_db)

    @property
    def test_database_url(self) -> str:
        return self._build_dsn(self.postgres_test_db)

    @property
    def cors_origins_list(self) -> list[str]:
        return [
            origin.strip() for origin in self.cors_origins.split(",") if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
