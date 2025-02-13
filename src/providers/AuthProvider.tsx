
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  signOut: async () => {} 
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Sign Out Error",
          description: "Could not sign out. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Unexpected sign out error:', error);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check active session
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('Current session:', session);
        
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('Session check error:', error);
        setUser(null);
        setLoading(false);
      }
    };

    // Initial session check
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_IN') {
        try {
          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session?.user?.id)
            .single();

          if (profileError || !profile) {
            // Create profile if it doesn't exist
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: session?.user?.id,
                email: session?.user?.email,
                full_name: session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0]
              });

            if (insertError) {
              console.error('Error creating profile:', insertError);
              toast({
                title: "Error",
                description: "Failed to create user profile. Some features might not work properly.",
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          console.error('Error checking/creating profile:', error);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
