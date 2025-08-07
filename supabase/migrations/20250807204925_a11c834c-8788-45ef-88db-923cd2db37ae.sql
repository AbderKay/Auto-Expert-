-- Créer une table profiles pour stocker les informations utilisateur
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Activer RLS sur la table profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent voir leur propre profil
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Politique pour que les utilisateurs puissent mettre à jour leur propre profil
CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Politique pour que les utilisateurs puissent insérer leur propre profil
CREATE POLICY "Les utilisateurs peuvent créer leur propre profil"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, phone)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.raw_user_meta_data ->> 'phone'
  );
  RETURN NEW;
END;
$$;

-- Déclencheur pour créer automatiquement un profil lors de l'inscription
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencheur pour mettre à jour updated_at sur la table profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Modifier la table rendez_vous pour lier les rendez-vous aux utilisateurs authentifiés
ALTER TABLE public.rendez_vous 
ALTER COLUMN user_id SET DEFAULT auth.uid()::text;

-- Mettre à jour les politiques RLS sur rendez_vous pour utiliser l'authentification
DROP POLICY IF EXISTS "Les clients peuvent voir leurs propres rendez-vous" ON public.rendez_vous;
DROP POLICY IF EXISTS "Les clients peuvent créer leurs propres rendez-vous" ON public.rendez_vous;
DROP POLICY IF EXISTS "Les clients peuvent modifier leurs propres rendez-vous" ON public.rendez_vous;

CREATE POLICY "Les utilisateurs authentifiés peuvent voir leurs propres rendez-vous"
ON public.rendez_vous
FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

CREATE POLICY "Les utilisateurs authentifiés peuvent créer leurs propres rendez-vous"
ON public.rendez_vous
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Les utilisateurs authentifiés peuvent modifier leurs propres rendez-vous"
ON public.rendez_vous
FOR UPDATE
TO authenticated
USING (user_id = auth.uid()::text);