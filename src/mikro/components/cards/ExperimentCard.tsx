import React from "react";
import { Experiment } from "../../../linker";
import { ListExperimentFragment } from "../../api/graphql";

interface ExperimentCardProps {
  experiment: ListExperimentFragment;
}

export const ExperimentCard = ({ experiment }: ExperimentCardProps) => {
  return (
    <Experiment.Smart
      object={experiment.id}
      className="bg-back-800 p-4 text-white rounded shadow-lg"
    >
      <Experiment.DetailLink object={experiment.id}>
        {experiment.name}
      </Experiment.DetailLink>
    </Experiment.Smart>
  );
};
