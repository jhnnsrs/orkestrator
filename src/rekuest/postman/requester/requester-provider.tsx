import React from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { useAlert } from "../../../components/alerter/alerter-context";
import { Assignation } from "../../../linker";
import { DetailAssignationFragment } from "../../api/graphql";
import { usePostman } from "../graphql/postman-context";
import {
  AssignOptions,
  AssignRequest,
  AssignRequestVariables,
  Defered,
  RequesterContext,
  ResolvedAssignRequest,
  UnassignOptions,
} from "./requester-context";
import { RequestResolver } from "./RequestResolver";

export type ReserverProviderProps = {
  children: React.ReactNode;
  defaults?: Omit<AssignOptions, "node">;
  autoResolve?: boolean;
};

const Msg =
  (ass: DetailAssignationFragment) =>
  ({ closeToast, toastProps }: any) => {
    return (
      <Assignation.DetailLink object={ass.id}>
        Open Assignation
      </Assignation.DetailLink>
    );
  };

export const RequesterProvider: React.FC<ReserverProviderProps> = ({
  children,
  defaults = {},
  autoResolve,
}) => {
  const { assign: postassign, requests, unassign: postunassign } = usePostman();
  const { alert } = useAlert();

  const [pendingRequests, setPendingRequests] = React.useState<AssignRequest[]>(
    []
  );
  const [resolvedRequests, setResolvedRequests] = React.useState<
    ResolvedAssignRequest[]
  >([]);

  const resolve = (request: ResolvedAssignRequest) => {
    let x = postassign({ variables: request.options });
    x.then((data) => {
      if (data.data?.assign) {
        request.defered.resolve(data.data.assign);
        toast(Msg(data.data?.assign));

        setPendingRequests((pendingRequests) =>
          pendingRequests.filter((r) => r.id !== request.id)
        );
        setResolvedRequests((resolvedRequests) => [
          ...resolvedRequests,
          request,
        ]);
      }
    }).catch((e) => {
      console.error(e);
      request.defered.reject(e);
    });
    return x;
  };

  const reject = (request: AssignRequest) => {
    setPendingRequests(pendingRequests.filter((r) => r.id !== request.id));
    request.defered.reject("User rejected request");
  };

  const assign = (variables: AssignRequestVariables) => {
    var defered = new Defered();

    var promise = new Promise<DetailAssignationFragment>((resolve, reject) => {
      defered.resolver = resolve;
      defered.rejecter = reject;
    });

    var request: AssignRequest = {
      id: uuidv4(),
      defered: defered,
      variables: variables,
    };

    if (autoResolve && variables.reservation?.allowAutoRequest) {
      let set_args = variables.reservation?.node?.args?.map((port, index) => {
        if (port?.key && variables.defaults) {
          return variables.defaults[port?.key];
        }
        return port?.nullable == true ? null : undefined;
      });

      console.log("Setting args", set_args);
      if (
        variables.reservation?.id &&
        set_args &&
        !set_args?.includes(undefined)
      ) {
        resolve({
          ...request,
          options: {
            reservation: variables.reservation.id,
            args: set_args,
          },
        });
      }
    }

    setPendingRequests((pendingRequests) => {
      return [...pendingRequests, request];
    });

    return promise;
  };

  const unassign = (options: UnassignOptions) => {
    postunassign({
      variables: options,
    })
      .then(() => {
        console.log("Unreserved");
      })
      .catch((e) => alert(e.message));
  };

  return (
    <RequesterContext.Provider
      value={{
        requests: requests,
        unassign: unassign,
        assign: assign,
        resolve: resolve,
        reject: reject,
        pending: pendingRequests,
      }}
    >
      <RequestResolver />
      {children}
    </RequesterContext.Provider>
  );
};
