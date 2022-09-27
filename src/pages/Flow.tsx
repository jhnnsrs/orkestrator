import React from "react";
import { useParams } from "react-router-dom";
import { useAlert } from "../components/alerter/alerter-context";
import { EditRiver } from "../floating/edit/Edit";
import { noTypename } from "../floating/utils";
import {
  GraphInput,
  UpdateFlowDocument,
  UpdateFlowMutation,
  UpdateFlowMutationVariables,
  useDiagramQuery,
} from "../fluss/api/graphql";
import { withFluss } from "../fluss/fluss";
import { useFluss } from "../fluss/fluss-context";
import { ModuleLayout } from "../layout/ModuleLayout";

interface Props {}

export const Flow: React.FC<Props> = (props) => {
  let { flowid } = useParams<{ flowid: string }>();
  const { client } = useFluss();
  const { alert } = useAlert();
  if (!flowid) return <></>;
  let { data } = withFluss(useDiagramQuery)({
    variables: { id: flowid },
  });

  if (!data?.diagram?.latestFlow?.id) return <>Loading</>;

  const saveDiagram = async (graph_input: GraphInput) => {
    if (!data?.diagram?.id) return;

    let variables = {
      id: data?.diagram?.id,
      graph: graph_input,
    };

    console.log("Sending variables", variables);

    client &&
      client
        .mutate<UpdateFlowMutation, UpdateFlowMutationVariables>({
          mutation: UpdateFlowDocument,
          variables: noTypename(variables),
        })
        .then((event) => {
          console.log(event);
        })
        .catch((error) => {
          console.error(error);
          console.log(variables);
          alert({
            message: error.message,
          })
            .then(() => {})
            .catch(() => {});
        });
  };

  return (
    <ModuleLayout sidebar={<> Versions</>}>
      <EditRiver flow={data?.diagram?.latestFlow} onFlowSave={saveDiagram} />
    </ModuleLayout>
  );
};