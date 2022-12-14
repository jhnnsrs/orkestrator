import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  NodeListItemFragment,
  NodesEventDocument,
  NodesEventSubscriptionHookResult,
  NodesQuery,
  NodesQueryVariables,
  useNodesQuery,
} from "../../rekuest/api/graphql";
import {
  AdditionalMate,
  Mate,
} from "../../rekuest/postman/mater/mater-context";
import { useReserver } from "../../rekuest/postman/reserver/reserver-context";
import { ResponsiveList } from "../../components/layout/ResponsiveList";
import { notEmpty } from "../../floating/utils";
import { Flow, Node } from "../../linker";
import { DashboardSearchFilter } from "./DashboardSearch";
import { withRekuest } from "../../rekuest";
import { ResponsiveContainerGrid } from "../../components/layout/ResponsiveContainerGrid";

interface IDashBoardSidebarProps {}

export const NodeItem = ({ node }: { node: NodeListItemFragment }) => {
  const { reserve } = useReserver();
  const navigate = useNavigate();

  return (
    <Node.Smart
      showSelfMates={true}
      placement="bottom"
      object={node.id}
      dragClassName={({ isOver, canDrop, isSelected, isDragging }) =>
        `rounded shadow-xl group text-white bg-slate-700 ${
          isOver && !isDragging && "border-primary-200 border"
        } ${isDragging && "border-primary-200 border"} ${
          isSelected && "ring-1 ring-primary-200 "
        }`
      }
      additionalMates={(accept, isself) => {
        let mates: AdditionalMate[] = [];
        if (!isself) {
          return mates;
        }

        if (accept == "item:@rekuest/node") {
          mates.push({
            action: async () => {
              await reserve({ node: node.id });
            },
            label: "Reserve",
          });

          if (node.interfaces?.includes("workflow") && node.meta?.flow) {
            mates.push({
              action: async () => {
                await navigate(Flow.linkBuilder(node.meta.flow));
              },
              label: "Show Flow",
            });
          }
        }

        if (accept == "list:@rekuest/node") {
          mates.push({
            action: async (self, drops) => {
              for (const drop of drops) {
                await reserve({ node: drop.object });
              }
            },
            label: "Reserve All",
          });
        }

        return mates;
      }}
    >
      <div className="mx-6 py-4 overflow-x-hidden">
        <Node.DetailLink
          className={({ isActive }) =>
            "font-bold text-md mb-2 cursor-pointer  " +
            (isActive ? "text-primary-300" : "")
          }
          object={node.id}
        >
          <span className="truncate">{node?.name}</span>
        </Node.DetailLink>
        <p className="text-white-700 text-base truncate">{node?.description}</p>
      </div>
    </Node.Smart>
  );
};

const DashBoardSidebar: React.FunctionComponent<IDashBoardSidebarProps> = (
  props
) => {
  const { data, loading, subscribeToMore, refetch } =
    withRekuest(useNodesQuery)();
  const [filter, setFilter] = React.useState<NodesQueryVariables>({
    search: "",
  });

  React.useEffect(() => {
    console.log("Subscribing to My Nodes");
    const unsubscribe = subscribeToMore({
      document: NodesEventDocument,
      variables: {},
      updateQuery: (prev, { subscriptionData }) => {
        console.log("Received Node", subscriptionData);
        var data = subscriptionData as NodesEventSubscriptionHookResult;
        let action = data.data?.nodes;
        let newelements;
        // Try to update
        if (action?.updated) {
          let updated_res = action.updated;
          newelements = prev.allnodes?.map((item: any) =>
            item.id === updated_res?.id
              ? { ...item, data: { ...item.data, ...updated_res } }
              : item
          );
        }

        if (action?.deleted) {
          let ended_res = action.deleted;
          newelements = prev.allnodes
            ?.map((item: any) => (item.id === ended_res ? null : item))
            .filter((item) => item != null);
        }

        if (action?.created) {
          let updated_res = action.created;
          newelements = prev.allnodes?.concat(updated_res);
        }

        console.log("Received ", subscriptionData);
        return {
          ...prev,
          nodes: newelements,
        } as NodesQuery;
      },
    });
    return () => unsubscribe();
  }, [subscribeToMore]);

  React.useEffect(() => {
    refetch(filter);
  }, [filter, refetch]);

  return (
    <div className="flex h-full flex-col overflow-y-hidden">
      <div className="flex-none p-5 dark:text-slate-50">
        <DashboardSearchFilter onFilterChanged={setFilter} />
      </div>
      <div className="flex-grow overflow-y-scroll p-2 overflow-x-hidden">
        {data?.allnodes && data?.allnodes.length > 0 && (
          <>
            <div className="font-semibold text-center text-xs dark:text-slate-50 mb-1">
              Nodes
            </div>
            <ResponsiveContainerGrid>
              {data?.allnodes?.filter(notEmpty).map((node, index) => (
                <NodeItem key={index} node={node} />
              ))}
            </ResponsiveContainerGrid>
          </>
        )}
      </div>
    </div>
  );
};

export default DashBoardSidebar;
