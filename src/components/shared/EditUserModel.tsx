import { userRole } from "@/constants";
import useConstantTranslation from "@/hooks/useConstantTranslation";
import { AdditionalUser } from "@/types";
import { getUserRole } from "@/utils/data";
import { useTranslation } from "next-i18next";
import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { MdSettings } from "react-icons/md";
import Button from "./Button";
import FormSelect from "./FormSelect";
import Input from "./Input";
import Modal, { ModalRef } from "./Modal";

interface EditUserModalProps {
  user: AdditionalUser;
  updateUser: Function;
  isUpdating: boolean;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  updateUser,
  isUpdating,
}) => {
  const { t } = useTranslation("admin");
  const modalRef = useRef<ModalRef>();
  const { USER_ROLE } = useConstantTranslation();

  const {
    control,
    register,
    watch,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<any>({
    defaultValues: {
      role: getUserRole(user),
      deactived: user.deactived,
      name: user.sources?.[0]?.name || "admin",
    },
  });

  const watchRole = watch("role");

  const handleSave = ({ deactived, name, role }) => {
    const isUploader = role === userRole.uploader || role === userRole.admin;
    const isAdmin = role === userRole.admin;

    updateUser({
      userId: user.id,
      isUploader,
      isAdmin,
      deactived,
      name,
    });
  };

  const handleModalState = (state: "open" | "close") => () => {
    if (state === "open") {
      modalRef.current.open();
    } else if (state === "close") {
      modalRef.current.close();
    }
  };

  return (
    <React.Fragment>
      <Button
        onClick={handleModalState("open")}
        secondary
        className="w-full"
        LeftIcon={MdSettings}
      />

      <Modal ref={modalRef} className="md:w-1/3 w-11/12">
        <h1 className="text-2xl font-semibold">{t("edit_user")}</h1>

        <div className="space-y-4 my-8">
          <div className="flex items-center">
            <FormSelect
              control={control}
              name="role"
              selectProps={{
                options: USER_ROLE,
              }}
              label={t("role")}
              rules={{
                required: "Please select role!",
              }}
            />
            {watchRole && watchRole !== userRole.user && (
              <Input
                {...register("name", {
                  required: "Please enter alias!",
                })}
                containerInputClassName="border border-white/80 p-2 h-10"
                label={t("alias")}
                containerClassName="hidden md:block shrink-0 ml-4"
              />
            )}
          </div>
          {errors.role && (
            <p className="text-red-500 mt-2">{errors.role.message}</p>
          )}
          {errors.name && (
            <p className="text-red-500 mt-2">{errors.name.message}</p>
          )}
          <div className="flex items-center">
            <label
              className="inline-block text-white cursor-pointer"
              htmlFor="deactived"
            >
              {t("deactived")}
            </label>
            <input
              {...register("deactived")}
              className="cursor-pointer appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-gray-600 checked:bg-primary-500 checked:border-primary-500 focus:outline-none transition duration-200 mx-2 "
              type="checkbox"
              id="deactived"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button secondary onClick={handleModalState("close")}>
            <p>{t("cancel")}</p>
          </Button>
          <Button
            isLoading={isUpdating}
            onClick={handleSubmit(handleSave)}
            primary
            disabled={!isDirty}
          >
            <p>{t("save")}</p>
          </Button>
        </div>
      </Modal>
    </React.Fragment>
  );
};

export default EditUserModal;
