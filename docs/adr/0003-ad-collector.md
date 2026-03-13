# ADR 0003: Collecteur AD Windows

## Statut
Accepté

## Contexte
La collecte AD On-Premise doit être déployée chez le client avec un modèle de sécurité renforcé.

## Décision
- Collecteur Windows avec flux sortant uniquement
- Privilège minimum (compte lecture seule ou gMSA)
- Modules PowerShell signés

## Conséquences

### Positives
- Pas d'exposition entrante
- Faible surface d'attaque
- Compatible avec la plupart des environnements

### Negatives
- Déploiement par tenant
- Dépendance Windows
