-- Modifier la table feedback_clients pour auto-générer les IDs
-- Créer une séquence pour les IDs si elle n'existe pas déjà
CREATE SEQUENCE IF NOT EXISTS feedback_clients_id_seq;

-- Modifier la colonne id pour qu'elle soit auto-incrémentée
ALTER TABLE public.feedback_clients 
ALTER COLUMN id SET DEFAULT nextval('feedback_clients_id_seq');

-- Associer la séquence à la colonne
ALTER SEQUENCE feedback_clients_id_seq OWNED BY public.feedback_clients.id;