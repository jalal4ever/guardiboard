# Architecture Guardiboard V1

## Vue d'ensemble

Guardiboard est une plateforme SaaS de supervision de la posture de sécurité pour les environnements hybrides (Active Directory On-Premise + Microsoft 365).

## Décisions Architecturales

Voir [ADR](./adr/)

## Composants

### Frontend (apps/web)
- Next.js 14+ App Router
- React 18+
- Tailwind CSS

### Backend (apps/api)
- Node.js 20+
- Express
- TypeScript strict

### Worker (apps/worker)
- Jobs planifiés
- Collecte Microsoft Graph
- Ingestion des données AD

### Base de données
- PostgreSQL 15+
- Drizzle ORM
- Multi-tenant avec tenant_id

### Collecteur AD (collectors/windows-ad)
- PowerShell
- Faible privilège
- Sortie HTTPS uniquement
