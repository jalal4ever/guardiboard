# PRD — Guardiboard

## 1. Présentation

### 1.1 Nom du produit
**Guardiboard**

### 1.2 Vision
Guardiboard est une application SaaS de supervision de la posture de sécurité des environnements Microsoft, conçue pour être **flexible, modulaire, sécurisée et orientée décision**.

La plateforme permet de superviser, selon le besoin :
- un environnement **hybride** ;
- un **Active Directory on-premise uniquement** ;
- un environnement **Microsoft 365 uniquement**.

Guardiboard repose sur une promesse produit simple :

> **Supervise what you want, the way you want.**  
> **Superviser ce que vous voulez, comme vous le voulez.**

L’objectif est de mettre fin aux consoles de supervision imposées, rigides, peu lisibles ou complexes à paramétrer, en proposant une expérience moderne, configurable et pensée pour les besoins réels des DSI, équipes sécurité et équipes conformité.

---

## 2. Contexte et problème

Les organisations Microsoft disposent souvent de plusieurs outils, consoles et rapports pour évaluer leur sécurité :
- pour l’Active Directory on-premise ;
- pour Microsoft 365, Entra ID, Exchange Online, SharePoint, Teams et autres services associés ;
- pour la conformité, l’audit et la gouvernance.

Cette fragmentation crée plusieurs problèmes :
- une visibilité partielle ou dispersée ;
- une difficulté à prioriser les risques ;
- des interfaces trop techniques pour les profils décisionnels ;
- des outils qui imposent leur propre logique de lecture ;
- une personnalisation limitée du périmètre de supervision ;
- une complexité élevée pour connecter, maintenir et exploiter les sources de données.

Guardiboard répond à ce besoin avec une plateforme unique, configurable et sécurisée, capable de centraliser les indicateurs essentiels de sécurité Microsoft dans un dashboard orienté action.

---

## 3. Objectifs produit

### 3.1 Objectifs métier
- Fournir une vue claire, exploitable et centralisée de la posture de sécurité Microsoft.
- Permettre aux organisations de choisir exactement ce qu’elles souhaitent superviser.
- Réduire la complexité de configuration par rapport aux outils et consoles traditionnels.
- Offrir une plateforme lisible aussi bien pour les profils techniques que décisionnels.
- Faciliter la priorisation des risques et des actions correctrices.

### 3.2 Objectifs fonctionnels
- Superviser l’Active Directory on-premise.
- Superviser Microsoft 365 et les composants associés.
- Permettre un mode hybride ou un mode ciblé selon le contexte client.
- Autoriser la personnalisation du contenu visible dans le dashboard.
- Gérer plusieurs tenants et plusieurs environnements.
- Sécuriser les secrets, identifiants, jetons et informations sensibles.
- Offrir des tests de connectivité et des mécanismes de validation des intégrations.

### 3.3 Objectifs techniques
- Disposer d’un frontend moderne, riche et responsive.
- Disposer d’un backend structuré pour les intégrations, la collecte et l’orchestration.
- Garantir une architecture sécurisée par défaut.
- Rendre l’application extensible pour ajouter de nouveaux contrôles et modules.

---

## 4. Personas cibles

### 4.1 DSI / RSSI
Attendent une vue synthétique de la posture de sécurité, des risques majeurs, des tendances et des priorités de remédiation.

### 4.2 Administrateur système / ingénieur infrastructure
Souhaite disposer d’indicateurs techniques précis, de détails d’exposition, de résultats de contrôles et d’une aide à la correction.

### 4.3 Équipe sécurité / conformité / audit
A besoin d’une vision structurée, traçable et exploitable pour suivre les écarts, justifier les décisions et préparer les contrôles de conformité.

### 4.4 Prestataire MSSP / intégrateur / partenaire
Peut utiliser la plateforme pour superviser plusieurs clients, plusieurs tenants et plusieurs périmètres techniques dans une logique multi-environnement.

---

## 5. Périmètre produit

### 5.1 Modes de supervision
Guardiboard doit permettre, lors du paramétrage initial puis à tout moment ensuite, de choisir le périmètre de supervision parmi les modes suivants :

- **Mode hybride** : Active Directory on-premise + Microsoft 365.
- **Mode Active Directory on-premise uniquement**.
- **Mode Microsoft 365 uniquement**.

Le choix ne doit pas être figé. Le périmètre de supervision doit être modifiable dans le temps selon l’évolution du client.

### 5.2 Philosophie de personnalisation
Le produit doit permettre de sélectionner :
- ce que l’on souhaite superviser ;
- ce que l’on souhaite afficher ;
- la manière dont on souhaite le visualiser.

