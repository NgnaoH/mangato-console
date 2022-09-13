/* eslint-disable react-hooks/exhaustive-deps */
import { AdditionalUser } from "@/types";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const useUser = () => {
  const [user, setUser] = useState<User>(null);
  const [additionUser, setAdditionUser] = useState<AdditionalUser>(null);
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  // @ts-ignore
  useEffect(async () => {
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return setIsLoading(false);
    const { data: additionUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();
    setAdditionUser(additionUser);
    setUser(user);
    setIsLoading(false);
  }, []);

  return { user, additionUser, isLoading };
};

export default useUser;
