/* eslint-disable react-hooks/exhaustive-deps */
import { AdditionalUser } from "@/types";
import { supabase } from "@/utils/supabase";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const withAuthRedirect = <K,>(WrappedComponent: NextPage<K>) => {
  const WithAuthRedirectComponent: NextPage<K> = (props) => {
    const router = useRouter();
    const [user, setUser] = useState<AdditionalUser>();
    const [sourceId, setSourceId] = useState<string>();

    // @ts-ignore
    useEffect(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: additionalUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: sourceAddedByUser } = await supabase
        .from("kaguya_sources")
        .select("id")
        .eq("addedUserId", user.id)
        .single();

      setSourceId(sourceAddedByUser.id);
      setUser(additionalUser);
    }, []);

    return user ? (
      <WrappedComponent {...props} user={user} sourceId={sourceId} />
    ) : null;
  };

  WithAuthRedirectComponent.getInitialProps = WrappedComponent.getInitialProps;

  return WithAuthRedirectComponent;
};

export default withAuthRedirect;
