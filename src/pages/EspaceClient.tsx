import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout/Layout';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Car, 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  User,
  History,
  LogOut
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { modifierRendezVous, annulerRendezVous, getUserId } from '@/utils/n8nApi';
import { supabase } from '@/integrations/supabase/client';
import DevisForm from '@/components/DevisForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';

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

// Schema de validation pour la modification
const modificationSchema = z.object({
  date: z.date({
    required_error: "La date est requise",
  }),
  heure: z.string().min(1, "L'heure est requise"),
  typeIntervention: z.array(z.string()).min(1, "Au moins un type d'intervention est requis"),
});

type ModificationFormData = z.infer<typeof modificationSchema>;

const EspaceClient = () => {
  const [rdvAVenir, setRdvAVenir] = useState<any[]>([]);
  const [rdvPasses, setRdvPasses] = useState<any[]>([]);
  const [devis, setDevis] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isModificationModalOpen, setIsModificationModalOpen] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState<any>(null);
  const navigate = useNavigate();

  // Types d'intervention disponibles
  const typesIntervention = [
    "Entretien périodique",
    "Diagnostic électronique", 
    "Réparation moteur",
    "Révision complète",
    "Changement d'huile",
    "Pneus",
    "Freinage",
    "Climatisation",
    "Carrosserie",
    "Autre"
  ];

  const chargerRendezVous = async () => {
    try {
      const userId = getUserId();
      
      // Charger les rendez-vous depuis Supabase
      const { data: rendezVousData, error: rdvError } = await supabase
        .from('rendez_vous')
        .select('*')
        .eq('user_id', userId)
        .order('date_rdv', { ascending: true });

      if (rdvError) {
        console.error('Erreur lors du chargement des rendez-vous:', rdvError);
        return;
      }

      // Charger les devis depuis Supabase
      const { data: devisData, error: devisError } = await supabase
        .from('devis')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (devisError) {
        console.error('Erreur lors du chargement des devis:', devisError);
      } else {
        setDevis(devisData || []);
      }

      if (rendezVousData) {
        // Transformer les données pour correspondre au format attendu
        const rdvFormates = rendezVousData.map(rdv => ({
          id: rdv.id.toString(),
          date: rdv.date_rdv,
          heure: rdv.heure_rdv,
          vehicule: rdv.vehicule || 'Véhicule non spécifié',
          typeIntervention: rdv.service || 'Service non spécifié',
          statut: rdv.status || 'pending',
          technicien: 'À définir',
          commentaires: '',
          nom_client: rdv.nom_client,
          email_client: rdv.email_client,
          telephone_client: rdv.telephone_client
        }));

        // Séparer les RDV selon leur statut
        // Onglet "Rendez-vous" : statut différent de "confirmé"
        const aVenir = rdvFormates.filter(rdv => rdv.statut !== 'confirmé');
        
        // Onglet "Historique" : statut = "confirmé" 
        const passes = rdvFormates.filter(rdv => rdv.statut === 'confirmé');
        
        setRdvAVenir(aVenir);
        setRdvPasses(passes);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  useEffect(() => {
    // Configurer l'écoute des changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        navigate('/auth');
        return;
      } else {
        setSession(session);
        setUser(session.user);
        
        // Charger les données seulement si on a une session
        await chargerRendezVous();
        setIsLoading(false);
      }
    });

    // Vérifier la session actuelle
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setSession(session);
      setUser(session.user);
      await chargerRendezVous();
      setIsLoading(false);
    };

    initAuth();

    // Nettoyer la subscription à la destruction du composant
    return () => subscription.unsubscribe();

    // Configurer l'écoute en temps réel pour les nouveaux rendez-vous
    const userId = getUserId();
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rendez_vous',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Nouveau rendez-vous détecté:', payload);
          // Recharger les données quand un nouveau RDV est ajouté
          chargerRendezVous();
          
          // Afficher une notification
          toast({
            title: '✅ Nouveau rendez-vous',
            description: 'Votre rendez-vous a été confirmé et ajouté à votre planning.',
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rendez_vous',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Rendez-vous modifié:', payload);
          chargerRendezVous();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'devis',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Nouveau devis détecté:', payload);
          chargerRendezVous();
          
          toast({
            title: '📄 Nouveau devis disponible',
            description: 'Un nouveau devis a été généré pour votre intervention.',
          });
        }
      )
      .subscribe();

    // Nettoyer l'abonnement au démontage du composant
    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const handleModifierRdv = (rdv: any) => {
    setSelectedRdv(rdv);
    setIsModificationModalOpen(true);
  };

  const handleSaveModification = async (data: ModificationFormData) => {
    if (!selectedRdv) return;

    setIsLoading(true);
    try {
      // Vérifier si le créneau est disponible
      const { data: conflictRdv, error: checkError } = await supabase
        .from('rendez_vous')
        .select('*')
        .eq('date_rdv', format(data.date, 'yyyy-MM-dd'))
        .eq('heure_rdv', data.heure)
        .neq('id', parseInt(selectedRdv.id))
        .neq('status', 'annulé');

      if (checkError) {
        throw new Error('Erreur lors de la vérification de disponibilité');
      }

      if (conflictRdv && conflictRdv.length > 0) {
        toast({
          title: '❌ Créneau non disponible',
          description: 'Ce créneau est déjà occupé. Veuillez choisir une autre date/heure.',
          variant: 'destructive',
        });
        return;
      }

      // Mettre à jour le rendez-vous
      const { error: updateError } = await supabase
        .from('rendez_vous')
        .update({
          date_rdv: format(data.date, 'yyyy-MM-dd'),
          heure_rdv: data.heure,
          service: data.typeIntervention.join(', '),
          status: 'pending' // Remet en pending après modification
        })
        .eq('id', parseInt(selectedRdv.id));

      if (updateError) {
        throw updateError;
      }

      // Recharger les données
      await chargerRendezVous();
      setIsModificationModalOpen(false);
      setSelectedRdv(null);

      toast({
        title: '✅ Rendez-vous modifié',
        description: 'Votre rendez-vous a été modifié avec succès et est en attente de confirmation.',
      });
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible de modifier le rendez-vous. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ModificationModal = () => {
    const form = useForm<ModificationFormData>({
      resolver: zodResolver(modificationSchema),
      defaultValues: {
        date: selectedRdv ? new Date(selectedRdv.date) : new Date(),
        heure: selectedRdv?.heure || '',
        typeIntervention: selectedRdv?.typeIntervention ? [selectedRdv.typeIntervention] : [],
      },
    });

    const handleSubmit = (data: ModificationFormData) => {
      handleSaveModification(data);
    };

    // Heures disponibles
    const heuresDisponibles = [
      "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
      "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
      "17:00", "17:30"
    ];

    return (
      <Dialog open={isModificationModalOpen} onOpenChange={setIsModificationModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Modifier le rendez-vous
            </DialogTitle>
            <DialogDescription>
              Modifiez la date, l'heure et le type d'intervention de votre rendez-vous.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date du rendez-vous</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Heure */}
              <FormField
                control={form.control}
                name="heure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure du rendez-vous</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une heure" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {heuresDisponibles.map((heure) => (
                          <SelectItem key={heure} value={heure}>
                            {heure}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Types d'intervention */}
              <FormField
                control={form.control}
                name="typeIntervention"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Types d'intervention</FormLabel>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {typesIntervention.map((type) => (
                        <label key={type} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={field.value.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...field.value, type]);
                              } else {
                                field.onChange(field.value.filter(t => t !== type));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModificationModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
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

  const handleConfirmerRdv = async (rdvId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rendez_vous')
        .update({ status: 'confirmé' })
        .eq('id', parseInt(rdvId));

      if (error) throw error;

      // Recharger les données pour mettre à jour l'affichage
      await chargerRendezVous();
      
      toast({
        title: '✅ Rendez-vous confirmé',
        description: 'Le rendez-vous a été confirmé et déplacé dans l\'historique.',
      });
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible de confirmer le rendez-vous. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDevis = async (devisId: string) => {
    try {
      // Récupérer les données du devis
      const { data: devisData, error: devisError } = await supabase
        .from('devis')
        .select('*')
        .eq('id', parseInt(devisId))
        .single();

      if (devisError || !devisData) {
        throw new Error('Devis non trouvé');
      }

      // Préparer les données pour le webhook n8n
      const payload = {
        nom_client: devisData.nom_client || 'Client',
        email_client: devisData.email_client || '',
        date_rdv: new Date().toISOString().split('T')[0], // Date par défaut
        heure_rdv: '09:00', // Heure par défaut
        service: devisData.service || 'Service non spécifié',
        vehicule: 'Véhicule non spécifié', // Données par défaut
        montant: parseFloat(String(devisData.total_ttc || 0)),
        rdv_id: devisId,
      };

      const response = await fetch('https://mon-serveur.com/webhook/generer-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          timestamp: new Date().toISOString(),
          source: 'autoexpert-website'
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Télécharger automatiquement le PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devis_${devisId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: '✅ Téléchargement réussi',
        description: 'Le devis PDF a été téléchargé avec succès.',
      });
    } catch (error) {
      console.error('Erreur téléchargement devis:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible de télécharger le devis. Veuillez réessayer.',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: '✅ Déconnexion réussie',
        description: 'Vous avez été déconnecté avec succès.',
      });
    } catch (error) {
      toast({
        title: '❌ Erreur',
        description: 'Erreur lors de la déconnexion.',
        variant: 'destructive',
      });
    }
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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement de votre espace client...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Car className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Mon Espace Client</h1>
                  <p className="text-muted-foreground">Bienvenue, {user?.email}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>

            {/* Modal de modification */}
            <ModificationModal />

            <Tabs defaultValue="rdv" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="rdv" className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4" />
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
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      <span>Rendez-vous à venir</span>
                    </CardTitle>
                    <CardDescription>
                      Consultez et gérez vos prochains rendez-vous
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {rdvAVenir.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
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
                                    <CalendarIcon className="h-4 w-4 text-primary" />
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
                                {rdv.commentaires && (
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Commentaires:</strong> {rdv.commentaires}
                                  </p>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  onClick={() => handleConfirmerRdv(rdv.id)}
                                  disabled={isLoading}
                                  variant="outline" 
                                  size="sm" 
                                  className="bg-green-50 text-green-700 hover:bg-green-100 border-green-300"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Confirmer
                                </Button>
                                
                                <Button 
                                  onClick={() => handleModifierRdv(rdv)}
                                  variant="outline" 
                                  size="sm" 
                                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-300"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Modifier
                                </Button>
                                
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
                                    <CalendarIcon className="h-4 w-4 text-green-600" />
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
                                {rdv.commentaires && (
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Commentaires:</strong> {rdv.commentaires}
                                  </p>
                                )}
                              </div>
                               <div className="flex space-x-2">
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
                {/* Formulaire de demande de devis */}
                <DevisForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EspaceClient;