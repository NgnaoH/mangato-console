import { typeReport } from "@/components/shared/ReportConfirmation";
import { supabase } from "@/utils/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import { useMutation } from "react-query";
import { toast } from "react-toastify";

interface createReportParams {
  type: string;
  reporterId: string;
  reason: string;
  userId?: string;
  chapterId?: string;
}

const useCreateReport = () => {
  return useMutation<any, PostgrestError, createReportParams, any>(
    async (params: createReportParams) => {
      const { type, userId, chapterId } = params;

      if (
        (type === typeReport.user && userId) ||
        (type === typeReport.chapter && chapterId)
      ) {
        const { error } = await supabase.from("reports").insert({ ...params });
        if (error) throw error;
        return;
      }

      return toast.error("Some thing went wrong");
    },
    {
      onSuccess: () => {
        toast.success("Report successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }
  );
};

export default useCreateReport;
