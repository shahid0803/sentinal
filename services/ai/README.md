# Sentinel AI service

The OLD FastAPI service is not copied wholesale. Its `/analyze` contract is
reserved for the optional Python service and must return classification, severity,
confidence, similarity/duplicate, cluster, and recommended action. This service
is currently unavailable unless Python dependencies and a runner are provisioned;
the canonical API remains truthful about that boundary.
