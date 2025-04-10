
// Helper function to check if a user with a given email exists
export const checkEmailExists = async (supabaseClient: any, email: string): Promise<boolean> => {
  try {
    // Query the auth.users table to check if a user with the given email exists
    const { data, error } = await supabaseClient.rpc('check_email_exists', { email_to_check: email });
    
    if (error) throw error;
    
    return Boolean(data);
  } catch (error) {
    console.error("Error checking if email exists:", error);
    throw error;
  }
};