Le dashboard doit être configurable par cases à cocher, sélections, filtres et options de personnalisation. L’utilisateur doit pouvoir activer ou désactiver :
- des domaines de supervision ;
- des familles de contrôles ;
- des widgets ;
- des alertes ;
- des indicateurs ;
- des sections du tableau de bord.

---

## 6. Fonctionnalités principales

### 6.1 Onboarding et paramétrage
- Création de l’espace client / organisation.
- Choix du mode de supervision : hybride, AD on-prem uniquement, Microsoft 365 uniquement.
- Paramétrage du tenant, des applications Azure et des connecteurs nécessaires.
- Paramétrage du compte de service ou de l’agent de collecte pour l’Active Directory.
- Sélection des contrôles et domaines à superviser.
- Personnalisation initiale du dashboard.

### 6.2 Supervision Active Directory on-premise
Le module Active Directory doit analyser les configurations de sécurité essentielles de l’environnement on-premise selon une approche inspirée des contrôles mis en avant par Purple Knight [web:11][web:12].

Les analyses doivent couvrir notamment :
- comptes à privilèges ;
- délégations sensibles ;
- configurations historiques à risque ;
- expositions liées aux mots de passe ;
- objets vulnérables ou mal configurés ;
- paramètres de sécurité AD critiques ;
- signaux de faiblesse dans la gouvernance des identités.

### 6.3 Supervision Microsoft 365
Le module Microsoft 365 doit analyser la posture de sécurité du tenant selon une approche inspirée de Monkey365, qui couvre de nombreux contrôles sur les services Microsoft et leurs configurations [web:18][web:20].

Les vérifications doivent pouvoir couvrir notamment :
- Entra ID ;
- Exchange Online ;
- SharePoint Online ;
- Teams ;
- applications d’entreprise ;
- permissions accordées ;
- accès invités ;
- MFA ;
- configurations de sécurité et d’exposition.

### 6.4 Dashboard riche et personnalisable
Le frontend doit proposer un dashboard moderne, lisible et riche en informations utiles pour les DSI, les équipes sécurité et conformité.

Le dashboard doit inclure :
- score global de posture de sécurité ;
- scores par domaine ;
- indicateurs critiques ;
- alertes prioritaires ;
- vues par environnement ;
- vues par criticité ;
- vues par tenant ;
- tendances dans le temps ;
- état des connecteurs ;
- liste des contrôles en échec ;
- recommandations de remédiation.

Le dashboard doit permettre :
- de masquer ou afficher des widgets ;
- de filtrer par périmètre ;
- de filtrer par niveau de risque ;
- de filtrer par source ;
- de sauvegarder une vue personnalisée ;
- d’adapter l’affichage au rôle utilisateur.

### 6.5 Gestion des tenants et des intégrations Microsoft 365
Le backend doit permettre de gérer les connexions aux environnements Microsoft 365.

Fonctionnalités attendues :
- ajouter un enregistrement de tenant ;
- donner un nom lisible à l’enregistrement ;
- modifier ce nom ;
- modifier les paramètres d’intégration ;
- supprimer l’enregistrement ;
- tester la connectivité avec le tenant ;
- vérifier l’état des autorisations et secrets ;
- visualiser le statut de l’intégration.

### 6.6 Gestion des applications Azure
Le backend doit permettre :
- d’enregistrer les informations d’applications Azure ;
- de gérer les identifiants nécessaires à la connexion ;
- de tester l’accès ;
- de modifier les paramètres ;
- de supprimer l’intégration ;
- d’associer une application Azure à un tenant ou à plusieurs périmètres.

### 6.7 Collecte on-premise
Pour la supervision Active Directory, l’application doit permettre l’utilisation d’un compte de service ou d’un composant de collecte dédié.

Exigences :
- support d’un compte de service à privilèges minimaux ;
- collecte sécurisée des données utiles ;
- limitation stricte du périmètre d’accès ;
- possibilité d’évoluer vers un agent local si nécessaire ;
- communications chiffrées vers le backend.

### 6.8 Recommandations et remédiation
Pour chaque contrôle, la plateforme doit afficher :
- le statut ;
- le niveau de criticité ;
- la description du risque ;
- l’impact métier ou sécurité ;
- la recommandation de remédiation ;
- la source du contrôle ;
- l’historique d’évolution.

### 6.9 Historique et traçabilité
- Historique des scans.
- Historique des scores.
- Historique des changements de configuration.
- Journal des actions d’administration.
- Journal des tests de connectivité.
- Journal des opérations sensibles.

