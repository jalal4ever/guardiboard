# ADR 0002: Microsoft Graph App-Only

## Statut
Accepté

## Contexte
La collecte Microsoft 365 doit être automatisée sans interaction utilisateur.

## Décision
Utiliser le flux Client Credentials avec certificat X.509.

## Conséquences

### Positives
- Pas de refresh tokens à gérer
- Automatisation complète
- Certificat rotatif

### Negatives
- Nécessite consentement admin initial
- Certificat à renouveler
