import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Layout from '@/components/Layout/Layout';
import { 
  Wrench, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Car,
  Phone,
  Mail,
  Settings,
  Loader2,
  Bell
} from 'lucide-react';
import { demanderRappelMaintenance, getUserId } from '@/utils/n8nApi';

const formSchema = z.object({
  marque: z.string().min(1, 'Veuillez sélectionner la marque'),
  modele: z.string().min(2, 'Le modèle doit contenir au moins 2 caractères'),
  annee: z.string().min(4, 'Année invalide'),
  kilometrage: z.string().min(1, 'Veuillez indiquer le kilométrage'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(10, 'Numéro de téléphone invalide'),
});

type FormData = z.infer<typeof formSchema>;

const Maintenance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marque: '',
      modele: '',
      annee: '',
      kilometrage: '',
      email: '',
      telephone: '',
    },
  });

  const marques = [
    'Renault', 'Peugeot', 'Citroën', 'Volkswagen', 'BMW', 'Mercedes', 
    'Audi', 'Toyota', 'Honda', 'Nissan', 'Ford', 'Opel', 'Autre'
  ];

  const typesEntretien = [
    {
      id: 'vidange',
      titre: 'Vidange',
      description: 'Changement de l\'huile moteur et du filtre',
      frequence: 'Tous les 15 000 km ou 1 an',
      importance: 'critique',
      duree: '30 min',
      prix: 'À partir de 80€'
    },
    {
      id: 'revision',
      titre: 'Révision complète',
      description: 'Contrôle général du véhicule',
      frequence: 'Tous les 20 000 km ou 2 ans',
      importance: 'haute',
      duree: '2h',
      prix: 'À partir de 150€'
    },
    {
      id: 'freins',
      titre: 'Contrôle freins',
      description: 'Vérification plaquettes, disques et circuit',
      frequence: 'Tous les 30 000 km',
      importance: 'critique',
      duree: '45 min',
      prix: 'À partir de 120€'
    },
    {
      id: 'pneus',
      titre: 'Contrôle pneus',
      description: 'Vérification usure, pression et géométrie',
      frequence: 'Tous les 10 000 km',
      importance: 'moyenne',
      duree: '20 min',
      prix: 'À partir de 40€'
    },
    {
      id: 'distribution',
      titre: 'Courroie de distribution',
      description: 'Remplacement courroie et tendeurs',
      frequence: 'Tous les 100 000 km ou 5 ans',
      importance: 'critique',
      duree: '4h',
      prix: 'À partir de 400€'
    },
    {
      id: 'climatisation',
      titre: 'Entretien climatisation',
      description: 'Recharge gaz et nettoyage circuit',
      frequence: 'Tous les 2 ans',
      importance: 'faible',
      duree: '1h',
      prix: 'À partir de 90€'
    }
  ];

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critique':
        return 'bg-red-100 text-red-800';
      case 'haute':
        return 'bg-orange-100 text-orange-800';
      case 'moyenne':
        return 'bg-yellow-100 text-yellow-800';
      case 'faible':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'critique':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'haute':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'moyenne':
        return <Settings className="h-4 w-4 text-yellow-600" />;
      case 'faible':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Wrench className="h-4 w-4" />;
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      const userId = getUserId();
      
      const maintenanceData = {
        marque: data.marque,
        modele: data.modele,
        annee: data.annee,
        kilometrage: data.kilometrage,
        email: data.email,
        telephone: data.telephone,
        typeEntretien: selectedMaintenance || 'general',
      };

      console.log('Demande de rappel maintenance:', maintenanceData);

      const result = await demanderRappelMaintenance(maintenanceData, userId);

      if (result.success) {
        setIsSubmitted(true);
        toast({
          title: '✅ Demande enregistrée !',
          description: 'Nous vous contacterons pour planifier votre entretien.',
        });
        form.reset();
        setSelectedMaintenance(null);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Erreur lors de la demande de rappel:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible d\'enregistrer votre demande. Veuillez réessayer.',
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
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-primary">Demande Enregistrée !</CardTitle>
              <CardDescription>
                Nous vous contacterons très prochainement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Votre demande de rappel pour l'entretien de votre véhicule a été enregistrée.
                Notre équipe vous contactera dans les 24h pour planifier votre intervention.
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => setIsSubmitted(false)} 
                  variant="outline" 
                  className="flex-1"
                >
                  Nouvelle Demande
                </Button>
                <Button asChild className="flex-1 btn-primary">
                  <a href="/rdv">Prendre RDV Directement</a>
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
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Rappel Maintenance</h1>
              <p className="text-xl text-muted-foreground">
                Prenez soin de votre véhicule avec nos rappels d'entretien personnalisés
              </p>
            </div>

            {/* Types d'entretien */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Types d'Entretien Recommandés</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {typesEntretien.map((entretien) => (
                  <Card 
                    key={entretien.id} 
                    className={`card-auto cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      selectedMaintenance === entretien.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedMaintenance(entretien.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          {getImportanceIcon(entretien.importance)}
                          <span>{entretien.titre}</span>
                        </CardTitle>
                        <Badge className={getImportanceColor(entretien.importance)}>
                          {entretien.importance}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {entretien.description}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fréquence:</span>
                          <span className="font-medium">{entretien.frequence}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Durée:</span>
                          <span className="font-medium">{entretien.duree}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Prix:</span>
                          <span className="font-medium text-primary">{entretien.prix}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Informations maintenance */}
              <div className="space-y-6">
                <Card className="card-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Wrench className="h-5 w-5 text-primary" />
                      <span>Pourquoi l'entretien ?</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>• Prolonge la durée de vie du véhicule</p>
                    <p>• Maintient les performances optimales</p>
                    <p>• Prévient les pannes coûteuses</p>
                    <p>• Assure votre sécurité sur la route</p>
                    <p>• Préserve la valeur de revente</p>
                  </CardContent>
                </Card>

                <Card className="card-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span>Notre service de rappel</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>• Rappels personnalisés selon votre véhicule</p>
                    <p>• Notifications par email et SMS</p>
                    <p>• Planification flexible des rendez-vous</p>
                    <p>• Devis transparent avant intervention</p>
                  </CardContent>
                </Card>

                <Card className="card-auto">
                  <CardHeader>
                    <CardTitle>Entretien Urgence</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Besoin d'un entretien urgent ?
                    </p>
                    <div className="flex flex-col space-y-2">
                      <Button asChild className="btn-primary">
                        <a href="/rdv">
                          <Calendar className="h-4 w-4 mr-2" />
                          Prendre RDV Immédiat
                        </a>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.location.href = 'tel:+33123456789'}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Appeler Maintenant
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Formulaire de demande de rappel */}
              <div className="lg:col-span-2">
                <Card className="card-auto">
                  <CardHeader>
                    <CardTitle>Demander un Rappel d'Entretien</CardTitle>
                    <CardDescription>
                      Remplissez vos informations pour recevoir des rappels personnalisés
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedMaintenance && (
                      <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="text-sm text-primary font-medium">
                          ✅ Type d'entretien sélectionné: {typesEntretien.find(e => e.id === selectedMaintenance)?.titre}
                        </p>
                      </div>
                    )}

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Informations véhicule */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center space-x-2">
                            <Car className="h-5 w-5 text-primary" />
                            <span>Informations du véhicule</span>
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="marque"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Marque *</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez la marque" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {marques.map((marque) => (
                                        <SelectItem key={marque} value={marque}>
                                          {marque}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="modele"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Modèle *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Ex: Clio, 308, Golf..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="annee"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Année *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Ex: 2020" type="number" min="1990" max="2024" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="kilometrage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Kilométrage actuel *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Ex: 50000" type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Informations contact */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center space-x-2">
                            <Mail className="h-5 w-5 text-primary" />
                            <span>Informations de contact</span>
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </div>

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
                              <Bell className="mr-2 h-4 w-4" />
                              Demander un Rappel
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

export default Maintenance;