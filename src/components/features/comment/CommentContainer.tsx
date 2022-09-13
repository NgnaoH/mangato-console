import Avatar from "@/components/shared/Avatar";
import Button from "@/components/shared/Button";
import DeleteConfirmation from "@/components/shared/DeleteConfirmation";
import DotList from "@/components/shared/DotList";
import Loading from "@/components/shared/Loading";
import ReportConfirmation, {
  typeReport,
} from "@/components/shared/ReportConfirmation";
import TextIcon from "@/components/shared/TextIcon";
import CommentReplyContextProvider, {
  useCommentReply,
} from "@/contexts/CommentReplyContext";
import useComment from "@/hooks/useComment";
import useCreateReaction from "@/hooks/useCreateReaction";
import useCreateReport from "@/hooks/useCreateReport";
import useDeleteComment from "@/hooks/useDeleteComment";
import useRemoveReaction from "@/hooks/useRemoveReaction";
import useUpdateComment from "@/hooks/useUpdateComment";
import { AdditionalUser, Comment } from "@/types";
import { getMentionedUserIds } from "@/utils/editor";
import { PostgrestError, User } from "@supabase/supabase-js";
import classNames from "classnames";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import React, { useMemo, useState } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { BsArrowReturnRight, BsReplyFill } from "react-icons/bs";
import { MdReport } from "react-icons/md";
import { UseQueryResult } from "react-query";
import CommentReactions from "./CommentReactions";
import Comments from "./Comments";
import Editor from "./Editor";
import ReactionSelector from "./ReactionSelector";

interface CommentContainerProps {
  commentId: string;
  user: User;
  additionUser: AdditionalUser;
}

interface CommentProps {
  comment: Comment;
  user: User;
  additionUser: AdditionalUser;
}

const CommentContainer: React.FC<CommentContainerProps> = ({
  commentId,
  user,
  additionUser,
}) => {
  const { data: comment, isLoading }: UseQueryResult<Comment, PostgrestError> =
    useComment(commentId);

  return (
    <div className="relative">
      {isLoading ? (
        <Loading />
      ) : !comment?.parent_id ? (
        <CommentReplyContextProvider>
          <CommentComponent
            comment={comment}
            user={user}
            additionUser={additionUser}
          />
        </CommentReplyContextProvider>
      ) : (
        <CommentComponent
          comment={comment}
          user={user}
          additionUser={additionUser}
        />
      )}
    </div>
  );
};

const CommentComponent: React.FC<CommentProps> = ({
  comment,
  user,
  additionUser,
}) => {
  const { locale } = useRouter();
  const [showReplies, setShowReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const commentReply = useCommentReply();

  const { mutate: createReaction } = useCreateReaction();
  const { mutate: removeReaction } = useRemoveReaction();
  const { mutate: updateComment } = useUpdateComment();
  const { mutate: createReport } = useCreateReport();
  const { mutate: deleteComment } = useDeleteComment({
    topic: comment.topic,
    parentId: comment.parent_id,
  });

  const activeReactions = comment.reactions_metadata.reduce(
    (set, reactionMetadata) => {
      if (reactionMetadata.active_for_user) {
        set.add(reactionMetadata.reaction_type);
      }
      return set;
    },
    new Set<string>()
  );

  const handleUpdate = (content: string) => {
    updateComment({
      comment: content,
      id: comment.id,
      mentionedUserIds: getMentionedUserIds(content),
    });

    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteComment(comment.id);
  };

  const handleToggleActionMenu: (
    isShow: boolean
  ) => React.MouseEventHandler<HTMLDivElement> = (isShow) => () => {
    setShowActionMenu(isShow);
  };

  const handleReply = () => {
    commentReply?.setReplyingTo(comment);

    setShowReplies(!showReplies);
  };

  const handleShowReplies = () => {
    setShowReplies(!showReplies);
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const toggleReaction = (reactionType: string) => {
    if (!activeReactions.has(reactionType)) {
      createReaction({
        commentId: comment.id,
        reactionType,
      });
    } else {
      removeReaction({
        commentId: comment.id,
        reactionType,
      });
    }
  };

  const handleReportUser = (reason) => {
    createReport({
      reporterId: user.id,
      type: typeReport.user,
      userId: comment.user.id,
      reason,
    });
  };

  const isDeactived = useMemo(() => comment?.user?.deactived, [comment]);

  return (
    <div
      className="relative flex gap-2 md:gap-4"
      onMouseEnter={handleToggleActionMenu(true)}
      onMouseLeave={handleToggleActionMenu(false)}
    >
      <Avatar src={isDeactived ? null : comment.user.avatar} />

      <div className="grow">
        <DotList className="mb-1">
          <span
            className={classNames(
              "font-semibold",
              isDeactived && "line-through text-gray-500"
            )}
          >
            {comment.user.name}
          </span>

          <span className="text-gray-400 text-sm">
            {dayjs(comment.created_at, { locale }).fromNow()}
          </span>

          {isDeactived && (
            <span className="text-gray-400 text-sm">
              Tài khoản bị hạn chế vì vi phạm tiêu chuẩn cộng đồng
            </span>
          )}
        </DotList>

        <div className="mb-4">
          <Editor
            readOnly={!isEditing}
            defaultContent={isDeactived ? "Bla bla" : comment.comment}
            onSubmit={handleUpdate}
            className="max-w-[30rem]"
          />
        </div>

        {comment.reactions_metadata?.length ? (
          <CommentReactions
            reactionsMetadata={comment.reactions_metadata}
            toggleReaction={toggleReaction}
          />
        ) : null}

        {!showReplies && !comment.parent_id && comment.replies_count > 0 && (
          <TextIcon
            className="mt-4 hover:underline cursor-pointer"
            onClick={handleShowReplies}
            LeftIcon={BsArrowReturnRight}
          >
            {comment.replies_count} replies
          </TextIcon>
        )}

        {showReplies && !comment.parent_id && (
          <div className="mt-6">
            <Comments topic={comment.topic} parentId={comment.id} />
          </div>
        )}
      </div>

      <div
        className={classNames(
          "bg-background-800 items-center gap absolute -top-2 right-0",
          showActionMenu && !additionUser?.deactived ? "flex" : "hidden"
        )}
      >
        <ReactionSelector toggleReaction={toggleReaction} />

        {comment.user.id === user?.id && (
          <Button
            iconClassName="w-5 h-5"
            secondary
            LeftIcon={AiFillEdit}
            onClick={handleEdit}
          />
        )}

        <Button
          iconClassName="w-5 h-5"
          secondary
          LeftIcon={BsReplyFill}
          onClick={handleReply}
        />

        {comment.user.id === user?.id && (
          <DeleteConfirmation
            reference={
              <Button
                iconClassName="w-5 h-5"
                className="hover:bg-red-500"
                secondary
                LeftIcon={AiFillDelete}
              />
            }
            onConfirm={handleDelete}
          />
        )}

        {comment.user.id !== user?.id && (
          <ReportConfirmation
            reference={
              <Button
                iconClassName="w-5 h-5"
                className="hover:bg-red-500"
                secondary
                LeftIcon={MdReport}
              />
            }
            type={typeReport.user}
            onConfirm={handleReportUser}
          />
        )}
      </div>
    </div>
  );
};

export default CommentContainer;
