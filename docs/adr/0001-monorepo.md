# ADR 0001: Architecture Monorepo

## Statut
Accepté

## Contexte
Guardiboard nécessite une structure qui permette de gérer frontend, backend, worker et packages partagés de manière coordonnée.

## Décision
Utiliser un monorepo pnpm workspaces + Turbo.

## Conséquences

### Positives
- Partage de types entre frontend et backend
- Déploiement indépendant des applications
- Gestion centralisée des dépendances

### Negatives
- Complexité de configuration initiale
- Build global peut être lent sans caching
