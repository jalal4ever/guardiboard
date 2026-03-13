### Guardiboard
**Plateforme SaaS de supervision de la posture de sécurité (Active Directory On-Premise + Microsoft 365)**

--------------------------------------------------------------------------------

#### Vision Produit
Guardiboard permet de **"superviser ce que l'on veut, comme on le veut"** — une plateforme hybride de supervision de sécurité qui s'adapte aux besoins de chaque organisation :
*   **AD On-Premise** : collecte, analyse et contrôle de la posture Active Directory
*   **Microsoft 365** : supervision de la configuration et de la sécurité M365 via Microsoft Graph
*   **Hybride** : corrélation et visibilité unifiée entre les deux environnements

##### Modes de Supervision
| Mode | Description |
| ------ | ------ |
| hybrid | Supervision complète AD + M365 avec corrélation |
| ad-only | Active Directory On-Premise uniquement |
| m365-only | Microsoft 365 uniquement |

--------------------------------------------------------------------------------

#### Architecture V1
##### Composants
*   **Frontend** : Next.js 14+ (App Router), React, Tailwind CSS
*   **Backend** : Node.js 20+, TypeScript strict
*   **Base de données** : PostgreSQL 15+
*   **Collecteur AD** : PowerShell sur Windows (faible privilège)

##### Flux de Données
*(À compléter selon votre architecture)*

--------------------------------------------------------------------------------

#### Fonctionnalités V1
##### Collecte Microsoft 365
*  Organisation, domaines, licences
*  Utilisateurs, groupes, appartenances
*  Rôles admin et affectations
*  Conditional Access
*  Méthodes d'authentification MFA
*  Applications d'entreprise, Service Principals
*  Secure Score

##### Collecte Active Directory
*  Topologie (forêt, domaines, trusts, DCs)
*  Hygiène des comptes (inactifs, mots de passe)
*  Groupes privilégiés
*  Délégation Kerberos
*  Politiques de mot de passe (FGPP)
*  Métadonnées GPO

##### Dashboard
*  Widgets configurables
*  Vues par scope (AD, M365, Hybride)
*  Scores de posture
*  Findings et alertes
*  Inventaire des actifs

--------------------------------------------------------------------------------

#### Prérequis
##### Développement
*  Node.js 20+
*  pnpm 8+
*  PostgreSQL 15+
*  Docker (optionnel)
*  **Recommandation IA** : Définissez vos sous-agents personnalisés dans le dossier `.opencode/agents/` pour déléguer les tâches techniques (AD, M365, Security, UI).

##### Production
*  Azure Key Vault (secrets)
*  PostgreSQL mutualisé ou dédié
*  Certificat Azure AD pour Microsoft Graph

--------------------------------------------------------------------------------

#### Sécurité (Security by Design)
*   **Multi-tenant** : isolation stricte par `tenant_id` (implémentée via Row Level Security - RLS dans PostgreSQL et validée par middleware API).
*   **Moindre privilège** : permissions Graph minimales, compte AD lecture seule.
*   **Chiffrement** : tokens chiffrés au repos, TLS everywhere.
*   **Audit** : journalisation de toutes les actions sensibles.

--------------------------------------------------------------------------------

#### Documentation
*  Architecture
*  ADR
*  API

*Note pour les agents IA : Toute la documentation détaillée de Guardiboard est accessible dynamiquement ("lazy loading") via la compétence OpenCode. Invoquez la compétence (skill) `docs` pour consulter les schémas d'architecture ou les ADR avant de prendre des décisions critiques.*

--------------------------------------------------------------------------------

#### Licence
Propriétaire