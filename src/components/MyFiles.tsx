import React, { useEffect, useState } from "react";
import {
  BsCaretLeft,
  BsCaretRight,
  BsDownload,
  BsPlusCircle,
  BsTrash,
} from "react-icons/bs";
import { ImCancelCircle } from "react-icons/im";
import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { Mate } from "../rekuest/postman/mater/mater-context";
import { SectionTitle } from "../layout/SectionTitle";
import { MikroFile } from "../linker";
import {
  MyOmeroFilesDocument,
  MyOmeroFilesQuery,
  MyOmeroFilesQueryVariables,
  useDeleteOmeroFileMutation,
  useMyOmeroFilesQuery,
  useUploadOmeroFileMutation,
} from "../mikro/api/graphql";
import { useMikro, withMikro } from "../mikro/MikroContext";
import { useConfirm } from "./confirmer/confirmer-context";
import { ResponsiveGrid } from "./layout/ResponsiveGrid";
import { preventOverflow } from "@popperjs/core";
import { Icons } from "react-toastify";
export type IMyRepresentationsProps = {};

const limit = 20;

const hashFile = (file: File) => {
  return `${file.name}_${file.size}_${file.type}`;
};

export type UploadFuture = {
  hash: string;
  file: File;
  future: Promise<any>;
  controller: AbortController;
  progress?: number;
};

