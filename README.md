# 🚗 AutoExpert - Site Web Agence Automobile

Site web moderne et dynamique pour agence automobile avec intégration complète **n8n** pour la gestion backend.

## 🎨 Aperçu du Projet

**AutoExpert** est une plateforme web complète pour une agence automobile offrant :
- **Design moderne** : Rouge, noir, gris, blanc avec arrière-plan de voiture de luxe
- **Responsive design** : Optimisé pour tous les écrans
- **Intégration n8n** : Toutes les actions connectées à des workflows automatisés
- **Interface intuitive** : Navigation fluide et expérience utilisateur optimale

### 🌟 Fonctionnalités Principales

1. **🏠 Page d'Accueil**
   - Présentation de l'agence et des services
   - Témoignages clients
   - Statistiques de performance
   - Call-to-action pour prises de contact

2. **📅 Réservation de RDV**
   - Formulaire dynamique avec validation
   - Calendrier interactif pour sélection de créneaux
   - Envoi automatique vers n8n
   - Confirmation en temps réel

3. **👤 Espace Client**
   - Gestion des rendez-vous à venir
   - Historique des interventions
   - Modification/Annulation de RDV (via n8n)
   - Téléchargement de devis PDF

4. **⭐ Formulaire Satisfaction**
   - Évaluation par étoiles
   - Commentaires détaillés
   - Recommandations
   - Envoi feedback vers n8n

5. **🔧 Rappel Maintenance**
   - Guide des types d'entretien
   - Formulaire de demande de rappel
   - Conseils personnalisés par véhicule

## 🚀 Installation et Configuration

### Prérequis
- Node.js 18+ et npm
- Accès à une instance n8n
- Compte GitHub (optionnel pour déploiement)

### 1. Installation Locale

```bash
# Cloner le repository
git clone https://github.com/votre-username/autoexpert-website.git
cd autoexpert-website

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

Le site sera accessible sur `http://localhost:8080`

### 2. Configuration n8n

#### Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# URLs de vos webhooks n8n
VITE_N8N_WEBHOOK_RESERVATION=https://votre-n8n.com/webhook/reservation
VITE_N8N_WEBHOOK_MODIFICATION=https://votre-n8n.com/webhook/modification
VITE_N8N_WEBHOOK_ANNULATION=https://votre-n8n.com/webhook/annulation
VITE_N8N_WEBHOOK_SATISFACTION=https://votre-n8n.com/webhook/satisfaction
VITE_N8N_WEBHOOK_MAINTENANCE=https://votre-n8n.com/webhook/maintenance
VITE_N8N_WEBHOOK_CONTACT=https://votre-n8n.com/webhook/contact
```

#### Configuration des Workflows n8n

Pour chaque fonctionnalité, créez un workflow n8n avec les déclencheurs webhook correspondants :

##### 🎯 Workflow Réservation RDV

**Webhook URL** : `/webhook/reservation`
**Méthode** : POST

**Données reçues** :
```json
{
  "nom": "string",
  "email": "string", 
  "telephone": "string",
  "vehicule": "string",
  "date": "YYYY-MM-DD",
  "heure": "HH:MM",
  "typeIntervention": "string",
  "commentaires": "string",
  "userId": "string",
  "timestamp": "ISO string",
  "webhookType": "RESERVATION",
  "source": "autoexpert-website"
}
```

**Actions recommandées** :
- Envoyer email de confirmation au client
- Notifier l'équipe technique
- Ajouter l'événement au calendrier
- Créer une fiche client si nouvelle

##### ✏️ Workflow Modification RDV

**Webhook URL** : `/webhook/modification`
**Méthode** : POST

**Données reçues** :
```json
{
  "rdvId": "string",
  "modifications": {
    "action": "demande_modification",
    "message": "string"
  },
  "userId": "string",
  "timestamp": "ISO string"
}
```

**Actions recommandées** :
- Marquer le RDV comme "modification demandée"
- Envoyer email au client pour confirmer demande
- Notifier l'équipe pour traitement

##### ❌ Workflow Annulation RDV

**Webhook URL** : `/webhook/annulation`
**Méthode** : POST

**Données reçues** :
```json
{
  "rdvId": "string",
  "raison": "string",
  "userId": "string",
  "timestamp": "ISO string"
}
```

**Actions recommandées** :
- Supprimer/annuler le RDV dans le système
- Envoyer email de confirmation d'annulation
- Libérer le créneau dans le calendrier
- Mettre à jour les statistiques

##### ⭐ Workflow Satisfaction

**Webhook URL** : `/webhook/satisfaction`
**Méthode** : POST

**Données reçues** :
```json
{
  "rdvId": "string",
  "note": "number (1-5)",
  "commentaire": "string",
  "recommande": "boolean",
  "evaluations": {
    "serviceQualite": "number (1-5)",
    "accueilEquipe": "number (1-5)", 
    "rapportQualitePrix": "number (1-5)",
    "delaiIntervention": "number (1-5)"
  },
  "userId": "string",
  "timestamp": "ISO string"
}
```

**Actions recommandées** :
- Stocker les évaluations en base de données
- Calculer moyennes et statistiques
- Envoyer notification si note faible
- Répondre automatiquement par email

##### 🔔 Workflow Rappel Maintenance

**Webhook URL** : `/webhook/maintenance`
**Méthode** : POST

**Données reçues** :
```json
{
  "marque": "string",
  "modele": "string",
  "annee": "string",
  "kilometrage": "string",
  "email": "string",
  "telephone": "string",
  "typeEntretien": "string",
  "userId": "string",
  "timestamp": "ISO string"
}
```

**Actions recommandées** :
- Programmer des rappels automatiques
- Calculer prochaines dates d'entretien
- Envoyer devis personnalisé
- Créer suivi client

##### 📞 Workflow Contact

**Webhook URL** : `/webhook/contact`
**Méthode** : POST

**Données reçues** :
```json
{
  "nom": "string",
  "email": "string",
  "telephone": "string",
  "sujet": "string", 
  "message": "string",
  "timestamp": "ISO string"
}
```

### 3. Structure du Projet

```
autoexpert-website/
├── src/
│   ├── assets/               # Images et fichiers statiques
│   │   └── luxury-car-bg.jpg # Arrière-plan de voiture de luxe
│   ├── components/           # Composants réutilisables
│   │   ├── Layout/          # Header, Footer, Layout principal
│   │   └── ui/              # Composants shadcn/ui
│   ├── pages/               # Pages de l'application
│   │   ├── Index.tsx        # Page d'accueil
│   │   ├── Rdv.tsx          # Réservation de RDV
│   │   ├── EspaceClient.tsx # Espace client
│   │   ├── Satisfaction.tsx # Formulaire satisfaction
│   │   ├── Maintenance.tsx  # Rappel maintenance
│   │   └── NotFound.tsx     # Page 404
│   ├── utils/               # Utilitaires
│   │   └── n8nApi.ts        # Fonctions d'intégration n8n
│   ├── hooks/               # Hooks React personnalisés
│   ├── lib/                 # Bibliothèques utilitaires
│   ├── index.css            # Styles CSS principaux + design system
│   └── main.tsx             # Point d'entrée de l'application
├── public/                  # Fichiers publics
├── .env.local              # Variables d'environnement (à créer)
├── package.json            # Dépendances et scripts
├── tailwind.config.ts      # Configuration Tailwind CSS
├── vite.config.ts          # Configuration Vite
└── README.md               # Ce fichier
```

## 🎨 Design System

### Couleurs Principales
- **Rouge Primaire** : `hsl(0, 84%, 55%)` - Actions et CTAs
- **Noir Profond** : `hsl(0, 0%, 5%)` - Texte principal (mode sombre)
- **Gris Élégant** : `hsl(0, 0%, 20%)` - Sections secondaires
- **Blanc Pur** : `hsl(0, 0%, 98%)` - Arrière-plans

### Composants Personnalisés
- `.btn-primary` : Boutons principaux avec effet glow
- `.card-auto` : Cartes avec effet glass morphism
- `.hero-background` : Arrière-plan avec overlay voiture
- `.glow-red` : Effets de lumière rouge dynamiques

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev          # Lance le serveur de développement

# Production  
npm run build        # Construit l'application pour la production
npm run preview      # Prévisualise la version de production

# Qualité du code
npm run lint         # Vérifie la qualité du code avec ESLint
```

