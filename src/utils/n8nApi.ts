// Configuration et utilitaires pour l'intégration n8n
// Configurez vos webhooks n8n dans le fichier .env.local

// URLs des webhooks n8n - À configurer dans votre environnement
const N8N_WEBHOOKS = {
  RESERVATION: 'http://localhost:5678/webhook-test/reservation',
  MODIFICATION: import.meta.env.VITE_N8N_WEBHOOK_MODIFICATION || 'https://your-n8n-instance.com/webhook/modification',
  ANNULATION: 'http://localhost:5678/webhook-test/cancel-reservation',
  SATISFACTION: import.meta.env.VITE_N8N_WEBHOOK_SATISFACTION || 'https://your-n8n-instance.com/webhook/satisfaction',
  RAPPEL_MAINTENANCE: import.meta.env.VITE_N8N_WEBHOOK_MAINTENANCE || 'https://your-n8n-instance.com/webhook/maintenance',
  CONTACT: import.meta.env.VITE_N8N_WEBHOOK_CONTACT || 'https://your-n8n-instance.com/webhook/contact',
  DEVIS: 'http://localhost:5678/webhook-test/devis',
  DEVIS_PDF: import.meta.env.VITE_N8N_WEBHOOK_DEVIS_PDF || 'https://your-n8n-instance.com/webhook/devis-pdf',
};

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Fonction générique pour envoyer des données à n8n
export const sendToN8n = async (
  webhookType: keyof typeof N8N_WEBHOOKS,
  data: any,
  userId?: string
): Promise<ApiResponse> => {
  try {
    const webhookUrl = N8N_WEBHOOKS[webhookType];
    
    // Ajouter l'ID utilisateur dans les données
    const payload = {
      ...data,
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString(),
      webhookType,
      source: 'autoexpert-website'
    };

    console.log(`Envoi vers n8n (${webhookType}):`, payload);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }

    let result;
    const contentType = response.headers.get('content-type');
    
    try {
      // Essayer de parser en JSON si possible
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        // Sinon, lire comme texte
        result = await response.text();
      }
    } catch (parseError) {
      console.warn('Impossible de parser la réponse, utilisation du status HTTP:', parseError);
      result = { status: 'success', message: 'Webhook exécuté avec succès' };
    }
    
    console.log(`Réponse n8n (${webhookType}):`, result);
    
    return {
      success: true,
      message: result?.message || 'Données envoyées avec succès',
      data: result
    };
  } catch (error) {
    console.error(`Erreur envoi n8n (${webhookType}):`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'envoi'
    };
  }
};

// Fonctions spécialisées pour chaque type d'action

export const envoyerReservation = async (formData: {
  nom: string;
  email: string;
  telephone: string;
  vehicule: string;
  date: string;
  heure: string;
  typeIntervention: string;
  commentaires?: string;
}) => {
  return sendToN8n('RESERVATION', formData);
};

export const modifierRendezVous = async (rdvId: string, modifications: any, userId?: string) => {
  return sendToN8n('MODIFICATION', { rdvId, modifications }, userId);
};

export const annulerRendezVous = async (rdvId: string, raison?: string, userId?: string): Promise<ApiResponse> => {
  try {
    const payload = {
      rdvId,
      raison,
      userId: userId || getUserId(),
      timestamp: new Date().toISOString()
    };

    const response = await fetch('http://localhost:5678/webhook-test/cancel-reservation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, message: 'Rendez-vous annulé avec succès', data: result };
  } catch (error) {
    console.error('Erreur lors de l\'annulation du rendez-vous:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
};

export const envoyerSatisfaction = async (feedbackData: {
  rdvId: string;
  note: number;
  commentaire: string;
  recommande: boolean;
}, userId?: string) => {
  return sendToN8n('SATISFACTION', feedbackData, userId);
};

export const demanderRappelMaintenance = async (vehiculeInfo: {
  marque: string;
  modele: string;
  annee: string;
  kilometrage: string;
  email: string;
  telephone: string;
}, userId?: string) => {
  return sendToN8n('RAPPEL_MAINTENANCE', vehiculeInfo, userId);
};

export const envoyerContact = async (contactData: {
  nom: string;
  email: string;
  telephone?: string;
  sujet: string;
  message: string;
}) => {
  return sendToN8n('CONTACT', contactData);
};

export const envoyerDevis = async (devisData: {
  nom: string;
  email: string;
  telephone: string;
  vehicule: string;
  typeService: string;
  description: string;
}) => {
  return sendToN8n('DEVIS', devisData);
};

// Fonction pour générer et télécharger un devis PDF via n8n
export const genererDevisPDF = async (devisData: {
  nom_client: string;
  email_client: string;
  date_rdv: string;
  heure_rdv: string;
  service: string;
  vehicule: string;
  montant: number;
  rdv_id: string;
}): Promise<Blob | null> => {
  try {
    const webhookUrl = 'https://mon-serveur.com/webhook/generer-pdf';
    
    const payload = {
      ...devisData,
      timestamp: new Date().toISOString(),
      source: 'autoexpert-website'
    };

    console.log('Génération PDF via n8n:', payload);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    // Vérifier que la réponse est bien un PDF
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/pdf')) {
      return await response.blob();
    } else {
      throw new Error('La réponse n\'est pas un fichier PDF');
    }
  } catch (error) {
    console.error('Erreur génération PDF n8n:', error);
    return null;
  }
};

// Utilitaire pour générer un ID utilisateur temporaire
export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Utilitaire pour stocker l'ID utilisateur dans localStorage
export const getUserId = (): string => {
  let userId = localStorage.getItem('autoexpert_user_id');
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem('autoexpert_user_id', userId);
  }
  return userId;
};

export default N8N_WEBHOOKS;