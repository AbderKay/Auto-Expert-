import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FileText, Loader2 } from 'lucide-react';
import { envoyerContact, getUserId } from '@/utils/n8nApi';

const formSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(10, 'Numéro de téléphone invalide'),
  vehicule: z.string().min(1, 'Veuillez indiquer votre véhicule'),
  typeService: z.string().min(1, 'Veuillez sélectionner le type de service'),
  description: z.string().min(10, 'Veuillez décrire votre demande (minimum 10 caractères)'),
});

type FormData = z.infer<typeof formSchema>;

interface DevisFormProps {
  onSuccess?: () => void;
}

const DevisForm = ({ onSuccess }: DevisFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: '',
      email: '',
      telephone: '',
      vehicule: '',
      typeService: '',
      description: '',
    },
  });

  const typesService = [
    'Entretien périodique',
    'Réparation carrosserie',
    'Diagnostic électronique',
    'Contrôle technique',
    'Changement de pneus',
    'Réparation moteur',
    'Révision complète',
    'Climatisation',
    'Freinage',
    'Autre'
  ];

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      const userId = getUserId();
      
      const devisData = {
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        sujet: `Demande de devis - ${data.typeService}`,
        message: `Demande de devis pour véhicule: ${data.vehicule}\nType de service: ${data.typeService}\nDescription: ${data.description}`,
      };

      console.log('Envoi de la demande de devis:', devisData);

      const result = await envoyerContact(devisData);

      if (result.success) {
        toast({
          title: '✅ Demande de devis envoyée !',
          description: 'Nous vous enverrons votre devis par email dans les plus brefs délais.',
        });
        form.reset();
        onSuccess?.();
      } else {
        throw new Error(result.message || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande de devis:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible d\'envoyer votre demande. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="card-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <span>Demander un devis</span>
        </CardTitle>
        <CardDescription>
          Remplissez le formulaire ci-dessous et nous vous enverrons un devis personnalisé par email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <FormField
              control={form.control}
              name="typeService"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de service *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le type de service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {typesService.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description de votre demande *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez précisément le service souhaité, les problèmes rencontrés, ou vos besoins spécifiques..."
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full btn-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Demander un devis
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DevisForm;