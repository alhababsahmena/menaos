"""Root conftest.

Present so pytest treats ``backend/`` as the rootdir and puts it on ``sys.path``
(prepend import mode), making the ``app`` package importable from tests. Shared
fixtures live in ``tests/conftest.py``.
"""
