import * as React from "react";
import { ResponsiveContainerGrid } from "../../components/layout/ResponsiveContainerGrid";
import { ResponsiveList } from "../../components/layout/ResponsiveList";
import { OptimizedImage } from "../../layout/OptimizedImage";
import {
  Experiment,
  MikroFile,
  Representation,
  Sample,
  Table,
} from "../../linker";
import {
  GlobalSearchQueryVariables,
  useGlobalSearchLazyQuery,
} from "../../mikro/api/graphql";
import { useMikro, withMikro } from "../../mikro/MikroContext";
import { DataSearch } from "./DataSearch";

interface IDataSidebarProps {}

export const RepresentationItem = ({ re }: any) => {
  const { s3resolve } = useMikro();

  return (
    <Representation.Smart
      showSelfMates={true}
      placement="bottom"
      object={re.id}
      dragClassName={({ isOver, canDrop, isSelected, isDragging }) =>
        `rounded shadow-xl group text-white  h-[4rem] bg-center bg-cover ${
          isOver && !isDragging && "border-primary-200 border"
        } ${isDragging && "border-primary-200 border"} ${
          isSelected && "ring-1 ring-primary-200 "
        }`
      }
    >
      {re.latestThumbnail && (
        <OptimizedImage
          src={s3resolve(re?.latestThumbnail.image)}
          style={{ filter: "brightness(0.7)" }}
          className="object-cover h-[4rem] w-full absolute top-0 left-0 rounded"
          blurhash={re?.latestThumbnail.blurhash}
        />
      )}
      <div className="px-6 py-4 truncate relative">
        <Representation.DetailLink
          className={({ isActive } /*  */) =>
            "font-bold text-md mb-2 cursor-pointer " +
            (isActive ? "text-primary-300" : "")
          }
          object={re.id}
        >
          <span className="truncate">{re?.name}</span>
        </Representation.DetailLink>
        <p className="text-white-700 text-base group-hover:block hidden">
          {re?.sample?.name}
        </p>
      </div>
    </Representation.Smart>
  );
};

export const SampleItem = ({ sa }: any) => {
  const { s3resolve } = useMikro();

  return (
    <Sample.Smart
      showSelfMates={true}
      placement="bottom"
      object={sa.id}
      dragClassName={({ isOver, canDrop, isSelected, isDragging }) =>
        `rounded shadow-xl group text-white bg-slate-700 ${
          isOver && !isDragging && "border-primary-200 border"
        } ${isDragging && "border-primary-200 border"} ${
          isSelected && "ring-1 ring-primary-200 "
        }`
      }
    >
      <div className="px-6 py-4 truncate">
        <Sample.DetailLink
          className={({ isActive }) =>
            "font-bold text-md mb-2 cursor-pointer " +
            (isActive ? "text-primary-300" : "")
          }
          object={sa.id}
        >
          <span className="truncate">{sa?.name}</span>
        </Sample.DetailLink>
        <p className="text-white-700 text-base"></p>
      </div>
    </Sample.Smart>
  );
};

export const ExperimentItem = ({ experiment }: any) => {
  const { s3resolve } = useMikro();

  return (
    <Experiment.Smart
      showSelfMates={true}
      placement="bottom"
      object={experiment.id}
      dragClassName={({ isOver, canDrop, isSelected, isDragging }) =>
        `rounded shadow-xl group text-white bg-slate-700 ${
          isOver && !isDragging && "border-primary-200 border"
        } ${isDragging && "border-primary-200 border"} ${
          isSelected && "ring-1 ring-primary-200 "
        }`
      }
    >
      <div className="px-6 py-4 truncate">
        <Experiment.DetailLink
          className={({ isActive }) =>
            "font-bold text-md mb-2 cursor-pointer " +
            (isActive ? "text-primary-300" : "")
          }
          object={experiment.id}
        >
          <span className="truncate">{experiment?.name}</span>
        </Experiment.DetailLink>
        <p className="text-white-700 text-base"></p>
      </div>
    </Experiment.Smart>
  );
};

