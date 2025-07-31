import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout/Layout';
import { 
  Calendar, 
  Clock, 
  Car, 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  User,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { modifierRendezVous, annulerRendezVous, getUserId } from '@/utils/n8nApi';

// Données mockées pour la démonstration
const mockRendezVous = [
  {
    id: 'rdv_001',
    date: '2024-02-15',
    heure: '10:00',
    vehicule: 'Renault Clio 2020',
    typeIntervention: 'Entretien périodique',
    statut: 'confirmé',
    technicien: 'Pierre Dubois',
    commentaires: 'Révision complète + changement filtres'
  },
  {
    id: 'rdv_002',
    date: '2024-01-20',
    heure: '14:30',
    vehicule: 'Renault Clio 2020',
    typeIntervention: 'Diagnostic électronique',
    statut: 'terminé',
    technicien: 'Marie Martin',
    commentaires: 'Problème démarrage résolu'
  },
];

const mockDevis = [
  {
    id: 'devis_001',
    rdvId: 'rdv_002',
    date: '2024-01-20',
    montant: 185.50,
    statut: 'payé',
    intervention: 'Diagnostic électronique',
    details: ['Diagnostic complet', 'Remplacement capteur', 'Main d\'oeuvre']
  },
  {
    id: 'devis_002',
    rdvId: 'rdv_001',
    date: '2024-02-15',
    montant: 320.00,
    statut: 'en_attente',
    intervention: 'Entretien périodique',
    details: ['Révision complète', 'Changement filtres', 'Vidange moteur']
  }
];

const EspaceClient = () => {
  const [rdvAVenir, setRdvAVenir] = useState<any[]>([]);
  const [rdvPasses, setRdvPasses] = useState<any[]>([]);
  const [devis, setDevis] = useState(mockDevis);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Séparer les RDV à venir et passés
    const maintenant = new Date();
    const aVenir = mockRendezVous.filter(rdv => 
      new Date(rdv.date) >= maintenant && rdv.statut !== 'terminé'
    );
    const passes = mockRendezVous.filter(rdv => 
      new Date(rdv.date) < maintenant || rdv.statut === 'terminé'
    );
    
    setRdvAVenir(aVenir);
    setRdvPasses(passes);
  }, []);

  const handleModifierRdv = async (rdvId: string) => {
    setIsLoading(true);
    try {
      const userId = getUserId();
      const modifications = {
        action: 'demande_modification',
        message: 'Client souhaite modifier son RDV'
      };
      
      const result = await modifierRendezVous(rdvId, modifications, userId);
      
      if (result.success) {
        toast({
          title: '✅ Demande envoyée',
          description: 'Votre demande de modification a été transmise. Nous vous recontacterons rapidement.',
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: '❌ Erreur',
        description: 'Impossible d\'envoyer votre demande. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnnulerRdv = async (rdvId: string) => {
    setIsLoading(true);
    try {
      const userId = getUserId();
      const result = await annulerRendezVous(rdvId, 'Annulation par le client', userId);
      
      if (result.success) {
        // Mettre à jour la liste localement
        setRdvAVenir(prev => prev.filter(rdv => rdv.id !== rdvId));
        
        toast({
          title: '✅ Rendez-vous annulé',
          description: 'Votre rendez-vous a été annulé avec succès.',
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: '❌ Erreur',
        description: 'Impossible d\'annuler le rendez-vous. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDevis = (devisId: string) => {
    // Simulation du téléchargement
    toast({
      title: '📄 Téléchargement',
      description: 'Le devis PDF est en cours de téléchargement...',
    });
    
    // En réalité, ici vous déclencheriez un appel à votre API n8n
    // pour générer et télécharger le PDF
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'confirmé':
        return <Badge className="bg-blue-100 text-blue-800">Confirmé</Badge>;
      case 'terminé':
        return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'en_cours':
        return <Badge className="bg-yellow-100 text-yellow-800">En cours</Badge>;
      case 'annulé':
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Mon Espace Client</h1>
              <p className="text-xl text-muted-foreground">
                Gérez vos rendez-vous et suivez l'historique de vos interventions
              </p>
            </div>

            <Tabs defaultValue="rdv" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="rdv" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Rendez-vous</span>
                </TabsTrigger>
                <TabsTrigger value="historique" className="flex items-center space-x-2">
                  <History className="h-4 w-4" />
                  <span>Historique</span>
                </TabsTrigger>
                <TabsTrigger value="devis" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Devis</span>
                </TabsTrigger>
              </TabsList>

              {/* Rendez-vous à venir */}
              <TabsContent value="rdv" className="space-y-6">
                <Card className="card-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span>Rendez-vous à venir</span>
                    </CardTitle>
                    <CardDescription>
                      Consultez et gérez vos prochains rendez-vous
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {rdvAVenir.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>Aucun rendez-vous à venir</p>
                        <Button asChild className="mt-4 btn-primary">
                          <a href="/rdv">Prendre rendez-vous</a>
                        </Button>
                      </div>
                    ) : (
                      rdvAVenir.map((rdv) => (
                        <Card key={rdv.id} className="border-l-4 border-l-primary">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2 text-lg font-semibold">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span>{format(new Date(rdv.date), 'EEEE d MMMM yyyy', { locale: fr })}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{rdv.heure}</span>
                                  </div>
                                  {getStatutBadge(rdv.statut)}
                                </div>
                                <div className="flex items-center space-x-2 text-muted-foreground">
                                  <Car className="h-4 w-4" />
                                  <span>{rdv.vehicule}</span>
                                </div>
                                <p className="text-sm">
                                  <strong>Intervention:</strong> {rdv.typeIntervention}
                                </p>
                                <p className="text-sm">
                                  <strong>Technicien:</strong> {rdv.technicien}
                                </p>
                                {rdv.commentaires && (
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Commentaires:</strong> {rdv.commentaires}
                                  </p>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-300">
                                      <Edit className="h-4 w-4 mr-1" />
                                      Modifier
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <Edit className="h-5 w-5 text-blue-600" />
                                        Modifier le rendez-vous
                                      </DialogTitle>
                                      <DialogDescription>
                                        Choisissez le type de modification que vous souhaitez effectuer. Notre équipe vous recontactera dans les plus brefs délais.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-3 mt-4">
                                      <Button 
                                        onClick={() => handleModifierRdv(rdv.id)}
                                        disabled={isLoading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                                      >
                                        <Calendar className="h-4 w-4" />
                                        Changer la date/heure
                                      </Button>
                                      <Button 
                                        onClick={() => handleModifierRdv(rdv.id)}
                                        disabled={isLoading}
                                        variant="outline"
                                        className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-2"
                                      >
                                        <Car className="h-4 w-4" />
                                        Modifier l'intervention
                                      </Button>
                                      <p className="text-xs text-muted-foreground text-center mt-3">
                                        Un conseiller vous contactera pour finaliser la modification
                                      </p>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="bg-red-50 text-red-700 hover:bg-red-100 border-red-300">
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Annuler
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                        Annuler le rendez-vous
                                      </DialogTitle>
                                      <DialogDescription>
                                        Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est irréversible et vous devrez reprendre un nouveau rendez-vous si nécessaire.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="bg-red-50 p-4 rounded-lg mt-4">
                                      <div className="flex items-start gap-3">
                                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm text-red-800">
                                          <p className="font-medium">Rendez-vous à annuler :</p>
                                          <p>{format(new Date(rdv.date), 'EEEE d MMMM yyyy', { locale: fr })} à {rdv.heure}</p>
                                          <p>{rdv.typeIntervention}</p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex space-x-3 mt-6">
                                      <Button variant="outline" className="flex-1 border-gray-300">
                                        Non, garder
                                      </Button>
                                      <Button 
                                        onClick={() => handleAnnulerRdv(rdv.id)}
                                        disabled={isLoading}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                      >
                                        {isLoading ? "Annulation..." : "Oui, annuler"}
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Historique */}
              <TabsContent value="historique" className="space-y-6">
                <Card className="card-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <History className="h-5 w-5 text-primary" />
                      <span>Historique des interventions</span>
                    </CardTitle>
                    <CardDescription>
                      Consultez l'historique de vos interventions passées
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {rdvPasses.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>Aucun historique d'intervention</p>
                      </div>
                    ) : (
                      rdvPasses.map((rdv) => (
                        <Card key={rdv.id} className="border-l-4 border-l-green-500">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2 text-lg font-semibold">
                                    <Calendar className="h-4 w-4 text-green-600" />
                                    <span>{format(new Date(rdv.date), 'EEEE d MMMM yyyy', { locale: fr })}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{rdv.heure}</span>
                                  </div>
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="flex items-center space-x-2 text-muted-foreground">
                                  <Car className="h-4 w-4" />
                                  <span>{rdv.vehicule}</span>
                                </div>
                                <p className="text-sm">
                                  <strong>Intervention:</strong> {rdv.typeIntervention}
                                </p>
                                <p className="text-sm">
                                  <strong>Technicien:</strong> {rdv.technicien}
                                </p>
                                {rdv.commentaires && (
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Commentaires:</strong> {rdv.commentaires}
                                  </p>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-300">
                                      <Edit className="h-4 w-4 mr-1" />
                                      Modifier
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <Edit className="h-5 w-5 text-blue-600" />
                                        Demander une modification
                                      </DialogTitle>
                                      <DialogDescription>
                                        Cette intervention est terminée. Vous pouvez demander une modification ou une intervention complémentaire.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-3 mt-4">
                                      <Button 
                                        onClick={() => handleModifierRdv(rdv.id)}
                                        disabled={isLoading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                                      >
                                        <Calendar className="h-4 w-4" />
                                        Nouvelle intervention
                                      </Button>
                                      <Button 
                                        onClick={() => handleModifierRdv(rdv.id)}
                                        disabled={isLoading}
                                        variant="outline"
                                        className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-2"
                                      >
                                        <FileText className="h-4 w-4" />
                                        Signaler un problème
                                      </Button>
                                      <p className="text-xs text-muted-foreground text-center mt-3">
                                        Un conseiller vous contactera pour vous assister
                                      </p>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="bg-green-50 text-green-700 hover:bg-green-100 border-green-300"
                                  asChild
                                >
                                  <a href="/satisfaction" className="flex items-center space-x-2">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Évaluer</span>
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Devis */}
              <TabsContent value="devis" className="space-y-6">
                <Card className="card-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span>Mes devis</span>
                    </CardTitle>
                    <CardDescription>
                      Consultez et téléchargez vos devis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {devis.map((devis) => (
                      <Card key={devis.id} className="border">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-4">
                                <span className="text-lg font-semibold">
                                  Devis #{devis.id}
                                </span>
                                <Badge 
                                  className={devis.statut === 'payé' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                                >
                                  {devis.statut === 'payé' ? 'Payé' : 'En attente'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(devis.date), 'EEEE d MMMM yyyy', { locale: fr })}
                              </p>
                              <p className="text-sm">
                                <strong>Intervention:</strong> {devis.intervention}
                              </p>
                              <div className="text-2xl font-bold text-primary">
                                {devis.montant.toFixed(2)} €
                              </div>
                              <ul className="text-sm text-muted-foreground">
                                {devis.details.map((detail, idx) => (
                                  <li key={idx}>• {detail}</li>
                                ))}
                              </ul>
                            </div>
                            <Button 
                              onClick={() => downloadDevis(devis.id)}
                              className="flex items-center space-x-2 btn-primary"
                            >
                              <Download className="h-4 w-4" />
                              <span>Télécharger PDF</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EspaceClient;