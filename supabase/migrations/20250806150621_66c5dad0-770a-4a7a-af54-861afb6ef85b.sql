-- Ajouter une colonne rdv_id à la table feedback_clients pour lier directement aux rendez-vous
ALTER TABLE public.feedback_clients 
ADD COLUMN rdv_id INTEGER REFERENCES public.rendez_vous(id);

-- Créer un index pour optimiser les requêtes
CREATE INDEX idx_feedback_clients_rdv_id ON public.feedback_clients(rdv_id);