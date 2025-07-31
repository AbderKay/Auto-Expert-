import { Car, Phone, MapPin, Mail, Clock, Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary rounded-lg">
                <Car className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">AutoExpert</h3>
                <p className="text-sm text-muted-foreground">Agence Automobile</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Votre partenaire de confiance pour l'entretien, la réparation et la vente de véhicules. 
              Expertise et qualité depuis plus de 15 ans.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Navigation rapide */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors link-animated">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/rdv" className="text-muted-foreground hover:text-primary transition-colors link-animated">
                  Réserver un RDV
                </Link>
              </li>
              <li>
                <Link to="/espace-client" className="text-muted-foreground hover:text-primary transition-colors link-animated">
                  Mon Espace Client
                </Link>
              </li>
              <li>
                <Link to="/satisfaction" className="text-muted-foreground hover:text-primary transition-colors link-animated">
                  Satisfaction
                </Link>
              </li>
              <li>
                <Link to="/maintenance" className="text-muted-foreground hover:text-primary transition-colors link-animated">
                  Rappel Maintenance
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Entretien véhicules</li>
              <li>Réparation carrosserie</li>
              <li>Diagnostic électronique</li>
              <li>Contrôle technique</li>
              <li>Pièces détachées</li>
              <li>Vente de véhicules</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-muted-foreground">123 Avenue des Garages</p>
                  <p className="text-muted-foreground">75001 Paris, France</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <p className="text-muted-foreground">01 23 45 67 89</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <p className="text-muted-foreground">contact@autoexpert.fr</p>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Lun-Ven: 8h-18h</p>
                  <p className="text-muted-foreground">Sam: 9h-12h</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2024 AutoExpert. Tous droits réservés. Connecté avec n8n pour une gestion optimisée.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;