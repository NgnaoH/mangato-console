import { supabase } from "@/utils/supabase";
import { Provider } from "@supabase/gotrue-js";
import { useMutation } from "react-query";

interface UseSignInOptions {
  redirectTo?: string;
  scopes?: string;
}

const useSignIn = (supabaseOptions?: UseSignInOptions) => {
  return useMutation((provider: Provider) => {
    return supabase.auth.signInWithOAuth({
      provider,
      options: supabaseOptions,
    });
  });
};

export default useSignIn;