## 🚀 Déploiement

### Déploiement avec Lovable
1. Connectez votre projet à GitHub via l'interface Lovable
2. Cliquez sur "Share → Publish" dans Lovable
3. Votre site sera automatiquement déployé

### Déploiement Manuel
1. Construisez le projet : `npm run build`
2. Déployez le dossier `dist/` sur votre hébergeur
3. Configurez les variables d'environnement sur votre plateforme

## 🔒 Sécurité et Bonnes Pratiques

### Variables d'Environnement
- Toutes les URLs n8n sont configurées via des variables d'environnement
- Ne jamais commiter les fichiers `.env*` 
- Utiliser des URLs HTTPS pour tous les webhooks

### Gestion des Erreurs
- Tous les appels n8n incluent une gestion d'erreur robuste
- Messages d'erreur utilisateur-friendly
- Logs détaillés pour le debugging

### Données Utilisateur
- ID utilisateur généré automatiquement et stocké localement
- Toutes les données sont transmises de manière sécurisée à n8n
- Aucune donnée sensible stockée côté client

## 🆘 Dépannage

### Problèmes Courants

#### Les webhooks n8n ne fonctionnent pas
- Vérifiez que les URLs dans `.env.local` sont correctes
- Testez vos webhooks directement avec un outil comme Postman
- Vérifiez que votre instance n8n est accessible publiquement

#### Erreurs de build
- Supprimez `node_modules/` et `package-lock.json`
- Relancez `npm install`
- Vérifiez que vous utilisez Node.js 18+

#### Images qui ne s'affichent pas
- Vérifiez que le fichier `luxury-car-bg.jpg` est présent dans `src/assets/`
- Assurez-vous que l'import de l'image est correct

### Logs et Debugging
- Ouvrez la console du navigateur pour voir les logs détaillés
- Tous les appels n8n sont loggés avec leurs données
- Utilisez l'onglet Network pour analyser les requêtes

## 📞 Support

### Pour l'aide technique :
- Consultez la documentation de n8n : https://docs.n8n.io
- Vérifiez les issues GitHub du projet
- Documentation Lovable : https://docs.lovable.dev

### Fonctionnalités à développer :
- Système d'authentification avancé
- Chat en temps réel avec l'équipe
- Géolocalisation du garage
- Intégration avec des APIs de véhicules
- Système de paiement en ligne

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Développé avec ❤️ pour les professionnels de l'automobile**

*Prêt à être connecté avec n8n pour une gestion automatisée complète !*