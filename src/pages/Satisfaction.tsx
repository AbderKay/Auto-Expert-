import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Layout from '@/components/Layout/Layout';
import { Star, Send, CheckCircle, Loader2, ThumbsUp, MessageSquare } from 'lucide-react';
import { envoyerSatisfaction, getUserId } from '@/utils/n8nApi';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  rdvId: z.string().min(1, 'Veuillez sélectionner un rendez-vous'),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  note: z.number().min(1).max(5, 'Veuillez donner une note entre 1 et 5'),
  commentaire: z.string().min(10, 'Le commentaire doit contenir au moins 10 caractères'),
  recommande: z.enum(['oui', 'non'], {
    required_error: 'Veuillez indiquer si vous recommandez nos services',
  }),
  serviceQualite: z.number().min(1).max(5),
  accueilEquipe: z.number().min(1).max(5),
  rapportQualitePrix: z.number().min(1).max(5),
  delaiIntervention: z.number().min(1).max(5),
});

type FormData = z.infer<typeof formSchema>;


const Satisfaction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [rdvTermines, setRdvTermines] = useState<any[]>([]);
  const [currentNote, setCurrentNote] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rdvId: '',
      nom: '',
      note: 0,
      commentaire: '',
      recommande: undefined,
      serviceQualite: 0,
      accueilEquipe: 0,
      rapportQualitePrix: 0,
      delaiIntervention: 0,
    },
  });

  useEffect(() => {
    const chargerRdvConfirmes = async () => {
      try {
        const userId = getUserId();
        
        // Récupérer les rendez-vous confirmés uniquement
        const { data: rendezVousData, error } = await supabase
          .from('rendez_vous')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'confirmed')
          .order('date_rdv', { ascending: false });

        if (error) {
          console.error('Erreur lors du chargement des rendez-vous confirmés:', error);
          return;
        }

        // Récupérer tous les feedbacks existants pour identifier les RDV déjà évalués
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedback_clients')
          .select('service, nom');

        if (feedbackError) {
          console.error('Erreur lors du chargement des feedbacks:', feedbackError);
        }

        // Créer un ensemble des IDs de rendez-vous déjà évalués
        const rdvEvaluesIds = new Set();
        
        if (feedbackData) {
          feedbackData.forEach(feedback => {
            // Méthode 1: Extraire l'ID du service si c'est au format "RDV-{id}"
            const matchService = feedback.service?.match(/RDV-(\d+)/);
            if (matchService) {
              rdvEvaluesIds.add(matchService[1]);
            }
            
            // Méthode 2: Vérifier si le nom correspond à un ID de RDV
            if (feedback.nom && !isNaN(parseInt(feedback.nom))) {
              rdvEvaluesIds.add(feedback.nom);
            }
          });
        }

        console.log('RDV déjà évalués:', Array.from(rdvEvaluesIds));

        // Filtrer les rendez-vous non évalués
        const rdvNonEvalues = (rendezVousData || []).filter(rdv => {
          const rdvIdString = rdv.id.toString();
          const isEvaluated = rdvEvaluesIds.has(rdvIdString);
          console.log(`RDV ${rdvIdString}: ${isEvaluated ? 'déjà évalué' : 'disponible pour évaluation'}`);
          return !isEvaluated;
        });

        const rdvFormates = rdvNonEvalues.map(rdv => ({
          id: rdv.id.toString(),
          date: rdv.date_rdv,
          heure: rdv.heure_rdv,
          service: rdv.service || 'Service non spécifié',
          vehicule: rdv.vehicule || 'Véhicule non spécifié'
        }));

        console.log(`${rdvFormates.length} rendez-vous disponibles pour évaluation`);
        setRdvTermines(rdvFormates);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      }
    };

    chargerRdvConfirmes();
  }, []);

  const onSubmit = async (data: FormData) => {
    // Protection anti-double soumission
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const userId = getUserId();
      
      // Récupérer les informations du rendez-vous sélectionné
      const rdvSelectionne = rdvTermines.find(rdv => rdv.id === data.rdvId);
      
      const feedbackData = {
        rdvId: data.rdvId,
        note: data.note,
        commentaire: data.commentaire,
        recommande: data.recommande === 'oui',
        nom: data.nom,
        evaluations: {
          serviceQualite: data.serviceQualite,
          accueilEquipe: data.accueilEquipe,
          rapportQualitePrix: data.rapportQualitePrix,
          delaiIntervention: data.delaiIntervention,
        }
      };

      console.log('Envoi du feedback:', feedbackData);

      // Envoyer uniquement vers n8n - suppression du double insert Supabase
      const result = await envoyerSatisfaction(feedbackData, userId);
      console.log('Réponse du webhook:', result);

      if (result.success) {
        setIsSubmitted(true);
        toast({
          title: '✅ Évaluation envoyée avec succès !',
          description: result.message || result.data?.message || 'Votre avis a été transmis et enregistré. Merci pour votre retour !',
        });
        form.reset();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du feedback:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible d\'envoyer votre évaluation. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    name 
  }: { 
    value: number; 
    onChange: (value: number) => void; 
    name: string;
  }) => {
    const [localHovered, setLocalHovered] = useState(0);

    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 cursor-pointer transition-colors ${
              star <= (localHovered || value)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
            onMouseEnter={() => setLocalHovered(star)}
            onMouseLeave={() => setLocalHovered(0)}
            onClick={() => onChange(star)}
          />
        ))}
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background py-20">
          <Card className="max-w-lg mx-auto card-auto text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">Merci pour votre avis !</CardTitle>
              <CardDescription>
                Votre évaluation a été enregistrée avec succès
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Votre retour nous aide à améliorer continuellement la qualité de nos services.
                Nous apprécions le temps que vous avez pris pour nous évaluer.
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => setIsSubmitted(false)} 
                  variant="outline" 
                  className="flex-1"
                >
                  Nouvel Avis
                </Button>
                <Button asChild className="flex-1 btn-primary">
                  <a href="/espace-client">Mon Espace Client</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Évaluation de nos Services</h1>
              <p className="text-xl text-muted-foreground">
                Votre avis nous aide à améliorer notre service client
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Informations */}
              <div className="space-y-6">
                <Card className="card-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ThumbsUp className="h-5 w-5 text-primary" />
                      <span>Pourquoi votre avis compte</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>• Amélioration continue de nos services</p>
                    <p>• Formation de notre équipe</p>
                    <p>• Développement de nouveaux services</p>
                    <p>• Garantie de satisfaction client</p>
                  </CardContent>
                </Card>

                <Card className="card-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <span>Vos commentaires</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p>
                      N'hésitez pas à être précis dans vos commentaires. 
                      Cela nous aide à identifier les points d'amélioration 
                      et à maintenir un service de qualité.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Formulaire */}
              <div className="lg:col-span-2">
                <Card className="card-auto">
                  <CardHeader>
                    <CardTitle>Formulaire d'Évaluation</CardTitle>
                    <CardDescription>
                      Évaluez votre expérience récente avec nos services
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Sélection du RDV */}
                        <FormField
                          control={form.control}
                          name="rdvId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rendez-vous à évaluer *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={
                                      rdvTermines.length > 0 
                                        ? "Sélectionnez le rendez-vous" 
                                        : "Aucun rendez-vous confirmé disponible"
                                    } />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {rdvTermines.map((rdv) => (
                                    <SelectItem key={rdv.id} value={rdv.id}>
                                      {rdv.date} {rdv.heure ? `à ${rdv.heure}` : ''} - {rdv.service} ({rdv.vehicule})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Nom du client */}
                        <FormField
                          control={form.control}
                          name="nom"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Votre nom *</FormLabel>
                              <FormControl>
                                <Input placeholder="Votre nom et prénom" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Note globale */}
                        <FormField
                          control={form.control}
                          name="note"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Note globale *</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <StarRating
                                    value={field.value}
                                    onChange={field.onChange}
                                    name="note"
                                  />
                                  <p className="text-sm text-muted-foreground">
                                    Cliquez sur les étoiles pour donner votre note
                                  </p>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Évaluations détaillées */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Évaluations détaillées</h3>
                          
                          <FormField
                            control={form.control}
                            name="serviceQualite"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Qualité du service</FormLabel>
                                <FormControl>
                                  <StarRating
                                    value={field.value}
                                    onChange={field.onChange}
                                    name="serviceQualite"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="accueilEquipe"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Accueil et équipe</FormLabel>
                                <FormControl>
                                  <StarRating
                                    value={field.value}
                                    onChange={field.onChange}
                                    name="accueilEquipe"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="rapportQualitePrix"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rapport qualité/prix</FormLabel>
                                <FormControl>
                                  <StarRating
                                    value={field.value}
                                    onChange={field.onChange}
                                    name="rapportQualitePrix"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="delaiIntervention"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Délai d'intervention</FormLabel>
                                <FormControl>
                                  <StarRating
                                    value={field.value}
                                    onChange={field.onChange}
                                    name="delaiIntervention"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Recommandation */}
                        <FormField
                          control={form.control}
                          name="recommande"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recommanderiez-vous nos services ? *</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex space-x-6"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="oui" id="oui" />
                                    <Label htmlFor="oui">Oui, certainement</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="non" id="non" />
                                    <Label htmlFor="non">Non, pas vraiment</Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Commentaire */}
                        <FormField
                          control={form.control}
                          name="commentaire"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Commentaires *</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Partagez votre expérience, vos suggestions d'amélioration ou vos compliments..."
                                  className="resize-none h-32"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full btn-primary" 
                          size="lg"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Envoyer mon Évaluation
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Satisfaction;