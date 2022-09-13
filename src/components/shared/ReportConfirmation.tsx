import classNames from "classnames";
import { Trans, useTranslation } from "next-i18next";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { MdReport } from "react-icons/md";
import Button from "./Button";
import Input from "./Input";
import Modal, { ModalRef } from "./Modal";

interface ReportConfirmationProps extends React.HTMLAttributes<HTMLDivElement> {
  onConfirm?: (reason) => void;
  isLoading?: boolean;
  reference?: React.ReactNode;
  confirmString?: string;
  type: string;
}

export const typeReport = {
  user: "user",
  chapter: "chapter",
};

const ReportConfirmation: React.FC<ReportConfirmationProps> = (props) => {
  const { t } = useTranslation("report_modal");
  const modalRef = useRef<ModalRef>(null);
  const [requirment, setRequirment] = useState("");
  const [reason, setReason] = useState("");

  const {
    children,
    onConfirm,
    confirmString = t("report_default_confirm"),
    isLoading = false,
    reference = (
      <Button
        LeftIcon={MdReport}
        isLoading={isLoading}
        className="text-red-500 bg-red-500/20 hover:text-white hover:bg-red-500/80"
      >
        Xóa
      </Button>
    ),
    className,
    ...restProps
  } = props;

  const isButtonDisable = useMemo(
    () =>
      requirment.toLowerCase() !== confirmString.toLowerCase() ||
      reason.length < 8,
    [requirment, reason, confirmString]
  );

  const handleConfirm = useCallback(
    (dataReason) => {
      if (isButtonDisable) return;

      onConfirm?.(dataReason);

      modalRef.current?.close();
    },
    [isButtonDisable, onConfirm]
  );

  return (
    <Modal ref={modalRef} className="md:w-1/3 w-11/12" reference={reference}>
      <p className="text-2xl mt-4 mb-2">
        {t("report")} {t(props.type)}
      </p>
      <p className="text-xs text-gray-500 mb-5">
          <Trans
            i18nKey="report_modal:report_message"
            values={{
              typeReport: t(props.type),
            }}
          >
            We will handle this <b>{{ typeReport }}</b> after consider.
          </Trans>
        </p>
      <div className={classNames("space-y-4", className)} {...restProps}>
        
        <div>
          <Trans
            i18nKey="report_modal:report_requirment"
            values={{
              confirmString,
            }}
          >
            Nhập <b>{confirmString}</b> để xác nhận xóa.
          </Trans>

          <Input
            onChange={(e) =>
              setRequirment((e.target as HTMLTextAreaElement).value)
            }
            className="px-2 py-1 focus:ring focus:ring-primary-500/60"
          />
        </div>
        <div>
          <label htmlFor="reason">{t("reasons_validate")}</label>
          <Input
            id="reason"
            onChange={(e) => setReason((e.target as HTMLTextAreaElement).value)}
            className="px-2 py-1 focus:ring focus:ring-primary-500/60"
          />
        </div>

        <Button
          className={classNames(
            "w-full text-red-500 bg-red-500/20 flex items-center justify-center",
            !isButtonDisable && "hover:text-white hover:bg-red-500/80",
            isButtonDisable && "opacity-60"
          )}
          disabled={isButtonDisable}
          onClick={() => handleConfirm(reason)}
        >
          {t("report")}
        </Button>
      </div>
    </Modal>
  );
};

export default ReportConfirmation;