---

## 7. Exigences de sécurité

### 7.1 Positionnement sécurité
Guardiboard est une plateforme conçue selon une approche **security by design**.

La plateforme ne doit pas seulement superviser la sécurité des environnements clients ; elle doit également appliquer elle-même un haut niveau d’exigence en matière de protection des accès, des secrets, des échanges, de l’administration et des données sensibles.

### 7.2 Principes de sécurité
- Principe du moindre privilège.
- Séparation des rôles et responsabilités.
- Chiffrement des secrets et données sensibles.
- Sécurisation des communications.
- Journalisation des actions sensibles.
- Auditabilité des opérations d’administration.
- Durcissement par défaut de l’architecture.
- Rotation des secrets.
- Réduction de la surface d’exposition.
- Défense en profondeur.

### 7.3 Gestion des secrets
Tous les mots de passe, secrets applicatifs, jetons, clés et identifiants techniques doivent être :
- stockés de manière sécurisée ;
- chiffrés au repos ;
- protégés en transit ;
- masqués dans l’interface ;
- non exposés dans les logs ;
- rotatifs si possible ;
- gérés via un mécanisme dédié de secret management.

### 7.4 Authentification et autorisation
Le produit doit prévoir :
- authentification forte ;
- authentification multifacteur pour les administrateurs ;
- gestion des rôles ;
- contrôle d’accès granulaire ;
- gestion des sessions ;
- expiration et révocation des accès ;
- séparation entre accès lecture, administration, paramétrage et exploitation.

### 7.5 Journalisation et audit
Toutes les opérations sensibles doivent être tracées :
- connexions ;
- échecs d’authentification ;
- modifications d’intégrations ;
- suppression d’enregistrements ;
- tests de connectivité ;
- changements de périmètre ;
- activation ou désactivation de contrôles ;
- accès aux paramètres sensibles.

### 7.6 Conformité et exigences élevées
L’architecture devra être pensée pour faciliter l’alignement avec des exigences fortes de sécurité et de conformité, notamment :
- principes Zero Trust ;
- bonnes pratiques de sécurisation SaaS ;
- exigences de traçabilité ;
- exigences de gouvernance ;
- exigences de protection des données ;
- attentes de conformité d’entreprise.

---

## 8. Exigences non fonctionnelles

### 8.1 Performance
- Chargement rapide du dashboard.
- Temps de réponse faible sur les vues principales.
- Exécution asynchrone des tâches de collecte.
- Support des scans planifiés.

### 8.2 Scalabilité
- Capacité à supporter plusieurs organisations.
- Capacité à supporter plusieurs tenants.
- Capacité à supporter plusieurs sources de collecte.
- Conception modulaire pour ajouter de nouveaux contrôles.

### 8.3 Disponibilité
- Architecture pensée pour une forte disponibilité.
- Gestion des erreurs d’intégration.
- Reprise sur incident.
- Surveillance de l’état des connecteurs.

### 8.4 Maintenabilité
- Code modulaire.
- Séparation claire frontend / backend.
- Architecture extensible.
- Journalisation exploitable.
- Documentation technique et fonctionnelle.

### 8.5 Expérience utilisateur
- Interface simple malgré la richesse fonctionnelle.
- Lecture claire pour les profils non experts.
- Navigation fluide.
- Aide contextuelle sur les contrôles et résultats.
- Terminologie compréhensible par les métiers et les équipes techniques.

---

## 9. Architecture cible

### 9.1 Frontend
Le frontend doit être une application web moderne offrant :
- dashboard personnalisable ;
- vues détaillées ;
- filtres ;
- gestion des paramètres ;
- gestion des tenants ;
- gestion des intégrations ;
- affichage des alertes ;
- consultation de l’historique.

### 9.2 Backend
Le backend doit gérer :
- authentification et autorisation ;
- logique métier ;
- orchestration des analyses ;
- stockage des paramètres ;
- gestion des tenants ;
- gestion des applications Azure ;
- communication avec Microsoft 365 ;
- réception des données on-premise ;
- planification des scans ;
- journalisation et audit.

### 9.3 Stockage
Le système doit stocker :
- tenants ;
- paramètres d’intégration ;
- utilisateurs et rôles ;
- résultats de contrôles ;
- historiques ;
- logs d’audit ;
- métadonnées de dashboard ;
- configurations personnalisées.

### 9.4 Couche sécurité
Une couche dédiée doit gérer :
- chiffrement ;
- secret management ;
- contrôle d’accès ;
- audit ;
- rotation des secrets ;
- protection API ;
- sécurisation des communications internes et externes.

