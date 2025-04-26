
import { supabase } from './client';

/**
 * Gets the current user's workspace ID using the security definer function
 * @returns The user's workspace ID or null if not found
 */
export const getUserWorkspaceId = async (): Promise<string | null> => {
  try {
    const { data: workspaceId, error } = await supabase.rpc('get_user_workspace_id');
    
    if (error) {
      console.error('Error fetching user workspace ID:', error);
      return null;
    }
    
    return workspaceId;
  } catch (error) {
    console.error('Exception fetching user workspace ID:', error);
    return null;
  }
}

/**
 * Gets the current user's workspace data
 * @returns The workspace data or null if not found
 */
export const getUserWorkspaceData = async () => {
  try {
    const workspaceId = await getUserWorkspaceId();
    
    if (!workspaceId) {
      return null;
    }
    
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single();
      
    if (error) {
      console.error('Error fetching workspace data:', error);
      return null;
    }
    
    return workspace;
  } catch (error) {
    console.error('Exception fetching workspace data:', error);
    return null;
  }
}

/**
 * Checks if a user is a member of a specific workspace
 * @param workspaceId The workspace ID to check
 * @returns True if the user is a member of the workspace
 */
export const isWorkspaceMember = async (workspaceId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_workspace_member', { workspace_id: workspaceId });
    
    if (error) {
      console.error('Error checking workspace membership:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Exception checking workspace membership:', error);
    return false;
  }
}
