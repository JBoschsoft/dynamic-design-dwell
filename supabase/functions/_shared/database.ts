
// Helper function to check if a user with a given email exists
export const checkEmailExists = async (supabaseClient: any, email: string): Promise<boolean> => {
  try {
    // Use the newly created RPC function to check email existence
    const { data, error } = await supabaseClient.rpc('check_email_exists', { email_to_check: email });
    
    if (error) {
      console.error("Error checking if email exists:", error);
      throw error;
    }
    
    return Boolean(data);
  } catch (error) {
    console.error("Error in checkEmailExists:", error);
    throw error;
  }
};
