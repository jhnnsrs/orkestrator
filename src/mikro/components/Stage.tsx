import { ParentSize } from "@visx/responsive";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import { BsPinAngle, BsPinFill } from "react-icons/bs";
import Timestamp from "react-timestamp";
import { useConfirm } from "../../components/confirmer/confirmer-context";
import { CreateableSearchSelect } from "../../components/forms/fields/search_select_input";
import { TextInputField } from "../../components/forms/fields/text_input";
import { ResponsiveContainerGrid } from "../../components/layout/ResponsiveContainerGrid";
import { SelfActions } from "../../components/SelfActions";
import { StageCanvas } from "../../components/StageCanvas";
import { notEmpty } from "../../floating/utils";
import { PageLayout } from "../../layout/PageLayout";
import { SectionTitle } from "../../layout/SectionTitle";
import { Position } from "../../linker";
import {
  CommentableModels,
  DetailStageDocument,
  UpdateStageMutationVariables,
  useDeletePositionMutation,
  useDetailStageQuery,
  useUpdateStageMutation,
  usePinStageMutation,
  useTagSearchLazyQuery,
} from "../api/graphql";
import { withMikro } from "../MikroContext";
import CommentSection from "./comments/CommentSection";

export type IExperimentProps = {
  id: string;
};

const Stage: React.FC<IExperimentProps> = ({ id }) => {
  const { data, error } = withMikro(useDetailStageQuery)({
    variables: { id: id },
  });

  const [searchTags, _t] = withMikro(useTagSearchLazyQuery)();
  const [show, setshow] = useState(false);

  const [pinStage] = withMikro(usePinStageMutation)();

  const [updateStage] = withMikro(useUpdateStageMutation)();
  const { confirm } = useConfirm();

  const [deletePosition] = withMikro(useDeletePositionMutation)({
    update(cache, result) {
      const existing: any = cache.readQuery({
        query: DetailStageDocument,
        variables: { id: id },
      });
      cache.writeQuery({
        query: DetailStageDocument,
        data: {
          acquisition: {
            ...existing.acquisition,
            positions: existing.acquisition.positions.filter(
              (t: any) => t.id !== result.data?.deletePosition?.id
            ),
          },
        },
      });
    },
  });

  return (
    <PageLayout
      sidebar={
        <div className="p-5">
          <CommentSection id={id} model={CommentableModels.GrunnlagStage} />
        </div>
      }
      actions={<SelfActions type={"@mikro/stage"} object={id} />}
    >
      {!error && data && (
        <div className="p-3 flex-grow flex flex-col">
          <div className="flex flex-row">
            <div className="flex">
              <SectionTitle>{data?.stage?.name}</SectionTitle>
            </div>
            <div className="flex-grow" />
            <div className="flex text-white">
              {data?.stage?.id && (
                <button
                  onClick={() =>
                    pinStage({
                      variables: {
                        id: data?.stage?.id || "",
                        pin: !data?.stage?.pinned || false,
                      },
                    })
                  }
                >
                  {data?.stage?.pinned ? <BsPinFill /> : <BsPinAngle />}
                </button>
              )}
            </div>
          </div>
          <div className="flex  @2xl:flex-row-reverse flex-col rounded-md gap-4 mt-2">
            <div className="flex-1 max-w-2xl mt-2 rounded rounded-lg overflow-hidden">
              {data && (
                <ParentSize>
                  {({ width, height }) => (
                    <>
                      {data.stage && (
                        <StageCanvas
                          stage={data.stage}
                          height={height}
                          width={width}
                        />
                      )}
                    </>
                  )}
                </ParentSize>
              )}
            </div>
            <div className="p-3 flex-1 bg-white border shadow mt-2 rounded">
              <div className="font-light mt-2 ">Created At</div>
              <div className="text-md mt-2 ">
                <Timestamp date={data?.stage?.createdAt} />
              </div>
              <div className="font-light mt-2 ">Created by</div>
              <div className="text-md mt-2 ">{data?.stage?.creator?.sub}</div>

              <div className="font-light mt-2 ">Tags</div>
              <div className="text-xl flex mb-2">
                {data?.stage?.tags?.map((tag, index) => (
                  <>
                    <span className="font-semibold mr-2">#{tag} </span>
                  </>
                ))}
              </div>
              <div className="flex flex-col mt-2">
                <button
                  className="border border-gray-600 rounded w-fit p-1"
                  onClick={() => setshow(!show)}
                >
                  {show ? "Hide" : "Edit"}
                </button>
              </div>
              {data?.stage && show && (
                <Formik<UpdateStageMutationVariables>
                  initialValues={{
                    id: data?.stage?.id,
                    tags: data?.stage?.tags,
                    name: data?.stage?.name,
                  }}
                  onSubmit={(values) => {
                    updateStage({ variables: values })
                      .then(console.log)
                      .then(() => setshow(false));
                  }}
                >
                  {() => (
                    <Form>
                      <div className="border-t border-gray-300 pt-2">
                        <TextInputField name="name" label="Name" />
                        <div className="flex-grow">
                          <CreateableSearchSelect
                            name="tags"
                            isMulti={true}
                            label="Tags"
                            lazySearch={searchTags}
                          />
                        </div>
                        <button
                          type="submit"
                          className="border border-gray-600 rounded w-fit p-1 focus:border-green-300"
                          autoFocus={true}
                        >
                          Change
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}
            </div>
          </div>

          <SectionTitle> Positions </SectionTitle>
          <ResponsiveContainerGrid>
            {data?.stage?.positions?.filter(notEmpty).map((pos) => (
              <Position.Smart
                object={pos.id}
                className="border border-gray-800 cursor-pointer rounded p-5 text-white bg-gray-900 hover:shadow-lg"
              >
                <div className="flex">
                  <Position.DetailLink
                    className="flex-grow cursor-pointer font-semibold"
                    object={pos.id}
                  >
                    {pos?.name}
                  </Position.DetailLink>
                </div>
              </Position.Smart>
            ))}
          </ResponsiveContainerGrid>
        </div>
      )}
    </PageLayout>
  );
};

export { Stage as Acquisition };
