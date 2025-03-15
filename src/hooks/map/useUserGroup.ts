import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { supabase } from '@/database/supabaseClient';

export function useUserGroup() {
  const { user, isLoaded } = useUser();
  const [groupId, setGroupId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserGroup() {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }

      try {
        // 假设有一个用户-组映射表
        const { data, error: fetchError } = await supabase
          .from('user_groups')
          .select('group_id')
          .eq('user_id', user.id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          setGroupId(data.group_id);
        }
      } catch (err: any) {
        console.error('Error fetching user group:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserGroup();
  }, [user, isLoaded]);

  return { groupId, loading, error };
}
