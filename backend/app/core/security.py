"""Reserved for auth dependencies (dual auth).

Intentionally empty for now — not yet implemented. Two paths:
- **Microsoft Entra SSO** (JWT/OIDC): match on the Entra ``oid`` claim (immutable
  per tenant), never ``email``.
- **Local password**: verify against the ``users.password`` hash (argon2/bcrypt).
"""