export const TableItem = ({ table }: any) => {
  const { s3resolve } = useMikro();

  return (
    <Table.Smart
      showSelfMates={true}
      placement="bottom"
      object={table.id}
      dragClassName={({ isOver, canDrop, isSelected, isDragging }) =>
        `rounded shadow-xl group text-white bg-slate-700 ${
          isOver && !isDragging && "border-primary-200 border"
        } ${isDragging && "border-primary-200 border"} ${
          isSelected && "ring-1 ring-primary-200 "
        }`
      }
    >
      <div className="px-6 py-4">
        <Table.DetailLink
          className={({ isActive }) =>
            "font-bold text-md mb-2 cursor-pointer " +
            (isActive ? "text-primary-300" : "")
          }
          object={table.id}
        >
          <span className="truncate">{table?.name}</span>
        </Table.DetailLink>
        <p className="text-white-700 text-base"></p>
      </div>
    </Table.Smart>
  );
};

export const FileItem = ({ file }: any) => {
  const { s3resolve } = useMikro();

  return (
    <MikroFile.Smart
      showSelfMates={true}
      placement="bottom"
      object={file.id}
      dragClassName={({ isOver, canDrop, isSelected, isDragging }) =>
        `rounded shadow-xl group text-white bg-slate-700 ${
          isOver && !isDragging && "border-primary-200 border"
        } ${isDragging && "border-primary-200 border"} ${
          isSelected && "ring-1 ring-primary-200 "
        }`
      }
    >
      <div className="px-6 py-4">
        <MikroFile.DetailLink
          className={({ isActive }) =>
            "font-bold text-md mb-2 cursor-pointer " +
            (isActive ? "text-primary-300" : "")
          }
          object={file.id}
        >
          <span className="truncate">{file?.name}</span>
        </MikroFile.DetailLink>
        <p className="text-white-700 text-base"></p>
      </div>
    </MikroFile.Smart>
  );
};

const DataSidebar: React.FunctionComponent<IDataSidebarProps> = (props) => {
  const [fetch, { data }] = withMikro(useGlobalSearchLazyQuery)();
  const [filter, setFilter] = React.useState<GlobalSearchQueryVariables>({
    search: "",
  });

  React.useEffect(() => {
    fetch({ variables: filter });
  }, [filter, fetch]);

  return (
    <>
      <div className="flex h-full flex-col" data-enableselect={true}>
        <div className="flex-none p-5 dark:text-slate-50">
          <DataSearch
            onFilterChanged={(v) => setFilter(v)}
            className="w-full p-3 rounded-md shadow-lg dark:bg-slate-200 dark:text-slate-800"
          />
        </div>
        <div
          className="flex-grow flex flex-col gap-2 p-5 overflow-y-scroll direct"
          data-enableselect={true}
        >
          {data?.experiments && data?.experiments.length > 0 && (
            <div className="font-semibold text-center text-xs dark:text-slate-50 mt-2">
              Experiments
            </div>
          )}
          <ResponsiveContainerGrid>
            {data?.experiments?.map((experiment, index) => (
              <ExperimentItem key={index} experiment={experiment} />
            ))}
          </ResponsiveContainerGrid>
          {data?.samples && data?.samples.length > 0 && (
            <div
              className="font-semibold text-center text-xs dark:text-slate-50 mt-2"
              data-enableselect={true}
            >
              Samples
            </div>
          )}
          <ResponsiveContainerGrid>
            {data?.samples?.map((sa, index) => (
              <SampleItem key={index} sa={sa} />
            ))}
          </ResponsiveContainerGrid>
          {data?.tables && data?.tables.length > 0 && (
            <div
              className="font-semibold text-center text-xs dark:text-slate-50 mt-2"
              data-enableselect={true}
            >
              Tables
            </div>
          )}
          <ResponsiveContainerGrid>
            {data?.tables?.map((ta, index) => (
              <TableItem table={ta} key={index} />
            ))}
          </ResponsiveContainerGrid>
          {data?.representations && data?.representations.length > 0 && (
            <div
              className="font-semibold text-center text-xs dark:text-slate-50 mt-2"
              data-enableselect={true}
            >
              Images
            </div>
          )}
          <ResponsiveContainerGrid>
            {data?.representations?.map((re, index) => (
              <RepresentationItem key={index} re={re} />
            ))}
          </ResponsiveContainerGrid>
          {data?.files && data?.files.length > 0 && (
            <div
              className="font-semibold text-center text-xs dark:text-slate-50 mt-2"
              data-enableselect={true}
            >
              Files
            </div>
          )}
          <ResponsiveContainerGrid>
            {data?.files?.map((f, index) => (
              <FileItem key={index} file={f} />
            ))}
          </ResponsiveContainerGrid>
        </div>
      </div>
    </>
  );
};

export default DataSidebar;
