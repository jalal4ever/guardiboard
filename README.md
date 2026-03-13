# Guardiboard

**Plateforme SaaS de supervision de la posture de sécurité (Active Directory On-Premise + Microsoft 365)**

---

## Vision Produit

Guardiboard permet de **"superviser ce que l'on veut, comme on le veut"** — une plateforme hybride de supervision de sécurité qui s'adapte aux besoins de chaque organisation :

- **AD On-Premise** : collecte, analyse et contrôle de la posture Active Directory
- **Microsoft 365** : supervision de la configuration et de la sécurité M365 via Microsoft Graph
- **Hybride** : corrélation et visibilité unifiée entre les deux environnements

### Modes de Supervision

| Mode | Description |
|------|-------------|
| `hybrid` | Supervision complète AD + M365 avec corrélation |
| `ad-only` | Active Directory On-Premise uniquement |
| `m365-only` | Microsoft 365 uniquement |

---

## Architecture V1

```
guardiboard/
  apps/
    web/          # Frontend Next.js App Router + React + Tailwind
    api/          # API REST Node.js TypeScript
    worker/      # Jobs planifiés, collectes, évaluations
  packages/
    db/           # Accès PostgreSQL, migrations, schéma
    types/        # Contrats TypeScript partagés
    validation/   # Schémas Zod/JSON
    ui/           # Design system
    auth/         # Auth, sessions, RBAC
    config/       # Configuration typée
  collectors/
    windows-ad/   # Collecteur AD On-Premise (Windows)
  docs/           # Documentation technique
```

### Composants

- **Frontend** : Next.js 14+ (App Router), React, Tailwind CSS
- **Backend** : Node.js 20+, TypeScript strict
- **Base de données** : PostgreSQL 15+
- **Collecteur AD** : PowerShell sur Windows (faible privilège)

### Flux de Données

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Microsoft 365  │────▶│  Worker      │────▶│ PostgreSQL  │
│  (Graph API)    │     │  (collecte)  │     │  (stockage) │
└─────────────────┘     └──────────────┘     └─────────────┘
                              │                      │
┌─────────────────┐           │                      ▼
│  Active         │──────────┼──────────┐    ┌─────────────┐
│  Directory      │          ▼          │    │  API        │
│  On-Premise    │◀── Collecteur ──────┘    │  (REST)     │
└─────────────────┘   (Windows Agent)         └─────────────┘
                                                    │
                                                    ▼
                                             ┌─────────────┐
                                             │  Frontend   │
                                             │  (Next.js)  │
                                             └─────────────┘
```

---

## Fonctionnalités V1

### Collecte Microsoft 365

- Organisation, domaines, licences
- Utilisateurs, groupes, appartenances
- Rôles admin et affectations
- Conditional Access
- Méthodes d'authentification MFA
- Applications d'entreprise, Service Principals
- Secure Score

### Collecte Active Directory

- Topologie (forêt, domaines, trusts, DCs)
- Hygiène des comptes (inactifs, mots de passe)
- Groupes privilégiés
- Délégation Kerberos
- Politiques de mot de passe (FGPP)
- Métadonnées GPO

### Dashboard

- Widgets configurables
- Vues par scope (AD, M365, Hybride)
- Scores de posture
- Findings et alertes
- Inventaire des actifs

---

## Prérequis

### Développement

- Node.js 20+
- pnpm 8+
- PostgreSQL 15+
- Docker (optionnel)

### Production

- Azure Key Vault (secrets)
- PostgreSQL mutualisé ou dédié
- Certificat Azure AD pour Microsoft Graph

---

## Sécurité (Security by Design)

- **Multi-tenant** : isolation stricte par `tenant_id`
- **Moindre privilège** : permissions Graph minimales, compte AD lecture seule
- **Chiffrement** : tokens chiffrés au repos, TLS everywhere
- **Audit** : journalisation de toutes les actions sensibles

---

## Documentation

- [Architecture](./docs/architecture/overview.md)
- [ADR](./docs/adr/)
- [API](./docs/api/)

---

## Licence

Propriétaire
