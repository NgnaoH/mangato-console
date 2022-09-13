import Loading from "@/components/shared/Loading";
import TransLink from "@/components/shared/TransLink";
import { useCommentReply } from "@/contexts/CommentReplyContext";
import useComments from "@/hooks/useComments";
import useCreateComment from "@/hooks/useCreateComment";
import useUser from "@/hooks/useUser";
import { Comment } from "@/types";
import { getMentionedUserIds } from "@/utils/editor";
import { Trans, useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import CommentContainer from "./CommentContainer";
import Editor from "./Editor";

interface CommentsProps {
  parentId?: string;
  topic: string;
}

const Comments: React.FC<CommentsProps> = ({ parentId = null, topic }) => {
  const { t } = useTranslation("comment");
  const { data: comments, isLoading } = useComments({ parentId, topic });
  const [commentState, setCommentState] = useState<any>({});
  const commentReply = useCommentReply();
  const { user, additionUser } = useUser();
  const editorRef = useRef<any>(null);

  const { asPath } = useRouter();

  const { mutate: createComment, isLoading: createCommentLoading } =
    useCreateComment();

  useEffect(() => {
    if (!commentReply?.replyingTo) {
      setCommentState({ defaultContent: null });
    } else {
      setCommentState({
        defaultContent: `<span data-type="mention" data-id="${commentReply.replyingTo.user.id}" data-label="${commentReply.replyingTo.user.name}" contenteditable="false"></span><span>&nbsp</span>`,
      });
    }
  }, [commentReply?.replyingTo]);

  const handleEditorSubmit = (content: string) => {
    createComment({
      topic,
      parentId,
      mentionedUserIds: getMentionedUserIds(content),
      comment: content,
    });

    setCommentState({ defaultContent: null });

    editorRef.current?.commands?.clearContent();
    commentReply?.setReplyingTo(null);
  };

  return (
    <div className="space-y-4 mb-4">
      {isLoading ? (
        <div className="relative w-full h-20">
          <Loading className="w-8 h-8" />
        </div>
      ) : (
        user &&
        additionUser &&
        comments &&
        comments.map((comment: Comment) => (
          <CommentContainer
            key={comment.id}
            commentId={comment.id}
            user={user}
            additionUser={additionUser}
          />
        ))
      )}

      {user ? (
        additionUser.deactived ? (
          <p className="p-2 bg-background-800 text-gray-300">
            Tài khoản của bạn bị hạn chế, vui lòng liên hệ{" "}
            <a
              target="blank"
              href="https://discord.com"
              className="text-red-500"
            >
              Admin
            </a>
          </p>
        ) : (
          <Editor
            ref={editorRef}
            placeholder={t("comment_placeholder")}
            defaultContent={commentState.defaultContent}
            autofocus={!!commentReply?.replyingTo}
            onSubmit={handleEditorSubmit}
            isLoading={createCommentLoading}
          />
        )
      ) : (
        <p className="p-2 bg-background-800 text-gray-300">
          <Trans i18nKey="comment:need_login_msg">
            Bạn phải{" "}
            <TransLink
              href={`/login?redirectedFrom=${asPath}`}
              className="text-primary-300 hover:underline"
            >
              đăng nhập
            </TransLink>{" "}
            dể bình luận.
          </Trans>
        </p>
      )}
    </div>
  );
};

export default Comments;