---

## 10. Modèle de permissions

### 10.1 Rôles minimaux
- **Super Admin plateforme**
- **Admin client**
- **Analyste sécurité**
- **Lecteur / auditeur**
- **Opérateur technique**

### 10.2 Capacités par rôle
- Le Super Admin gère la plateforme globale.
- L’Admin client gère le périmètre, les intégrations et les utilisateurs de son organisation.
- L’Analyste sécurité consulte les résultats détaillés et suit les remédiations.
- Le Lecteur consulte les tableaux de bord et rapports sans modifier la configuration.
- L’Opérateur technique gère les connecteurs et les tests de connectivité sans accès complet aux paramètres les plus sensibles.

---

## 11. MVP

### 11.1 Objectif du MVP
Lancer une première version utile, crédible et exploitable, focalisée sur la valeur principale : centraliser la supervision de sécurité Microsoft avec paramétrage flexible.

### 11.2 Contenu du MVP
- Authentification et rôles de base.
- Création d’une organisation.
- Choix du mode de supervision.
- Gestion d’au moins un tenant Microsoft 365.
- Enregistrement d’une application Azure.
- Test de connectivité tenant.
- Paramétrage de base des contrôles à activer.
- Dashboard principal avec scores et alertes.
- Module Microsoft 365 initial.
- Module Active Directory initial.
- Historique minimal des scans.
- Journal d’audit des actions sensibles.
- Chiffrement des secrets.

### 11.3 Hors MVP
- Marketplace d’extensions.
- Reporting avancé multi-format.
- Moteur de workflows de remédiation.
- Automatisation poussée des actions correctives.
- Corrélation avancée multi-sources.
- Benchmark inter-clients.
- IA de priorisation avancée.

---

## 12. Roadmap produit

### Phase 1 — Fondation
- Authentification
- rôles
- organisations
- tenants
- applications Azure
- dashboard initial
- sécurité de base
- journalisation
- premiers contrôles AD et Microsoft 365

### Phase 2 — Personnalisation avancée
- widgets configurables
- vues enregistrées
- filtres avancés
- activation/désactivation fine des contrôles
- paramétrage par rôle ou profil

### Phase 3 — Industrialisation
- multi-tenant avancé
- planification des scans
- reporting exportable
- historisation poussée
- meilleure observabilité
- résilience renforcée

### Phase 4 — Extension produit
- nouveaux modules Microsoft
- nouveaux connecteurs
- recommandations enrichies
- automatisations de remédiation
- capacités de conformité avancées

---

## 13. Indicateurs de succès

### 13.1 KPIs produit
- nombre d’organisations actives ;
- nombre de tenants supervisés ;
- nombre de contrôles activés ;
- taux d’utilisation des dashboards personnalisés ;
- temps moyen de configuration initiale ;
- taux de succès des tests de connectivité ;
- fréquence de consultation des alertes critiques ;
- temps moyen entre détection et remédiation.

### 13.2 KPIs qualité
- temps de réponse des écrans clés ;
- taux d’erreur sur les intégrations ;
- nombre d’incidents de sécurité ;
- nombre d’échecs de collecte ;
- disponibilité de la plateforme.

---

## 14. Risques produit

- Complexité des permissions Microsoft nécessaires aux intégrations.
- Sensibilité élevée des secrets et comptes techniques.
- Hétérogénéité des environnements Active Directory.
- Variabilité des attentes client en matière de dashboard.
- Complexité de maintenir une UX simple avec un produit très paramétrable.
- Charge de maintenance des contrôles de sécurité dans le temps.

---

## 15. Positionnement final

Guardiboard est une plateforme SaaS de supervision de sécurité Microsoft, modulaire, paramétrable et sécurisée, conçue pour permettre aux organisations de choisir exactement ce qu’elles veulent superviser, dans le périmètre qu’elles souhaitent, avec le niveau de personnalisation dont elles ont besoin.

Le produit couvre :
- l’Active Directory on-premise ;
- Microsoft 365 ;
- ou les deux dans une logique hybride.

L’approche d’analyse s’inspire des contrôles de sécurité mis en avant par Purple Knight pour l’Active Directory [web:11][web:12] et de l’approche de Monkey365 pour l’évaluation de nombreux contrôles de sécurité Microsoft 365 [web:18][web:20].

Guardiboard est conçu pour offrir une expérience de supervision moderne, personnalisable et alignée avec des exigences de sécurité élevées, afin de remplacer les consoles imposées par une plateforme orientée besoin réel, lisibilité et action.