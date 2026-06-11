import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook para rastrear usuarios en línea usando Supabase Presence
 */
export const usePresence = (currentUser, activeCompany) => {
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        if (!currentUser || !activeCompany) return;

        // Crear canal de presencia
        const channel = supabase.channel(`presence-${activeCompany}`, {
            config: {
                presence: {
                    key: currentUser.id || currentUser.name,
                },
            },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState();
                const users = [];
                
                Object.keys(newState).forEach((key) => {
                    const presence = newState[key][0];
                    users.push({
                        id: key,
                        name: presence.name,
                        role: presence.role,
                        company: presence.company,
                        onlineAt: presence.onlineAt
                    });
                });
                
                setOnlineUsers(users);
            })
                        .on('presence', { event: 'join' }, () => {
                // User joined - no action needed
            })
            .on('presence', { event: 'leave' }, () => {
                // User left - no action needed
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        name: currentUser.name,
                        role: currentUser.role,
                        company: activeCompany,
                        onlineAt: new Date().toISOString(),
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser, activeCompany]);

    return onlineUsers;
};