const MyFiles: React.FC<IMyRepresentationsProps> = () => {
  const [offset, setOffset] = useState(0);
  const [progress, setProgress] = useState(undefined);

  const [uploadFutures, setUploadFutures] = useState<UploadFuture[]>([]);
  const [pendingFutures, setPendingFutures] = useState<UploadFuture[]>([]);

  const { s3resolve } = useMikro();

  const {
    data,
    loading: all_loading,
    refetch,
  } = withMikro(useMyOmeroFilesQuery)({
    variables: { limit: limit, offset: 0 },
    //pollInterval: 1000,
  });

  const [uploadFile] = withMikro(useUploadOmeroFileMutation)({
    update(cache, result) {
      const existing: any = cache.readQuery({
        query: MyOmeroFilesDocument,
        variables: { limit: 20, offset: 0 },
      });
      cache.writeQuery({
        query: MyOmeroFilesDocument,
        variables: { limit: 20, offset: 0 },
        data: {
          myomerofiles: existing.myomerofiles.concat(
            result.data?.uploadOmeroFile
          ),
        },
      });
    },
  });

  const [{ isOver, canDrop }, drop] = useDrop(() => {
    return {
      accept: [NativeTypes.FILE],
      drop: (item, monitor) => {
        const files: File[] = (item as any).files;
        console.log("files", files);
        const futures: UploadFuture[] = files.map((file: any, index) => {
          let abortController = new AbortController();

          let hash = hashFile(file);

          return {
            hash: hash,
            file: file,
            controller: abortController,
            future: uploadFile({
              variables: { file },
              context: {
                fetchOptions: {
                  signal: abortController.signal,
                  onProgress: (ev: ProgressEvent) => {
                    setUploadFutures((prev) =>
                      prev.map((f) =>
                        f.hash === hash
                          ? { ...f, progress: ev.loaded / ev.total }
                          : f
                      )
                    );
                  },
                },
              },
            })
              .then((x) =>
                setUploadFutures((futures) =>
                  futures.filter((f) => f.hash !== hashFile(file))
                )
              )
              .catch((e) => {
                console.log("error", e);
                setUploadFutures((futures) =>
                  futures.filter((f) => f.hash !== hashFile(file))
                );
              }),
          };
        });

        setUploadFutures(futures);
        return {};
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    };
  }, []);

  useEffect(() => {
    refetch({ limit: 20, offset: offset });
  }, [offset, limit]);

  const { confirm } = useConfirm();

  const [deleteOmeroFile] = withMikro(useDeleteOmeroFileMutation)({
    update(cache, result) {
      const existing = cache.readQuery<MyOmeroFilesQuery>({
        query: MyOmeroFilesDocument,
        variables: { limit: 20, offset: 0 },
      });
      cache.writeQuery<MyOmeroFilesQuery, MyOmeroFilesQueryVariables>({
        query: MyOmeroFilesDocument,
        variables: { limit: 20, offset: 0 },
        data: {
          myomerofiles: existing?.myomerofiles?.filter(
            (f) => f?.id != result.data?.deleteOmeroFile?.id
          ),
        },
      });
    },
  });

  return (
    <div>
      <div className="font-light text-xl flex mr-2">
        <MikroFile.ListLink>
          <SectionTitle>My Files</SectionTitle>
        </MikroFile.ListLink>
        <div className="flex-grow"></div>
        <div className="flex-0">
          {offset != 0 && (
            <button
              className="p-1 text-gray-600 rounded"
              onClick={() => setOffset(offset - limit)}
            >
              {" "}
              <BsCaretLeft />{" "}
            </button>
          )}
          {data?.myomerofiles && data?.myomerofiles.length == limit && (
            <button
              className="p-1 text-gray-600 rounded"
              onClick={() => setOffset(offset + limit)}
            >
              {" "}
              <BsCaretRight />{" "}
            </button>
          )}
        </div>
      </div>
      <ResponsiveGrid>
        {data?.myomerofiles?.map(
          (file, index) =>
            file?.id && (
              <MikroFile.Smart
                showSelectingIndex={true}
                object={file?.id}
                dragClassName={({ isOver, canDrop, isSelected, isDragging }) =>
                  `rounded shadow-xl group text-white bg-center truncate bg-cover ${
                    isOver && !isDragging && "border-primary-200 border"
                  } ${isDragging && "border-primary-200 border"} ${
                    isSelected && "ring-1 ring-secondary-500 "
                  }`
                }
                additionalMates={(over) => {
                  if (over == "item:@mikro/omerofile") {
                    return [
                      {
                        action: async (self, partner) => {
                          await confirm({
                            message:
                              "Are you sure you want to delete this file?",
                          });

                          deleteOmeroFile({
                            variables: { id: partner[0].object },
                          });
                        },
                        label: (
                          <>
                            <BsTrash />
                          </>
                        ),
                        description: "Delete this file",
                      } as Mate,
                      {
                        action: async (self, partner) => {
                          window.open(s3resolve(file?.file));
                        },
                        label: <BsDownload />,
                        description: "Donwload this file",
                      } as Mate,
                    ];
                  }

                  if (over == "list:@mikro/omerofile") {
                    return [
                      {
                        action: async (self, partners) => {
                          await confirm({
                            message:
                              "Are you sure you want to delete all these files?",
                          });

                          for (let partner of partners) {
                            await deleteOmeroFile({
                              variables: { id: partner.object },
                            });
                          }
                        },
                        label: (
                          <>
                            <BsTrash /> Delete All
                          </>
                        ),
                        description: "Delete all files",
                      } as Mate,
                    ];
                  }
                }}
              >
                <div
                  key={index}
                  className="rounded shadow-xl group text-white bg-center bg-cover"
                  style={{
                    background:
                      "linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.95))",
                  }}
                >
                  <div className="px-6 py-4">
                    <MikroFile.DetailLink
                      className="font-bold text-xl mb-2 cursor-pointer"
                      object={file.id}
                    >
                      {file?.name}
                    </MikroFile.DetailLink>
                    <p className="text-white-700 text-base">{file?.type}</p>
                  </div>
                </div>
              </MikroFile.Smart>
            )
        )}

        {uploadFutures.map((future, index) => (
          <div
            key={index}
            className="rounded shadow-xl group text-white bg-center bg-cover relative group"
            // style={{
            //   background: `center bottom linear-gradient(to right, rgba(255,0,0,0.75), rgba(255,0,0,0.95)) ${
            //     future.progress && future.progress * 100
            //   }%, linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.95)) ${
            //     future.progress && (1 - future.progress) * 100
            //   }%`,
            // }}
            style={{
              background: `center bottom linear-gradient(to right, rgba(0,220,0,0.75) ${
                future.progress && Math.floor(future.progress * 100)
              }%, rgba(0,0,0,0.95) ${
                future.progress && Math.floor(future.progress * 100)
              }% ${
                future.progress && Math.floor((1 - future.progress) * 100)
              }%)`,
            }}
          >
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2 cursor-pointer">
                {future.file.name}
              </div>
              <p className="text-white-700 text-base">
                {future.progress && Math.floor(future.progress * 100)}%
              </p>
            </div>
            <button
              className="hidden group-hover:block text-white-500 bg-red-500 rounded-md text px-2 absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 b"
              onClick={() => future.controller.abort()}
            >
              x
            </button>
          </div>
        ))}
        <div
          className={`${
            !canDrop && "hidden"
          } bg-slate-300 p-4 rounded shadow-xl group bg-center bg-cover animate-all`}
          ref={drop}
        >
          {isOver ? "Release to upload" : "Drag and drop a file here"}
        </div>
      </ResponsiveGrid>
    </div>
  );
};

export { MyFiles };
