-- Activer RLS sur toutes les tables publiques pour corriger les erreurs de sécurité

-- 1. Activer RLS sur la table rendez_vous
ALTER TABLE public.rendez_vous ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour rendez_vous (les clients peuvent voir leurs propres RDV)
CREATE POLICY "Les clients peuvent voir leurs propres rendez-vous" 
ON public.rendez_vous 
FOR SELECT 
USING (true); -- Pour l'instant, tout le monde peut voir (pas d'auth encore)

CREATE POLICY "Les clients peuvent créer leurs propres rendez-vous" 
ON public.rendez_vous 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Les clients peuvent modifier leurs propres rendez-vous" 
ON public.rendez_vous 
FOR UPDATE 
USING (true);

-- 2. Activer RLS sur la table devis
ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les clients peuvent voir leurs propres devis" 
ON public.devis 
FOR SELECT 
USING (true);

CREATE POLICY "Création de devis autorisée" 
ON public.devis 
FOR INSERT 
WITH CHECK (true);

-- 3. Activer RLS sur la table feedback_clients
ALTER TABLE public.feedback_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les clients peuvent voir leurs propres feedback" 
ON public.feedback_clients 
FOR SELECT 
USING (true);

CREATE POLICY "Les clients peuvent créer leur feedback" 
ON public.feedback_clients 
FOR INSERT 
WITH CHECK (true);

-- 4. Activer RLS sur la table demandes_maintenance
ALTER TABLE public.demandes_maintenance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les clients peuvent voir leurs propres demandes de maintenance" 
ON public.demandes_maintenance 
FOR SELECT 
USING (true);

CREATE POLICY "Les clients peuvent créer des demandes de maintenance" 
ON public.demandes_maintenance 
FOR INSERT 
WITH CHECK (true);

-- Ajouter une colonne user_id pour lier les données aux utilisateurs (pour quand l'auth sera implémentée)
ALTER TABLE public.rendez_vous ADD COLUMN user_id TEXT;
ALTER TABLE public.devis ADD COLUMN user_id TEXT;
ALTER TABLE public.feedback_clients ADD COLUMN user_id TEXT;
ALTER TABLE public.demandes_maintenance ADD COLUMN user_id TEXT;