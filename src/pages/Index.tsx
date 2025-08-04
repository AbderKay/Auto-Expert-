import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout/Layout';
import { 
  Car, 
  Wrench, 
  Shield, 
  Clock, 
  Star, 
  Phone, 
  MapPin, 
  CheckCircle,
  Calendar,
  Users,
  Award,
  User
} from 'lucide-react';
import luxuryCarBg from '@/assets/luxury-car-bg.jpg';

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const services = [
    {
      icon: Wrench,
      title: "Entretien Complet",
      description: "Révision, vidange, filtres et contrôles techniques complets",
      features: ["Diagnostic gratuit", "Pièces d'origine", "Garantie 2 ans"]
    },
    {
      icon: Shield,
      title: "Réparation Carrosserie",
      description: "Remise en état après accident, peinture et débosselage",
      features: ["Devis gratuit", "Assurance directe", "Véhicule de courtoisie"]
    },
    {
      icon: Car,
      title: "Diagnostic Électronique",
      description: "Analyse complète des systèmes électroniques de votre véhicule",
      features: ["Équipement moderne", "Rapport détaillé", "Conseils d'expert"]
    }
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      rating: 5,
      comment: "Service exceptionnel ! Mon véhicule a été réparé rapidement et parfaitement.",
      date: "Il y a 2 jours"
    },
    {
      name: "Pierre Martin",
      rating: 5,
      comment: "Équipe professionnelle et transparente. Je recommande vivement AutoExpert.",
      date: "Il y a 1 semaine"
    },
    {
      name: "Sophie Laurent",
      rating: 4,
      comment: "Très satisfaite de la qualité du service et des conseils prodigués.",
      date: "Il y a 2 semaines"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section 
        className="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4)), url(${luxuryCarBg})`
        }}
      >
        <div className="container mx-auto px-4 text-center text-white">
          <div className={`space-y-6 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              Agence Automobile d'Excellence
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Votre Partenaire
              <span className="block text-primary">Automobile de Confiance</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Expertise professionnelle, service de qualité et technologies de pointe 
              pour l'entretien et la réparation de votre véhicule.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button 
                asChild 
                size="lg" 
                className="btn-primary text-lg px-8 py-4 glow-red hover:glow-red-strong"
              >
                <Link to="/rdv">
                  <Calendar className="mr-2 h-5 w-5" />
                  Réserver un RDV
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-black"
              >
                <Link to="/auth">
                  <User className="mr-2 h-5 w-5" />
                  Espace Client
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-black"
                onClick={() => window.location.href = 'tel:+33123456789'}
              >
                <Phone className="mr-2 h-5 w-5" />
                Nous Contacter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nos Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une gamme complète de services automobiles avec l'expertise de nos techniciens certifiés
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="card-auto hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="text-center">
                    <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-8 w-8 text-primary group-hover:text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription className="text-base">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">15+</div>
              <div className="text-secondary-foreground">Années d'Expérience</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">5000+</div>
              <div className="text-secondary-foreground">Véhicules Réparés</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">98%</div>
              <div className="text-secondary-foreground">Clients Satisfaits</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">24h</div>
              <div className="text-secondary-foreground">Délai Moyen</div>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Avis Clients</h2>
            <p className="text-xl text-muted-foreground">
              Ce que pensent nos clients de nos services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-auto">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < testimonial.rating ? 'text-primary fill-current' : 'text-muted'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.comment}"</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold">{testimonial.name}</span>
                    <span className="text-muted-foreground">{testimonial.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact rapide */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Besoin d'Aide ?</h2>
          <p className="text-xl mb-8 opacity-90">
            Notre équipe est disponible pour répondre à toutes vos questions
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="flex items-center space-x-3">
              <Phone className="h-6 w-6" />
              <span className="text-lg">01 23 45 67 89</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-6 w-6" />
              <span className="text-lg">123 Avenue des Garages, Paris</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6" />
              <span className="text-lg">Lun-Ven 8h-18h</span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
