import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Database } from '@/integrations/supabase/types';

type Band = Database['public']['Tables']['bands']['Row'];

type BandContextType = {
  currentBand: Band | null;
  bands: Band[];
  loading: boolean;
  setCurrentBand: (band: Band) => void;
  createBand: (name: string) => Promise<Band | null>;
  updateBand: (id: string, name: string) => Promise<void>;
  deleteBand: (id: string) => Promise<void>;
};

const BandContext = createContext<BandContextType | undefined>(undefined);

export const BandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentBand, setCurrentBand] = useState<Band | null>(null);
  const [bands, setBands] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's bands on mount and when user changes
  useEffect(() => {
    if (!user) {
      setBands([]);
      setCurrentBand(null);
      setLoading(false);
      return;
    }

    async function fetchBands() {
      try {
        setLoading(true);
        
        // Get bands where the user is a member
        const { data: memberData, error: memberError } = await supabase
          .from('band_members')
          .select('band_id')
          .eq('user_id', user.id);

        if (memberError) throw memberError;

        const bandIds = memberData.map(item => item.band_id);
        
        if (bandIds.length === 0) {
          setBands([]);
          setCurrentBand(null);
          setLoading(false);
          return;
        }

        // Fetch the bands
        const { data: bandsData, error: bandsError } = await supabase
          .from('bands')
          .select('*')
          .in('id', bandIds);

        if (bandsError) throw bandsError;

        setBands(bandsData || []);
        
        // Set the first band as current if not already set
        if (!currentBand && bandsData && bandsData.length > 0) {
          setCurrentBand(bandsData[0]);
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to load bands",
          description: error.message || "Could not load your bands"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchBands();
  }, [user]);

  const createBand = async (name: string): Promise<Band | null> => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to create a band"
      });
      return null;
    }

    try {
      // Create the band
      const { data: bandData, error: bandError } = await supabase
        .from('bands')
        .insert([{ 
          name, 
          created_by: user.id,
        }])
        .select()
        .single();

      if (bandError) throw bandError;

      if (!bandData) {
        throw new Error('Failed to create band');
      }

      // Add the creator as a band member
      const { error: memberError } = await supabase
        .from('band_members')
        .insert([{
          band_id: bandData.id,
          user_id: user.id,
          role: 'Admin',
        }]);

      if (memberError) throw memberError;

      // Update local state
      setBands([...bands, bandData]);
      setCurrentBand(bandData);

      toast({
        title: "Band created",
        description: `"${name}" has been created successfully`
      });

      return bandData;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create band",
        description: error.message || "Could not create the band"
      });
      return null;
    }
  };

  const updateBand = async (id: string, name: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('bands')
        .update({ name })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      const updatedBands = bands.map(band => 
        band.id === id ? { ...band, name } : band
      );
      setBands(updatedBands);
      
      if (currentBand && currentBand.id === id) {
        setCurrentBand({ ...currentBand, name });
      }

      toast({
        title: "Band updated",
        description: `"${name}" has been updated successfully`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update band",
        description: error.message || "Could not update the band"
      });
    }
  };

  const deleteBand = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('bands')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      const updatedBands = bands.filter(band => band.id !== id);
      setBands(updatedBands);
      
      if (currentBand && currentBand.id === id) {
        setCurrentBand(updatedBands.length > 0 ? updatedBands[0] : null);
      }

      toast({
        title: "Band deleted",
        description: "The band has been deleted successfully"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete band",
        description: error.message || "Could not delete the band"
      });
    }
  };

  return (
    <BandContext.Provider value={{
      currentBand,
      bands,
      loading,
      setCurrentBand,
      createBand,
      updateBand,
      deleteBand
    }}>
      {children}
    </BandContext.Provider>
  );
};

export const useBand = () => {
  const context = useContext(BandContext);
  if (context === undefined) {
    throw new Error('useBand must be used within a BandProvider');
  }
  return context;
}; 