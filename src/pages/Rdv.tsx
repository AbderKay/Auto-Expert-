import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Layout from '@/components/Layout/Layout';
import { Calendar as CalendarIcon, Clock, User, Car, Wrench, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { envoyerReservation, getUserId } from '@/utils/n8nApi';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(10, 'Numéro de téléphone invalide'),
  vehicule: z.string().min(1, 'Veuillez indiquer votre véhicule'),
  date: z.date({
    required_error: 'Veuillez sélectionner une date',
  }),
  heure: z.string().min(1, 'Veuillez sélectionner une heure'),
  typeIntervention: z.array(z.string()).min(1, 'Veuillez sélectionner au moins un type d\'intervention'),
  commentaires: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const Rdv = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: '',
      email: '',
      telephone: '',
      vehicule: '',
      heure: '',
      typeIntervention: [],
      commentaires: '',
    },
  });

  const typesIntervention = [
    'Entretien périodique',
    'Réparation carrosserie',
    'Diagnostic électronique',
    'Contrôle technique',
    'Changement de pneus',
    'Réparation moteur',
    'Révision complète',
    'Autre'
  ];

  const creneauxDisponibles = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      const userId = getUserId();
      
      const reservationData = {
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        vehicule: data.vehicule,
        date: format(data.date, 'yyyy-MM-dd'),
        heure: data.heure,
        typeIntervention: data.typeIntervention.join(', '),
        commentaires: data.commentaires || '',
      };

      console.log('Envoi de la réservation:', reservationData);

      // Envoyer à n8n - le workflow gère entièrement la réponse
      await envoyerReservation(reservationData, userId);

      // n8n gère la réponse - pas de traitement automatique
      console.log('Réservation envoyée à n8n pour traitement');
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible d\'enregistrer votre réservation. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background py-20">
          <Card className="max-w-lg mx-auto card-auto text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CalendarIcon className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-primary">Réservation Confirmée !</CardTitle>
              <CardDescription>
                Votre rendez-vous a été enregistré avec succès
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Vous recevrez une confirmation par email dans les prochaines minutes.
                Notre équipe vous contactera si nécessaire.
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => setIsSubmitted(false)} 
                  variant="outline" 
                  className="flex-1"
                >
                  Nouvelle Réservation
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
              <h1 className="text-4xl font-bold mb-4">Réserver un Rendez-vous</h1>
              <p className="text-xl text-muted-foreground">
                Prenez rendez-vous en ligne pour l'entretien de votre véhicule
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Informations pratiques */}
              <div className="space-y-6">
                <Card className="card-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span>Horaires d'ouverture</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Lundi - Vendredi:</span>
                      <span>8h00 - 18h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Samedi:</span>
                      <span>9h00 - 12h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimanche:</span>
                      <span className="text-muted-foreground">Fermé</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Wrench className="h-5 w-5 text-primary" />
                      <span>Services disponibles</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Entretien périodique</li>
                      <li>• Réparation carrosserie</li>
                      <li>• Diagnostic électronique</li>
                      <li>• Contrôle technique</li>
                      <li>• Changement pneus</li>
                      <li>• Révision complète</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Formulaire de réservation */}
              <div className="lg:col-span-2">
                <Card className="card-auto">
                  <CardHeader>
                    <CardTitle>Formulaire de Réservation</CardTitle>
                    <CardDescription>
                      Remplissez les informations ci-dessous pour prendre rendez-vous
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Informations personnelles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="nom"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom complet *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Votre nom et prénom" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="telephone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Téléphone *</FormLabel>
                                <FormControl>
                                  <Input placeholder="01 23 45 67 89" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input placeholder="votre.email@exemple.com" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="vehicule"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Véhicule *</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Renault Clio 2020" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Date et heure */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Date du rendez-vous *</FormLabel>
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
                                          <span>Sélectionnez une date</span>
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
                                        date < new Date() || date.getDay() === 0 // Dimanche fermé
                                      }
                                      initialFocus
                                      className={cn("p-3 pointer-events-auto")}
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="heure"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Heure *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionnez l'heure" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {creneauxDisponibles.map((creneau) => (
                                      <SelectItem key={creneau} value={creneau}>
                                        {creneau}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="typeIntervention"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type d'intervention * (sélection multiple possible)</FormLabel>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded-md p-4">
                                {typesIntervention.map((type) => (
                                  <div key={type} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={type}
                                      checked={field.value?.includes(type)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([...field.value, type]);
                                        } else {
                                          field.onChange(field.value?.filter((item: string) => item !== type));
                                        }
                                      }}
                                    />
                                    <Label
                                      htmlFor={type}
                                      className="text-sm font-normal cursor-pointer"
                                    >
                                      {type}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="commentaires"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Commentaires (optionnel)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Décrivez le problème ou vos besoins spécifiques..."
                                  className="resize-none"
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
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              Confirmer la Réservation
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

export default Rdv;