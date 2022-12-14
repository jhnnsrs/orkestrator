import React, { useState, useEffect } from "react";
import { DetailAssignationFragment } from "../../rekuest/api/graphql";
import { useDetailRunQuery } from "../api/graphql";
import { withFluss } from "../fluss";
import { Run } from "./Run";

export interface FlussAssignationProps {
  assignation: DetailAssignationFragment;
}

export const FlussAssignation: React.FC<FlussAssignationProps> = (props) => {
  const { data } = withFluss(useDetailRunQuery)({
    variables: { assignation: props.assignation.id },
  });

  return data?.run?.id ? (
    <>
      <Run id={data.run.id} />
    </>
  ) : (
    <>Loading</>
  );
};
