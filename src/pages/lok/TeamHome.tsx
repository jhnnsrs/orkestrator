import * as React from "react";
import { BsFolder2Open } from "react-icons/bs";
import { IoMdCheckmark } from "react-icons/io";
import { TfiMarkerAlt } from "react-icons/tfi";
import Timestamp from "react-timestamp";
import { notEmpty } from "../../floating/utils";
import { ActionButton } from "../../layout/ActionButton";
import { useDialog } from "../../layout/dialog/DialogProvider";
import { PageLayout } from "../../layout/PageLayout";
import {
  getDefaultSmartModel,
  getIdentifierForCommentableModel,
} from "../../linker";
import { CreatePublicFaktDialgog } from "../../lok/components/dialogs/CreatePublicFaktDialog";
import { MyPrivateFakts } from "../../lok/components/MyPrivateFakts";
import { MyPublicFakts } from "../../lok/components/MyPublicFakts";
import { UserTag } from "../../lok/components/UserTag";
import {
  CommentableModels,
  MentionCommentFragment,
  useMyMentionsQuery,
  useResolveCommentMutation,
} from "../../mikro/api/graphql";
import { CommentView } from "../../mikro/components/comments/CommentView";
import { withMikro } from "../../mikro/MikroContext";

interface IFlowHomeProps {}

export const MentionedComment = ({
  comment,
}: {
  comment: MentionCommentFragment;
}) => {
  const [resolveComment] = withMikro(useResolveCommentMutation)({
    update: (cache, { data }) => {
      if (data?.resolveComment) {
        cache.modify({
          id: cache.identify(data.resolveComment),
          fields: {
            resolved: () => data.resolveComment?.resolved,
            resolvedBy: () => data.resolveComment?.resolvedBy,
          },
        });
      }
    },
  });

  if (!comment.contentType) return <>Cannot</>;
  const identifier = getIdentifierForCommentableModel(comment.contentType);
  if (!identifier) return <>No identifier found for {comment.contentType}</>;

  const Model = getDefaultSmartModel(identifier);
  if (!Model) return <>No Smart Model found for {identifier}</>;

  return (
    <div className="flex flex-col text-white">
      {comment?.user && (
        <div className="mt-2 flex flex-col w-full">
          <div className="flex flex-row ">
            {comment.user.sub && (
              <UserTag sub={comment?.user.sub} className="inline-flex mr-2" />
            )}{" "}
            <div className="flex flex-grow my-auto">
              mentioned you <div className="mr-2"></div>
              {comment.mentions.length > 1 &&
                "and " + comment.mentions.length + " others"}{" "}
              <Timestamp relative date={comment?.createdAt} />
            </div>
            <div className="flex flex-initial my-auto">
              {comment.resolved ? (
                <div className="flex flex-row mr-2">
                  <div className="text-green-500">
                    <IoMdCheckmark />
                  </div>
                </div>
              ) : (
                <button
                  className="mr-2"
                  onClick={() => {
                    resolveComment({
                      variables: {
                        id: comment.id,
                      },
                    });
                  }}
                  title="Resolve Comment"
                >
                  {" "}
                  <TfiMarkerAlt />
                </button>
              )}
              <div className="text-gray-500 my-auto">
                <Model.DetailLink
                  object={comment.objectId.toString()}
                  className="text-slate-50 mt-5 "
                >
                  <BsFolder2Open />
                </Model.DetailLink>
              </div>
            </div>
          </div>
          <div className="flex-initial my-auto w-full">
            <CommentView
              descendents={comment.descendents}
              className="mt-2  text-sm bg-slate-300 p-3 border rounded text-black"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const TeamHome: React.FunctionComponent<IFlowHomeProps> = (props) => {
  const { data } = withMikro(useMyMentionsQuery)();
  const { ask } = useDialog();
  return (
    <PageLayout
      actions={
        <>
          <ActionButton
            label="Create Public App"
            onAction={async () => {
              const x = await ask(CreatePublicFaktDialgog, {});
            }}
          />
        </>
      }
    >
      <div className="flex-initial flex flex-row mb-2">
        <div className="text-xl dark:text-white">My Feed</div>
      </div>
      {data?.mymentions?.filter(notEmpty).map((x, index) => (
        <MentionedComment key={index} comment={x} />
      ))}
      <MyPublicFakts />
      <MyPrivateFakts />
    </PageLayout>
  );
};

export default TeamHome;
